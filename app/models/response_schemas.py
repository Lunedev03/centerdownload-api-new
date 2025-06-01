# app/models/response_schemas.py - Define os esquemas de resposta da API.

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, HttpUrl
from .enums import TaskStatus

class TaskCreationResponse(BaseModel):
    success: bool = True
    data: Dict[str, Any]

class TaskStatusData(BaseModel):
    task_id: str
    status: TaskStatus
    progress: Optional[int] = None
    download_url: Optional[str] = None
    error: Optional[str] = None

class TaskStatusResponse(BaseModel):
    success: bool = True
    data: TaskStatusData

class VideoInfo(BaseModel):
    title: str
    thumbnailUrl: str
    duration: str
    author: str
    viewCount: str

class VideoInfoResponse(BaseModel):
    success: bool = True
    data: VideoInfo

class DownloadOption(BaseModel):
    quality: str
    format: str
    size: str
    type: str
    recommended: Optional[bool] = False

class DownloadOptionsResponse(BaseModel):
    success: bool = True
    data: List[DownloadOption]

class DownloadUrlResponse(BaseModel):
    success: bool = True
    data: Dict[str, str]
