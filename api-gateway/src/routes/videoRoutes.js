const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const validateUrl = require('../middleware/urlValidator');
const { validateTaskId } = require('../middleware/urlValidator');

// Rota para obter informações do vídeo
router.get('/info', validateUrl, videoController.getVideoInfo);

// Rota para obter opções de download
router.get('/options', validateUrl, videoController.getDownloadOptions);

// Rota para iniciar download
router.post('/download', validateUrl, videoController.startDownload);

// Rota para verificar status da tarefa
router.get('/task/:taskId', validateTaskId, videoController.checkTaskStatus);

// Rota para obter URL de download
router.get('/download/:taskId', validateTaskId, videoController.getDownloadUrl);

// Rota adicional para verificar status (compatibilidade com frontend)
router.get('/status/:taskId', validateTaskId, videoController.checkTaskStatus);

module.exports = router; 