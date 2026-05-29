from fastapi import Request

from app.controllers.v1.base import new_router
from app.services import voice
from app.utils import utils

router = new_router()


@router.get(
    "/voices",
    summary="Lista vozes TTS disponíveis (Kokoro)",
)
def get_voices(request: Request):
    voices = voice.get_all_kokoro_voices()
    response = {"voices": voices}
    return utils.get_response(200, response)
