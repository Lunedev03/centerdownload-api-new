/**
 * Utilitários para validação de dados
 */

/**
 * Verifica se uma string é uma URL válida
 * @param {string} url - String a ser verificada
 * @returns {boolean} - Verdadeiro se for uma URL válida
 */
function isValidUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

/**
 * Verifica se uma URL é de uma plataforma suportada
 * @param {string} url - URL a ser verificada
 * @returns {boolean} - Verdadeiro se for de uma plataforma suportada
 */
function isSupportedPlatform(url) {
  if (!isValidUrl(url)) {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Lista de plataformas suportadas
    const supportedPlatforms = [
      'youtube.com', 'youtu.be',
      'vimeo.com',
      'dailymotion.com',
      'facebook.com', 'fb.com',
      'instagram.com',
      'twitter.com', 'x.com',
      'tiktok.com'
    ];
    
    return supportedPlatforms.some(platform => hostname.includes(platform));
  } catch (e) {
    return false;
  }
}

module.exports = {
  isValidUrl,
  isSupportedPlatform
}; 