@echo off
echo Running Backend Flake8 Check...
cd backend
call flake8 --format=check .
if %errorlevel% neq 0 (
    echo ❌ Backend Flake8 linting failed!
    exit /b 1
) else (
    echo ✅ Backend Flake8 linting passed
)
exit /b 0
