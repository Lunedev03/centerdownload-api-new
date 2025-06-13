from .celery_config import celery_app_instance as app
from app.services.engine_manager import selecionar_motores_para_url
import logging
import os
from yt_dlp import YoutubeDL

logger = logging.getLogger(__name__)

@app.task(bind=True, name='tasks.processar_download_video')
def processar_download_video(self, dados_requisicao_dict: dict):
    task_id = self.request.id
    video_url = dados_requisicao_dict.get('video_url')
    engine_client = dados_requisicao_dict.get('engine')

    engines = selecionar_motores_para_url(video_url, engine_client)
    output_dir = os.path.join('app', 'download')
    os.makedirs(output_dir, exist_ok=True)

    for engine in engines:
        try:
            ydl_opts = {'outtmpl': os.path.join(output_dir, f"{task_id}.%(ext)s")}
            with YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(video_url, download=True)
            file_path = ydl.prepare_filename(info)
            logger.info(f"Download concluído com {engine} para {video_url}")
            return {
                'task_id': task_id,
                'status': 'completed',
                'file_path': file_path,
                'engine_used': engine
            }
        except Exception as e:
            logger.warning(f"Motor {engine} falhou para {video_url}: {e}")
            continue
    return {
        'task_id': task_id,
        'status': 'failed',
        'error': 'all engines failed'
    }
