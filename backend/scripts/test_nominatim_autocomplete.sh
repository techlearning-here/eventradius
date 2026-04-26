#!/bin/bash
# Test: Nominatim City Autocomplete (OpenStreetMap - Free)
# This script tests the city autocomplete feature using uv

cd "$(dirname "$0")/.."

echo "=========================================="
echo "TEST: Nominatim City Autocomplete"
echo "=========================================="
echo "OpenStreetMap - free, no API key needed!"
echo ""

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.cargo/bin:$PATH"
fi

# Install dependencies using uv (faster than pip)
echo "Installing dependencies with uv..."
uv pip install -q -r requirements.txt

echo "Running Nominatim autocomplete tests..."
echo ""

# Run the test script with uv
uv run python scripts/test_photon_autocomplete.py

TEST_EXIT_CODE=$?

echo ""
echo "=========================================="
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✓ Tests completed successfully"
else
    echo "✗ Tests failed with exit code $TEST_EXIT_CODE"
fi
echo "=========================================="

exit $TEST_EXIT_CODE
