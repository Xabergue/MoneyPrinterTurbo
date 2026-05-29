@echo off
title MPT — Iniciando...
echo.
echo  MoneyPrinterTurbo — Iniciando tudo...
echo.
start "MPT Backend" cmd /k "conda activate mpt && python main.py"
timeout /t 3 /nobreak >nul
start "MPT Frontend" cmd /k "cd frontend && npm run dev"
echo.
echo  Backend:  http://localhost:8080
echo  Frontend: http://localhost:3001
echo  Docs API: http://localhost:8080/docs
echo.
pause
