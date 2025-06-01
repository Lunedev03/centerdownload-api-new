const config = require('../config/config');
const logger = require('../utils/logger');
const { StatusCodes } = require('http-status-codes');

/**
 * Middleware para validar se a URL pertence a uma plataforma suportada
 */
function validateUrl(req, res, next) {
  const url = req.query.url || req.body.url;
  
  if (!url) {
    logger.warn('Tentativa de requisição sem URL');
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'URL é obrigatória',
      error: 'MISSING_URL'
    });
  }
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Verifica se o domínio é suportado
    const isSupported = config.supportedPlatforms.some(platform => 
      hostname === platform || hostname.endsWith('.' + platform)
    );
    
    if (!isSupported) {
      logger.warn(`URL não suportada: ${url}`);
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'URL não suportada. Use links das plataformas suportadas.',
        error: 'UNSUPPORTED_URL'
      });
    }
    
    // Se chegou aqui, a URL é válida
    next();
  } catch (error) {
    logger.warn(`URL inválida: ${url}`);
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'URL inválida. Verifique o endereço e tente novamente.',
      error: 'INVALID_URL'
    });
  }
}

module.exports = validateUrl; 