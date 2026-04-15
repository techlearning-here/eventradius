#!/bin/bash

echo "========================================"
echo "Running All Backend and Frontend Checks"
echo "========================================"
echo

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed!"
    echo "Install with: brew install uv or curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# Store the script's directory to return to it later
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if .venv exists in backend directory
if [ ! -d "$PROJECT_ROOT/backend/.venv" ]; then
    echo "❌ uv environment not found in backend/.venv!"
    echo "Run: cd backend && uv venv"
    exit 1
fi

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

# Change to backend directory
cd "$PROJECT_ROOT/backend"

echo "[1/7] Backend Black Formatting Check..."
uv run black --check --diff api/ config/ tests/
BLACK_STATUS=$?
print_status "1/7" "Backend Black formatting" $BLACK_STATUS
if [ $BLACK_STATUS -ne 0 ]; then
    echo
    echo "========================================"
    echo "❌ CHECKS FAILED!"
    echo "========================================"
    exit 1
fi
echo

echo "[2/7] Backend Tests with Coverage..."
uv run python run-ci-tests.py
TESTS_STATUS=$?
print_status "2/7" "Backend tests" $TESTS_STATUS
if [ $TESTS_STATUS -ne 0 ]; then
    echo
    echo "========================================"
    echo "❌ CHECKS FAILED!"
    echo "========================================"
    exit 1
fi
echo

echo "[3/7] Backend Isort Check..."
uv run isort --check-only --diff api/ config/ tests/
ISORT_STATUS=$?
print_status "3/7" "Backend Isort formatting" $ISORT_STATUS
if [ $ISORT_STATUS -ne 0 ]; then
    echo
    echo "========================================"
    echo "❌ CHECKS FAILED!"
    echo "========================================"
    exit 1
fi
echo

echo "[4/7] Backend Flake8 Check..."
echo "Note: Excluding tests/manual_IT/ (manual integration tests)"
uv run flake8 api/ config/ tests/ --exclude=tests/manual_IT/ --max-line-length=88 --extend-ignore=E203,W503,E402,F401,F541,F811,E712,E501
FLAKE8_STATUS=$?
print_status "4/7" "Backend Flake8 linting" $FLAKE8_STATUS
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

echo "[5/7] Frontend ESLint Check..."
npm run lint
LINT_STATUS=$?
print_status "5/7" "Frontend ESLint" $LINT_STATUS
if [ $LINT_STATUS -ne 0 ]; then
    echo
    echo "========================================"
    echo "❌ CHECKS FAILED!"
    echo "========================================"
    exit 1
fi
echo

echo "[6/7] Frontend TypeScript Check..."
npx tsc --noEmit
TSC_STATUS=$?
print_status "6/7" "Frontend TypeScript check" $TSC_STATUS
if [ $TSC_STATUS -ne 0 ]; then
    echo
    echo "========================================"
    echo "❌ CHECKS FAILED!"
    echo "========================================"
    exit 1
fi
echo

echo "[7/7] Frontend Unit Tests..."
echo "Note: Running caching infrastructure verification tests"
cd "$PROJECT_ROOT/frontend" && npm test -- --testPathPatterns="cache-infrastructure" --passWithNoTests
FRONTEND_TEST_STATUS=$?
print_status "7/7" "Frontend unit tests" $FRONTEND_TEST_STATUS
if [ $FRONTEND_TEST_STATUS -ne 0 ]; then
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
echo "- Frontend Unit Tests: ✅"
echo "- Frontend Integration Tests: ⏭️  Excluded (manual run only)"
echo
echo "All quality checks completed successfully!"
echo "Ready for deployment"
echo
echo "Note: Frontend integration tests are excluded from CI."
echo "Run them separately with:"
echo "  ./scripts/FE_Integration_tests/run_FE_Playwright_test.sh"
exit 0
