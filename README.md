# API Central Downloads

Plataforma para download de vídeos de múltiplas plataformas usando arquitetura de microserviços híbridos com Python e Node.js.

## Arquitetura do Projeto

Este projeto implementa uma arquitetura de microserviços híbridos, composta por:

1. **Frontend Next.js**: Interface de usuário para inserção de URLs e gestão de downloads
2. **API Gateway (Node.js)**: Middleware que gerencia requisições, cache, validação e comunicação com API Python
3. **API Python (FastAPI)**: Serviço especializado no processamento de downloads de vídeo com motores como yt-dlp

### Diagrama de Componentes

```
┌─────────────┐        ┌────────────────┐        ┌────────────────┐
│             │        │                │        │                │
│  Frontend   │───────▶│  API Gateway   │───────▶│   API Python   │
│  (Next.js)  │◀───────│   (Node.js)    │◀───────│   (FastAPI)    │
│             │        │                │        │                │
└─────────────┘        └────────────────┘        └────────────────┘
```

## Vantagens da Arquitetura Híbrida

- **Melhor Desempenho**: Node.js é excelente para I/O intensivo (muitas conexões simultâneas)
- **Processamento Otimizado**: Python é mais adequado para processamento de vídeo com bibliotecas especializadas
- **Escalabilidade Independente**: Cada serviço pode ser escalado conforme a necessidade
- **Resiliência**: Falha em um componente não afeta todo o sistema

## Pré-requisitos

- Node.js 16+ e npm
- Python 3.8+ e pip
- (Opcional) yt-dlp, youtube-dl e outros motores de download

## Instalação

1. Clone o repositório:
   ```bash
   git clone <repo-url>
   cd API-Central-downloads
   ```

2. Instale as dependências do frontend:
   ```bash
   npm install
   ```

3. Instale as dependências da API Gateway:
   ```bash
   cd api-gateway
   npm install
   cd ..
   ```

4. Instale as dependências da API Python:
   ```bash
   pip install fastapi uvicorn
   ```

5. Configure variáveis de ambiente:
   ```bash
   # Na raiz do projeto
   echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1" > .env.local
   
   # Na pasta api-gateway
   cd api-gateway
   echo "PORT=3001
   NODE_ENV=development
   PYTHON_API_URL=http://localhost:8000/api/v1
   LOG_LEVEL=info" > .env
   cd ..
   ```

## Executando o Projeto

### Modo Desenvolvimento

Para iniciar todo o sistema (API Python, API Gateway e Frontend) com um único comando:

```bash
npm run dev
```

Este comando irá:
1. Iniciar a API Python (FastAPI)
2. Iniciar a API Gateway (Node.js)
3. Verificar se ambas as APIs estão funcionando
4. Iniciar o servidor Next.js

### Construção para Produção

```bash
npm run build
```

Este comando irá:
1. Iniciar a API Python e API Gateway
2. Aguardar até que ambas estejam operacionais
3. Executar o build do Next.js
4. Encerrar as APIs após o build

### Acesso

- Frontend: http://localhost:3000
- API Gateway: http://localhost:3001/status
- API Python: http://localhost:8000/docs

## Uso

1. Acesse o frontend em http://localhost:3000
2. Cole a URL do vídeo que deseja baixar
3. Selecione o formato e a qualidade desejados
4. Clique em "Baixar" e aguarde o processamento
5. Quando concluído, clique em "Baixar Arquivo" para obter o vídeo

## Estrutura do Projeto

```
API-Central-downloads/
├── app/                      # API Python (FastAPI)
│   ├── core/                 # Configurações, utils, etc.
│   ├── models/               # Esquemas de dados
│   ├── routes/               # Endpoints da API
│   ├── services/             # Serviços de negócio
│   └── tasks/                # Tarefas assíncronas
├── api-gateway/              # API Gateway (Node.js)
│   ├── src/
│   │   ├── controllers/      # Controladores
│   │   ├── middleware/       # Middlewares
│   │   ├── routes/           # Rotas da API
│   │   ├── services/         # Serviços
│   │   └── utils/            # Utilitários
├── components/               # Componentes React
├── app/                      # Páginas Next.js
├── lib/                      # Bibliotecas/Serviços
└── public/                   # Arquivos estáticos
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT.

## 📋 Sobre o Projeto

Central de Downloads é uma ferramenta web que permite aos usuários baixar vídeos, áudios, imagens e outros conteúdos de diversas plataformas como YouTube, Instagram, Facebook, Twitter, TikTok, Twitch, SoundCloud e Pinterest - tudo em um único lugar.

## ✨ Funcionalidades

- **Download Simplificado**: Cole o link e baixe conteúdo em segundos
- **Múltiplas Plataformas**: Suporte para as principais redes sociais e plataformas de streaming
- **Interface Intuitiva**: Design moderno e responsivo para uma excelente experiência do usuário
- **Processamento Rápido**: Tecnologia otimizada para downloads rápidos
- **Validação de URLs**: Sistema inteligente para validar links das plataformas suportadas

## 🔧 Tecnologias Utilizadas

- **Next.js** - Framework React para renderização no servidor
- **TypeScript** - Para tipagem estática e melhor manutenção do código
- **Tailwind CSS** - Para estilização e design responsivo
- **Framer Motion** - Para animações suaves
- **Shadcn/UI** - Componentes reutilizáveis e acessíveis
- **React Hook Form** - Para gerenciamento de formulários
- **Zod** - Para validação de dados

## 🚀 Como Executar

### Pré-requisitos

- Node.js (versão 18.x ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/Lunedev03/API-Central-downloads.git
   cd API-Central-downloads
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   yarn
   ```

3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

4. Acesse a aplicação em `http://localhost:3000`

## 📱 Responsividade

A aplicação foi desenvolvida com uma abordagem mobile-first, garantindo uma experiência de usuário excelente em todos os dispositivos - de smartphones a desktops.

## 🔒 Segurança

- Validação robusta de URLs para prevenir ataques de injeção
- Tratamento seguro de erros
- Feedback visual para usuários em caso de URLs inválidas

## 🌐 Plataformas Suportadas

- YouTube
- Instagram
- Facebook
- Twitter
- TikTok
- Twitch
- SoundCloud
- Pinterest
- E mais...

## 🔮 Próximos Passos

- [ ] Adicionar suporte para mais plataformas
- [ ] Implementar seleção de qualidade de download
- [ ] Adicionar histórico de downloads
- [ ] Opções avançadas de conversão de formato
- [ ] Implementar sistema de contas de usuário

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido por [Lunedev03](https://github.com/Lunedev03).

---

Feito com ❤️ e React 