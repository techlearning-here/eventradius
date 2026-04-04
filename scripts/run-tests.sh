#!/bin/bash

# Comprehensive test runner for EventRadius

echo "🚀 Running EventRadius Test Suite"
echo "=================================="

# Backend Tests
echo "📋 Running Backend Tests..."
cd ../backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

# Install test dependencies
echo "Installing test dependencies..."
pip install -r requirements-test.txt

# Run backend tests
echo "Running backend unit tests..."
python -m pytest tests/ -v --tb=short

# Frontend Tests
echo ""
echo "📋 Running Frontend Tests..."
cd ../../frontend

# Install test dependencies if not already installed
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Install test dependencies
echo "Installing test dependencies..."
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/jest jest jest-environment-jsdom ts-jest

# Run frontend tests
echo "Running frontend unit tests..."
npm test -- --watchAll=false --coverage

# Integration Tests
echo ""
echo "📋 Running Integration Tests..."
cd ../../backend

# Run integration tests
echo "Running API integration tests..."
python -m pytest tests/ -v -m integration

# Generate Coverage Reports
echo ""
echo "📊 Generating Coverage Reports..."

# Backend coverage
cd ../../backend
python -m pytest tests/ --cov=. --cov-report=html --cov-report=term

# Frontend coverage
cd ../../frontend
npm test -- --coverage

echo ""
echo "✅ Test Suite Complete!"
echo "======================"
echo "Backend coverage report: backend/htmlcov/index.html"
echo "Frontend coverage report: frontend/coverage/lcov-report/index.html"
