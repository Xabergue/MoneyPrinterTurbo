# MoneyPrinterTurbo v2.0 💸

**AI-powered automatic short video generator**

Simply provide a topic or keyword, and the system automatically generates the script, visual materials, narration, subtitles, and background music — synthesizing everything into a high-definition short video.

> Reformed fork of [MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) with simplified backend, local TTS (Kokoro), LLM via local endpoint, and a modern React/Next.js interface.

---

## What Changed in v2.0

| Change | Before | Now |
|--------|--------|-----|
| **TTS** | edge-tts (unstable, 403 errors) | **Kokoro TTS** (local, stable) |
| **LLM** | 15+ providers with proprietary SDKs | **OpenAI-compatible** with configurable `base_url` |
| **Frontend** | Streamlit (monolithic 48KB) | **React/Next.js** modern and professional |
| **Subtitles** | edge (unstable) + whisper | **faster-whisper** (medium model, 1.4GB) |
| **Videos** | Only Pexels/Pixabay | **Local library** + Pexels/Pixabay |
| **Config** | 12KB with removed providers | **Simplified**, comments in English |

---

## Features

- ✅ Automatic script generation via LLM (DeepSeek, GPT, etc.)
- ✅ Voice synthesis with Kokoro TTS (14 voices, including Portuguese)
- ✅ Automatic subtitles with faster-whisper
- ✅ Video sources: local library, Pexels, Pixabay
- ✅ Aspect ratios: 9:16 (vertical), 16:9 (horizontal), 1:1 (square)
- ✅ Batch generation (multiple videos at once)
- ✅ Clip transitions (FadeIn, FadeOut, SlideIn, SlideOut)
- ✅ Configurable background music
- ✅ Modern dark theme interface in React/Next.js
- ✅ Complete REST API with FastAPI
- ✅ Automatic fallback: if local videos are insufficient, uses Pexels

---

## Requirements

| Item | Minimum | Recommended |
|------|---------|-------------|
| CPU | 4 cores | 8+ cores |
| RAM | 4 GB | 8 GB+ |
| GPU | Not required | 4 GB+ VRAM (for whisper GPU) |
| Python | 3.11+ | 3.11 or 3.12 |
| Node.js | 18+ | 20+ |
| FFmpeg | Required | Installed via system |
| ImageMagick | Required | Installed via system |

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Xabergue/MoneyPrinterTurbo.git
cd MoneyPrinterTurbo
```

### 2. Set up Python environment

> **⚠️ Compatibility notice:** Python 3.11 or 3.12 is recommended. Python 3.13 has limited Kokoro TTS support — use `conda create -n mpt python=3.11 -y` to avoid incompatibilities.

We recommend using [uv](https://docs.astral.sh/uv/):

```bash
uv python install 3.11
uv sync --frozen
```

Or with conda:

```bash
conda create -n mpt python=3.11 -y
conda activate mpt
pip install -r requirements.txt
```

Or with traditional venv + pip:

```bash
python3.11 -m venv .venv
source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 3. Install ImageMagick

**MacOS:**
```bash
brew install imagemagick
```

**Ubuntu/Debian:**
```bash
sudo apt-get install imagemagick
```

**Windows:**
Download from https://imagemagick.org/script/download.php — choose the **static** version.

### 4. Install FFmpeg

FFmpeg is usually downloaded automatically. If needed:
- Download from https://www.gyan.dev/ffmpeg/builds/
- Set `ffmpeg_path` in `config.toml`

### 5. Set up local LLM (DeepSProxy)

The project uses a local OpenAI-compatible LLM endpoint. We recommend **DeepSProxy** as a proxy for the DeepSeek API:

1. Install and configure DeepSProxy running on port 3000
2. The `config.toml` already comes configured with `openai_base_url = "http://localhost:3000/v1"` and `openai_model_name = "deepseek-chat"`

If using another provider (Ollama, LM Studio, etc.), just adjust `openai_base_url` in `config.toml`.

### 6. Configure settings

```bash
cp config.example.toml config.toml
```

Edit `config.toml` and configure:
- Pexels/Pixabay API keys (if using online sources)
- LLM endpoint URL (default: `http://localhost:3000/v1`)
- LLM model (default: `deepseek-chat`)

### 7. Install Kokoro TTS

Kokoro is already in the dependencies. The version installed depends on your Python:

- **Python 3.11/3.12:** `kokoro>=0.9.4,<1.0` (recommended)
- **Python 3.13:** `kokoro==0.7.16` (limited support)

