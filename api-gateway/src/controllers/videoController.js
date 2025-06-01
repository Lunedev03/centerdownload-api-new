const { StatusCodes } = require('http-status-codes');
const pythonApiService = require('../services/pythonApiService');
const logger = require('../utils/logger');

/**
 * Função auxiliar para tratar erros de forma consistente
 */
function handleApiError(error, res, operation) {
  logger.error(`Erro ao ${operation}: ${error.message}`);
  
  // Verificar se o erro vem da API Python com resposta formatada
  if (error.response && error.response.data) {
    const status = error.response.status || StatusCodes.INTERNAL_SERVER_ERROR;
    return res.status(status).json({
      success: false,
      message: error.response.data.message || 'Erro ao processar a requisição',
      error: error.response.data.error || 'API_ERROR'
    });
  }
  
  // Erros gerais
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: `Ocorreu um erro ao ${operation}`,
    error: 'SERVER_ERROR'
  });
}

/**
 * Controlador para obter informações do vídeo
 */
async function getVideoInfo(req, res) {
  const { url } = req.query;
  const correlationId = req.headers['x-correlation-id'] || 'unknown';
  
  try {
    logger.info(`Requisição de informações para vídeo: ${url}`, { correlationId, url });
    const videoInfo = await pythonApiService.getVideoInfo(url);
    
    return res.status(StatusCodes.OK).json(videoInfo);
  } catch (error) {
    return handleApiError(error, res, 'obter informações do vídeo');
  }
}

/**
 * Controlador para obter opções de download
 */
async function getDownloadOptions(req, res) {
  const { url } = req.query;
  const correlationId = req.headers['x-correlation-id'] || 'unknown';
  
  try {
    logger.info(`Requisição de opções de download para vídeo: ${url}`, { correlationId, url });
    const options = await pythonApiService.getDownloadOptions(url);
    
    return res.status(StatusCodes.OK).json(options);
  } catch (error) {
    return handleApiError(error, res, 'obter opções de download');
  }
}

/**
 * Controlador para iniciar o download do vídeo
 */
async function startDownload(req, res) {
  const downloadRequest = req.body;
  const correlationId = req.headers['x-correlation-id'] || 'unknown';
  
  try {
    if (!downloadRequest || !downloadRequest.url) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Dados de download inválidos',
        error: 'INVALID_REQUEST'
      });
    }
    
    logger.info(`Requisição para iniciar download: ${downloadRequest.url}`, { correlationId, url: downloadRequest.url });
    const taskResult = await pythonApiService.startDownload(downloadRequest);
    
    return res.status(StatusCodes.ACCEPTED).json(taskResult);
  } catch (error) {
    return handleApiError(error, res, 'iniciar download');
  }
}

/**
 * Controlador para verificar o status de uma tarefa
 */
async function checkTaskStatus(req, res) {
  const { taskId } = req.params;
  const correlationId = req.headers['x-correlation-id'] || 'unknown';
  
  try {
    if (!taskId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'ID da tarefa é obrigatório',
        error: 'MISSING_TASK_ID'
      });
    }
    
    logger.info(`Verificando status da tarefa: ${taskId}`, { correlationId, taskId });
    const taskStatus = await pythonApiService.checkTaskStatus(taskId);
    
    return res.status(StatusCodes.OK).json(taskStatus);
  } catch (error) {
    return handleApiError(error, res, 'verificar status da tarefa');
  }
}

/**
 * Controlador para obter o link de download
 */
async function getDownloadUrl(req, res) {
  const { taskId } = req.params;
  const correlationId = req.headers['x-correlation-id'] || 'unknown';
  
  try {
    if (!taskId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'ID da tarefa é obrigatório',
        error: 'MISSING_TASK_ID'
      });
    }
    
    logger.info(`Requisição de URL de download para tarefa: ${taskId}`, { correlationId, taskId });
    const downloadUrl = await pythonApiService.getDownloadUrl(taskId);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        download_url: downloadUrl
      }
    });
  } catch (error) {
    return handleApiError(error, res, 'obter a URL de download');
  }
}

module.exports = {
  getVideoInfo,
  getDownloadOptions,
  startDownload,
  checkTaskStatus,
  getDownloadUrl
}; 