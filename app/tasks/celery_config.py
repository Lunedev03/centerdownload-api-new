# app/tasks/celery_config.py - Configuração do Celery

# from celery import Celery
#
# # URLs do Broker e Backend (Redis) - viriam de config/settings.py ou variáveis de ambiente
# # Exemplo: REDIS_URL = "redis://localhost:6379/0"
#
# # celery_app_instance = Celery(
# #     'video_downloader_tasks', # Nome do módulo de tarefas (pode ser 'app.tasks')
# #     broker="redis://localhost:6379/0", # Substituir por config
# #     backend="redis://localhost:6379/0", # Substituir por config
# #     include=['app.tasks.download_tasks'] # Lista de módulos onde as tarefas são definidas
# # )
# #
# # celery_app_instance.conf.update(
# #     task_serializer='json',
# #     result_serializer='json',
# #     accept_content=['json'],
# #     timezone='UTC', # Recomendado para consistência
# #     enable_utc=True,
# #     task_acks_late = True,
# #     worker_prefetch_multiplier = 1,
# #     task_track_started = True,
# # )
#
print("Configurações do Celery (celery_app_instance) conceitualmente definidas em app/tasks/celery_config.py.")
