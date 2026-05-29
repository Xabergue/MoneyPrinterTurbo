@echo off
title MPT — Setup
chcp 65001 >nul
echo.
echo  ╔══════════════════════════════════════╗
echo  ║   MoneyPrinterTurbo — Setup          ║
echo  ╚══════════════════════════════════════╝
echo.

:: ── 1. Localizar conda ──────────────────────────────────────
set CONDA_PATH=
for %%P in (
    "%USERPROFILE%\miniconda3"
    "%USERPROFILE%\anaconda3"
    "%LOCALAPPDATA%\miniconda3"
    "%LOCALAPPDATA%\anaconda3"
    "C:\ProgramData\miniconda3"
    "C:\ProgramData\Anaconda3"
    "C:\miniconda3"
    "C:\anaconda3"
) do (
    if exist "%%~P\Scripts\activate.bat" (
        set CONDA_PATH=%%~P
        goto :found_conda
    )
)

:: conda não encontrado — instalar Miniconda automaticamente
echo  [!] Conda nao encontrado. Instalando Miniconda3...
echo.
powershell -Command "Invoke-WebRequest -Uri 'https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe' -OutFile '%TEMP%\miniconda_installer.exe'"
start /wait "" "%TEMP%\miniconda_installer.exe" /InstallationType=JustMe /RegisterPython=0 /S /D=%USERPROFILE%\miniconda3
set CONDA_PATH=%USERPROFILE%\miniconda3
echo  [✓] Miniconda instalado em %CONDA_PATH%
echo.

:found_conda
echo  [✓] Conda encontrado em: %CONDA_PATH%
call "%CONDA_PATH%\Scripts\activate.bat"

:: ── 2. Criar ambiente mpt se não existir ────────────────────
conda env list | findstr /C:"mpt" >nul 2>&1
if errorlevel 1 (
    echo  [!] Ambiente mpt nao encontrado. Criando com Python 3.11...
    call conda create -n mpt python=3.11 -y
    echo  [✓] Ambiente mpt criado.
) else (
    echo  [✓] Ambiente mpt ja existe.
)

:: ── 3. Ativar ambiente e instalar dependências ───────────────
call conda activate mpt
echo  [~] Instalando dependencias Python...
pip install -r requirements.txt
if errorlevel 1 (
    echo  [ERRO] Falha ao instalar dependencias. Verifique o requirements.txt.
    pause
    exit /b 1
)
echo  [✓] Dependencias Python instaladas.

:: ── 4. Instalar dependências do frontend ────────────────────
echo  [~] Instalando dependencias do frontend...
where node >nul 2>&1
if errorlevel 1 (
    echo  [!] Node.js nao encontrado. Instale em https://nodejs.org e rode este setup novamente.
    pause
    exit /b 1
)
cd frontend
call npm install
cd ..
echo  [✓] Dependencias do frontend instaladas.

:: ── 5. Criar .env se não existir ────────────────────────────
if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo  [✓] Arquivo .env criado a partir do .env.example
    echo  [!] Edite o .env e preencha suas chaves de API antes de iniciar.
) else (
    echo  [✓] Arquivo .env ja existe.
)

echo.
echo  ╔══════════════════════════════════════╗
echo  ║   Setup concluido!                   ║
echo  ║   Agora rode: start.bat              ║
echo  ╚══════════════════════════════════════╝
echo.
pause
