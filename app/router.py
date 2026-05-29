"""Configuração da aplicação — APIRouter raiz.

Define todos os endpoints da aplicação FastAPI.
"""

from fastapi import APIRouter

from app.controllers.v1 import llm, video, voices

root_api_router = APIRouter()
# v1
root_api_router.include_router(video.router)
root_api_router.include_router(llm.router)
root_api_router.include_router(voices.router)
