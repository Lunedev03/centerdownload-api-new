# app/main.py - Arquivo principal da aplicação FastAPI

from fastapi import FastAPI, Request, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import os
import logging
import random
import json
from typing import Dict, List, Optional, Any

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger("video-api")

# Criar a aplicação FastAPI
app_fastapi = FastAPI(
    title="API de Download de Vídeos",
    version="0.1.0",
    description="API para download de vídeos de múltiplas plataformas"
)

# Configuração de CORS
origins_permitidas = ["http://localhost:3000", "http://localhost:3001"]
app_fastapi.add_middleware(
    CORSMiddleware,
    allow_origins=origins_permitidas,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar pasta para downloads se não existir
os.makedirs("app/download", exist_ok=True)

# Rotas básicas
@app_fastapi.get("/api/v1/health", tags=["Health Check"], status_code=status.HTTP_200_OK)
async def health_check():
    logger.info("Health check executado")
    return {"status": "healthy", "service": "video-downloader-api"}

@app_fastapi.get("/api/v1/video/info", tags=["Video"])
async def get_video_info(url: str):
    if not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL não fornecida"
        )
    
    logger.info(f"Solicitando informações para URL: {url}")
    
    # Implementação futura - por enquanto retorna dados de exemplo
    return {
        "data": {
            "title": "Vídeo de exemplo",
            "thumbnailUrl": "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop",
            "duration": "10:24",
            "author": "Canal de Exemplo",
            "viewCount": "1.2M"
        }
    }

@app_fastapi.get("/api/v1/video/options", tags=["Video"])
async def get_video_options(url: str):
    if not url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL não fornecida"
        )
    
    logger.info(f"Solicitando opções de download para URL: {url}")
    
    # Implementação futura - por enquanto retorna dados de exemplo
    return {
        "data": [
            {"quality": "4K", "format": "MP4", "size": "2.1 GB", "type": "video"},
            {"quality": "1080p", "format": "MP4", "size": "850 MB", "type": "video", "recommended": True},
            {"quality": "720p", "format": "MP4", "size": "450 MB", "type": "video"},
            {"quality": "480p", "format": "MP4", "size": "250 MB", "type": "video"},
            {"quality": "360p", "format": "MP4", "size": "150 MB", "type": "video"},
            {"quality": "High", "format": "MP3", "size": "8 MB", "type": "audio", "recommended": True},
            {"quality": "Medium", "format": "MP3", "size": "5 MB", "type": "audio"}
        ]
    }

@app_fastapi.post("/api/v1/video/download", tags=["Video"])
async def start_download(request: Request):
    try:
        data = await request.json()
        url = data.get('url')
        
        if not url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="URL não fornecida"
            )
        
        logger.info(f"Iniciando download para URL: {url}")
        
        # Implementação futura - por enquanto retorna dados de exemplo
        task_id = f"mock-task-{abs(hash(url)) % 10000}"
        
        return {
            "data": {
                "task_id": task_id,
                "status": "pending"
            }
        }
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="JSON inválido"
        )

@app_fastapi.get("/api/v1/video/task/{task_id}", tags=["Video"])
async def check_task_status(task_id: str):
    if not task_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID da tarefa não fornecido"
        )
    
    logger.info(f"Verificando status da tarefa: {task_id}")
    
    # Implementação futura - por enquanto retorna dados de exemplo
    statuses = ["pending", "processing", "completed", "failed"]
    status_value = statuses[hash(task_id) % 4]  # Determinístico para teste
    
    response = {"status": status_value}
    if status_value == "processing":
        response["progress"] = random.randint(10, 90)
    elif status_value == "completed":
        response["download_url"] = f"/api/v1/download/{task_id}"
    elif status_value == "failed":
        response["error"] = "Erro simulado durante o download"
    
    return {"data": response}

@app_fastapi.get("/api/v1/download/{task_id}", tags=["Video"])
async def download_file(task_id: str):
    """Endpoint para download do arquivo processado"""
    if not task_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID da tarefa não fornecido"
        )
    
    logger.info(f"Solicitando download do arquivo para tarefa: {task_id}")
    
    # Para demonstração, criar um arquivo de texto temporário
    file_path = os.path.join("app", "download", f"{task_id}.txt")
    
    # Verificar se o arquivo já existe, se não, criar um arquivo de exemplo
    if not os.path.exists(file_path):
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(f"Este é um arquivo de exemplo para a tarefa {task_id}.\n")
            f.write("Em uma implementação real, este seria o vídeo ou áudio baixado.\n")
    
    # Gerar um nome de arquivo mais amigável
    download_filename = f"download-{task_id}.txt"
    
    # Em uma implementação real, o tipo de arquivo e nome seria determinado pelo formato selecionado
    # Por exemplo: video-title.mp4 ou audio-title.mp3
    
    # Determinar o tipo MIME com base na extensão (em implementação real)
    media_type = "text/plain"  # Para arquivos de texto em nossa demonstração
    # Em produção: "video/mp4" para vídeos MP4, "audio/mpeg" para áudios MP3, etc.
    
    # FileResponse configura os cabeçalhos necessários para download no navegador:
    # - Content-Disposition: attachment; filename="nome-do-arquivo.extensao"
    # - Content-Type: tipo-mime-adequado
    return FileResponse(
        path=file_path,
        filename=download_filename,
        media_type=media_type,
        # Force o download como "attachment" para que o navegador baixe em vez de exibir
        headers={"Content-Disposition": f"attachment; filename=\"{download_filename}\""}
    )

# Manipulador de exceções para toda a aplicação
@app_fastapi.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erro não tratado: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Ocorreu um erro interno no servidor"}
    )

# Evento de inicialização
@app_fastapi.on_event("startup")
async def startup_event():
    logger.info("Aplicação FastAPI iniciada com sucesso")

# Evento de encerramento
@app_fastapi.on_event("shutdown")
async def shutdown_event():
    logger.info("Aplicação FastAPI encerrada")

logger.info("Aplicação FastAPI (app_fastapi) em app/main.py criada e configurada.")
logger.info("CORS, tratamento de erros e rotas básicas configurados.")
