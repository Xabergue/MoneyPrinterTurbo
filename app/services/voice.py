import math
import os
from typing import Union

import soundfile as sf
import numpy as np
from loguru import logger
from moviepy.audio.io.AudioFileClip import AudioFileClip

from app.config import config
from app.utils import utils


# Lista curada de vozes disponíveis no Kokoro TTS
# Formato: (voice_id, idioma, gênero, nome_exibição)
_KOKORO_VOICES = [
    ("af_heart", "en-US", "Female", "Heart (EN-US Feminino)"),
    ("af_bella", "en-US", "Female", "Bella (EN-US Feminino)"),
    ("af_sarah", "en-US", "Female", "Sarah (EN-US Feminino)"),
    ("af_nicole", "en-US", "Female", "Nicole (EN-US Feminino)"),
    ("am_adam", "en-US", "Male", "Adam (EN-US Masculino)"),
    ("am_michael", "en-US", "Male", "Michael (EN-US Masculino)"),
    ("am_george", "en-US", "Male", "George (EN-US Masculino)"),
    ("bf_emma", "en-GB", "Female", "Emma (EN-GB Feminino)"),
    ("bf_alice", "en-GB", "Female", "Alice (EN-GB Feminino)"),
    ("bf_isabella", "en-GB", "Female", "Isabella (EN-GB Feminino)"),
    ("bm_george", "en-GB", "Male", "George (EN-GB Masculino)"),
    ("bm_lewis", "en-GB", "Male", "Lewis (EN-GB Masculino)"),
    ("pf_dora", "pt-BR", "Female", "Dora (PT-BR Feminino)"),
    ("pm_alex", "pt-BR", "Male", "Alex (PT-BR Masculino)"),
    ("pm_santa", "pt-BR", "Male", "Santa (PT-BR Masculino)"),
]


def get_all_kokoro_voices() -> list[str]:
    """
    Retorna a lista de vozes Kokoro disponíveis no formato de exibição.
    Formato: "voice_id - Nome (Idioma Gênero)"
    """
    return [
        f"{voice_id} - {display_name}"
        for voice_id, _, _, display_name in _KOKORO_VOICES
    ]


def parse_voice_name(name: str) -> str:
    # Extrai o voice_id do formato de exibição.
    # Aceita tanto o voice_id puro quanto o formato "voice_id - Nome..."
    name = name.strip()
    if " - " in name:
        return name.split(" - ")[0].strip()
    return name


def _get_lang_code(voice_name: str) -> str:
    # Infere o lang_code do Kokoro a partir do voice_id.
    # 'a' = inglês americano, 'b' = inglês britânico, 'p' = português
    if voice_name.startswith('p'):
        return 'p'  # português
    elif voice_name.startswith('b'):
        return 'b'  # inglês britânico
    else:
        return 'a'  # inglês americano (padrão)


def kokoro_tts(text: str, voice_name: str, voice_rate: float, voice_file: str) -> bool:
    """
    Gera áudio usando Kokoro TTS.

    Args:
        text: Texto para sintetizar
        voice_name: ID da voz Kokoro (ex: af_heart, bf_emma)
        voice_rate: Velocidade da fala (0.5 a 2.0)
        voice_file: Caminho do arquivo de saída

    Returns:
        True se o áudio foi gerado com sucesso, False caso contrário
    """
    # Validação: se voice_name está vazio, usar o padrão
    if not voice_name or voice_name.strip() == "":
        voice_name = "pf_dora"
        logger.info("voice_name vazio em kokoro_tts, usando padrão: pf_dora")

    try:
        from kokoro import KPipeline
    except ImportError:
        logger.error(
            "Kokoro TTS não está instalado. Instale com: pip install kokoro>=0.9.4 soundfile"
        )
        return False

    voice_name = parse_voice_name(voice_name)
    lang_code = _get_lang_code(voice_name)

    logger.info(f"iniciando Kokoro TTS, voz: {voice_name}, lang_code: {lang_code}, velocidade: {voice_rate}")

    try:
        pipeline = KPipeline(lang_code=lang_code)
        generator = pipeline(text, voice=voice_name, speed=voice_rate)

        audio_chunks = []
        for _, _, audio in generator:
            if audio is not None:
                audio_chunks.append(audio)

        if audio_chunks:
            full_audio = np.concatenate(audio_chunks)
            # Garante que o diretório de saída existe
            os.makedirs(os.path.dirname(voice_file) or ".", exist_ok=True)
            sf.write(voice_file, full_audio, 24000)
            logger.info(f"áudio gerado com sucesso: {voice_file}")
            return True
        else:
            logger.error("Kokoro TTS não produziu nenhum áudio")
            return False
    except Exception as e:
        logger.error(f"erro no Kokoro TTS: {str(e)}")
        return False


