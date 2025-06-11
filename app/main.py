# app/main.py - Arquivo principal da aplicação FastAPI

try:
    from fastapi import FastAPI, Request, HTTPException, Response, status
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse, FileResponse
    import os
    import logging
    import json
    import random
    from typing import Dict, List, Optional, Any
    from app.routes import api_router
except ImportError as e:
    import sys
    print(f"Erro de importação: {e}")
    print(f"Versão do Python: {sys.version}")
    print(f"Versão do Pydantic necessária: >=2.0.0")
    print("Tente instalar a versão correta do pydantic com:")
    print("pip install pydantic>=2.0.0")
    sys.exit(1)

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

# Incluir as rotas da API
app_fastapi.include_router(api_router, prefix="/api/v1")

# Rotas básicas
@app_fastapi.get("/api/v1/health", tags=["Health Check"], status_code=status.HTTP_200_OK)
async def health_check():
    logger.info("Health check executado")
    return {
        "success": True,
        "data": {
            "status": "healthy",
            "service": "video-downloader-api"
        }
    }

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
        "success": True,
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
    
    # Implementação futura - por enquanto retorna dados de exemplo com tamanhos em bytes
    # Os tamanhos são fornecidos como números (bytes) para serem processados pelo frontend e API Gateway
    return {
        "success": True,
        "data": [
            {"quality": "4K", "format": "MP4", "size": 2256000000, "type": "video"},  # ~2.1 GB
            {"quality": "1080p", "format": "MP4", "size": 891289600, "type": "video", "recommended": True},  # ~850 MB
            {"quality": "720p", "format": "MP4", "size": 471859200, "type": "video"},  # ~450 MB
            {"quality": "480p", "format": "MP4", "size": 262144000, "type": "video"},  # ~250 MB
            {"quality": "360p", "format": "MP4", "size": 157286400, "type": "video"},  # ~150 MB
            {"quality": "High", "format": "MP3", "size": 8388608, "type": "audio", "recommended": True},  # ~8 MB
            {"quality": "Medium", "format": "MP3", "size": 5242880, "type": "audio"}  # ~5 MB
        ]
    }

@app_fastapi.post("/api/v1/video/download", tags=["Video"])
async def start_download(request: Request):
    try:
        # Ler o corpo da requisição
        data = await request.json()
        
        # Validar usando o modelo Pydantic
        try:
            from app.models.request_schemas import DownloadRequest
            request_data = DownloadRequest(**data)
            url = str(request_data.video_url)
        except Exception as validation_error:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Dados de requisição inválidos: {str(validation_error)}"
            )
        
        logger.info(f"Iniciando download para URL: {url}")
        
        # Implementação futura - por enquanto retorna dados de exemplo
        task_id = f"mock-task-{abs(hash(url)) % 10000}"
        
        return {
            "success": True,
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
    
    return {
        "success": True,
        "data": response
    }

@app_fastapi.get("/api/v1/download/{task_id}", tags=["Video"])
async def download_file(task_id: str):
    """Endpoint para download do arquivo processado"""
    if not task_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID da tarefa não fornecido"
        )
    
    logger.info(f"Solicitando download do arquivo para tarefa: {task_id}")
    
    # Verificar se existe um arquivo de tarefa para o task_id
    task_file = os.path.join("app", "download", f"{task_id}.json")
    
    if not os.path.exists(task_file):
        logger.warning(f"Tentativa de download para tarefa inexistente: {task_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tarefa {task_id} não encontrada"
        )
    
    try:
        # Ler dados da tarefa
        with open(task_file, "r") as f:
            task_data = json.load(f)
        
        # Verificar se a tarefa está concluída
        if task_data.get("status") != "completed":
            logger.warning(f"Tentativa de download para tarefa não concluída: {task_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Tarefa {task_id} não está concluída"
            )
        
        # Para demonstração, criar um arquivo de texto temporário
        output_file = os.path.join("app", "download", f"{task_id}.txt")
        
        # Verificar se o arquivo já existe, se não, criar um arquivo de exemplo
        if not os.path.exists(output_file):
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(f"Este é um arquivo de exemplo para a tarefa {task_id}.\n")
                f.write("Em uma implementação real, este seria o vídeo ou áudio baixado.\n")
                f.write(f"URL: {task_data.get('download_data', {}).get('video_url', 'N/A')}\n")
                f.write(f"Formato: {task_data.get('download_data', {}).get('format', 'N/A')}\n")
        
        # Gerar um nome de arquivo mais amigável
        download_filename = f"download-{task_id}.txt"
        
        # Em uma implementação real, o tipo de arquivo e nome seria determinado pelo formato selecionado
        # Por exemplo: video-title.mp4 ou audio-title.mp3
        
        # Determinar o tipo MIME com base na extensão (em implementação real)
        media_type = "text/plain"  # Para arquivos de texto em nossa demonstração
        # Em produção: "video/mp4" para vídeos MP4, "audio/mpeg" para áudios MP3, etc.
        
        # FileResponse configura os cabeçalhos necessários para download no navegador
        return FileResponse(
            path=output_file,
            filename=download_filename,
            media_type=media_type,
            # Force o download como "attachment" para que o navegador baixe em vez de exibir
            headers={"Content-Disposition": f"attachment; filename=\"{download_filename}\""}
        )
    except Exception as e:
        logger.error(f"Erro ao processar download para tarefa {task_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao processar download: {str(e)}"
        )

# Manipulador de exceções para toda a aplicação
@app_fastapi.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erro não tratado: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Ocorreu um erro interno no servidor",
            "error": str(exc)
        }
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
