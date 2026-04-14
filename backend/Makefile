# EventRadius Backend Makefile
# Uses UV for Python package management

.PHONY: help install install-dev dev test test-ci format format-check lint clean lock

# Default target
help:
	@echo "EventRadius Backend - Available Commands:"
	@echo ""
	@echo "  make install     - Install production dependencies"
	@echo "  make install-dev - Install with development dependencies"
	@echo "  make dev         - Run development server with hot reload"
	@echo "  make test        - Run all tests"
	@echo "  make test-ci     - Run CI tests (stable tests only)"
	@echo "  make format      - Format code with black and isort"
	@echo "  make format-check- Check formatting without making changes"
	@echo "  make lint        - Run flake8 linter"
	@echo "  make check       - Run all checks (format, lint, test-ci)"
	@echo "  make lock        - Generate uv.lock file"
	@echo "  make clean       - Remove cache files and virtual environment"
	@echo "  make migrate     - Migrate from venv to uv"
	@echo ""

# Install dependencies
install:
	uv pip install -e .

install-dev:
	uv pip install -e ".[dev]"

# Development server
dev:
	uv run uvicorn main:app --reload --port 8000

# Testing
test:
	uv run pytest -v

test-ci:
	uv run python run-ci-tests.py

test-coverage:
	uv run pytest --cov=api --cov=config --cov-report=html --cov-report=xml

# Code formatting
format:
	uv run black api/ config/ tests/
	uv run isort api/ config/ tests/

format-check:
	uv run black --check api/ config/ tests/
	uv run isort --check-only api/ config/ tests/

# Linting
lint:
	uv run flake8 api/ config/ tests/ --max-line-length=88 --extend-ignore=E203,W503,E402,F401,F541,F811,E712,E501

# Run all checks
check: format-check lint test-ci
	@echo "✅ All checks passed!"

# Generate lock file
lock:
	uv pip compile pyproject.toml -o uv.lock

# Clean up
clean:
	rm -rf .venv
	rm -rf __pycache__
	rm -rf .pytest_cache
	rm -rf htmlcov
	rm -f .coverage
	rm -f coverage.xml
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

# Migrate from venv to uv
migrate:
	@echo "🚀 Migrating from venv to uv..."
	@if [ -d "venv" ]; then \
		echo "📦 Backing up venv to venv.backup..."; \
		mv venv venv.backup; \
	fi
	@echo "🆕 Creating uv environment..."
	uv venv
	@echo "📥 Installing dependencies..."
	uv pip install -e ".[dev]"
	@echo "✅ Migration complete!"
	@echo ""
	@echo "To verify everything works:"
	@echo "  make test-ci"
	@echo "  make dev"
