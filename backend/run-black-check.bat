@echo off
call venv\Scripts\activate
black --check --diff api/ config/ tests/
