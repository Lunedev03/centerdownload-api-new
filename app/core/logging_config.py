# app/core/logging_config.py - Configuração para logging estruturado da API.
# Autor: [Seu Nome/IA]
# Data: [Data Atual]
# Propósito: Define a configuração do sistema de logging para a aplicação,
#            com foco em logs estruturados em JSON para fácil análise e monitoramento.

import logging
import sys
# from python_json_logger import jsonlogger # Biblioteca popular para logging JSON em Python
# import os # Para carregar configurações de ambiente, se necessário

# NÍVEL DE LOG PADRÃO (pode ser sobrescrito por variável de ambiente)
# LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()

def setup_logging(log_level: str = "INFO"):
    '''
    Configura o sistema de logging para a aplicação.

    Esta função deve ser chamada o mais cedo possível no ciclo de vida da aplicação,
    idealmente em app/main.py, antes da inicialização do FastAPI ou logo após.
    '''
    # logger_root = logging.getLogger() # Obtém o logger raiz
    # logger_root.setLevel(log_level)
    #
    # # Remove handlers padrão existentes para evitar duplicação de logs
    # for handler in logger_root.handlers[:]:
    #     logger_root.removeHandler(handler)
    #
    # # Handler para enviar logs para a saída padrão (stdout ou stderr)
    # stream_handler = logging.StreamHandler(sys.stdout) # Usar sys.stdout é comum para containers
    # stream_handler.setLevel(log_level)

    # FORMATADOR JSON
    # ---------------
    # Usar um formatador JSON para que os logs sejam estruturados e fáceis de processar
    # por sistemas de gerenciamento de logs como ELK Stack, Splunk, Grafana Loki, etc.
    #
    # Exemplo de campos a serem incluídos (alguns são padrão, outros via 'extra'):
    #
    # formatter = jsonlogger.JsonFormatter(
    #     # Campos padrão do logging que queremos incluir:
    #     fmt='%(asctime)s %(levelname)s %(name)s %(module)s %(funcName)s %(lineno)d %(message)s'
    #     # Adicionar campos customizados que podem ser passados via 'extra' no logging:
    #     # Estes são exemplos, podem ser adaptados conforme a necessidade.
    #     # '%(correlation_id)s %(request_id)s %(client_ip)s %(endpoint)s %(http_method)s '
    #     # '%(task_id)s %(video_url)s %(engine_used)s %(ffmpeg_command)s '
    #     # '%(duration_ms)s %(stack_trace)s' # stack_trace para erros
    #     ,
    #     # Renomear campos padrão para nomes mais comuns em logs JSON, se desejado:
    #     # rename_fields={
    #     #     "asctime": "timestamp",
    #     #     "levelname": "level",
    #     #     "name": "logger_name",
    #     #     "funcName": "function_name",
    #     #     "lineno": "line_number"
    #     # },
    #     # Configurar o timestamp para formato ISO 8601 UTC:
    #     # datefmt='iso', # ou '%Y-%m-%dT%H:%M:%S.%fZ'
    # )
    #
    # # stream_handler.setFormatter(formatter)
    # # logger_root.addHandler(stream_handler)

    # CAMPOS DETALHADOS PARA LOGS ESTRUTURADOS (EXEMPLOS):
    # ----------------------------------------------------
    # - timestamp (string): Data e hora do evento no formato ISO 8601 UTC. (Padrão 'asctime')
    # - level (string): Nível de severidade do log (DEBUG, INFO, WARNING, ERROR, CRITICAL). (Padrão 'levelname')
    # - message (string): A mensagem de log principal. (Padrão 'message')
    # - logger_name (string): Nome do logger que emitiu o log. (Padrão 'name')
    # - module (string): Módulo Python onde o log foi originado. (Padrão 'module')
    # - function_name (string): Nome da função que emitiu o log. (Padrão 'funcName')
    # - line_number (int): Número da linha no arquivo fonte. (Padrão 'lineno')
    #
    # Campos de Contexto da Requisição (adicionar via 'extra'):
    # - correlation_id (string): ID único para rastrear uma requisição através de múltiplos logs/serviços.
    #                            Gerado no início da requisição (e.g., em um middleware).
    # - request_id (string): Similar ao correlation_id, pode ser específico do FastAPI ou servidor web.
    # - client_ip (string): Endereço IP do cliente. Considerar X-Forwarded-For e questões de privacidade.
    # - endpoint (string): Endpoint da API que foi acessado (ex: "/api/v1/download").
    # - http_method (string): Método HTTP utilizado (GET, POST, PUT, DELETE, etc.).
    # - request_params (dict/string): Parâmetros da requisição (query e corpo).
    #                                 !!! IMPORTANTE: Dados sensíveis (senhas, tokens, PII) DEVEM ser
    #                                 anonimizados, omitidos ou mascarados antes de serem logados. !!!
    # - user_agent (string): User-Agent do cliente.
    #
    # Campos Específicos da Aplicação (adicionar via 'extra'):
    # - task_id (string): ID da tarefa Celery, quando aplicável.
    # - video_url (string): URL do vídeo sendo processada.
    # - engine_used (string): Nome do motor de download utilizado na tentativa.
    # - ffmpeg_command (string): Comando FFmpeg executado (se curto e relevante; evitar logar comandos muito longos).
    #
    # Campos de Diagnóstico e Erro (adicionar via 'extra' ou automaticamente pelo logger):
    # - stack_trace (string/list): Stack trace completo quando um erro/exceção é logado.
    #                               O módulo 'logging' já captura informações de exceção com logger.exception().
    # - error_type (string): Tipo da exceção (ex: "ValueError", "DownloadFailedError").
    #
    # Campos de Performance (adicionar via 'extra'):
    # - duration_ms (float/int): Duração de uma operação específica ou da requisição inteira em milissegundos.

    # EXEMPLO DE COMO USAR O LOGGER CONFIGURADO EM OUTROS MÓDULOS:
    # -----------------------------------------------------------
    # import logging
    # logger = logging.getLogger(__name__) # Boa prática usar o nome do módulo atual
    #
    # def minha_funcao(parametro_sensivel="senha123"):
    #     logger.info(
    #         "Minha função foi chamada.",
    #         extra={
    #             "correlation_id": "abc-123",
    #             "endpoint": "/minha_rota",
    #             "meu_parametro": "valor_do_parametro",
    #             # Exemplo de sanitização MUITO SIMPLES (NÃO USAR EM PRODUÇÃO):
    #             "parametro_sensivel_log": f"{parametro_sensivel[:2]}***{parametro_sensivel[-2:]}" if parametro_sensivel else None
    #         }
    #     )
    #     try:
    #         # ... alguma lógica ...
    #         # if erro:
    #         #    raise ValueError("Algo deu errado")
    #         pass
    #     except Exception as e:
    #         logger.error(
    #             f"Erro na minha_funcao: {str(e)}",
    #             exc_info=True, # Adiciona stack trace ao log (se o formatador suportar ou for padrão)
    #             extra={"correlation_id": "abc-123", "error_type": type(e).__name__}
    #         )
    #         # Ou usar logger.exception("Mensagem de erro") que faz o mesmo que error com exc_info=True

    # NÍVEIS DE LOG APROPRIADOS:
    # --------------------------
    # - DEBUG: Informação detalhada, tipicamente de interesse apenas durante o desenvolvimento e depuração.
    # - INFO: Confirmação de que as coisas estão funcionando como esperado. Eventos significativos da aplicação.
    # - WARNING: Algo inesperado aconteceu, ou indicação de algum problema potencial no futuro próximo
    #            (ex: 'uso de disco quase no limite'). A aplicação continua funcionando.
    # - ERROR: Devido a um problema mais sério, o software não foi capaz de realizar alguma função.
    # - CRITICAL: Um erro sério, indicando que o próprio programa pode ser incapaz de continuar rodando.

    # CONSIDERAÇÕES ADICIONAIS:
    # -------------------------
    # - LoggerAdapters ou Filters: Podem ser usados para injetar automaticamente informações de contexto
    #   (como correlation_id) em todas as mensagens de log sem precisar passá-las no 'extra' toda vez.
    # - Configuração via Dicionário: Para configurações mais complexas, Python logging suporta
    #   configuração via um dicionário (logging.config.dictConfig).
    # - Variáveis de Ambiente: O nível de log e outros parâmetros de logging podem ser configurados
    #   através de variáveis de ambiente para flexibilidade entre diferentes ambientes (dev, staging, prod).

    print("Módulo app/core/logging_config.py com a função setup_logging() e comentários detalhados sobre estrutura e formato de logs (JSON) foi conceitualmente definido.")
    print("A configuração real do logger (instanciação e adição de handlers/formatters) está comentada, mas a descrição está presente.")

# Para testar conceitualmente (não será executado pelo worker diretamente):
# if __name__ == "__main__":
# setup_logging("DEBUG")
# test_logger = logging.getLogger("meu_modulo_teste")
# test_logger.debug("Este é um log de debug.", extra={"correlation_id": "xyz-789", "custom_field": "valor_teste"})
# test_logger.info("Este é um log de info.")
# test_logger.warning("Este é um log de warning.")
# try:
# 1 / 0
# except ZeroDivisionError:
# test_logger.error("Este é um log de erro com stack trace.", exc_info=True) # exc_info=True para capturar o stack trace
# # ou
# # test_logger.exception("Este é um log de exceção, também com stack trace.") # Mais conciso
