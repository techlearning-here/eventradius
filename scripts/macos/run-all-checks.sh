#!/bin/bash

echo "========================================"
echo "Running All Backend and Frontend Checks"
echo "========================================"
echo

# Function to print status
print_status() {
    local step=$1
    local description=$2
    local status=$3
    
    if [ $status -eq 0 ]; then
        echo "✅ $description passed"
    else
        echo "❌ $description failed!"
        return 1
    fi
}

# Store the script's directory to return to it later
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Change to backend directory
cd "$PROJECT_ROOT/backend"

echo "[1/6] Backend Black Formatting Check..."
source venv/bin/activate
black --check --diff api/ config/ tests/
BLACK_STATUS=$?
print_status "1/6" "Backend Black formatting" $BLACK_STATUS
if [ $BLACK_STATUS -ne 0 ]; then
    echo
    echo "========================================"
    echo "❌ CHECKS FAILED!"
    echo "========================================"
    exit 1
fi
echo

echo "[2/6] Backend Tests with Coverage..."
source venv/bin/activate
python run-ci-tests.py
TESTS_STATUS=$?
print_status "2/6" "Backend tests" $TESTS_STATUS
if [ $TESTS_STATUS -ne 0 ]; then
    echo
    echo "========================================"
    echo "❌ CHECKS FAILED!"
    echo "========================================"
    exit 1
fi
echo

echo "[3/6] Backend Isort Check..."
source venv/bin/activate
isort --check-only --diff api/ config/ tests/
ISORT_STATUS=$?
print_status "3/6" "Backend Isort formatting" $ISORT_STATUS
if [ $ISORT_STATUS -ne 0 ]; then
    echo
    echo "========================================"
    echo "❌ CHECKS FAILED!"
    echo "========================================"
    exit 1
fi
echo

echo "[4/6] Backend Flake8 Check..."
source venv/bin/activate
flake8 api/ config/ tests/ --max-line-length=88 --extend-ignore=E203,W503,E402,F401,F541,F811,E712,E501
FLAKE8_STATUS=$?
print_status "4/6" "Backend Flake8 linting" $FLAKE8_STATUS
if [ $FLAKE8_STATUS -ne 0 ]; then
    echo
    echo "========================================"
    echo "❌ CHECKS FAILED!"
    echo "========================================"
    exit 1
fi
echo

# Change to frontend directory
cd "$PROJECT_ROOT/frontend"

echo "[5/6] Frontend ESLint Check..."
npm run lint
LINT_STATUS=$?
print_status "5/6" "Frontend ESLint" $LINT_STATUS
if [ $LINT_STATUS -ne 0 ]; then
    echo
    echo "========================================"
    echo "❌ CHECKS FAILED!"
    echo "========================================"
    exit 1
fi
echo

echo "[6/6] Frontend TypeScript Check..."
npx tsc --noEmit
TSC_STATUS=$?
print_status "6/6" "Frontend TypeScript check" $TSC_STATUS
if [ $TSC_STATUS -ne 0 ]; then
    echo
    echo "========================================"
    echo "❌ CHECKS FAILED!"
    echo "========================================"
    exit 1
fi
echo

echo "========================================"
echo "✅ ALL CHECKS PASSED!"
echo "========================================"
echo
echo "Summary:"
echo "- Backend Black formatting: ✅"
echo "- Backend tests: ✅"
echo "- Backend Isort: ✅"
echo "- Backend Flake8: ✅"
echo "- Frontend ESLint: ✅"
echo "- Frontend TypeScript: ✅"
echo
echo "All quality checks completed successfully!"
echo "Ready for deployment"
exit 0
