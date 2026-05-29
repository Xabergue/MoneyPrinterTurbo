# MoneyPrinterTurbo v2.0 💸

**Gerador automático de vídeos curtos com IA**

Basta fornecer um tema ou palavra-chave, e o sistema gera automaticamente o roteiro, os materiais visuais, a narração, as legendas e a música de fundo — sintetizando tudo em um vídeo curto de alta definição.

> Fork reformado do [MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) com backend simplificado, TTS local (Kokoro), LLM via endpoint local e interface moderna em React/Next.js.

---

## O que mudou na v2.0

| Mudança | Antes | Agora |
|---------|-------|-------|
| **TTS** | edge-tts (instável, erro 403) | **Kokoro TTS** (local, estável) |
| **LLM** | 15+ provedores com SDKs proprietários | **OpenAI-compatível** com `base_url` configurável |
| **Frontend** | Streamlit (monolítico 48KB) | **React/Next.js** moderno e profissional |
| **Legendas** | edge (instável) + whisper | **faster-whisper** (modelo medium, 1.4GB) |
| **Vídeos** | Apenas Pexels/Pixabay | **Biblioteca local** + Pexels/Pixabay |
| **Config** | 12KB com provedores removidos | **Simplificada**, comentários em pt-BR |

---

## Funcionalidades

- ✅ Geração automática de roteiro via LLM (DeepSeek, GPT, etc.)
- ✅ Síntese de voz com Kokoro TTS (14 vozes, incluindo português)
- ✅ Legendas automáticas com faster-whisper
- ✅ Fontes de vídeo: biblioteca local, Pexels, Pixabay
- ✅ Proporções: 9:16 (vertical), 16:9 (horizontal), 1:1 (quadrado)
- ✅ Geração em lote (múltiplos vídeos por vez)
- ✅ Transições entre clipes (FadeIn, FadeOut, SlideIn, SlideOut)
- ✅ Música de fundo configurável
- ✅ Interface moderna dark theme em React/Next.js
- ✅ API REST completa com FastAPI
- ✅ Fallback automático: se vídeos locais forem insuficientes, usa Pexels

---

## Requisitos

| Item | Mínimo | Recomendado |
|------|--------|-------------|
| CPU | 4 núcleos | 8+ núcleos |
| RAM | 4 GB | 8 GB+ |
| GPU | Não obrigatório | 4 GB+ VRAM (para whisper GPU) |
| Python | 3.11+ | 3.11 |
| Node.js | 18+ | 20+ |
| FFmpeg | Obrigatório | Instalado via sistema |
| ImageMagick | Obrigatório | Instalado via sistema |

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Xabergue/MoneyPrinterTurbo.git
cd MoneyPrinterTurbo
```

### 2. Configure o ambiente Python

Recomendamos usar [uv](https://docs.astral.sh/uv/) para gerenciar o ambiente:

```bash
uv python install 3.11
uv sync --frozen
```

Ou com venv + pip tradicional:

```bash
python3.11 -m venv .venv
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 3. Instale o ImageMagick

**MacOS:**
```bash
brew install imagemagick
```

**Ubuntu/Debian:**
```bash
sudo apt-get install imagemagick
```

**Windows:**
Baixe de https://imagemagick.org/script/download.php — escolha a versão **static**.

### 4. Instale o FFmpeg

O FFmpeg geralmente é baixado automaticamente. Se necessário:
- Baixe de https://www.gyan.dev/ffmpeg/builds/
- Configure `ffmpeg_path` no `config.toml`

### 5. Configure o LLM local (DeepSProxy)

O projeto usa um endpoint LLM OpenAI-compatível rodando localmente. Recomendamos o **DeepSProxy** como proxy para a API DeepSeek:

1. Instale e configure o DeepSProxy rodando na porta 3000
2. O `config.toml` já vem configurado com `openai_base_url = "http://localhost:3000/v1"` e `openai_model_name = "deepseek-chat"`

Se usar outro provedor (Ollama, LM Studio, etc.), basta ajustar a `openai_base_url` no `config.toml`.

### 6. Configure o arquivo de configuração

```bash
cp config.example.toml config.toml
```

Edite o `config.toml` e configure:
- Chaves de API do Pexels/Pixabay (se for usar)
- URL do endpoint LLM (padrão: `http://localhost:3000/v1`)
- Modelo LLM (padrão: `deepseek-chat`)

### 7. Instale o Kokoro TTS

O Kokoro já está nas dependências (`pip install kokoro>=0.9.4`). Se necessário, instale manualmente:

```bash
pip install kokoro>=0.9.4 soundfile
```

### 8. Adicione vídeos à biblioteca local (opcional)

