/**
 * Módulo de logging para a aplicação
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Obter nível de log da configuração ou usar INFO como padrão
const currentLogLevel = process.env.LOG_LEVEL 
  ? (LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] || LOG_LEVELS.INFO)
  : LOG_LEVELS.INFO;

/**
 * Formata uma mensagem de log com timestamp
 * @param {string} level - Nível do log
 * @param {string} message - Mensagem principal
 * @param {any} [details] - Detalhes adicionais (opcional)
 * @returns {string} - Mensagem formatada
 */
function formatLogMessage(level, message, details) {
  const timestamp = new Date().toISOString();
  let formattedMessage = `[${timestamp}] ${level}: ${message}`;
  
  if (details !== undefined) {
    if (typeof details === 'object') {
      try {
        formattedMessage += ` - ${JSON.stringify(details)}`;
      } catch (e) {
        formattedMessage += ` - [Objeto não serializável]`;
      }
    } else {
      formattedMessage += ` - ${details}`;
    }
  }
  
  return formattedMessage;
}

/**
 * Logger para mensagens de erro
 * @param {string} message - Mensagem de erro
 * @param {any} [details] - Detalhes adicionais (opcional)
 */
function error(message, details) {
  if (currentLogLevel >= LOG_LEVELS.ERROR) {
    console.error(formatLogMessage('ERROR', message, details));
  }
}

/**
 * Logger para mensagens de aviso
 * @param {string} message - Mensagem de aviso
 * @param {any} [details] - Detalhes adicionais (opcional)
 */
function warn(message, details) {
  if (currentLogLevel >= LOG_LEVELS.WARN) {
    console.warn(formatLogMessage('WARN', message, details));
  }
}

/**
 * Logger para mensagens informativas
 * @param {string} message - Mensagem informativa
 * @param {any} [details] - Detalhes adicionais (opcional)
 */
function info(message, details) {
  if (currentLogLevel >= LOG_LEVELS.INFO) {
    console.info(formatLogMessage('INFO', message, details));
  }
}

/**
 * Logger para mensagens de debug
 * @param {string} message - Mensagem de debug
 * @param {any} [details] - Detalhes adicionais (opcional)
 */
function debug(message, details) {
  if (currentLogLevel >= LOG_LEVELS.DEBUG) {
    console.debug(formatLogMessage('DEBUG', message, details));
  }
}

module.exports = {
  error,
  warn,
  info,
  debug
}; 