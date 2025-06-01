const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');
const NodeCache = require('node-cache');

// Cache para armazenar respostas temporariamente
const apiCache = new NodeCache({
  stdTTL: config.cache.stdTTL,
  checkperiod: config.cache.checkperiod
});

// Cliente Axios para comunicação com a API Python
const pythonApiClient = axios.create({
  baseURL: config.pythonApiBaseUrl,
  timeout: 30000, // 30 segundos
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

// Interceptor para logar respostas
pythonApiClient.interceptors.response.use(
  response => {
    logger.debug(`Resposta da API Python: ${response.status} ${response.statusText}`);
    return response;
  },
  error => {
    logger.error('Erro na comunicação com API Python:', error.message);
    return Promise.reject(error);
  }
);

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
    const response = await pythonApiClient.get('/video/info', {
      params: { url }
    });
    
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
    const response = await pythonApiClient.get('/video/options', {
      params: { url }
    });
    
    // Armazenar no cache
    apiCache.set(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    logger.error(`Erro ao obter opções de download ${url}:`, error.message);
    throw error;
  }
}

/**
 * Inicia o download do vídeo
 * @param {Object} downloadRequest - Dados da requisição de download
 * @returns {Promise<Object>} - Resultado da criação da tarefa
 */
async function startDownload(downloadRequest) {
  try {
    const response = await pythonApiClient.post('/video/download', downloadRequest);
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
    const response = await pythonApiClient.get(`/video/task/${taskId}`);
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
    // Na verdade, não precisamos fazer uma requisição adicional à API Python
    // Podemos simplesmente retornar a URL completa diretamente
    const downloadUrl = `${config.pythonApiBaseUrl}/api/v1/download/${taskId}`;
    
    logger.info(`URL de download gerada para tarefa ${taskId}: ${downloadUrl}`);
    
    // Retornar a URL de download direta
    return downloadUrl;
    
    /* Código anterior que fazia uma requisição adicional
    const response = await pythonApiClient.get(`/video/download/${taskId}`);
    
    if (response.data && typeof response.data === 'object') {
      if (response.data.download_url) {
        return response.data.download_url;
      } else if (response.data.data && response.data.data.download_url) {
        return response.data.data.download_url;
      }
    }
    
    logger.error(`Formato de resposta inválido para URL de download: ${JSON.stringify(response.data)}`);
    throw new Error('Formato de resposta inválido: download_url não encontrado');
    */
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