Coloque arquivos `.mp4`, `.mov`, `.avi` ou `.mkv` no diretório:

```
resource/videos/
```

Se não houver vídeos locais suficientes, o sistema usa Pexels como fallback automaticamente.

---

## Executando

### Backend (API FastAPI)

```bash
# Com uv
uv run python main.py

# Ou com venv ativado
python main.py
```

A API fica disponível em http://localhost:8080

Documentação interativa: http://localhost:8080/docs

### Frontend (Next.js)

```bash
# Com o script de inicialização
bash frontend.sh

# Ou manualmente
cd frontend
npm install
npm run dev
```

A interface fica disponível em http://localhost:3001

---

## Vozes Kokoro Disponíveis

| ID | Idioma | Gênero |
|----|--------|--------|
| af_heart | Inglês US | Feminino |
| af_bella | Inglês US | Feminino |
| af_sarah | Inglês US | Feminino |
| af_nicole | Inglês US | Feminino |
| am_adam | Inglês US | Masculino |
| am_michael | Inglês US | Masculino |
| am_george | Inglês US | Masculino |
| bf_emma | Inglês GB | Feminino |
| bf_alice | Inglês GB | Feminino |
| bf_isabella | Inglês GB | Feminino |
| bm_george | Inglês GB | Masculino |
| bm_lewis | Inglês GB | Masculino |
| pf_dora | Português BR | Feminino |
| pm_alex | Português BR | Masculino |

---

## API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/v1/videos` | Iniciar geração de vídeo |
| POST | `/api/v1/subtitle` | Gerar apenas legenda |
| POST | `/api/v1/audio` | Gerar apenas áudio |
| POST | `/api/v1/scripts` | Gerar roteiro via LLM |
| POST | `/api/v1/terms` | Gerar termos de busca |
| GET | `/api/v1/tasks/{task_id}` | Consultar status da tarefa |
| GET | `/api/v1/tasks` | Listar todas as tarefas |
| DELETE | `/api/v1/tasks/{task_id}` | Deletar tarefa |
| GET | `/api/v1/voices` | Listar vozes Kokoro |
| GET | `/api/v1/musics` | Listar músicas de fundo |
| GET | `/api/v1/stream/{path}` | Stream de vídeo |
| GET | `/api/v1/download/{path}` | Download de vídeo |

---

## Estrutura do Projeto

```
MoneyPrinterTurbo/
├── main.py                     # Entry point da API
├── config.example.toml         # Configuração modelo
├── pyproject.toml              # Dependências Python
├── requirements.txt            # Backup pip
├── app/                        # Backend FastAPI
│   ├── asgi.py                 # Configuração do app
│   ├── router.py               # Rotas API
│   ├── config/                 # Carregamento de config
│   ├── controllers/            # Endpoints
│   │   └── v1/                 # API v1 (video, llm, voices)
│   ├── models/                 # Schemas Pydantic
│   ├── services/               # Lógica de negócio
│   │   ├── llm.py             # Cliente OpenAI-compatível
│   │   ├── voice.py           # Kokoro TTS
│   │   ├── material.py        # Busca de vídeos (local/Pexels/Pixabay)
│   │   ├── subtitle.py        # faster-whisper
│   │   ├── video.py           # Montagem de vídeo (MoviePy + FFmpeg)
│   │   ├── task.py            # Pipeline de orquestração
│   │   └── state.py           # Gerenciamento de estado
│   └── utils/                  # Utilitários
├── frontend/                   # Interface React/Next.js
│   ├── src/app/                # Páginas (App Router)
│   ├── src/components/         # Componentes UI
│   └── src/lib/                # API client, hooks
├── resource/
│   ├── fonts/                  # Fontes para legendas
│   ├── songs/                  # Músicas de fundo
│   └── videos/                 # Biblioteca local de vídeos
└── test/                       # Testes unitários
```

---

## Deploy com Docker

```bash
docker-compose up
```

A API fica disponível em http://localhost:8080

---

## Perguntas Frequentes

### O Kokoro TTS não funciona

Verifique se as dependências estão instaladas:
```bash
pip install kokoro>=0.9.4 soundfile
```

### O modelo Whisper não carrega

O modelo `medium` (~1.4GB) é baixado automaticamente na primeira execução. Se a rede estiver instável, baixe manualmente e coloque em `models/whisper-medium/`.

### FFmpeg não encontrado

Configure o caminho no `config.toml`:
```toml
ffmpeg_path = "/caminho/para/ffmpeg"
```

### Erro "Too many open files"

Aumente o limite:
```bash
ulimit -n 10240
```

---

## Licença

MIT — veja o arquivo [LICENSE](LICENSE)
