"""Gerencia escolha de motores de download."""
from typing import List, Dict, Optional
import urllib.parse
import logging

engine_logger = logging.getLogger(__name__)

REGISTRY_DE_MOTORES: Dict[str, List[str]] = {
    "youtube.com": ["yt-dlp"],
    "youtu.be": ["yt-dlp"],
    "vimeo.com": ["yt-dlp"],
    "DEFAULT": ["yt-dlp"],
}

MOTORES_SUPORTADOS: List[str] = ["yt-dlp"]

def selecionar_motores_para_url(video_url: str, motor_especificado_pelo_cliente: Optional[str] = None, **kwargs) -> List[str]:
    """Retorna lista de motores a usar para determinada URL."""
    correlation_id = kwargs.get("correlation_id")

    if motor_especificado_pelo_cliente:
        engine_logger.debug(
            "Motor especificado pelo cliente",
            extra={"correlation_id": correlation_id, "engine": motor_especificado_pelo_cliente}
        )
        if motor_especificado_pelo_cliente in MOTORES_SUPORTADOS:
            return [motor_especificado_pelo_cliente]
        engine_logger.warning("Motor nao suportado, usando padrao", extra={"correlation_id": correlation_id})

    try:
        parsed = urllib.parse.urlparse(video_url)
        domain = parsed.netloc.lower().replace("www.", "")
    except Exception as exc:
        engine_logger.error("Erro ao parsear URL", extra={"correlation_id": correlation_id, "error": str(exc)})
        return REGISTRY_DE_MOTORES["DEFAULT"]

    return REGISTRY_DE_MOTORES.get(domain, REGISTRY_DE_MOTORES["DEFAULT"])
