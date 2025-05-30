# Estratégia de Gerenciamento de Logs da API

## 1. Introdução

Este documento descreve a estratégia conceitual para o gerenciamento de logs gerados pela API de Download de Vídeos. O gerenciamento eficaz de logs é crucial para controlar o uso de espaço em disco, otimizar a performance de sistemas de análise de logs e cumprir com políticas de retenção de dados e requisitos de conformidade.

A aplicação está configurada (conceitualmente através de `app/core/logging_config.py`) para gerar logs estruturados em JSON para a saída padrão (`stdout`), o que é uma prática comum em ambientes de contêineres.

## 2. Rotação de Logs

A rotação de logs é o processo de arquivar ou deletar arquivos de log antigos para evitar que eles consumam todo o espaço em disco disponível.

### 2.1. Logs para Saída Padrão (`stdout`/`stderr`) em Ambientes de Contêineres

Quando a aplicação roda em contêineres (ex: Docker, Kubernetes) e envia logs para `stdout`/`stderr`:

*   **Responsabilidade da Plataforma:** A rotação de logs é, na maioria das vezes, gerenciada pela plataforma de orquestração de contêineres ou pelo runtime do contêiner.
*   **Docker:** O driver de logging padrão do Docker (`json-file`) suporta opções de rotação que podem ser configuradas ao iniciar um contêiner, como:
    *   `--log-opt max-size=10m` (tamanho máximo de cada arquivo de log, ex: 10 megabytes)
    *   `--log-opt max-file=3` (número máximo de arquivos de log a serem mantidos)
    Estas configurações são aplicadas na linha de comando do Docker (`docker run ...`) ou em arquivos de composição (ex: `docker-compose.yml`).
*   **Kubernetes:** O Kubernetes geralmente lida com os logs de `stdout`/`stderr` dos contêineres no nível do nó. Agentes de coleta de logs (como Fluentd, Fluent Bit, ou o próprio kubelet) são responsáveis por capturar esses logs e enviá-los para um backend de logging. A rotação dos arquivos de log nos nós é gerenciada pelo runtime do contêiner (ex: Docker, containerd) ou por ferramentas do sistema operacional do nó (como `logrotate`). As políticas de rotação no nó são configuradas pelo administrador do cluster.

### 2.2. Logs Escritos Diretamente em Arquivos (Alternativa Menos Comum para esta API)

Se a aplicação fosse configurada para escrever logs diretamente em arquivos no sistema de arquivos do servidor (em vez de `stdout`), as seguintes estratégias seriam aplicadas:

*   **`logrotate` (Linux):**
    *   O `logrotate` é um utilitário padrão em sistemas Linux projetado para facilitar a administração de arquivos de log.
    *   Ele permite rotacionar, comprimir, enviar por e-mail e deletar logs automaticamente.
    *   A configuração é feita através de arquivos em `/etc/logrotate.conf` e `/etc/logrotate.d/`. Um arquivo de configuração específico para a API seria criado, especificando:
        *   Caminho para os arquivos de log da API.
        *   Frequência da rotação (diária, semanal, mensal).
        *   Condições para rotação (tamanho do arquivo).
        *   Número de arquivos rotacionados a manter (`rotate count`).
        *   Opção de compressão para arquivos rotacionados (`compress`).
        *   Scripts de `prerotate` e `postrotate` (se necessário).
*   **Handlers de Logging do Python:**
    *   O módulo `logging` do Python oferece handlers como `RotatingFileHandler` (rotaciona baseado no tamanho do arquivo) e `TimedRotatingFileHandler` (rotaciona baseado em intervalo de tempo).
    *   Embora funcional, para aplicações de produção robustas, `logrotate` é geralmente preferido para gerenciamento de arquivos de log devido à sua flexibilidade e por ser um padrão de sistema. Usar `stdout` em containers é a abordagem mais moderna.

## 3. Retenção de Logs

A retenção de logs define por quanto tempo os logs são armazenados antes de serem arquivados ou permanentemente deletados.

### 3.1. Com Sistemas de Gerenciamento de Logs Centralizados (Recomendado)

A prática recomendada é enviar os logs estruturados (JSON) da API para um sistema de gerenciamento de logs centralizado, como:

*   ELK Stack (Elasticsearch, Logstash, Kibana)
*   Splunk
*   Grafana Loki
*   Datadog Logs, New Relic Logs, etc.

Nestes sistemas:

*   **Configuração Centralizada:** As políticas de retenção são configuradas diretamente na plataforma de logging.
*   **Flexibilidade:** Permitem definir diferentes períodos de retenção para diferentes tipos ou níveis de logs. Por exemplo, logs de `DEBUG` podem ser retidos por 7 dias, enquanto logs de `INFO` e `ERROR` por 30, 90 dias ou mais, dependendo dos requisitos.
*   **Arquivamento:** Muitas dessas plataformas suportam o arquivamento de logs mais antigos para um storage de baixo custo (ex: Amazon S3 Glacier, Google Cloud Storage Archive) antes da exclusão definitiva.
*   **Busca e Análise:** Facilitam a busca, análise e visualização dos logs, independentemente do período de retenção dos logs "quentes".

### 3.2. Para Logs em Arquivo (Gerenciados por `logrotate`)

Se os logs forem mantidos em arquivos e gerenciados por `logrotate`:

*   A opção `rotate count` no `logrotate` indiretamente define a retenção (ex: 7 rotações diárias significam 7 dias de logs).
*   A opção `maxage` pode ser usada para deletar arquivos rotacionados mais antigos que um certo número de dias.

## 4. Considerações de Segurança e Compliance

*   As políticas de retenção de logs devem estar em conformidade com os requisitos legais e regulatórios aplicáveis (ex: LGPD no Brasil, GDPR na Europa, HIPAA para saúde, PCI-DSS para pagamentos).
*   Dados sensíveis ou informações de identificação pessoal (PII) devem ser evitados nos logs ou devidamente anonimizados/mascarados, conforme planejado na estrutura dos logs. A retenção desses dados, mesmo que mascarados, também deve seguir as políticas de privacidade.
*   O acesso aos logs (tanto os arquivos quanto os sistemas centralizados) deve ser controlado e restrito a pessoal autorizado.

Este planejamento conceitual serve como base para a configuração da infraestrutura de logging e monitoramento da API.
