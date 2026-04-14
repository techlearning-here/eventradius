@echo off
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate
) else if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate
)
uv run flake8 api/ config/ tests/ --max-line-length=88 --extend-ignore=E203,W503,E402,F401,F541,F811,E712,E501
