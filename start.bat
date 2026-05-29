@echo off
title MPT — Iniciando...
chcp 65001 >nul
echo.
echo  Iniciando MoneyPrinterTurbo...
echo.
start "MPT Backend" cmd /k "backend.bat"
timeout /t 4 /nobreak >nul
start "MPT Frontend" cmd /k "frontend.bat"
echo.
echo  Backend:  http://localhost:8080
echo  Frontend: http://localhost:3001
echo  Docs API: http://localhost:8080/docs
echo.
pause
