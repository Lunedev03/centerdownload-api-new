/**
 * Configurações globais da aplicação
 * Centraliza o acesso a variáveis de ambiente e outras configurações
 */

// URL base da API Gateway (Express.js)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Tempo máximo de espera para verificação de status (em milissegundos)
export const STATUS_CHECK_TIMEOUT = 300000; // 5 minutos

// Intervalo entre verificações de status (em milissegundos)
export const STATUS_CHECK_INTERVAL = 2000; // 2 segundos

// Tempo máximo de espera para download (em milissegundos)
export const DOWNLOAD_TIMEOUT = 60000; // 1 minuto

// Plataformas suportadas para download
export const SUPPORTED_PLATFORMS = [
  'youtube.com',
  'youtu.be',
  'vimeo.com',
  'dailymotion.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'tiktok.com'
];

// Verifica se uma URL é de uma plataforma suportada
export function isUrlSupported(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return SUPPORTED_PLATFORMS.some(platform => urlObj.hostname.includes(platform));
  } catch (e) {
    return false;
  }
}

// Formatos de arquivo suportados
export const SUPPORTED_FORMATS = ['mp4', 'mp3', 'webm', 'ogg', 'wav', 'aac'];

// Qualidades de vídeo suportadas
export const SUPPORTED_QUALITIES = ['1080p', '720p', '480p', '360p', '240p', '144p'];

// Configurações de desenvolvimento
export const DEV_CONFIG = {
  enableMocks: process.env.NEXT_PUBLIC_ENABLE_MOCKS === 'true',
  logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info'
}; 