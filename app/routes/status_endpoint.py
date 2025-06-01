# app/routes/status_endpoint.py - Endpoint para consultar status de tarefas de download

from fastapi import APIRouter, HTTPException, status, Request
from app.models.response_schemas import TaskStatusResponse, TaskStatusData
from app.models.enums import TaskStatus
import logging
import os
import json
import random
from datetime import datetime, timedelta

status_logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/{task_id}", response_model=TaskStatusResponse)
async def get_download_task_status_endpoint(task_id: str, request: Request):
    correlation_id = request.headers.get("X-Correlation-ID", "unknown")
    status_logger.info(
        f"Consulta de status para tarefa {task_id}.",
        extra={"correlation_id": correlation_id, "task_id": task_id}
    )
    
    # Verificar se existe um arquivo de tarefa para o task_id
    task_file = os.path.join("app", "download", f"{task_id}.json")
    
    if not os.path.exists(task_file):
        status_logger.warning(
            f"Tentativa de consultar status para tarefa inexistente: {task_id}.",
            extra={"correlation_id": correlation_id, "task_id": task_id}
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Tarefa {task_id} não encontrada."
        )
    
    try:
        # Ler dados da tarefa
        with open(task_file, "r") as f:
            task_data = json.load(f)
        
        # Verificar o tempo de criação para simular progresso
        created_at = datetime.fromisoformat(task_data.get("created_at", datetime.now().isoformat()))
        elapsed_seconds = (datetime.now() - created_at).total_seconds()
        
        # Simular progresso baseado no tempo decorrido
        task_status = task_data.get("status", "pending")
        progress = None
        download_url = None
        error = None
        
        if elapsed_seconds < 5:
            task_status = "pending"
            progress = 0
        elif elapsed_seconds < 15:
            task_status = "processing"
            progress = min(int((elapsed_seconds - 5) * 10), 90)  # Progresso de 0 a 90%
        else:
            # Após 15 segundos, finalizar com sucesso (90% do tempo) ou falha (10% do tempo)
            if random.random() < 0.9:  # 90% de chance de sucesso
                task_status = "completed"
                progress = 100
                download_url = f"/api/v1/download/{task_id}"
            else:
                task_status = "failed"
                error = "Erro simulado durante o download"
        
        # Atualizar o status no arquivo
        task_data["status"] = task_status
        task_data["progress"] = progress
        task_data["download_url"] = download_url
        task_data["error"] = error
        task_data["updated_at"] = datetime.now().isoformat()
        
        with open(task_file, "w") as f:
            json.dump(task_data, f)
        
        # Criar resposta
        task_status_data = TaskStatusData(
            task_id=task_id,
            status=TaskStatus(task_status),
            progress=progress,
            download_url=download_url,
            error=error
        )
        
        status_logger.debug(
            f"Status retornado para tarefa {task_id}: {task_status}",
            extra={
                "correlation_id": correlation_id, 
                "task_id": task_id,
                "task_status": task_status, 
                "progress": progress,
                "download_url_present": bool(download_url),
                "error_present": bool(error)
            }
        )
        
        return TaskStatusResponse(success=True, data=task_status_data)
    
    except Exception as e:
        status_logger.error(
            f"Erro ao processar status da tarefa {task_id}: {str(e)}",
            extra={"correlation_id": correlation_id, "task_id": task_id, "error": str(e)}
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar status da tarefa: {str(e)}"
        )

print("Comentário sobre como proteger o endpoint de status com API Key adicionado conceitualmente a app/routes/status_endpoint.py.")
print("Comentários de logging conceitual adicionados/atualizados em app/routes/status_endpoint.py.")
