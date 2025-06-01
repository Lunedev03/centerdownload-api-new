import { toast } from "@/hooks/use-toast"
import { API_BASE_URL, STATUS_CHECK_INTERVAL, STATUS_CHECK_TIMEOUT } from "./config";

// Tipos
export interface DownloadOption {
  quality: string
  format: string
  size: string
  type: 'video' | 'audio'
  recommended?: boolean
}

export interface VideoPreview {
  title: string
  thumbnailUrl: string
  duration: string
  author: string
  viewCount: string
}

export type TaskStatus = {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  download_url?: string;
  error?: string;
};

// Mock de dados - serão usados como fallback ou para testes
export const mockOptions: DownloadOption[] = [
  { quality: "4K", format: "MP4", size: "2.1 GB", type: "video" },
  { quality: "1080p", format: "MP4", size: "850 MB", type: "video", recommended: true },
  { quality: "720p", format: "MP4", size: "450 MB", type: "video" },
  { quality: "480p", format: "MP4", size: "250 MB", type: "video" },
  { quality: "360p", format: "MP4", size: "150 MB", type: "video" },
  { quality: "High", format: "MP3", size: "8 MB", type: "audio", recommended: true },
  { quality: "Medium", format: "MP3", size: "5 MB", type: "audio" },
]

// Simular dados de previsualização
export const mockPreview: VideoPreview = {
  title: "Vídeo de exemplo",
  thumbnailUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop",
  duration: "10:24",
  author: "Canal de Exemplo",
  viewCount: "1.2M"
}

/**
 * Função auxiliar para fazer requisições à API
 * @param endpoint - Endpoint da API
 * @param options - Opções da requisição
 * @returns Promise com a resposta da API
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`Fazendo requisição para: ${url}`, options?.method || 'GET');
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(options?.headers || {})
      }
    });

    console.log(`Resposta recebida de ${url} com status: ${response.status}`);
    
    // Tentar obter o corpo da resposta como JSON
    let data;
    try {
      data = await response.json();
      console.log(`Dados da resposta:`, data);
    } catch (e) {
      console.error(`Erro ao parsear resposta JSON de ${url}:`, e);
      throw new Error('A resposta não é um JSON válido');
    }

    if (!response.ok) {
      console.error(`Erro na resposta (${response.status}) de ${url}:`, data);
      
      // Extrair mensagem de erro de diferentes formatos possíveis
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      if (data) {
        if (typeof data === 'object') {
          if (data.message) errorMessage = data.message;
          else if (data.error) errorMessage = data.error;
          else if (data.detail) errorMessage = data.detail;
          else if (data.data && data.data.message) errorMessage = data.data.message;
        }
      }
      
      throw new Error(errorMessage);
    }

    // Normalizar a resposta para um formato consistente
    return normalizeResponse<T>(data);
  } catch (error) {
    console.error(`Erro na requisição para ${url}:`, error);
    if (error instanceof Error) {
      // Preservar a mensagem de erro original
      throw error;
    } else {
      // Converter erro desconhecido para um erro JavaScript padrão
      throw new Error(`Erro desconhecido na requisição para ${url}`);
    }
  }
}

/**
 * Função auxiliar para normalizar diferentes formatos de resposta
 * @param data - Dados da resposta
 * @returns Dados normalizados
 */
function normalizeResponse<T>(data: any): T {
  // Se data for null ou undefined, retornar como está
  if (data == null) return data as T;
  
  // Se não for um objeto, retornar como está
  if (typeof data !== 'object') return data as T;
  
  // Se for um array, retornar como está
  if (Array.isArray(data)) return data as T;
  
  // Verificar diferentes formatos de resposta
  if ('success' in data && data.success === true && 'data' in data) {
    // Formato { success: true, data: ... }
    return data.data as T;
  } else if ('data' in data && typeof data.data === 'object') {
    // Formato { data: ... } sem campo success
    return data.data as T;
  } else if ('task_id' in data || 'taskId' in data) {
    // Resposta com ID de tarefa diretamente no objeto raiz
    // Normalizar para um formato consistente
    const taskId = data.task_id || data.taskId;
    const status = data.status || 'pending';
    
    return {
      task_id: taskId,
      status: status,
      ...(data.progress !== undefined ? { progress: data.progress } : {}),
      ...(data.download_url !== undefined ? { download_url: data.download_url } : {}),
      ...(data.error !== undefined ? { error: data.error } : {})
    } as unknown as T;
  }
  
  // Se nenhum formato conhecido for detectado, retornar como está
  return data as T;
}

