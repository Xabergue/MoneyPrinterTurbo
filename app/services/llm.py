import json
import logging
import re
from typing import List

from loguru import logger
from openai import OpenAI
from openai.types.chat import ChatCompletion

from app.config import config

_max_retries = 5


def _normalize_text_response(content, llm_provider: str) -> str:
    # Normaliza a resposta de texto do LLM. Diferentes SDKs podem retornar
    # None, string vazia ou objetos não-textuais em cenários de erro.
    if content is None:
        raise ValueError(f"[{llm_provider}] retornou conteúdo de texto vazio")

    if not isinstance(content, str):
        raise TypeError(
            f"[{llm_provider}] retornou conteúdo não-textual: {type(content).__name__}"
        )

    content = content.strip()
    if not content:
        raise ValueError(f"[{llm_provider}] retornou conteúdo de texto vazio")

    return content.replace("\n", "")


def _extract_chat_completion_text(response, llm_provider: str) -> str:
    # Extrai o texto de uma resposta ChatCompletion no formato OpenAI.
    # Valida a estrutura para evitar erros de atributo em respostas malformadas.
    choices = getattr(response, "choices", None)
    if not choices:
        raise ValueError(f"[{llm_provider}] retornou choices vazio")

    first_choice = choices[0]
    message = getattr(first_choice, "message", None)
    if message is None:
        raise ValueError(f"[{llm_provider}] retornou message vazio")

    content = getattr(message, "content", None)
    return _normalize_text_response(content, llm_provider)


def _generate_response(prompt: str) -> str:
    try:
        llm_provider = "openai"
        logger.info(f"provedor LLM: {llm_provider}")

        # Usa o cliente OpenAI com base_url configurável para compatibilidade
        # com qualquer endpoint que siga a API OpenAI (DeepSProxy, Ollama, etc.)
        api_key = config.openai_api_key
        model_name = config.openai_model_name
        base_url = config.openai_base_url

        if not api_key:
            api_key = "local"

        logger.info(f"conectando ao LLM em: {base_url}, modelo: {model_name}")

        client = OpenAI(
            api_key=api_key,
            base_url=base_url,
        )

        response = client.chat.completions.create(
            model=model_name, messages=[{"role": "user", "content": prompt}]
        )

        if response:
            if isinstance(response, ChatCompletion):
                return _extract_chat_completion_text(response, llm_provider)
            else:
                raise Exception(
                    f'[{llm_provider}] retornou uma resposta inválida: "{response}", '
                    f"verifique sua conexão de rede e tente novamente."
                )
        else:
            raise Exception(
                f"[{llm_provider}] retornou uma resposta vazia, verifique sua conexão de rede e tente novamente."
            )
    except Exception as e:
        return f"Error: {str(e)}"


def generate_script(
    video_subject: str, language: str = "", paragraph_number: int = 1
) -> str:
    prompt = f"""
# Role: Video Script Generator

## Goals:
Generate a script for a video, depending on the subject of the video.

## Constrains:
1. the script is to be returned as a string with the specified number of paragraphs.
2. do not under any circumstance reference this prompt in your response.
3. get straight to the point, don't start with unnecessary things like, "welcome to this video".
4. you must not include any type of markdown or formatting in the script, never use a title.
5. only return the raw content of the script.
6. do not include "voiceover", "narrator" or similar indicators of what should be spoken at the beginning of each paragraph or line.
7. you must not mention the prompt, or anything about the script itself. also, never talk about the amount of paragraphs or lines. just write the script.
8. respond in the same language as the video subject.

# Initialization:
- video subject: {video_subject}
- number of paragraphs: {paragraph_number}
""".strip()
    if language:
        prompt += f"\n- language: {language}"

    final_script = ""
    logger.info(f"tema: {video_subject}")

    def format_response(response):
        # Limpa o roteiro removendo asteriscos e hashes
        response = response.replace("*", "")
        response = response.replace("#", "")

        # Remove sintaxe markdown
        response = re.sub(r"\[.*\]", "", response)
        response = re.sub(r"\(.*\)", "", response)

        # Divide o roteiro em parágrafos
        paragraphs = response.split("\n\n")

        return "\n\n".join(paragraphs)

    for i in range(_max_retries):
        try:
            response = _generate_response(prompt=prompt)
            if response:
                final_script = format_response(response)
            else:
                logging.error("LLM retornou uma resposta vazia")

            if final_script:
                break
        except Exception as e:
            logger.error(f"falha ao gerar roteiro: {e}")

        if i < _max_retries:
            logger.warning(f"falha ao gerar roteiro do vídeo, tentando novamente... {i + 1}")

    if "Error: " in final_script:
        logger.error(f"falha ao gerar roteiro do vídeo: {final_script}")
    else:
        logger.success(f"concluído: \n{final_script}")
    return final_script.strip()


def generate_terms(video_subject: str, video_script: str, amount: int = 5) -> List[str]:
    prompt = f"""
# Role: Video Search Terms Generator

## Goals:
Generate {amount} search terms for stock videos, depending on the subject of a video.

## Constrains:
1. the search terms are to be returned as a json-array of strings.
2. each search term should consist of 1-3 words, always add the main subject of the video.
3. you must only return the json-array of strings. you must not return anything else. you must not return the script.
4. the search terms must be related to the subject of the video.
5. reply with english search terms only.

## Output Example:
["search term 1", "search term 2", "search term 3","search term 4","search term 5"]

## Context:
### Video Subject
{video_subject}

### Video Script
{video_script}

Please note that you must use English for generating video search terms; Chinese is not accepted.
""".strip()

    logger.info(f"tema: {video_subject}")

    search_terms = []
    response = ""
    for i in range(_max_retries):
        try:
            response = _generate_response(prompt)
            if "Error: " in response:
                logger.error(f"falha ao gerar termos de busca: {response}")
                return response
            search_terms = json.loads(response)
            if not isinstance(search_terms, list) or not all(
                isinstance(term, str) for term in search_terms
            ):
                logger.error("resposta não é uma lista de strings.")
                continue

        except Exception as e:
            logger.warning(f"falha ao gerar termos de busca: {str(e)}")
            if response:
                match = re.search(r"\[.*]", response)
                if match:
                    try:
                        search_terms = json.loads(match.group())
                    except Exception as e:
                        logger.warning(f"falha ao analisar termos de busca: {str(e)}")

        if search_terms and len(search_terms) > 0:
            break
        if i < _max_retries:
            logger.warning(f"falha ao gerar termos de busca, tentando novamente... {i + 1}")

    logger.success(f"concluído: \n{search_terms}")
    return search_terms


if __name__ == "__main__":
    video_subject = "O significado da vida"
    script = generate_script(
        video_subject=video_subject, language="pt-BR", paragraph_number=1
    )
    print("######################")
    print(script)
    search_terms = generate_terms(
        video_subject=video_subject, video_script=script, amount=5
    )
    print("######################")
    print(search_terms)
