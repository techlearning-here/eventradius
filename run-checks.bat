@echo off
echo ========================================
echo EventRadius - Pre-commit Checks
echo ========================================
echo.

REM Check if pre-commit is installed
where pre-commit >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Pre-commit not found. Installing...
    pip install pre-commit
    if %ERRORLEVEL% NEQ 0 (
        echo Failed to install pre-commit. Please install manually:
        echo pip install pre-commit
        pause
        exit /b 1
    )
    echo Pre-commit installed successfully!
    echo.
)

REM Check if we're in a git repository
if not exist ".git" (
    echo Error: Not in a git repository. Please run from project root.
    pause
    exit /b 1
)

echo Running all pre-commit checks...
echo ========================================
echo.

REM Run all pre-commit hooks
pre-commit run --all-files

REM Check results
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS: All checks passed!
    echo ========================================
    echo Your code is ready to commit.
) else (
    echo.
    echo ========================================
    echo FAILED: Some checks need attention
    echo ========================================
    echo.
    echo Common fixes:
    echo   - Backend: Run 'black .' to fix formatting
    echo   - Frontend: Run 'npm run lint' to fix ESLint issues
    echo   - Secrets: Remove any hardcoded API keys
    echo.
    echo To run individual checks:
    echo   pre-commit run black          (Python formatting)
    echo   pre-commit run eslint         (TypeScript/JS linting)
    echo   pre-commit run detect-secrets (Security scan)
    echo   pre-commit run gitleaks       (Git security)
    echo.
    echo For detailed troubleshooting, see README.md
)

echo.
pause
