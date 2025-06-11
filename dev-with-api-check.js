/**
 * Script para desenvolvimento que verifica se as APIs estão rodando antes de iniciar o servidor Next.js
 */
const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

// Cores para diferenciar os logs
const colors = {
  reset: '\x1b[0m',
  python: '\x1b[36m', // Ciano
  node: '\x1b[32m',   // Verde
  error: '\x1b[31m',  // Vermelho
  info: '\x1b[33m',   // Amarelo
  success: '\x1b[32m', // Verde
  warning: '\x1b[33m'  // Amarelo
};

console.log(`${colors.info}Iniciando ambiente de desenvolvimento...${colors.reset}`);

// Verificar se as pastas necessárias existem
if (!fs.existsSync(path.join(process.cwd(), 'app/download'))) {
  fs.mkdirSync(path.join(process.cwd(), 'app/download'), { recursive: true });
  console.log(`${colors.info}Pasta app/download criada${colors.reset}`);
}

// Configurações
const PYTHON_API_URL = 'http://localhost:8000/api/v1/health';
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 2000; // 2 segundos
const PYTHON_SETUP_SCRIPT = 'setup-python-api.py';

// Verificar se o Python está instalado
function checkPythonInstallation() {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['--version']);
    
    pythonProcess.on('error', (err) => {
      console.error('Erro ao verificar instalação do Python:', err.message);
      reject(new Error('Python não está instalado ou não está no PATH'));
    });
    
    let pythonVersion = '';
    pythonProcess.stdout.on('data', (data) => {
      pythonVersion += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`Python instalado: ${pythonVersion.trim()}`);
        resolve(true);
      } else {
        reject(new Error(`Python não está instalado corretamente (código ${code})`));
      }
    });
  });
}

// Executar script de configuração Python
function setupPythonEnvironment() {
  return new Promise((resolve, reject) => {
    console.log('Configurando ambiente Python...');
    
    // Verificar se o script existe
    if (!fs.existsSync(PYTHON_SETUP_SCRIPT)) {
      console.error(`Script de configuração ${PYTHON_SETUP_SCRIPT} não encontrado`);
      reject(new Error('Script de configuração não encontrado'));
      return;
    }
    
    const setupProcess = spawn('python', [PYTHON_SETUP_SCRIPT]);
    
    setupProcess.stdout.on('data', (data) => {
      console.log(`[Python Setup] ${data.toString().trim()}`);
    });
    
    setupProcess.stderr.on('data', (data) => {
      console.error(`[Python Setup Error] ${data.toString().trim()}`);
    });
    
    setupProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Ambiente Python configurado com sucesso');
        resolve(true);
      } else {
        reject(new Error(`Falha ao configurar ambiente Python (código ${code})`));
      }
    });
  });
}

// Iniciar API Python
function startPythonApi() {
  console.log('Iniciando API Python...');
  
  const pythonApi = spawn('python', ['-m', 'uvicorn', 'app.main:app_fastapi', '--reload', '--host', '127.0.0.1', '--port', '8000']);
  
  pythonApi.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[Python API] ${output}`);
  });
  
  pythonApi.stderr.on('data', (data) => {
    const error = data.toString().trim();
    console.error(`[Python API Error] ${error}`);
  });
  
  pythonApi.on('close', (code) => {
    console.log(`API Python encerrada com código ${code}`);
    process.exit(1);
  });
  
  return pythonApi;
}

// Iniciar API Gateway Node.js
function startNodeApi() {
  console.log('Iniciando API Gateway Node.js...');
  
  const nodeApi = spawn('npm', ['run', 'dev'], { cwd: path.join(process.cwd(), 'api-gateway') });
  
  nodeApi.stdout.on('data', (data) => {
    const output = data.toString().trim();
    console.log(`[Node API] ${output}`);
  });
  
  nodeApi.stderr.on('data', (data) => {
    const error = data.toString().trim();
    console.error(`[Node API Error] ${error}`);
  });
  
  nodeApi.on('close', (code) => {
    console.log(`API Gateway Node.js encerrada com código ${code}`);
    process.exit(1);
  });
  
  return nodeApi;
}

// Verificar se a API Python está disponível
async function checkPythonApiAvailability(retryCount = 0) {
  if (retryCount >= MAX_RETRIES) {
    console.error('Tempo limite excedido aguardando API Python iniciar');
    return false;
  }
  
  try {
    console.log(`Aguardando API Python iniciar... (tentativa ${retryCount + 1})`);
    const response = await axios.get(PYTHON_API_URL, { timeout: 5000 });
    
    if (response.status === 200) {
      console.log('API Python está online!');
      return true;
    }
  } catch (error) {
    // Continuar tentando
  }
  
  await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
  return checkPythonApiAvailability(retryCount + 1);
}

// Função principal
async function main() {
  try {
    // Verificar se o Python está instalado
    await checkPythonInstallation();
    
    // Configurar ambiente Python
    await setupPythonEnvironment();
    
    // Iniciar API Python
    const pythonApiProcess = startPythonApi();
    
    // Aguardar API Python iniciar
    const pythonApiAvailable = await checkPythonApiAvailability();
    
    if (!pythonApiAvailable) {
      console.error('Não foi possível iniciar a API Python. Verifique os logs acima para mais detalhes.');
      process.exit(1);
    }
    
    // Iniciar API Gateway Node.js
    const nodeApiProcess = startNodeApi();
    
    console.log('API Gateway está online!');
    
    // Lidar com sinais de encerramento
    process.on('SIGINT', () => {
      console.log('Encerrando processos...');
      pythonApiProcess.kill();
      nodeApiProcess.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error('Erro ao iniciar ambiente de desenvolvimento:', error.message);
    process.exit(1);
  }
}

// Iniciar
main(); 