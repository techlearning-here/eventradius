@echo off
call venv\Scripts\activate
python -m pytest tests/ -v --cov=api --cov=config --cov-report=xml --cov-report=html
