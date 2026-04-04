@echo off
echo Running Black Formatting Check...
cd backend
..\venv\Scripts\python.exe -m black --check --diff .
if %errorlevel% neq 0 (
    echo ❌ Backend Black formatting failed!
    exit /b 1
) else (
    echo ✅ Backend Black formatting passed
)
exit /b 0