If needed, install manually:

```bash
# Python 3.11 or 3.12 (recommended)
pip install "kokoro>=0.9.4,<1.0" soundfile

# Python 3.13
pip install kokoro==0.7.16 soundfile
```

### 8. Add videos to local library (optional)

Place `.mp4`, `.mov`, `.avi`, or `.mkv` files in the directory:

```
resource/videos/
```

If there aren't enough local videos, the system automatically falls back to Pexels.

---

## Running

### Backend (FastAPI API)

```bash
# With uv
uv run python main.py

# Or with activated venv
python main.py
```

API available at http://localhost:8080

Interactive docs: http://localhost:8080/docs

### Frontend (Next.js)

```bash
# With startup script
bash frontend.sh

# Or manually
cd frontend
npm install
npm run dev
```

Interface available at http://localhost:3001

---

## Available Kokoro Voices

| ID | Language | Gender |
|----|----------|--------|
| af_heart | English US | Female |
| af_bella | English US | Female |
| af_sarah | English US | Female |
| af_nicole | English US | Female |
| am_adam | English US | Male |
| am_michael | English US | Male |
| am_george | English US | Male |
| bf_emma | English GB | Female |
| bf_alice | English GB | Female |
| bf_isabella | English GB | Female |
| bm_george | English GB | Male |
| bm_lewis | English GB | Male |
| pf_dora | Portuguese BR | Female |
| pm_alex | Portuguese BR | Male |

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/v1/videos` | Start video generation |
| POST | `/api/v1/subtitle` | Generate subtitle only |
| POST | `/api/v1/audio` | Generate audio only |
| POST | `/api/v1/scripts` | Generate script via LLM |
| POST | `/api/v1/terms` | Generate search terms |
| GET | `/api/v1/tasks/{task_id}` | Query task status |
| GET | `/api/v1/tasks` | List all tasks |
| DELETE | `/api/v1/tasks/{task_id}` | Delete task |
| GET | `/api/v1/voices` | List Kokoro voices |
| GET | `/api/v1/musics` | List background music |
| GET | `/api/v1/stream/{path}` | Stream video |
| GET | `/api/v1/download/{path}` | Download video |

---

## Project Structure

```
MoneyPrinterTurbo/
├── main.py                     # API entry point
├── config.example.toml         # Configuration template
├── pyproject.toml              # Python dependencies
├── requirements.txt            # pip backup
├── app/                        # FastAPI Backend
│   ├── asgi.py                 # App configuration
│   ├── router.py               # API routes
│   ├── config/                 # Config loading
│   ├── controllers/            # Endpoints
│   │   └── v1/                 # API v1 (video, llm, voices)
│   ├── models/                 # Pydantic schemas
│   ├── services/               # Business logic
│   │   ├── llm.py             # OpenAI-compatible client
│   │   ├── voice.py           # Kokoro TTS
│   │   ├── material.py        # Video search (local/Pexels/Pixabay)
│   │   ├── subtitle.py        # faster-whisper
│   │   ├── video.py           # Video assembly (MoviePy + FFmpeg)
│   │   ├── task.py            # Orchestration pipeline
│   │   └── state.py           # State management
│   └── utils/                  # Utilities
├── frontend/                   # React/Next.js Interface
│   ├── src/app/                # Pages (App Router)
│   ├── src/components/         # UI Components
│   └── src/lib/                # API client, hooks
├── resource/
│   ├── fonts/                  # Subtitle fonts
│   ├── songs/                  # Background music
│   └── videos/                 # Local video library
└── test/                       # Unit tests
```

---

## Docker Deployment

```bash
docker-compose up
```

API available at http://localhost:8080

---

## FAQ

### Kokoro TTS doesn't work

Check dependencies (Kokoro version depends on your Python version):
```bash
# Python 3.11 or 3.12
pip install "kokoro>=0.9.4,<1.0" soundfile

# Python 3.13 (limited support)
pip install kokoro==0.7.16 soundfile
```

If issues persist on Python 3.13, we recommend using Python 3.11 or 3.12.

### Whisper model won't load

The `medium` model (~1.4GB) downloads automatically on first run. If network is unstable, download manually and place in `models/whisper-medium/`.

### FFmpeg not found

Set the path in `config.toml`:
```toml
ffmpeg_path = "/path/to/ffmpeg"
```

### "Too many open files" error

Increase the limit:
```bash
ulimit -n 10240
```

---

## License

MIT — see the [LICENSE](LICENSE) file
