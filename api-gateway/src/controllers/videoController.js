const { StatusCodes } = require('http-status-codes');
const pythonApiService = require('../services/pythonApiService');
const logger = require('../utils/logger');

/**
 * Controlador para obter informações do vídeo
 */
async function getVideoInfo(req, res) {
  const { url } = req.query;
  
  try {
    logger.info(`Requisição de informações para vídeo: ${url}`);
    const videoInfo = await pythonApiService.getVideoInfo(url);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: videoInfo
    });
  } catch (error) {
    logger.error(`Erro ao obter informações do vídeo: ${error.message}`);
    
    // Verificar se o erro vem da API Python
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Erro ao processar a requisição',
        error: error.response.data.error || 'API_ERROR'
      });
    }
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Ocorreu um erro ao processar sua requisição',
      error: 'SERVER_ERROR'
    });
  }
}

/**
 * Controlador para obter opções de download
 */
async function getDownloadOptions(req, res) {
  const { url } = req.query;
  
  try {
    logger.info(`Requisição de opções de download para vídeo: ${url}`);
    const options = await pythonApiService.getDownloadOptions(url);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: options
    });
  } catch (error) {
    logger.error(`Erro ao obter opções de download: ${error.message}`);
    
    // Verificar se o erro vem da API Python
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Erro ao processar a requisição',
        error: error.response.data.error || 'API_ERROR'
      });
    }
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Ocorreu um erro ao processar sua requisição',
      error: 'SERVER_ERROR'
    });
  }
}

/**
 * Controlador para iniciar o download do vídeo
 */
async function startDownload(req, res) {
  const downloadRequest = req.body;
  
  try {
    logger.info(`Requisição para iniciar download: ${downloadRequest.url}`);
    const taskResult = await pythonApiService.startDownload(downloadRequest);
    
    return res.status(StatusCodes.ACCEPTED).json({
      success: true,
      data: taskResult
    });
  } catch (error) {
    logger.error(`Erro ao iniciar download: ${error.message}`);
    
    // Verificar se o erro vem da API Python
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Erro ao processar a requisição',
        error: error.response.data.error || 'API_ERROR'
      });
    }
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Ocorreu um erro ao processar sua requisição',
      error: 'SERVER_ERROR'
    });
  }
}

/**
 * Controlador para verificar o status de uma tarefa
 */
async function checkTaskStatus(req, res) {
  const { taskId } = req.params;
  
  try {
    logger.info(`Verificando status da tarefa: ${taskId}`);
    const taskStatus = await pythonApiService.checkTaskStatus(taskId);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: taskStatus
    });
  } catch (error) {
    logger.error(`Erro ao verificar status da tarefa: ${error.message}`);
    
    // Verificar se o erro vem da API Python
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Erro ao processar a requisição',
        error: error.response.data.error || 'API_ERROR'
      });
    }
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Ocorreu um erro ao verificar o status da tarefa',
      error: 'SERVER_ERROR'
    });
  }
}

/**
 * Controlador para obter o link de download
 */
async function getDownloadUrl(req, res) {
  const { taskId } = req.params;
  
  try {
    logger.info(`Requisição de URL de download para tarefa: ${taskId}`);
    const downloadUrl = await pythonApiService.getDownloadUrl(taskId);
    
    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        download_url: downloadUrl
      }
    });
  } catch (error) {
    logger.error(`Erro ao obter URL de download: ${error.message}`);
    
    // Verificar se o erro vem da API Python
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.message || 'Erro ao processar a requisição',
        error: error.response.data.error || 'API_ERROR'
      });
    }
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Ocorreu um erro ao obter a URL de download',
      error: 'SERVER_ERROR'
    });
  }
}

module.exports = {
  getVideoInfo,
  getDownloadOptions,
  startDownload,
  checkTaskStatus,
  getDownloadUrl
}; 