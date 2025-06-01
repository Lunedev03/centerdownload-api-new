# API Gateway para Download de Vídeos

API Gateway desenvolvida em Node.js para integração com API Python de download de vídeos de várias plataformas.

## Arquitetura

Este projeto implementa uma arquitetura de microserviços híbridos, onde:

- **API Gateway (Node.js)**: Lida com requisições dos clientes, validação, caching e balanceamento
- **API Python (FastAPI)**: Processa o download efetivo dos vídeos usando motores como yt-dlp

## Vantagens desta Abordagem

- **Melhor Desempenho**: Node.js é excelente para I/O intensivo (múltiplas conexões)
- **Processamento Otimizado**: Python é mais adequado para processamento de vídeo
- **Escalabilidade Independente**: Cada serviço pode ser escalado conforme necessário
- **Resiliência**: Falha em um componente não afeta todo o sistema

## Requisitos

- Node.js 16+
- npm ou yarn
- API Python de download de vídeos rodando (configurável via variáveis de ambiente)

## Instalação

```bash
# Clonar o repositório
git clone <repo-url>
cd api-gateway

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env conforme necessário
```

## Configuração

Ajuste as variáveis no arquivo `.env`:

```
PORT=3001                            # Porta em que a API Gateway rodará
NODE_ENV=development                 # Ambiente (development, production)
PYTHON_API_URL=http://localhost:8000/api/v1  # URL da API Python
LOG_LEVEL=info                       # Nível de logging
```

## Executando

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start
```

## Endpoints da API

### Informações do Vídeo
- **GET** `/api/v1/video/info?url={video_url}`
- Retorna informações básicas do vídeo (título, duração, thumbnail)

### Opções de Download
- **GET** `/api/v1/video/options?url={video_url}`
- Retorna opções de download disponíveis (qualidade, formato, tamanho)

### Iniciar Download
- **POST** `/api/v1/video/download`
- Corpo: `{ "url": "...", "format": "...", "quality": "..." }`
- Inicia o processo de download e retorna um ID de tarefa

### Status da Tarefa
- **GET** `/api/v1/video/task/{task_id}`
- Verifica o status atual de uma tarefa de download

### URL de Download
- **GET** `/api/v1/video/download/{task_id}`
- Retorna a URL para download do arquivo quando estiver pronto

### Status da API
- **GET** `/status`
- Verifica o status de funcionamento da API Gateway

## Funcionalidades

- **Validação de URL**: Verifica se a URL pertence a uma plataforma suportada
- **Cache**: Armazena resultados temporariamente para reduzir carga na API Python
- **Rate Limiting**: Protege contra excesso de requisições
- **Logging**: Registro detalhado de atividades para diagnóstico
- **Tratamento de Erros**: Respostas consistentes para diferentes tipos de erro

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request 