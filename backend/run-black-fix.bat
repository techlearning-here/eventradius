@echo off
call venv\Scripts\activate
black api/ config/ tests/
echo Black formatting applied successfully!
