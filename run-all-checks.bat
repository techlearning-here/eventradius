@echo off
echo ========================================
echo Running All Backend and Frontend Checks
echo ========================================
echo.

echo [1/6] Backend Black Formatting Check...
cd backend
call run-black-check.bat
if %errorlevel% neq 0 (
    echo ❌ Backend Black formatting failed!
    exit /b 1
) else (
    echo ✅ Backend Black formatting passed
)
echo.

echo [2/6] Backend Tests with Coverage...
call run-tests.bat
if %errorlevel% neq 0 (
    echo ❌ Backend tests failed!
    exit /b 1
) else (
    echo ✅ Backend tests passed
)
echo.

echo [3/6] Backend Isort Check...
call run-isort-check.bat
if %errorlevel% neq 0 (
    echo ❌ Backend Isort formatting failed!
    exit /b 1
) else (
    echo ✅ Backend Isort formatting passed
)
echo.

echo [4/6] Backend Flake8 Check...
call run-flake8-check.bat
if %errorlevel% neq 0 (
    echo ❌ Backend Flake8 linting failed!
    exit /b 1
) else (
    echo ✅ Backend Flake8 linting passed
)
echo.

cd ..\frontend
echo [5/6] Frontend ESLint Check...
call run-lint.bat
if %errorlevel% neq 0 (
    echo ❌ Frontend ESLint failed!
    exit /b 1
) else (
    echo ✅ Frontend ESLint passed
)
echo.

echo [6/6] Frontend TypeScript Check...
call run-typescript-check.bat
if %errorlevel% neq 0 (
    echo ❌ Frontend TypeScript check failed!
    exit /b 1
) else (
    echo ✅ Frontend TypeScript check passed
)
echo.

echo ========================================
echo ✅ ALL CHECKS PASSED!
echo ========================================
echo.
echo Summary:
echo - Backend Black formatting: ✅
echo - Backend tests: ✅
echo - Backend Isort: ✅
echo - Backend Flake8: ✅
echo - Frontend ESLint: ✅
echo - Frontend TypeScript: ✅
echo.
echo All quality checks completed successfully!
exit /b 0
