from celery import Celery
import os

BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0")
BACKEND_URL = os.environ.get("CELERY_RESULT_BACKEND", BROKER_URL)

celery_app_instance = Celery(
    'video_downloader_tasks',
    broker=BROKER_URL,
    backend=BACKEND_URL,
    include=['app.tasks.download_tasks']
)

celery_app_instance.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='UTC',
    enable_utc=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_track_started=True,
)
