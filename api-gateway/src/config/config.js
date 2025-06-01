require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  env: process.env.NODE_ENV || 'development',
  pythonApiBaseUrl: process.env.PYTHON_API_URL || 'http://localhost:8000/api/v1',
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimits: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // limite de 100 requisições por janela por IP
  },
  cache: {
    stdTTL: 300, // 5 minutos em segundos
    checkperiod: 600 // 10 minutos em segundos
  },
  supportedPlatforms: [
    'youtube.com', 'youtu.be',
    'instagram.com', 'www.instagram.com',
    'facebook.com', 'www.facebook.com', 'fb.com', 'fb.watch',
    'tiktok.com', 'www.tiktok.com', 'vm.tiktok.com',
    'twitter.com', 'www.twitter.com', 'x.com', 't.co',
    'soundcloud.com', 'www.soundcloud.com', 'snd.sc',
    'twitch.tv', 'www.twitch.tv', 'clips.twitch.tv',
    'pinterest.com', 'www.pinterest.com', 'pin.it',
    'vimeo.com', 'www.vimeo.com',
    'dailymotion.com', 'www.dailymotion.com', 'dai.ly'
  ]
}; 