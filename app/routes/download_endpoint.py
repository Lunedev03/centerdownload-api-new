# app/routes/download_endpoint.py - Endpoint para submeter tarefas de download

from fastapi import APIRouter, status, Request, HTTPException, Depends
from app.models.request_schemas import DownloadRequest
from app.models.response_schemas import TaskCreationResponse
import uuid
import logging
import os
import json
from datetime import datetime

# Configuração do logger
download_logger = logging.getLogger(__name__)

# Criação do router
router = APIRouter()

# Função para simular o processamento assíncrono (será substituída por Celery em produção)
async def process_download_task(task_id: str, download_data: dict):
    """
    Função que simula o processamento assíncrono de uma tarefa de download.
    Em produção, isso seria feito por um worker Celery.
    """
    # Criar diretório de downloads se não existir
    download_dir = os.path.join("app", "download")
    os.makedirs(download_dir, exist_ok=True)
    
    # Simular o processamento salvando os dados da tarefa
    task_file = os.path.join(download_dir, f"{task_id}.json")
    with open(task_file, "w") as f:
        json.dump({
            "task_id": task_id,
            "download_data": download_data,
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }, f)
    
    download_logger.info(f"Tarefa de download {task_id} criada para URL: {download_data.get('video_url')}")
    return task_id

@router.post("", response_model=TaskCreationResponse, status_code=status.HTTP_202_ACCEPTED)
async def enqueue_download_task_endpoint(request_data: DownloadRequest, request: Request):
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    download_logger.info(
        "Requisição de download recebida.",
        extra={
            "correlation_id": correlation_id,
            "video_url": str(request_data.video_url),
            "format": request_data.format,
            "engine": request_data.engine,
            "audio_only": request_data.audio_only,
            "start_time": request_data.start_time,
            "end_time": request_data.end_time,
        }
    )
    
    # Converter o modelo Pydantic para dicionário
    task_payload_dict = request_data.dict()
    task_payload_dict["video_url"] = str(request_data.video_url)  # Converter HttpUrl para string
    task_payload_dict["correlation_id"] = correlation_id
    
    try:
        # Gerar ID único para a tarefa
        task_id = str(uuid.uuid4())
        
        # Em produção, isso seria enviado para uma fila Celery
        # task_instance = processar_download_video.delay(dados_requisicao_dict=task_payload_dict)
        # task_id = task_instance.id
        
        # Por enquanto, processamos de forma síncrona (simulação)
        await process_download_task(task_id, task_payload_dict)
        
        download_logger.info(
            f"Tarefa de download {task_id} criada e enfileirada para {request_data.video_url}.",
            extra={"correlation_id": correlation_id, "task_id": task_id, "video_url": str(request_data.video_url)}
        )
        
        # Retornar resposta no formato esperado
        return TaskCreationResponse(
            success=True,
            data={
                "task_id": task_id,
                "status": "pending"
            }
        )
    except Exception as e:
        download_logger.error(
            f"Falha ao enfileirar tarefa de download para {request_data.video_url}: {str(e)}",
            extra={"correlation_id": correlation_id, "video_url": str(request_data.video_url), "error": str(e)}
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha ao iniciar o processo de download: {str(e)}"
        )

print("Endpoint POST /download (app/routes/download_endpoint.py) conceitualmente definido.")

# app/routes/download_endpoint.py (continuação ou atualização)
# Conteúdo existente ...
# # Para proteger este endpoint, a assinatura da função seria alterada para incluir:
# # from fastapi import Depends
# # from app.core.security import verificar_api_key
# #
# # @router.post(..., dependencies=[Depends(verificar_api_key)])
# # async def enqueue_download_task_endpoint(request_data: DownloadRequest, request: Request): # Manter request: Request

print("Comentário sobre como proteger o endpoint de download com API Key adicionado conceitualmente a app/routes/download_endpoint.py.")
print("Comentários de logging conceitual adicionados/atualizados em app/routes/download_endpoint.py.")
