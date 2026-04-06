# macOS Scripts

This directory contains macOS shell script equivalents of the Windows batch files in the parent directory.

## Available Scripts

### Main Script
- `run-all-checks.sh` - Runs all backend and frontend quality checks

### Backend Scripts (run from backend directory)
- `run-black-check.sh` - Checks Python code formatting with Black
- `run-tests.sh` - Runs backend tests with coverage
- `run-isort-check.sh` - Checks import sorting with isort
- `run-flake8-check.sh` - Runs Flake8 linting

### Frontend Scripts (run from frontend directory)
- `run-lint.sh` - Runs ESLint on frontend code
- `run-typescript-check.sh` - Runs TypeScript type checking

## Usage

### Run all checks from project root:
```bash
./scripts/macos/run-all-checks.sh
```

### Run individual checks:
```bash
# Backend checks (from backend directory)
cd backend
../../scripts/macos/run-black-check.sh
../../scripts/macos/run-tests.sh
../../scripts/macos/run-isort-check.sh
../../scripts/macos/run-flake8-check.sh

# Frontend checks (from frontend directory)
cd frontend
../../scripts/macos/run-lint.sh
../../scripts/macos/run-typescript-check.sh
```

## Prerequisites

1. Python virtual environment activated (`backend/venv`)
2. Node.js dependencies installed (`frontend/node_modules`)
3. All required Python packages installed (black, isort, flake8, pytest)
4. All required Node.js packages installed (eslint, typescript)

## Notes

- These scripts are equivalent to the Windows `.bat` files but use bash syntax
- All scripts are executable (`chmod +x`)
- The main script will exit early if any check fails
- Scripts assume they're run from the project root directory
