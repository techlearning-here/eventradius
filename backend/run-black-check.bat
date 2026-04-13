@echo off
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate
) else if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate
)
uv run black --check --diff api/ config/ tests/
