import os
import random
import threading
from typing import List
from urllib.parse import urlencode

import requests
from loguru import logger
from moviepy.video.io.VideoFileClip import VideoFileClip

from app.config import config
from app.models.schema import MaterialInfo, VideoAspect, VideoConcatMode
from app.utils import utils

# Contador thread-safe para rotação de chaves de API
_api_key_counter = 0
_api_key_lock = threading.Lock()

# Extensões de vídeo suportadas para a biblioteca local
_LOCAL_VIDEO_EXTENSIONS = (".mp4", ".mov", ".avi", ".mkv")


def _get_tls_verify() -> bool:
    # Verificação de certificado TLS habilitada por padrão para evitar
    # ataques man-in-the-middle na busca e download de materiais.
    tls_verify = getattr(config, 'tls_verify', True)
    if isinstance(tls_verify, str):
        tls_verify = tls_verify.strip().lower() not in ("0", "false", "no", "off")

    if not tls_verify:
        logger.warning(
            "Verificação de certificado TLS desabilitada por config.app.tls_verify=false. "
            "Use apenas em ambientes com proxy confiável."
        )

    return bool(tls_verify)


def get_api_key(cfg_key: str):
    api_keys = getattr(config, cfg_key, None) or config.app.get(cfg_key)
    if not api_keys:
        raise ValueError(
            f"\n\n##### {cfg_key} não está configurado #####\n\n"
            f"Configure no arquivo .env as variáveis PEXELS_API_KEY ou PIXABAY_API_KEY\n\n"
            f"{utils.to_json(config.app)}"
        )

    # Se apenas uma chave foi fornecida, retorna ela
    if isinstance(api_keys, str):
        return api_keys

    global _api_key_counter
    with _api_key_lock:
        _api_key_counter += 1
        return api_keys[_api_key_counter % len(api_keys)]


def search_videos_local(
    search_term: str = "",
    minimum_duration: int = 0,
    video_aspect: VideoAspect = VideoAspect.portrait,
) -> List[MaterialInfo]:
    """
    Busca vídeos na biblioteca local em resource/videos/.
    Retorna todos os vídeos encontrados, ordenados aleatoriamente.
    O parâmetro search_term é ignorado para fonte local.
    """
    videos_dir = utils.resource_dir("videos")
    if not os.path.isdir(videos_dir):
        logger.warning(f"diretório de vídeos locais não encontrado: {videos_dir}")
        return []

    video_items = []
    for root, dirs, files in os.walk(videos_dir):
        for file in files:
            if file.lower().endswith(_LOCAL_VIDEO_EXTENSIONS):
                file_path = os.path.join(root, file)
                try:
                    clip = VideoFileClip(file_path)
                    duration = clip.duration
                    clip.close()
                    if duration >= minimum_duration or minimum_duration == 0:
                        item = MaterialInfo()
                        item.provider = "local"
                        item.url = file_path
                        item.duration = duration
                        video_items.append(item)
                except Exception as e:
                    logger.warning(f"não foi possível ler vídeo local: {file_path}, erro: {str(e)}")

    # Embaralha para variedade
    random.shuffle(video_items)
    logger.info(f"encontrados {len(video_items)} vídeos na biblioteca local")
    return video_items


def search_videos_pexels(
    search_term: str,
    minimum_duration: int,
    video_aspect: VideoAspect = VideoAspect.portrait,
) -> List[MaterialInfo]:
    aspect = VideoAspect(video_aspect)
    video_orientation = aspect.name
    video_width, video_height = aspect.to_resolution()
    api_key = get_api_key("pexels_api_keys")
    headers = {
        "Authorization": api_key,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    }
    # Constrói a URL
    params = {"query": search_term, "per_page": 20, "orientation": video_orientation}
    query_url = f"https://api.pexels.com/videos/search?{urlencode(params)}"
    logger.info(f"buscando vídeos: {query_url}, com proxies: {config.proxy}")

    try:
        r = requests.get(
            query_url,
            headers=headers,
            proxies=config.proxy,
            verify=_get_tls_verify(),
            timeout=(30, 60),
        )
        response = r.json()
        video_items = []
        if "videos" not in response:
            logger.error(f"busca de vídeos falhou: {response}")
            return video_items
        videos = response["videos"]
        # Percorre cada vídeo no resultado
        for v in videos:
            duration = v["duration"]
            # Verifica se o vídeo tem a duração mínima desejada
            if duration < minimum_duration:
                continue
            video_files = v["video_files"]
            # Procura pela melhor qualidade
            for video in video_files:
                w = int(video["width"])
                h = int(video["height"])
                if w == video_width and h == video_height:
                    item = MaterialInfo()
                    item.provider = "pexels"
                    item.url = video["link"]
                    item.duration = duration
                    video_items.append(item)
                    break
        return video_items
    except Exception as e:
        logger.error(f"busca de vídeos falhou: {str(e)}")

    return []


