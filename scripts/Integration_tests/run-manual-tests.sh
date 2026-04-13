#!/bin/bash
# Integration Test Runner
# Runs manual integration tests that require backend server and real database

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Manual Integration Test Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if backend is running
echo -e "${YELLOW}🔍 Checking if backend is running...${NC}"
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Backend is not running on http://localhost:8000${NC}"
    echo ""
    echo "Please start the backend first:"
    echo "  ./scripts/start-backend.sh"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Backend is running${NC}"
echo ""

# Check for TEST_AUTH_TOKEN in .env
echo -e "${YELLOW}🔍 Checking for TEST_AUTH_TOKEN...${NC}"
if [ -f "backend/.env" ]; then
    if grep -q "TEST_AUTH_TOKEN=your_jwt_token_here" backend/.env || ! grep -q "TEST_AUTH_TOKEN=" backend/.env; then
        echo -e "${RED}❌ TEST_AUTH_TOKEN not set in backend/.env${NC}"
        echo ""
        echo "Please add your JWT token to backend/.env:"
        echo "  TEST_AUTH_TOKEN=eyJhbGciOiJIUzI1NiIs..."
        echo ""
        echo "To get your token:"
        echo "  1. Login at http://localhost:5173"
        echo "  2. Open DevTools → Application → Local Storage"
        echo "  3. Copy the access_token value"
        echo ""
        exit 1
    fi
    echo -e "${GREEN}✅ TEST_AUTH_TOKEN found${NC}"
else
    echo -e "${RED}❌ backend/.env file not found${NC}"
    exit 1
fi
echo ""

# Change to backend directory
cd backend

# Run the tests
echo -e "${YELLOW}🚀 Running manual integration tests...${NC}"
echo ""

# Run specific test files
echo -e "${BLUE}Running: test_real_db_roundtrip.py${NC}"
uv run python -m pytest tests/manual_IT/test_real_db_roundtrip.py -v --tb=short || true

echo ""
echo -e "${BLUE}Running: test_event_wizard_roundtrip.py${NC}"
uv run python -m pytest tests/manual_IT/test_event_wizard_roundtrip.py -v --tb=short || true

echo ""
echo -e "${BLUE}Running: test_api.py${NC}"
uv run python -m pytest tests/manual_IT/test_api.py -v --tb=short || true

echo ""
echo -e "${BLUE}Running: test_user_journey.py${NC}"
uv run python -m pytest tests/manual_IT/test_user_journey.py -v --tb=short || true

echo ""
echo -e "${BLUE}Running: test_organizer_onboarding.py${NC}"
uv run python -m pytest tests/manual_IT/test_organizer_onboarding.py -v --tb=short || true

echo ""
echo -e "${BLUE}Running: test_soft_delete_restore.py${NC}"
uv run python -m pytest tests/manual_IT/test_soft_delete_restore.py -v --tb=short || true

echo ""
echo -e "${BLUE}Running: Frontend Integration Tests${NC}"
echo -e "${YELLOW}Note: Frontend must be running on localhost:5173${NC}"
cd ../frontend
npm run test:integration || true
cd ../backend

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  All integration tests completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "  ✅ Backend integration tests: tests/manual_IT/"
echo "  ✅ Frontend integration tests: frontend/src/__tests__/integration/"
echo ""
echo -e "${YELLOW}All tests require:${NC}"
echo "  - Backend running on localhost:8000"
echo "  - Frontend running on localhost:5173 (for frontend tests)"
echo "  - Valid JWT token in backend/.env (TEST_AUTH_TOKEN)"