/**
 * Valida se uma URL é suportada para download
 * @param url URL a ser validada
 * @returns boolean indicando se a URL é válida e suportada
 */
export function validateUrl(url: string): { isValid: boolean; message?: string } {
  // Verificar se a URL foi fornecida
  if (!url || url.trim() === '') {
    return { isValid: false, message: 'URL não fornecida' };
  }
  
  // Verificar se é uma URL válida
  try {
    new URL(url);
  } catch (e) {
    return { isValid: false, message: 'URL inválida. Forneça uma URL completa incluindo http:// ou https://' };
  }
  
  // Verificar se a URL é de uma plataforma suportada
  const supportedPlatforms = [
    'youtube.com', 'youtu.be',
    'vimeo.com',
    'dailymotion.com',
    'facebook.com', 'fb.com',
    'instagram.com',
    'twitter.com', 'x.com',
    'tiktok.com'
  ];
  
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();
  
  if (!supportedPlatforms.some(platform => hostname.includes(platform))) {
    return { 
      isValid: false, 
      message: `URL não suportada. Plataformas suportadas: ${supportedPlatforms.join(', ')}` 
    };
  }
  
  return { isValid: true };
}

/**
 * Busca informações do vídeo a partir da URL
 * @param url URL do vídeo
 * @returns Promise com informações do vídeo
 */
export async function fetchVideoInfo(url: string): Promise<VideoPreview> {
  // Validar URL antes de fazer a requisição
  const validation = validateUrl(url);
  if (!validation.isValid) {
    throw new Error(validation.message || 'URL inválida');
  }
  
  try {
    // Tentar obter dados da API
    const result = await fetchApi<VideoPreview | {data: VideoPreview}>(`/video/info?url=${encodeURIComponent(url)}`);
    
    // Verificar se o resultado já é do tipo VideoPreview ou se é um objeto com propriedade data
    if (result && typeof result === 'object') {
      if ('title' in result && 'thumbnailUrl' in result) {
        return result as VideoPreview;
      } else if ('data' in result && typeof result.data === 'object') {
        return result.data as VideoPreview;
      }
    }
    
    console.error("Formato de resposta inválido para informações do vídeo:", result);
    return mockPreview; // Fallback para dados mockados em caso de formato inválido
  } catch (error) {
    console.error("Erro ao buscar informações do vídeo:", error);
    
    // Em modo de desenvolvimento ou se a API não estiver disponível, usar dados mockados
    if (process.env.NODE_ENV === 'development') {
      console.warn("Usando dados mockados como fallback");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular atraso
      return mockPreview;
    }
    
    throw new Error("Não foi possível obter informações sobre este vídeo");
  }
}

/**
 * Busca opções de download para o vídeo
 * @param url URL do vídeo
 * @returns Promise com opções de download
 */
export async function fetchDownloadOptions(url: string): Promise<DownloadOption[]> {
  // Validar URL antes de fazer a requisição
  const validation = validateUrl(url);
  if (!validation.isValid) {
    throw new Error(validation.message || 'URL inválida');
  }
  
  try {
    // Tentar obter dados da API
    const result = await fetchApi<DownloadOption[] | {data: DownloadOption[]}>(`/video/options?url=${encodeURIComponent(url)}`);
    
    // Verificar se o resultado já é um array ou se é um objeto com propriedade data
    let options: DownloadOption[];
    
    if (Array.isArray(result)) {
      options = result;
    } else if (result && typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
      options = result.data;
    } else {
      console.error("Formato de resposta inválido para opções de download:", result);
      console.warn("Usando dados mockados como fallback devido a formato de resposta inválido");
      return mockOptions; // Fallback para dados mockados em caso de formato inválido
    }
    
    // Verificar se as opções retornadas têm a estrutura esperada e dados completos
    if (options.length > 0) {
      // Verificar se cada opção tem os campos necessários
      const validOptions = options.every(option => 
        'quality' in option && 
        'format' in option && 
        'size' in option && 
        'type' in option
      );
      
      if (validOptions) {
        // Processar os tamanhos para garantir que estão em formato legível
        options = options.map(option => {
          // Se o tamanho for um número (bytes), converter para formato legível
          if (typeof option.size === 'number') {
            return {
              ...option,
              size: formatFileSize(option.size)
            };
          }
          
          // Se não tiver tamanho ou for inválido, marcar como "Desconhecido"
          if (!option.size || option.size === '0 B' || option.size === '0') {
            return {
              ...option,
              size: 'Desconhecido'
            };
          }
          
          return option;
        });
        
        console.log("Usando opções de download retornadas pela API:", options);
        return options;
      } else {
        console.warn("Opções de download da API estão incompletas:", options);
      }
    }
    
    console.warn("Usando dados mockados como fallback devido a dados incompletos");
    return mockOptions;
  } catch (error) {
    console.error("Erro ao buscar opções de download:", error);
    
    // Em modo de desenvolvimento ou se a API não estiver disponível, usar dados mockados
    if (process.env.NODE_ENV === 'development') {
      console.warn("Usando dados mockados como fallback devido a erro");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular atraso
      return mockOptions;
    }
    
    throw new Error("Não foi possível obter opções de download para este vídeo");
  }
}