def search_videos_pixabay(
    search_term: str,
    minimum_duration: int,
    video_aspect: VideoAspect = VideoAspect.portrait,
) -> List[MaterialInfo]:
    aspect = VideoAspect(video_aspect)
    video_width, video_height = aspect.to_resolution()

    api_key = get_api_key("pixabay_api_keys")
    # Constrói a URL
    params = {
        "q": search_term,
        "video_type": "all",
        "per_page": 50,
        "key": api_key,
    }
    query_url = f"https://pixabay.com/api/videos/?{urlencode(params)}"
    logger.info(f"buscando vídeos: {query_url}, com proxies: {config.proxy}")

    try:
        r = requests.get(
            query_url, proxies=config.proxy, verify=_get_tls_verify(), timeout=(30, 60)
        )
        response = r.json()
        video_items = []
        if "hits" not in response:
            logger.error(f"busca de vídeos falhou: {response}")
            return video_items
        videos = response["hits"]
        for v in videos:
            duration = v["duration"]
            if duration < minimum_duration:
                continue
            video_files = v["videos"]
            for video_type in video_files:
                video = video_files[video_type]
                w = int(video["width"])
                if w >= video_width:
                    item = MaterialInfo()
                    item.provider = "pixabay"
                    item.url = video["url"]
                    item.duration = duration
                    video_items.append(item)
                    break
        return video_items
    except Exception as e:
        logger.error(f"busca de vídeos falhou: {str(e)}")

    return []


def save_video(video_url: str, save_dir: str = "") -> str:
    if not save_dir:
        save_dir = utils.storage_dir("cache_videos")

    if not os.path.exists(save_dir):
        os.makedirs(save_dir)

    url_without_query = video_url.split("?")[0]
    url_hash = utils.md5(url_without_query)
    video_id = f"vid-{url_hash}"
    video_path = f"{save_dir}/{video_id}.mp4"

    # Se o vídeo já existe, retorna o caminho
    if os.path.exists(video_path) and os.path.getsize(video_path) > 0:
        logger.info(f"vídeo já existe: {video_path}")
        return video_path

    # Se for um caminho local, copia em vez de baixar
    if os.path.isfile(video_url):
        import shutil
        try:
            shutil.copy2(video_url, video_path)
            logger.info(f"vídeo local copiado: {video_path}")
            return video_path
        except Exception as e:
            logger.error(f"falha ao copiar vídeo local: {str(e)}")
            return ""

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }

    # Baixa o vídeo
    with open(video_path, "wb") as f:
        f.write(
            requests.get(
                video_url,
                headers=headers,
                proxies=config.proxy,
                verify=_get_tls_verify(),
                timeout=(60, 240),
            ).content
        )

    if os.path.exists(video_path) and os.path.getsize(video_path) > 0:
        clip = None
        try:
            clip = VideoFileClip(video_path)
            duration = clip.duration
            fps = clip.fps
            if duration > 0 and fps > 0:
                return video_path
        except Exception as e:
            logger.warning(f"arquivo de vídeo inválido: {video_path} => {str(e)}")
            try:
                os.remove(video_path)
            except Exception as remove_error:
                logger.warning(
                    f"falha ao remover vídeo inválido: {video_path}, erro: {str(remove_error)}"
                )
        finally:
            if clip is not None:
                try:
                    clip.close()
                except Exception as close_error:
                    logger.warning(
                        f"falha ao fechar clip de vídeo: {video_path}, erro: {str(close_error)}"
                    )
    return ""


