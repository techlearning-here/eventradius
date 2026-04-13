@echo off
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate
) else if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate
)
uv run python run-ci-tests.py
