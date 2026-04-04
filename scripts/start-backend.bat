@echo off
echo Starting backend server...
cd /d "%~dp0..\backend"

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
) else (
    echo Virtual environment already exists
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Starting server...
python main.py
