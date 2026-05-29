@echo off
title MPT — Backend
echo.
echo  MoneyPrinterTurbo — Backend
echo  API disponivel em: http://localhost:8080
echo  Documentacao:      http://localhost:8080/docs
echo.
call conda activate mpt
python main.py
pause
