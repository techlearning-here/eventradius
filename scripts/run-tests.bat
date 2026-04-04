@echo off
REM Comprehensive test runner for EventRadius (Windows)

echo 🚀 Running EventRadius Test Suite
echo ==================================

REM Backend Tests
echo 📋 Running Backend Tests with Coverage...
cd backend

REM Check if virtual environment exists
if not exist "..\venv" (
    echo Creating virtual environment...
    python -m venv ..\venv
)

..\venv\Scripts\python.exe -m pytest tests/ -v --tb=short --cov=.
if %errorlevel% neq 0 (
    echo ❌ Backend tests failed!
    exit /b 1
) else (
    echo ✅ Backend tests passed
)
REM Install test dependencies
echo Installing test dependencies...
pip install -r requirements-test.txt

REM Run backend tests
echo Running backend unit tests...
python -m pytest tests/ -v --tb=short

REM Frontend Tests
echo.
echo 📋 Running Frontend Tests...
cd ..\frontend

REM Install test dependencies if not already installed
if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
)

REM Install test dependencies
echo Installing test dependencies...
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest jest jest-environment-jsdom ts-jest

REM Run frontend tests
echo Running frontend unit tests...
npm test -- --watchAll=false --coverage

REM Integration Tests
echo.
echo 📋 Running Integration Tests...
cd ..\backend

REM Run integration tests
echo Running API integration tests...
python -m pytest tests/ -v -m integration

echo.
echo ✅ Test Suite Complete!
echo ======================
echo Backend coverage report: backend\htmlcov\index.html
echo Frontend coverage report: frontend\coverage\lcov-report\index.html

pause
