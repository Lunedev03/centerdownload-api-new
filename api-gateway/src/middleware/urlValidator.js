const config = require('../config/config');
const logger = require('../utils/logger');
const { StatusCodes } = require('http-status-codes');
const { isValidUrl, isSupportedPlatform } = require('../utils/validators');

/**
 * Middleware para validar se a URL pertence a uma plataforma suportada
 * e se parece com uma URL de vídeo válida
 */
function validateUrl(req, res, next) {
  // Obter URL da query ou do body
  const url = req.query.url || (req.body && req.body.url) || (req.body && req.body.video_url);
  
  if (!url) {
    logger.warn('URL não fornecida na requisição');
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'URL do vídeo não fornecida',
      error: 'MISSING_URL'
    });
  }
  
  if (!isValidUrl(url)) {
    logger.warn(`URL inválida fornecida: ${url}`);
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'URL do vídeo inválida',
      error: 'INVALID_URL'
    });
  }
  
  if (!isSupportedPlatform(url)) {
    logger.warn(`URL de plataforma não suportada: ${url}`);
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Plataforma não suportada. Verifique a lista de plataformas suportadas.',
      error: 'UNSUPPORTED_URL'
    });
  }
  
  // URL válida, continuar
  next();
}

/**
 * Verifica se a URL parece ser de um vídeo com base em padrões conhecidos
 * @param {string} url - URL completa
 * @param {string} hostname - Hostname extraído da URL
 * @returns {boolean} - true se parece ser uma URL de vídeo
 */
function validateVideoUrlPattern(url, hostname) {
  // Padrões específicos para cada plataforma
  if (hostname.includes('youtube.com')) {
    // YouTube: deve ter "watch?v=" ou "shorts/"
    return url.includes('watch?v=') || url.includes('/shorts/');
  }
  
  if (hostname.includes('youtu.be')) {
    // YouTube short URL: deve ter um path
    const urlObj = new URL(url);
    return urlObj.pathname.length > 1;
  }
  
  if (hostname.includes('instagram.com')) {
    // Instagram: deve ter "/p/" ou "/reel/" ou "/tv/"
    return url.includes('/p/') || url.includes('/reel/') || url.includes('/tv/');
  }
  
  if (hostname.includes('facebook.com') || hostname.includes('fb.com') || hostname.includes('fb.watch')) {
    // Facebook: deve ter "/watch/" ou "/videos/" ou um ID numérico longo
    return url.includes('/watch/') || url.includes('/videos/') || /\/\d{10,}/.test(url);
  }
  
  if (hostname.includes('tiktok.com')) {
    // TikTok: deve ter "/video/" ou "@username"
    return url.includes('/video/') || url.includes('/@');
  }
  
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    // Twitter/X: deve ter "/status/"
    return url.includes('/status/');
  }
  
  if (hostname.includes('twitch.tv')) {
    // Twitch: deve ter "/videos/" ou "/clip/"
    return url.includes('/videos/') || url.includes('/clip/');
  }
  
  if (hostname.includes('vimeo.com')) {
    // Vimeo: geralmente tem apenas um ID numérico no path
    const urlObj = new URL(url);
    return /^\/\d+$/.test(urlObj.pathname);
  }
  
  // Para outras plataformas, aceitar por padrão e deixar a API Python validar
  return true;
}

/**
 * Middleware para validar ID de tarefa nas requisições
 * @param {Object} req - Objeto de requisição Express
 * @param {Object} res - Objeto de resposta Express
 * @param {Function} next - Função para passar para o próximo middleware
 */
function validateTaskId(req, res, next) {
  const { taskId } = req.params;
  
  if (!taskId) {
    logger.warn('ID de tarefa não fornecido na requisição');
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'ID de tarefa não fornecido',
      error: 'MISSING_TASK_ID'
    });
  }
  
  // Verificar se o taskId tem um formato válido (por exemplo, UUID ou string não vazia)
  if (typeof taskId !== 'string' || taskId.trim() === '') {
    logger.warn(`ID de tarefa inválido fornecido: ${taskId}`);
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'ID de tarefa inválido',
      error: 'INVALID_TASK_ID'
    });
  }
  
  // TaskId válido, continuar
  next();
}

module.exports = validateUrl;
module.exports.validateTaskId = validateTaskId; 