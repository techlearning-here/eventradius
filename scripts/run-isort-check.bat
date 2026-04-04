@echo off
echo Running Backend Isort Check...
cd backend
call isort --check-only .
if %errorlevel% neq 0 (
    echo ❌ Backend Isort formatting failed!
    exit /b 1
) else (
    echo ✅ Backend Isort formatting passed
)
exit /b 0
