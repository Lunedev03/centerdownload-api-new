const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Criar aplicação Express
const app = express();

// Adicionar middlewares básicos
app.use(helmet()); // Segurança
app.use(cors()); // Permitir CORS
app.use(express.json()); // Parser de JSON
app.use(express.urlencoded({ extended: true })); // Parser de URL encoded

// Logging de requisições HTTP
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: config.rateLimits.windowMs,
  max: config.rateLimits.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Muitas requisições, por favor tente novamente mais tarde',
    error: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use(limiter);

// Registrar rotas com prefixo de API
app.use('/api/v1', routes);

// Rota para status da API
app.get('/status', (req, res) => {
  return res.json({
    status: 'running',
    name: 'api-gateway',
    version: process.env.npm_package_version || '1.0.0',
    env: config.env,
    timestamp: new Date().toISOString()
  });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Recurso não encontrado',
    error: 'NOT_FOUND'
  });
});

// Middleware para tratamento de erros
app.use(errorHandler);

module.exports = app; 