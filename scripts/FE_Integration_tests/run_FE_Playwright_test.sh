#!/bin/bash
# Frontend Playwright E2E Test Runner
# Runs Playwright browser-based integration tests ONLY
# 
# Usage: ./scripts/FE_Integration_tests/run_FE_Playwright_test.sh [options]
# Options:
#   --headed     Run with visible browser
#   --ui         Run with interactive UI mode
#   --debug      Run in debug mode
#   --wizard     Run only Event Wizard tests
#   --details    Run only Event Details tests

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Frontend Playwright E2E Test Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Parse arguments
HEADED_MODE=false
UI_MODE=false
DEBUG_MODE=false
TEST_PATTERN=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --headed)
      HEADED_MODE=true
      shift
      ;;
    --ui)
      UI_MODE=true
      shift
      ;;
    --debug)
      DEBUG_MODE=true
      shift
      ;;
    --wizard)
      TEST_PATTERN="event-wizard.spec.ts"
      shift
      ;;
    --details)
      TEST_PATTERN="event-details.spec.ts"
      shift
      ;;
    --help)
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --headed     Run with visible browser window"
      echo "  --ui         Run with interactive UI mode (for debugging)"
      echo "  --debug      Run in debug mode (step through each action)"
      echo "  --wizard     Run only Event Wizard tests"
      echo "  --details    Run only Event Details tests"
      echo "  --help       Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                    # Run all tests headless"
      echo "  $0 --headed           # Run with visible browser"
      echo "  $0 --ui               # Run with interactive UI"
      echo "  $0 --wizard           # Run only Event Wizard tests"
      echo "  $0 --headed --details # Run Event Details with visible browser"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Check prerequisites
echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "frontend/package.json" ]; then
    echo -e "${YELLOW}📂 Changing to frontend directory...${NC}"
    cd frontend 2>/dev/null || { echo -e "${RED}❌ Could not find frontend directory${NC}"; exit 1; }
fi

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Please run from project root or frontend directory.${NC}"
    exit 1
fi

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

# Check if frontend dev server is running
echo -e "${YELLOW}🔍 Checking if frontend dev server is running...${NC}"
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${RED}❌ Frontend dev server is not running on http://localhost:5173${NC}"
    echo ""
    echo "Please start the frontend dev server:"
    echo "  cd frontend && npm run dev"
    echo ""
    exit 1
fi
echo -e "${GREEN}✅ Frontend dev server is running${NC}"
echo ""

# Check for Playwright installation
echo -e "${YELLOW}🔍 Checking for Playwright...${NC}"
if ! npx playwright --version > /dev/null 2>&1; then
    echo -e "${RED}❌ Playwright not found${NC}"
    echo "Installing Playwright..."
    npm install -D @playwright/test
    npx playwright install
fi
echo -e "${GREEN}✅ Playwright is installed${NC}"
echo ""

# Build the test command
TEST_CMD="npx playwright test --config playwright.integration.config.ts"

if [ -n "$TEST_PATTERN" ]; then
    TEST_CMD="$TEST_CMD $TEST_PATTERN"
    echo -e "${BLUE}🎯 Running specific test: ${TEST_PATTERN}${NC}"
fi

if [ "$HEADED_MODE" = true ]; then
    TEST_CMD="$TEST_CMD --headed"
    echo -e "${BLUE}🖥️  Running with visible browser${NC}"
fi

if [ "$UI_MODE" = true ]; then
    TEST_CMD="$TEST_CMD --ui"
    echo -e "${BLUE}🎮 Running with interactive UI mode${NC}"
fi

if [ "$DEBUG_MODE" = true ]; then
    TEST_CMD="$TEST_CMD --debug"
    echo -e "${BLUE}🐛 Running in debug mode${NC}"
fi

echo ""
echo -e "${YELLOW}🚀 Starting Playwright tests...${NC}"
echo -e "${YELLOW}⚠️  Note: You may need to login manually when prompted${NC}"
echo ""

# Run the tests
eval $TEST_CMD || {
    echo ""
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "  - Check if frontend UI is accessible at http://localhost:5173"
    echo "  - Verify you can login through the browser"
    echo "  - Run with --ui flag for interactive debugging:"
    echo "    $0 --ui"
    echo ""
    exit 1
}

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Playwright tests completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  - View report: npx playwright show-report"
echo "  - Run with UI mode: $0 --ui"
echo "  - Run specific test: $0 --wizard or $0 --details"
echo ""
