@echo off
title MPT — Backend
chcp 65001 >nul

:: Localizar conda
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
        goto :found
    )
)
echo  [ERRO] Conda nao encontrado. Execute setup.bat primeiro.
pause
exit /b 1

:found
call "%CONDA_PATH%\Scripts\activate.bat"
call conda activate mpt

echo.
echo  MoneyPrinterTurbo — Backend
echo  API:  http://localhost:8080
echo  Docs: http://localhost:8080/docs
echo.
python main.py
pause
