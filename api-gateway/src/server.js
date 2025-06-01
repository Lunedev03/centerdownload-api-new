const app = require('./app');
const config = require('./config/config');
const logger = require('./utils/logger');

// Iniciar o servidor
const server = app.listen(config.port, () => {
  logger.info(`API Gateway iniciado na porta ${config.port} em modo ${config.env}`);
  logger.info(`API Python configurada em ${config.pythonApiBaseUrl}`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Exceção não capturada:', error);
  // Aguardar 1 segundo para garantir que os logs sejam gravados
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Tratamento de promessas rejeitadas não capturadas
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promessa rejeitada não tratada:', reason);
});

// Tratamento de sinal de encerramento (SIGTERM)
process.on('SIGTERM', () => {
  logger.info('Recebido sinal SIGTERM, encerrando servidor graciosamente');
  server.close(() => {
    logger.info('Servidor encerrado');
    process.exit(0);
  });
});

module.exports = server; 