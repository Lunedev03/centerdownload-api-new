import { toast } from "@/hooks/use-toast"

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

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
      throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
    }

    // Verificar se a resposta contém uma propriedade data
    if (data && typeof data === 'object') {
      // Se a resposta já possui o formato esperado, retorná-la diretamente
      if ('success' in data && data.success === true && 'data' in data) {
        return data.data as T;
      }
      
      // Se não tiver a estrutura de API esperada, retornar os dados como estão
      return data as T;
    }

    // Caso não seja um objeto, retornar os dados como estão
    return data as T;
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
 * Busca informações do vídeo a partir da URL
 * @param url URL do vídeo
 * @returns Promise com informações do vídeo
 */
export async function fetchVideoInfo(url: string): Promise<VideoPreview> {
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
  try {
    // Tentar obter dados da API
    const result = await fetchApi<DownloadOption[] | {data: DownloadOption[]}>(`/video/options?url=${encodeURIComponent(url)}`);
    
    // Verificar se o resultado já é um array ou se é um objeto com propriedade data
    if (Array.isArray(result)) {
      return result;
    } else if (result && typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
      return result.data;
    } else {
      console.error("Formato de resposta inválido para opções de download:", result);
      return mockOptions; // Fallback para dados mockados em caso de formato inválido
    }
  } catch (error) {
    console.error("Erro ao buscar opções de download:", error);
    
    // Em modo de desenvolvimento ou se a API não estiver disponível, usar dados mockados
    if (process.env.NODE_ENV === 'development') {
      console.warn("Usando dados mockados como fallback");
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular atraso
      return mockOptions;
    }
    
    throw new Error("Não foi possível obter opções de download para este vídeo");
  }
}

/**
 * Inicia o download do arquivo
 * @param url URL do vídeo original
 * @param quality Qualidade selecionada
 * @returns Promise com resultado do download
 */
export async function startDownload(url: string, quality: string): Promise<{ success: boolean, fileName: string, taskId?: string }> {
  try {
    // Preparar o formato baseado na qualidade selecionada
    const format = mockOptions.find(opt => opt.quality === quality)?.format.toLowerCase() || 'mp4';
    const requestData = { 
      url, 
      quality,
      format
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
      const fileName = mockPreview.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      
      const selectedOption = mockOptions.find(opt => opt.quality === quality);
      const fileExtension = selectedOption?.format.toLowerCase() || 'mp4';
      
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
 * @returns Promise com o status atual da tarefa
 */
export async function checkTaskStatus(taskId: string): Promise<{ 
  status: 'pending' | 'processing' | 'completed' | 'failed', 
  progress?: number,
  download_url?: string,
  error?: string
}> {
  try {
    // Tentar verificar status via API
    type TaskStatus = {
      status: 'pending' | 'processing' | 'completed' | 'failed',
      progress?: number,
      download_url?: string,
      error?: string
    };
    
    const result = await fetchApi<TaskStatus | { data: TaskStatus }>(`/video/task/${taskId}`);
    
    // Verificar formato da resposta
    if ('status' in result) {
      return result as TaskStatus;
    } else if ('data' in result && typeof result.data === 'object' && 'status' in result.data) {
      return result.data as TaskStatus;
    } else {
      console.error("Formato de resposta inválido para status da tarefa:", result);
      throw new Error('Formato de resposta inválido: status não encontrado');
    }
  } catch (error) {
    console.error("Erro ao verificar status da tarefa:", error);
    
    // Em modo de desenvolvimento ou se a API não estiver disponível, simular status
    if (process.env.NODE_ENV === 'development') {
      console.warn("Simulando status da tarefa como fallback");
      // Gerar status aleatório para testes
      const statuses = ['pending', 'processing', 'completed', 'failed'] as const;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      return {
        status,
        progress: status === 'processing' ? Math.floor(Math.random() * 100) : undefined,
        download_url: status === 'completed' ? `http://localhost:3000/mock-download/${taskId}` : undefined,
        error: status === 'failed' ? 'Erro simulado durante o download' : undefined
      };
    }
    
    throw new Error("Não foi possível verificar o status do download.");
  }
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
    if ('download_url' in result) {
      downloadUrl = result.download_url;
    } else if ('data' in result && typeof result.data === 'object' && 'download_url' in result.data) {
      downloadUrl = result.data.download_url;
    } else {
      console.error("Formato de resposta inválido para URL de download:", result);
      throw new Error('Formato de resposta inválido: download_url não encontrado');
    }
    
    // Garantir que a URL seja absoluta
    if (downloadUrl && !downloadUrl.startsWith('http')) {
      // Se a URL for relativa, transformá-la em absoluta baseada na URL da API Python
      const pythonApiBaseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';
      downloadUrl = `${pythonApiBaseUrl}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
    }
    
    console.log("URL de download obtida:", downloadUrl);
    return downloadUrl;
  } catch (error) {
    console.error("Erro ao obter URL de download:", error);
    
    // Em modo de desenvolvimento ou se a API não estiver disponível, simular URL
    if (process.env.NODE_ENV === 'development') {
      console.warn("Simulando URL de download como fallback");
      const mockUrl = `http://localhost:8000/api/v1/download/file/${taskId}`;
      console.log("URL de download simulada:", mockUrl);
      return mockUrl;
    }
    
    throw new Error("Não foi possível obter o link de download.");
  }
} 