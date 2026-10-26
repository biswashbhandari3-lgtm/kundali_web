@echo off
title SkyVision Vedic Astrology Engine API Server
color 0A
echo ========================================================
echo        SkyVision Vedic Astrology Engine API Server
echo        (Surya Siddhanta & Drik Siddhanta)
echo ========================================================
cd /d "%~dp0"
echo Starting SkyVision API server at http://127.0.0.1:8000 ...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    node server.js
    pause
    exit /b 0
)
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
    uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
) else (
    echo Error: Node.js or Python virtual environment not found!
)
pause
