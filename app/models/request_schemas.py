# app/models/request_schemas.py - Define os esquemas de requisição da API.

# from typing import Optional
# from pydantic import BaseModel, validator

# class DownloadRequest(BaseModel):
#     video_url: str  # Obrigatório
#     format: str  # Obrigatório
#     engine: Optional[str] = None
#     audio_only: Optional[bool] = False
#     start_time: Optional[str] = None  # Formato HH:MM:SS
#     end_time: Optional[str] = None  # Formato HH:MM:SS
#
#     # Regras de Validação:
#     # video_url: "Deve ser uma URL pública e pertencer a uma lista de domínios suportados (a ser definida na configuração)."
#     # format: "Deve pertencer a um ENUM de formatos permitidos (a ser definido em enums.py)."
#     # start_time, end_time: "Devem seguir o formato HH:MM:SS. Se ambos fornecidos, end_time deve ser maior que start_time."
#
#     # Exemplo de validadores Pydantic (a serem implementados):
#     # @validator('video_url')
#     # def validate_video_url(cls, v):
#     #     # Lógica de validação da URL
#     #     return v
#
#     # @validator('format')
#     # def validate_format(cls, v):
#     #     # Lógica de validação do formato
#     #     return v
#
#     # @validator('end_time')
#     # def validate_time_consistency(cls, v, values):
#     #     start_time = values.get('start_time')
#     #     if start_time and v:
#     #         # Lógica para verificar se end_time é maior que start_time
#     #         pass
#     #     return v
