/**
 * Script para iniciar ambas as APIs (Python e Node.js) simultaneamente
 */
const { spawn } = require('child_process');
const path = require('path');

// Cores para diferenciar os logs
const colors = {
  reset: '\x1b[0m',
  python: '\x1b[36m', // Ciano
  node: '\x1b[32m',   // Verde
  error: '\x1b[31m',  // Vermelho
  info: '\x1b[33m'    // Amarelo
};

console.log(`${colors.info}Iniciando APIs...${colors.reset}`);

// Iniciar API Python (FastAPI)
const pythonApi = spawn('python', ['-m', 'uvicorn', 'app.main:app_fastapi', '--reload', '--port', '8000'], {
  cwd: process.cwd(),
  shell: true
});

// Iniciar API Node.js (Express)
const nodeApi = spawn('npm', ['run', 'dev'], {
  cwd: path.join(process.cwd(), 'api-gateway'),
  shell: true
});

// Capturar saída da API Python
pythonApi.stdout.on('data', (data) => {
  console.log(`${colors.python}[Python API] ${data.toString().trim()}${colors.reset}`);
});

pythonApi.stderr.on('data', (data) => {
  console.error(`${colors.error}[Python API Error] ${data.toString().trim()}${colors.reset}`);
});

// Capturar saída da API Node.js
nodeApi.stdout.on('data', (data) => {
  console.log(`${colors.node}[Node API] ${data.toString().trim()}${colors.reset}`);
});

nodeApi.stderr.on('data', (data) => {
  console.error(`${colors.error}[Node API Error] ${data.toString().trim()}${colors.reset}`);
});

// Tratar encerramento das APIs
pythonApi.on('close', (code) => {
  console.log(`${colors.info}API Python encerrada com código ${code}${colors.reset}`);
});

nodeApi.on('close', (code) => {
  console.log(`${colors.info}API Node.js encerrada com código ${code}${colors.reset}`);
});

// Tratar sinais de encerramento do processo principal
process.on('SIGINT', () => {
  console.log(`${colors.info}Encerrando APIs...${colors.reset}`);
  pythonApi.kill();
  nodeApi.kill();
});

process.on('SIGTERM', () => {
  console.log(`${colors.info}Encerrando APIs...${colors.reset}`);
  pythonApi.kill();
  nodeApi.kill();
}); 