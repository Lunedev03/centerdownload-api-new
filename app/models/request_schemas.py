# app/models/request_schemas.py - Define os esquemas de requisição da API.

from typing import Optional
from pydantic import BaseModel, validator, HttpUrl
import re
from .enums import AllowedFormats, DownloadEngine

class DownloadRequest(BaseModel):
    video_url: HttpUrl  # Obrigatório - usando HttpUrl para validação automática
    format: str  # Obrigatório
    engine: Optional[str] = None
    audio_only: Optional[bool] = False
    start_time: Optional[str] = None  # Formato HH:MM:SS
    end_time: Optional[str] = None  # Formato HH:MM:SS

    # Validador para formato
    @validator('format')
    def validate_format(cls, v):
        try:
            return AllowedFormats(v.lower())
        except ValueError:
            allowed_formats = [f.value for f in AllowedFormats]
            raise ValueError(f"Formato inválido. Formatos permitidos: {', '.join(allowed_formats)}")
    
    # Validador para engine
    @validator('engine')
    def validate_engine(cls, v):
        if v is None:
            return v
        try:
            return DownloadEngine(v.lower())
        except ValueError:
            allowed_engines = [e.value for e in DownloadEngine]
            raise ValueError(f"Engine inválido. Engines permitidos: {', '.join(allowed_engines)}")
    
    # Validador para tempos
    @validator('start_time', 'end_time')
    def validate_time_format(cls, v):
        if v is None:
            return v
        # Validar formato HH:MM:SS
        pattern = re.compile(r'^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$')
        if not pattern.match(v):
            raise ValueError("O tempo deve estar no formato HH:MM:SS")
        return v
    
    # Validador para consistência entre start_time e end_time
    @validator('end_time')
    def validate_time_consistency(cls, v, values):
        start_time = values.get('start_time')
        if start_time and v:
            # Converter para segundos para comparação
            def time_to_seconds(time_str):
                h, m, s = map(int, time_str.split(':'))
                return h * 3600 + m * 60 + s
            
            start_seconds = time_to_seconds(start_time)
            end_seconds = time_to_seconds(v)
            
            if end_seconds <= start_seconds:
                raise ValueError("end_time deve ser posterior a start_time")
        return v
