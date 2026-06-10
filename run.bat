@echo off
title TOS Analyzer Launcher
echo =========================================
echo       AI TOS Analyzer Launcher
echo =========================================
echo.

where python >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python was not found on your system PATH.
    echo Please install Python 3.10+ and check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

if not exist ".venv" (
    echo [INFO] Virtual environment .venv not found. Creating it now...
    python -m venv .venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo [SUCCESS] Virtual environment created.
    echo.
)

echo [INFO] Activating virtual environment and verifying dependencies...
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies verified.
echo.

echo [INFO] Starting FastAPI Backend on http://127.0.0.1:8000...
start "TOS Analyzer Backend" cmd /c "call .venv\Scripts\activate.bat && uvicorn tos_checker:app --host 127.0.0.1 --port 8000"

echo [INFO] Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul

echo [INFO] Opening TOS Analyzer in your browser...
start http://127.0.0.1:5500/index.html
echo [INFO] Starting Frontend HTTP Server on http://127.0.0.1:5500...
echo [INFO] Press Ctrl+C in this terminal to stop the frontend server.
python -m http.server 5500