/**
 * Formata o tamanho do arquivo em bytes para um formato legível
 * @param bytes Tamanho em bytes
 * @returns Tamanho formatado (ex: "1.5 MB")
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return 'Desconhecido';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  if (i === 0) return `${bytes} B`;
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Inicia o download do arquivo
 * @param url URL do vídeo original
 * @param quality Qualidade selecionada
 * @returns Promise com resultado do download
 */
export async function startDownload(url: string, quality: string): Promise<{ success: boolean, fileName: string, taskId?: string }> {
  // Validar URL antes de fazer a requisição
  const validation = validateUrl(url);
  if (!validation.isValid) {
    throw new Error(validation.message || 'URL inválida');
  }
  
  try {
    // Preparar o formato baseado na qualidade selecionada
    const format = quality.toLowerCase().includes('mp3') ? 'mp3' : 'mp4';
    
    // Ajustar o formato da requisição para corresponder ao modelo DownloadRequest do backend
    const requestData = { 
      video_url: url,  // Renomeado de 'url' para 'video_url' 
      format,
      audio_only: format === 'mp3'
    };
    
    console.log("Iniciando download com dados:", requestData);
    
    // Tentar iniciar download via API
    const response = await fetchApi<{ task_id: string, status: string } | { data: { task_id: string, status: string } }>('/video/download', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    
    console.log("Resposta da API de download:", response);
    
    // Extrair o task_id da resposta, independente do formato
    let taskId: string;
    if ('task_id' in response) {
      taskId = response.task_id;
    } else if ('data' in response && typeof response.data === 'object' && 'task_id' in response.data) {
      taskId = response.data.task_id;
    } else {
      console.error("Formato de resposta inválido:", response);
      throw new Error('Formato de resposta inválido: task_id não encontrado');
    }
    
    return {
      success: true,
      fileName: `${url.split('/').pop() || 'video'}.${format}`,
      taskId: taskId
    };
  } catch (error) {
    console.error("Erro ao iniciar download:", error);
    
    // Em modo de desenvolvimento ou se a API não estiver disponível, simular sucesso
    if (process.env.NODE_ENV === 'development') {
      console.warn("Simulando download bem-sucedido como fallback");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular atraso
      
      // Preparar o nome do arquivo
      const fileName = url
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      const fileExtension = quality.toLowerCase().includes('mp3') ? 'mp3' : 'mp4';
      
      return {
        success: true,
        fileName: `${fileName}.${fileExtension}`,
        taskId: `mock-${Date.now()}`
      };
    }
    
    // Se não estiver em modo de desenvolvimento, propagar o erro
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Não foi possível iniciar o download. Tente novamente mais tarde.");
    }
  }
}

/**
 * Verifica o status de uma tarefa de download
 * @param taskId ID da tarefa
 * @returns Promise com o status da tarefa
 */
