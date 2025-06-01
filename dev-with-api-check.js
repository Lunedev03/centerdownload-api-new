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

// Iniciar API Python (FastAPI)
const pythonApi = spawn('python', ['-m', 'uvicorn', 'app.main:app_fastapi', '--reload', '--port', '8000'], {
  cwd: process.cwd(),
  shell: true,
  env: { ...process.env, PYTHONIOENCODING: 'utf-8' } // Configurar codificação correta
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

// Verificar se as APIs estão online e então iniciar o Next.js
let pythonApiReady = false;
let nodeApiReady = false;
let nextStarted = false;
let checkAttempt = 0;
const MAX_CHECK_ATTEMPTS = 30; // Número máximo de tentativas (60 segundos)

// Verificar a cada 2 segundos se ambas as APIs estão online
const checkInterval = setInterval(async () => {
  checkAttempt++;
  
  if (checkAttempt > MAX_CHECK_ATTEMPTS) {
    console.error(`${colors.error}Tempo máximo de espera excedido. Verificar se as APIs estão funcionando corretamente.${colors.reset}`);
    pythonApi.kill();
    nodeApi.kill();
    clearInterval(checkInterval);
    process.exit(1);
  }
  
  try {
    // Verificar API Python
    if (!pythonApiReady) {
      try {
        const response = await axios.get('http://localhost:8000/api/v1/health', { timeout: 2000 });
        if (response.status === 200) {
          pythonApiReady = true;
          console.log(`${colors.success}API Python está online!${colors.reset}`);
        }
      } catch (error) {
        if (checkAttempt % 5 === 0) { // Mostrar mensagem a cada 5 tentativas
          console.log(`${colors.info}Aguardando API Python iniciar... (tentativa ${checkAttempt})${colors.reset}`);
        }
      }
    }

    // Verificar API Node.js
    if (!nodeApiReady) {
      try {
        const response = await axios.get('http://localhost:3001/status', { timeout: 2000 });
        if (response.status === 200) {
          nodeApiReady = true;
          console.log(`${colors.success}API Gateway está online!${colors.reset}`);
        }
      } catch (error) {
        if (checkAttempt % 5 === 0) { // Mostrar mensagem a cada 5 tentativas
          console.log(`${colors.info}Aguardando API Gateway iniciar... (tentativa ${checkAttempt})${colors.reset}`);
        }
      }
    }

    // Se ambas as APIs estiverem online, iniciar o Next.js
    if (pythonApiReady && nodeApiReady && !nextStarted) {
      nextStarted = true;
      console.log(`${colors.success}Ambas as APIs estão online! Iniciando servidor Next.js...${colors.reset}`);
      
      // Esperar um pouco para garantir que as APIs estão completamente inicializadas
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Iniciar o servidor Next.js de desenvolvimento
      const nextDev = spawn('npx', ['next', 'dev'], {
        cwd: process.cwd(),
        shell: true,
        stdio: 'inherit', // Mostrar a saída diretamente no console
        env: { 
          ...process.env,
          // Aumentar o timeout do Next.js
          NEXT_TELEMETRY_DISABLED: '1',
          NODE_OPTIONS: '--max-http-header-size=16384'
        }
      });

      nextDev.on('close', (code) => {
        console.log(`${colors.info}Servidor Next.js encerrado com código ${code}${colors.reset}`);
        
        // Encerrar as APIs quando o servidor Next.js for encerrado
        pythonApi.kill();
        nodeApi.kill();
        
        clearInterval(checkInterval);
        process.exit(code);
      });

      // Limpar o intervalo de verificação
      clearInterval(checkInterval);
    }
  } catch (error) {
    console.error(`${colors.error}Erro ao verificar APIs: ${error.message}${colors.reset}`);
  }
}, 2000);

// Tratar sinais de encerramento do processo principal
process.on('SIGINT', () => {
  console.log(`${colors.info}Encerrando servidor e APIs...${colors.reset}`);
  pythonApi.kill();
  nodeApi.kill();
  clearInterval(checkInterval);
  process.exit(0);
}); 