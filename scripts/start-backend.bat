@echo off
echo Starting backend server with uv...
cd /d "%~dp0..\backend"

:: Check if uv is installed
where uv >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ uv is not installed!
    echo Install with: powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
    exit /b 1
)

:: Check if .venv exists, create if not
if not exist .venv (
    echo Creating uv virtual environment...
    uv venv
) else (
    echo uv virtual environment already exists
)

echo Starting server...
uv run python main.py
