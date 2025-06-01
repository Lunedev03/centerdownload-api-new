const express = require('express');
const videoRoutes = require('./videoRoutes');

const router = express.Router();

// Rota para verificar a saúde da API
router.get('/health', (req, res) => {
  return res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Registrar rotas de vídeo
router.use('/video', videoRoutes);

module.exports = router; 