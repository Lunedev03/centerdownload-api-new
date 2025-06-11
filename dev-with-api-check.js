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

// Verificar e instalar dependências Node.js
function setupNodeEnvironment() {
  return new Promise((resolve, reject) => {
    console.log('Verificando dependências Node.js...');
    
    // Verificar node_modules na raiz
    if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
      console.log('Instalando dependências Node.js na raiz...');
      
      const npmInstall = spawn('npm', ['install'], { 
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      
      npmInstall.on('close', (code) => {
        if (code === 0) {
          console.log('Dependências Node.js instaladas com sucesso na raiz');
          
          // Verificar api-gateway
          if (!fs.existsSync(path.join(process.cwd(), 'api-gateway', 'node_modules'))) {
            console.log('Instalando dependências Node.js no API Gateway...');
            
            const npmInstallGateway = spawn('npm', ['install'], { 
              cwd: path.join(process.cwd(), 'api-gateway'),
              stdio: 'inherit'
            });
            
            npmInstallGateway.on('close', (code) => {
              if (code === 0) {
                console.log('Dependências Node.js instaladas com sucesso no API Gateway');
                resolve(true);
              } else {
                reject(new Error(`Falha ao instalar dependências no API Gateway (código ${code})`));
              }
            });
          } else {
            console.log('Dependências do API Gateway já instaladas');
            resolve(true);
          }
        } else {
          reject(new Error(`Falha ao instalar dependências Node.js na raiz (código ${code})`));
        }
      });
    } else {
      console.log('Dependências Node.js já instaladas');
      
      // Verificar api-gateway
      if (!fs.existsSync(path.join(process.cwd(), 'api-gateway', 'node_modules'))) {
        console.log('Instalando dependências Node.js no API Gateway...');
        
        const npmInstallGateway = spawn('npm', ['install'], { 
          cwd: path.join(process.cwd(), 'api-gateway'),
          stdio: 'inherit'
        });
        
        npmInstallGateway.on('close', (code) => {
          if (code === 0) {
            console.log('Dependências Node.js instaladas com sucesso no API Gateway');
            resolve(true);
          } else {
            reject(new Error(`Falha ao instalar dependências no API Gateway (código ${code})`));
          }
        });
      } else {
        console.log('Dependências do API Gateway já instaladas');
        resolve(true);
      }
    }
  });
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

// Iniciar API Gateway Node.js
function startNodeApi() {
  console.log('Iniciando API Gateway Node.js...');
  
  // Usar o comando node diretamente em vez de npm run
  const apiGatewayPath = path.join(process.cwd(), 'api-gateway');
  const serverPath = path.join(apiGatewayPath, 'src', 'server.js');
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(serverPath)) {
    console.error(`Arquivo de servidor não encontrado: ${serverPath}`);
    throw new Error('Arquivo de servidor não encontrado');
  }
  
  console.log(`Iniciando servidor em: ${serverPath}`);
  
  // Iniciar com node diretamente
  const nodeApi = spawn('node', [serverPath], { 
    cwd: apiGatewayPath,
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
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
  
  nodeApi.on('error', (err) => {
    console.error(`Erro ao iniciar API Gateway: ${err.message}`);
    process.exit(1);
  });
  
  return nodeApi;
}

// Iniciar a aplicação Next.js
function startNextApp() {
  console.log('Iniciando aplicação Next.js...');
  
  try {
    // Verificar se o módulo next está instalado
    const nextBinPath = path.join(process.cwd(), 'node_modules', '.bin', 'next');
    
    if (!fs.existsSync(nextBinPath)) {
      console.warn('Módulo next não encontrado em node_modules/.bin/next');
      console.log('As APIs estão rodando, mas o front-end Next.js não será iniciado automaticamente.');
      console.log('Para iniciar o front-end manualmente, abra outro terminal e execute: npm run dev');
      return null;
    }
    
    // Em sistemas Windows, usar o arquivo .cmd
    const isWindows = process.platform === 'win32';
    const nextExecutable = isWindows ? 
      path.join(process.cwd(), 'node_modules', '.bin', 'next.cmd') : 
      nextBinPath;
    
    // Verificar se existe o executável específico da plataforma
    if (!fs.existsSync(nextExecutable)) {
      console.warn(`Executável Next.js não encontrado: ${nextExecutable}`);
      console.log('As APIs estão rodando, mas o front-end Next.js não será iniciado automaticamente.');
      return null;
    }
    
    // Iniciar o Next.js
    const nextProcess = spawn(nextExecutable, ['dev'], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }
    });
    
    nextProcess.on('close', (code) => {
      console.log(`Aplicação Next.js encerrada com código ${code}`);
    });
    
    nextProcess.on('error', (err) => {
      console.error(`Erro ao iniciar Next.js: ${err.message}`);
      console.log('Continuando com as APIs em execução...');
    });
    
    return nextProcess;
  } catch (error) {
    console.error(`Erro ao tentar iniciar Next.js: ${error.message}`);
    console.log('As APIs estão rodando, mas o front-end Next.js não será iniciado automaticamente.');
    return null;
  }
}

// Função principal
async function main() {
  try {
    // Verificar se o Python está instalado
    await checkPythonInstallation();
    
    // Configurar ambiente Python
    await setupPythonEnvironment();
    
    // Configurar ambiente Node.js
    await setupNodeEnvironment();
    
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
    
    // Aguardar um pouco para garantir que as APIs estão estáveis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Iniciar a aplicação Next.js
    const nextProcess = startNextApp();
    
    // Lidar com sinais de encerramento
    process.on('SIGINT', () => {
      console.log('Encerrando processos...');
      pythonApiProcess.kill();
      nodeApiProcess.kill();
      if (nextProcess) nextProcess.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error('Erro ao iniciar ambiente de desenvolvimento:', error.message);
    process.exit(1);
  }
}

// Iniciar
main(); 