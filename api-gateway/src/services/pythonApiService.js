const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');
const NodeCache = require('node-cache');
const { StatusCodes } = require('http-status-codes');

// Cache para armazenar respostas temporariamente
const apiCache = new NodeCache({
  stdTTL: config.cache.stdTTL,
  checkperiod: config.cache.checkperiod
});

// Cliente Axios para comunicação com a API Python
const pythonApiClient = axios.create({
  baseURL: config.pythonApiBaseUrl,
  timeout: 60000, // 60 segundos (aumentado para operações que podem demorar mais)
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para logar requisições
pythonApiClient.interceptors.request.use(request => {
  logger.debug(`Requisição para API Python: ${request.method.toUpperCase()} ${request.baseURL}${request.url}`);
  return request;
});

// Interceptor para logar respostas e padronizar formato
pythonApiClient.interceptors.response.use(
  response => {
    logger.debug(`Resposta da API Python: ${response.status} ${response.statusText}`);
    
    // Garantir que a resposta esteja no formato esperado
    if (response.data && response.data.success !== undefined) {
      return response;
    } else if (response.data && response.data.data !== undefined) {
      // Se a resposta tem um campo 'data' mas não tem 'success', adicionar success=true
      response.data = {
        success: true,
        ...response.data
      };
      return response;
    } else {
      // Se a resposta não segue o formato esperado, padronizar
      const originalData = response.data;
      response.data = {
        success: true,
        data: originalData
      };
      return response;
    }
  },
  error => {
    if (error.response) {
      logger.error(`Erro na comunicação com API Python: ${error.response.status} ${error.response.statusText}`);
      
      // Padronizar resposta de erro
      if (!error.response.data.success) {
        error.response.data = {
          success: false,
          message: error.response.data.detail || error.response.data.message || 'Erro na API Python',
          error: error.response.data.error || 'API_ERROR'
        };
      }
    } else if (error.code === 'ECONNABORTED') {
      logger.error(`Timeout ao conectar com API Python: ${error.message}`);
      error.response = {
        status: StatusCodes.GATEWAY_TIMEOUT,
        data: {
          success: false,
          message: 'Tempo limite excedido ao conectar com o serviço',
          error: 'TIMEOUT_ERROR'
        }
      };
    } else {
      logger.error(`Erro na comunicação com API Python: ${error.message}`);
      error.response = {
        status: StatusCodes.BAD_GATEWAY,
        data: {
          success: false,
          message: 'Erro ao conectar com o serviço',
          error: 'CONNECTION_ERROR'
        }
      };
    }
    return Promise.reject(error);
  }
);

/**
 * Função de retry para requisições à API Python
 * @param {Function} fn - Função que faz a requisição
 * @param {number} retries - Número de tentativas
 * @param {number} delay - Delay entre tentativas em ms
 * @returns {Promise<any>} - Resultado da requisição
 */
async function withRetry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0 || 
        (error.response && error.response.status < 500 && error.response.status !== 429)) {
      // Não tentar novamente para erros 4xx (exceto 429 - Too Many Requests)
      throw error;
    }
    
    logger.warn(`Tentando novamente em ${delay}ms. Tentativas restantes: ${retries}`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2); // Backoff exponencial
  }
}

/**
 * Obtém informações do vídeo a partir da URL
 * @param {string} url - URL do vídeo
 * @returns {Promise<Object>} - Informações do vídeo
 */
