import os
import socket
from loguru import logger
from dotenv import load_dotenv

# Carrega o .env da raiz do projeto
root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
load_dotenv(os.path.join(root_dir, ".env"))

def _get(key, default=""):
    return os.getenv(key, default)

# ── LLM ──────────────────────────────────────────────────────
openai_base_url = _get("LLM_BASE_URL", "http://localhost:3000/v1")
openai_model_name = _get("LLM_MODEL", "deepseek-chat")
openai_api_key = _get("LLM_API_KEY", "local")

# ── Vídeo ─────────────────────────────────────────────────────
video_source = _get("VIDEO_SOURCE", "pexels")
pexels_api_keys = [k.strip() for k in _get("PEXELS_API_KEY").split(",") if k.strip()]
pixabay_api_keys = [k.strip() for k in _get("PIXABAY_API_KEY").split(",") if k.strip()]

# ── TTS ───────────────────────────────────────────────────────
tts_voice = _get("TTS_VOICE", "af_heart")
tts_speed = float(_get("TTS_SPEED", "1.0"))

# ── Whisper ───────────────────────────────────────────────────
whisper = {
    "model_size": _get("WHISPER_MODEL", "medium"),
    "device": _get("WHISPER_DEVICE", "cpu"),
    "compute_type": _get("WHISPER_COMPUTE_TYPE", "int8"),
}

# ── Caminhos ──────────────────────────────────────────────────
imagemagick_path = _get("IMAGEMAGICK_PATH", "")
if imagemagick_path and os.path.isfile(imagemagick_path):
    os.environ["IMAGEMAGICK_BINARY"] = imagemagick_path

ffmpeg_path = _get("FFMPEG_PATH", "")
if ffmpeg_path and os.path.isfile(ffmpeg_path):
    os.environ["IMAGEIO_FFMPEG_EXE"] = ffmpeg_path

# ── Servidor ──────────────────────────────────────────────────
listen_host = _get("HOST", "0.0.0.0")
listen_port = int(_get("PORT", "8080"))
log_level = _get("LOG_LEVEL", "DEBUG")
reload_debug = False

# ── Compatibilidade com código existente ──────────────────────
# Mantém o dict "app" que outros módulos podem acessar via config.app.get(...)
app = {
    "video_source": video_source,
    "pexels_api_keys": pexels_api_keys,
    "pixabay_api_keys": pixabay_api_keys,
    "tts_voice": tts_voice,
    "tts_speed": tts_speed,
    "imagemagick_path": imagemagick_path,
    "ffmpeg_path": ffmpeg_path,
    "openai_base_url": openai_base_url,
    "openai_model_name": openai_model_name,
    "openai_api_key": openai_api_key,
}

ui = {"hide_log": False}
proxy = {}
hostname = socket.gethostname()
project_name = "MoneyPrinterTurbo"
project_description = "Gerador automático de vídeos curtos com IA"
project_version = "2.0.0"

# Função save_config mantida por compatibilidade (agora é no-op)
def save_config():
    pass

logger.info(f"{project_name} v{project_version}")
