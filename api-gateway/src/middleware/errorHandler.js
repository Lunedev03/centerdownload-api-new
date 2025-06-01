const { StatusCodes } = require('http-status-codes');
const logger = require('../utils/logger');

/**
 * Middleware para tratamento de erros
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Ocorreu um erro interno no servidor';
  const errorCode = err.errorCode || 'SERVER_ERROR';
  
  logger.error(`[Error Handler] ${message}`, {
    statusCode,
    errorCode,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorCode
  });
}

module.exports = errorHandler; 