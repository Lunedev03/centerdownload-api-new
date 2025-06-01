# app/models/enums.py - Define Enumerações utilizadas nos modelos.

from enum import Enum

class AllowedFormats(str, Enum):
    MP4 = 'mp4'
    MP3 = 'mp3'
    AVI = 'avi'
    MKV = 'mkv'
    WEBM = 'webm'
    M4A = 'm4a'
    AAC = 'aac'
    OGG = 'ogg'
    WAV = 'wav'
    FLV = 'flv'

class TaskStatus(str, Enum):
    PENDING = 'pending'
    PROCESSING = 'processing'
    COMPLETED = 'completed'
    FAILED = 'failed'
    CANCELLED = 'cancelled'

class DownloadEngine(str, Enum):
    YOUTUBE_DL = 'youtube-dl'
    YT_DLP = 'yt-dlp'
    ANNIE = 'annie'
    STREAMLINK = 'streamlink'
    ARIA2 = 'aria2'
    RTMPDUMP = 'rtmpdump'
    GALLERY_DL = 'gallery-dl'
    YOU_GET = 'you-get'
