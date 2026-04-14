#!/bin/bash

echo "Starting backend server with uv..."
cd ./backend

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "❌ uv is not installed!"
    echo "Install with: brew install uv or curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# Check if .venv exists, create if not
if [ ! -d ".venv" ]; then
    echo "Creating uv virtual environment..."
    uv venv
fi

echo "Starting server..."
uv run python main.py
