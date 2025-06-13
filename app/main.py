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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="URL não fornecida")

    logger.info(f"Solicitando informações para URL: {url}")
    from yt_dlp import YoutubeDL

    try:
        with YoutubeDL({"skip_download": True}) as ydl:
            info = ydl.extract_info(url, download=False)

        return {
            "success": True,
            "data": {
                "title": info.get("title"),
                "thumbnailUrl": info.get("thumbnail"),
                "duration": info.get("duration"),
                "author": info.get("uploader"),
                "viewCount": info.get("view_count")
            },
        }
    except Exception as exc:
        logger.error(f"Erro ao obter informações: {exc}")
        raise HTTPException(status_code=500, detail="Falha ao obter informações do vídeo")

@app_fastapi.get("/api/v1/video/options", tags=["Video"])
async def get_video_options(url: str):
    if not url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="URL não fornecida")

    logger.info(f"Solicitando opções de download para URL: {url}")

    from yt_dlp import YoutubeDL

    try:
        with YoutubeDL({"skip_download": True}) as ydl:
            info = ydl.extract_info(url, download=False)
        formats = [
            {
                "format_id": f.get("format_id"),
                "ext": f.get("ext"),
                "filesize": f.get("filesize"),
                "format_note": f.get("format_note"),
                "video_codec": f.get("vcodec"),
                "audio_codec": f.get("acodec"),
            }
            for f in info.get("formats", []) if f.get("filesize")
        ]
        return {"success": True, "data": formats}
    except Exception as exc:
        logger.error(f"Erro ao obter opções: {exc}")
        raise HTTPException(status_code=500, detail="Falha ao obter opções")

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

        from app.tasks.download_tasks import processar_download_video
        result = processar_download_video.delay({"video_url": url})

        return {"success": True, "data": {"task_id": result.id, "status": "pending"}}
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