async function getVideoInfo(url) {
  const cacheKey = `video_info_${url}`;
  const cachedData = apiCache.get(cacheKey);
  
  if (cachedData) {
    logger.debug(`Usando cache para informações do vídeo: ${url}`);
    return cachedData;
  }
  
  try {
    const response = await withRetry(() => 
      pythonApiClient.get('/video/info', {
        params: { url }
      })
    );
    
    if (!response.data || !response.data.data) {
      throw new Error('Resposta inválida da API Python');
    }
    
    // Armazenar no cache
    apiCache.set(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    logger.error(`Erro ao obter informações do vídeo ${url}:`, error.message);
    throw error;
  }
}

/**
 * Obtém opções de download para o vídeo
 * @param {string} url - URL do vídeo
 * @returns {Promise<Array>} - Lista de opções de download
 */
async function getDownloadOptions(url) {
  const cacheKey = `download_options_${url}`;
  const cachedData = apiCache.get(cacheKey);
  
  if (cachedData) {
    logger.debug(`Usando cache para opções de download: ${url}`);
    return cachedData;
  }
  
  try {
    const response = await withRetry(() => 
      pythonApiClient.get('/video/options', {
        params: { url }
      })
    );
    
    if (!response.data || !response.data.data) {
      throw new Error('Resposta inválida da API Python');
    }
    
    // Verificar se as opções têm os campos necessários e processar os tamanhos
    const options = response.data.data;
    if (Array.isArray(options)) {
      // Verificar se cada opção tem os campos necessários
      const validOptions = options.every(option => 
        option.quality && 
        option.format && 
        option.size !== undefined && // Verificamos apenas se existe, pode ser 0 ou string
        option.type
      );
      
      if (!validOptions) {
        logger.warn(`Opções de download incompletas para ${url}`, options);
      }
      
      // Processar os tamanhos para garantir que estejam no formato correto
      options.forEach(option => {
        // Se o tamanho for um número (bytes), converter para formato legível
        if (typeof option.size === 'number') {
          option.size = formatFileSize(option.size);
          logger.debug(`Tamanho convertido para formato legível: ${option.size}`);
        }
        
        // Se não tiver tamanho ou for inválido, marcar como "Desconhecido"
        if (!option.size || option.size === '0 B' || option.size === '0') {
          logger.warn(`Tamanho não disponível para opção ${option.quality} ${option.format}`);
          option.size = 'Desconhecido';
        }
      });
      
      logger.info(`Opções de download processadas com sucesso para ${url}, ${options.length} opções disponíveis`);
    } else {
      logger.warn(`Formato inesperado para opções de download: ${typeof options}`, options);
    }
    
    // Armazenar no cache
    apiCache.set(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    logger.error(`Erro ao obter opções de download ${url}:`, error.message);
    throw error;
  }
}

/**
 * Formata o tamanho do arquivo em bytes para um formato legível
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} - Tamanho formatado (ex: "1.5 MB")
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return 'Desconhecido';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  if (i === 0) return `${bytes} B`;
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Inicia o download do vídeo
 * @param {Object} downloadRequest - Dados da requisição de download
 * @returns {Promise<Object>} - Resultado da criação da tarefa
 */
async function startDownload(downloadRequest) {
  try {
    if (!downloadRequest) {
      throw new Error('Requisição de download inválida');
    }
    
    // Verificar se temos video_url (novo formato) ou url (formato antigo)
    if (!downloadRequest.video_url && !downloadRequest.url) {
      throw new Error('URL do vídeo não fornecida');
    }
    
    // Normalizar o formato da requisição para o que a API Python espera
    const normalizedRequest = {
      ...downloadRequest,
      // Se video_url estiver presente, usá-lo; caso contrário, usar url
      url: downloadRequest.video_url || downloadRequest.url
    };
    
    // Remover video_url se existir, para evitar confusão na API Python
    if (normalizedRequest.video_url) {
      delete normalizedRequest.video_url;
    }
    
    const response = await withRetry(() => 
      pythonApiClient.post('/video/download', normalizedRequest)
    );
    
    if (!response.data || !response.data.data) {
      throw new Error('Resposta inválida da API Python');
    }
    
    return response.data;
  } catch (error) {
    logger.error(`Erro ao iniciar download:`, error.message);
    throw error;
  }
}

/**
 * Verifica o status de uma tarefa de download
 * @param {string} taskId - ID da tarefa
 * @returns {Promise<Object>} - Status atual da tarefa
 */
async function checkTaskStatus(taskId) {
  try {
    if (!taskId) {
      throw new Error('ID de tarefa inválido');
    }
    
    const response = await withRetry(() => 
      pythonApiClient.get(`/video/task/${taskId}`)
    );
    
    if (!response.data || !response.data.data) {
      throw new Error('Resposta inválida da API Python');
    }
    
    return response.data;
  } catch (error) {
    logger.error(`Erro ao verificar status da tarefa ${taskId}:`, error.message);
    throw error;
  }
}

/**
 * Obtém a URL de download para um arquivo
 * @param {string} taskId - ID da tarefa
 * @returns {Promise<string>} - URL para download do arquivo
 */
async function getDownloadUrl(taskId) {
  try {
    if (!taskId) {
      throw new Error('ID de tarefa inválido');
    }
    
    // Verificar primeiro se a tarefa está concluída
    const statusResponse = await checkTaskStatus(taskId);
    
    if (statusResponse.data.status !== 'completed') {
      throw new Error(`Tarefa ${taskId} não está concluída. Status atual: ${statusResponse.data.status}`);
    }
    
    // Extrair a URL base sem o caminho /api/v1 para evitar duplicação
    const baseUrl = config.pythonApiBaseUrl.replace(/\/api\/v1\/?$/, '');
    
    // Construir URL de download com o caminho correto
    const downloadUrl = `${baseUrl}/api/v1/download/${taskId}`;
    
    logger.info(`URL de download gerada para tarefa ${taskId}: ${downloadUrl}`);
    
    // Verificar se a URL é válida tentando acessá-la (HEAD request)
    try {
      // Usar o caminho correto para a verificação HEAD
      await pythonApiClient.head(`/api/v1/download/${taskId}`, { timeout: 5000 });
    } catch (error) {
      logger.warn(`URL de download não está disponível: ${downloadUrl}`, error.message);
      throw new Error(`URL de download não está disponível para tarefa ${taskId}`);
    }
    
    return downloadUrl;
  } catch (error) {
    logger.error(`Erro ao obter URL de download para tarefa ${taskId}:`, error.message);
    throw error;
  }
}

module.exports = {
  getVideoInfo,
  getDownloadOptions,
  startDownload,
  checkTaskStatus,
  getDownloadUrl
}; 