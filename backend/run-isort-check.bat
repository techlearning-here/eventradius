@echo off
call venv\Scripts\activate
isort --check-only --diff api/ config/ tests/
