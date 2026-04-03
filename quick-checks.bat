@echo off
echo ========================================
echo EventRadius - Quick Individual Checks
echo ========================================
echo.

:menu
echo Choose a check to run:
echo 1. Black (Python formatting)
echo 2. ESLint (TypeScript/JavaScript)
echo 3. Detect-secrets (Security)
echo 4. Gitleaks (Git security)
echo 5. Trailing whitespace
echo 6. End-of-file-fixer
echo 7. Run all checks
echo 8. Exit
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto black
if "%choice%"=="2" goto eslint
if "%choice%"=="3" goto detect-secrets
if "%choice%"=="4" goto gitleaks
if "%choice%"=="5" goto whitespace
if "%choice%"=="6" goto eof-fixer
if "%choice%"=="7" goto all
if "%choice%"=="8" goto exit
echo Invalid choice. Please try again.
goto menu

:black
echo.
echo Running Black (Python formatting)...
pre-commit run black
goto end

:eslint
echo.
echo Running ESLint (TypeScript/JavaScript)...
pre-commit run eslint
goto end

:detect-secrets
echo.
echo Running Detect-secrets (Security scan)...
pre-commit run detect-secrets
goto end

:gitleaks
echo.
echo Running Gitleaks (Git security)...
pre-commit run gitleaks
goto end

:whitespace
echo.
echo Running Trailing whitespace check...
pre-commit run trailing-whitespace
goto end

:eof-fixer
echo.
echo Running End-of-file-fixer...
pre-commit run end-of-file-fixer
goto end

:all
echo.
echo Running all checks...
pre-commit run --all-files
goto end

:end
echo.
pause
goto menu

:exit
echo Goodbye!
exit /b 0