export async function checkTaskStatus(taskId: string): Promise<TaskStatus> {
  try {
    // Tentar obter status via API
    const result = await fetchApi<TaskStatus | { data: TaskStatus }>(`/video/status/${taskId}`);
    
    // Verificar o formato da resposta
    let status: TaskStatus;
    
    if ('status' in result) {
      // Resposta já está no formato esperado
      status = result as TaskStatus;
    } else if ('data' in result && typeof result.data === 'object' && 'status' in result.data) {
      // Resposta encapsulada em um objeto data
      status = result.data as TaskStatus;
    } else {
      console.error("Formato de resposta inválido para status da tarefa:", result);
      throw new Error('Formato de resposta inválido: status não encontrado');
    }
    
    console.log("Status da tarefa:", status);
    return status;
  } catch (error) {
    console.error("Erro ao verificar status da tarefa:", error);
    
    // Em modo de desenvolvimento ou se a API não estiver disponível, simular status
    if (process.env.NODE_ENV === 'development') {
      console.warn("Simulando status da tarefa como fallback");
      return {
        task_id: taskId,
        status: 'completed',
        progress: 100
      };
    }
    
    throw new Error("Não foi possível verificar o status do download.");
  }
}

/**
 * Monitora o status de uma tarefa de download até que esteja concluída
 * @param taskId ID da tarefa
 * @param onStatusUpdate Callback para atualização de status
 * @returns Promise com o status final da tarefa
 */
export async function monitorTaskStatus(
  taskId: string,
  onStatusUpdate?: (status: TaskStatus) => void
): Promise<TaskStatus> {
  return new Promise((resolve, reject) => {
    let elapsedTime = 0;
    
    // Função para verificar o status periodicamente
    const checkStatus = async () => {
      try {
        const status = await checkTaskStatus(taskId);
        
        // Notificar sobre a atualização de status
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }
        
        // Se o download estiver concluído ou falhou, resolver ou rejeitar a promessa
        if (status.status === 'completed') {
          resolve(status);
          return;
        } else if (status.status === 'failed') {
          reject(new Error(status.error || "O download falhou."));
          return;
        }
        
        // Verificar se excedeu o tempo limite
        elapsedTime += STATUS_CHECK_INTERVAL;
        if (elapsedTime >= STATUS_CHECK_TIMEOUT) {
          reject(new Error("Tempo limite excedido ao aguardar o download."));
          return;
        }
        
        // Continuar verificando
        setTimeout(checkStatus, STATUS_CHECK_INTERVAL);
      } catch (error) {
        reject(error);
      }
    };
    
    // Iniciar a verificação
    checkStatus();
  });
}

/**
 * Obtém a URL de download para uma tarefa concluída
 * @param taskId ID da tarefa
 * @returns Promise com a URL de download
 */
export async function getDownloadUrl(taskId: string): Promise<string> {
  try {
    // Tentar obter URL de download via API
    const result = await fetchApi<{ download_url: string } | { data: { download_url: string } }>(`/video/download/${taskId}`);
    
    // Extrair a URL de download, independente do formato
    let downloadUrl: string;
    if (typeof result === 'object') {
      if ('download_url' in result) {
        downloadUrl = result.download_url;
      } else if (result.data && 'download_url' in result.data) {
        downloadUrl = result.data.download_url;
      } else {
        console.error("Formato de resposta inválido para URL de download:", result);
        throw new Error('Formato de resposta inválido: download_url não encontrado');
      }
    } else if (typeof result === 'string') {
      // Se a resposta já foi normalizada para uma string
      downloadUrl = result;
    } else {
      console.error("Formato de resposta inválido para URL de download:", result);
      throw new Error('Formato de resposta inválido: download_url não encontrado');
    }
    
    // Garantir que a URL seja absoluta
    if (downloadUrl && !downloadUrl.startsWith('http')) {
      // Se a URL for relativa, transformá-la em absoluta baseada na URL da API Gateway
      const apiBaseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
      downloadUrl = `${apiBaseUrl}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
    }
    
    console.log("URL de download obtida:", downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error("Erro ao obter URL de download:", error);
    
    // Em modo de desenvolvimento ou se a API não estiver disponível, simular URL
    if (process.env.NODE_ENV === 'development') {
      console.warn("Simulando URL de download como fallback");
      
      // Construir URL simulada usando a mesma lógica da API Gateway
      const apiBaseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
      const mockUrl = `${apiBaseUrl}/api/v1/download/${taskId}`;
      
      console.log("URL de download simulada:", mockUrl);
      return mockUrl;
    }
    
    throw new Error("Não foi possível obter o link de download.");
  }
} 