def tts(
    text: str,
    voice_name: str,
    voice_rate: float,
    voice_file: str,
    voice_volume: float = 1.0,
) -> Union[object, None]:
    """
    Função principal de TTS. Mantém a interface pública para compatibilidade com o pipeline.

    Args:
        text: Texto para sintetizar
        voice_name: ID da voz Kokoro
        voice_rate: Velocidade da fala
        voice_file: Caminho do arquivo de saída
        voice_volume: Volume da voz (atualmente não suportado pelo Kokoro, ignorado)

    Returns:
        Objeto compatível com SubMaker para geração de legendas, ou None em caso de erro
    """
    text = text.strip()
    if not text:
        logger.error("texto vazio, não é possível gerar áudio")
        return None

    voice_name = parse_voice_name(voice_name)

    # Garante que o diretório de saída existe
    ensure_file_path_exists(voice_file)

    success = kokoro_tts(text, voice_name, voice_rate, voice_file)

    if not success:
        return None

    # Retorna um objeto compatível com SubMaker para manter compatibilidade com o pipeline
    # Como Kokoro não fornece timestamps por palavra, criamos um SubMaker simulado
    # baseado na divisão do texto por pontuação
    sub_maker = _create_sub_maker_from_text(text, voice_file)
    return sub_maker


def _create_sub_maker_from_text(text: str, audio_file: str) -> object:
    """
    Cria um objeto compatível com SubMaker a partir do texto e arquivo de áudio.
    Usa a duração real do áudio e divide o texto proporcionalmente por pontuação.
    """
    try:
        audio_clip = AudioFileClip(audio_file)
        audio_duration = audio_clip.duration
        audio_clip.close()
    except Exception as e:
        logger.warning(f"não foi possível obter duração do áudio: {str(e)}")
        audio_duration = 0

    # Cria objeto compatível com SubMaker
    class CompatibleSubMaker:
        def __init__(self):
            self.subs = []
            self.offset = []

        def get_srt(self):
            if not self.subs or not self.offset:
                return ""
            lines = []
            for i, (sub, (start, end)) in enumerate(zip(self.subs, self.offset)):
                start_time = mktimestamp(start)
                end_time = mktimestamp(end)
                lines.append(f"{i + 1}")
                lines.append(f"{start_time} --> {end_time}")
                lines.append(sub)
                lines.append("")
            return "\n".join(lines)

    sub_maker = CompatibleSubMaker()

    # Divide o texto por pontuação e distribui proporcionalmente
    sentences = utils.split_string_by_punctuations(text)
    if not sentences:
        sentences = [text]

    audio_duration_100ns = max(int(audio_duration * 10000000), 1)
    total_chars = sum(len(s) for s in sentences)

    if total_chars <= 0:
        sub_maker.subs.append(text)
        sub_maker.offset.append((0, audio_duration_100ns))
        return sub_maker

    current_offset = 0
    for index, sentence in enumerate(sentences):
        cleaned_sentence = sentence.strip()
        if not cleaned_sentence:
            continue

        if index == len(sentences) - 1:
            sentence_end = audio_duration_100ns
        else:
            sentence_chars = len(cleaned_sentence)
            sentence_duration = max(
                int(audio_duration_100ns * (sentence_chars / total_chars)),
                1,
            )
            sentence_end = min(current_offset + sentence_duration, audio_duration_100ns)

        sub_maker.subs.append(cleaned_sentence)
        sub_maker.offset.append((current_offset, sentence_end))
        current_offset = sentence_end

    return sub_maker


def mktimestamp(time_unit: float) -> str:
    """
    Converte unidades de 100 nanossegundos em timestamp de legenda SRT.
    """
    hour = math.floor(time_unit / 10**7 / 3600)
    minute = math.floor((time_unit / 10**7 / 60) % 60)
    seconds = (time_unit / 10**7) % 60
    return f"{hour:02d}:{minute:02d}:{seconds:06.3f}".replace(".", ",")


def get_audio_duration(sub_maker) -> float:
    """
    Retorna a duração do áudio em segundos a partir do SubMaker.
    Compatível com o objeto retornado por tts().
    """
    try:
        if hasattr(sub_maker, 'offset') and sub_maker.offset:
            last_offset = sub_maker.offset[-1]
            if isinstance(last_offset, (tuple, list)) and len(last_offset) >= 2:
                # Converte de 100ns para segundos
                return last_offset[1] / 10000000.0
    except Exception as e:
        logger.warning(f"erro ao obter duração do áudio do sub_maker: {str(e)}")

    return 0


def create_subtitle(text: str, sub_maker, subtitle_file: str):
    """
    Cria arquivo de legenda a partir do SubMaker compatível.
    """
    try:
        srt_content = sub_maker.get_srt()
        if srt_content:
            with open(subtitle_file, "w", encoding="utf-8") as f:
                f.write(srt_content)
            logger.info(f"legenda criada: {subtitle_file}")
        else:
            logger.warning("conteúdo SRT vazio, legenda não foi criada")
    except Exception as e:
        logger.error(f"erro ao criar legenda: {str(e)}")


def ensure_file_path_exists(file_path: str) -> None:
    """
    Garante que o diretório do arquivo de saída existe.
    """
    dir_path = os.path.dirname(file_path)
    if dir_path:
        os.makedirs(dir_path, exist_ok=True)


if __name__ == "__main__":
    voices = get_all_kokoro_voices()
    print("Vozes Kokoro disponíveis:")
    for v in voices:
        print(f"  {v}")
