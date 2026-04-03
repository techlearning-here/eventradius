@echo off
call venv\Scripts\activate
flake8 api/ config/ tests/ --max-line-length=88 --extend-ignore=E203,W503