def download_videos(
    task_id: str,
    search_terms: List[str],
    source: str = "local",
    video_aspect: VideoAspect = VideoAspect.portrait,
    video_contact_mode: VideoConcatMode = VideoConcatMode.random,
    audio_duration: float = 0.0,
    max_clip_duration: int = 5,
) -> List[str]:
    valid_video_items = []
    valid_video_urls = []
    found_duration = 0.0

    # Seleciona a função de busca conforme a fonte
    if source == "local":
        search_videos = search_videos_local
    elif source == "pixabay":
        search_videos = search_videos_pixabay
    else:
        search_videos = search_videos_pexels

    if source == "local":
        # Para fonte local, não usa termos de busca
        video_items = search_videos(
            minimum_duration=max_clip_duration,
            video_aspect=video_aspect,
        )
        logger.info(f"encontrados {len(video_items)} vídeos na biblioteca local")
        for item in video_items:
            if item.url not in valid_video_urls:
                valid_video_items.append(item)
                valid_video_urls.append(item.url)
                found_duration += item.duration
    else:
        for search_term in search_terms:
            video_items = search_videos(
                search_term=search_term,
                minimum_duration=max_clip_duration,
                video_aspect=video_aspect,
            )
            logger.info(f"encontrados {len(video_items)} vídeos para '{search_term}'")

            for item in video_items:
                if item.url not in valid_video_urls:
                    valid_video_items.append(item)
                    valid_video_urls.append(item.url)
                    found_duration += item.duration

    logger.info(
        f"total de vídeos encontrados: {len(valid_video_items)}, duração necessária: {audio_duration} segundos, duração encontrada: {found_duration} segundos"
    )

    # Fallback: se a fonte for local e não houver vídeos suficientes, usa Pexels
    if source == "local" and found_duration < audio_duration:
        logger.warning(
            f"vídeos locais insuficientes ({found_duration:.1f}s < {audio_duration:.1f}s), "
            f"usando Pexels como fallback"
        )
        try:
            pexels_items = search_videos_pexels(
                search_term=" ".join(search_terms[:3]) if search_terms else "nature",
                minimum_duration=max_clip_duration,
                video_aspect=video_aspect,
            )
            for item in pexels_items:
                if item.url not in valid_video_urls:
                    valid_video_items.append(item)
                    valid_video_urls.append(item.url)
                    found_duration += item.duration
        except Exception as e:
            logger.warning(f"fallback para Pexels falhou: {str(e)}")

    video_paths = []

    material_directory = getattr(config, 'material_directory', '') or config.app.get("material_directory", "").strip()
    if material_directory == "task":
        material_directory = utils.task_dir(task_id)
    elif material_directory and not os.path.isdir(material_directory):
        material_directory = ""

    mode_value = video_contact_mode.value if hasattr(video_contact_mode, 'value') else video_contact_mode
    if mode_value == VideoConcatMode.random.value:
        random.shuffle(valid_video_items)

    total_duration = 0.0
    for item in valid_video_items:
        try:
            logger.info(f"processando vídeo: {item.url}")
            saved_video_path = save_video(
                video_url=item.url, save_dir=material_directory
            )
            if saved_video_path:
                logger.info(f"vídeo salvo: {saved_video_path}")
                video_paths.append(saved_video_path)
                seconds = min(max_clip_duration, item.duration)
                total_duration += seconds
                if total_duration > audio_duration:
                    logger.info(
                        f"duração total dos vídeos: {total_duration} segundos, parando download"
                    )
                    break
        except Exception as e:
            logger.error(f"falha ao processar vídeo: {utils.to_json(item)} => {str(e)}")
    logger.success(f"processados {len(video_paths)} vídeos")
    return video_paths


if __name__ == "__main__":
    download_videos(
        "test123", ["Nature Landscape"], audio_duration=100, source="local"
    )
