---
description: UV-based Python project management
---

# UV-Based Project Management

The backend has been fully converted to use **uv** - an extremely fast Python package manager and resolver.

## Quick Start

```bash
cd backend

# Create environment and install dependencies
uv venv
uv pip install -e ".[dev]"

# Run development server
uv run uvicorn main:app --reload
```

## Why UV?

- **10-100x faster** than pip
- **Automatic caching** - packages cached globally
- **Deterministic builds** with `uv.lock`
- **No need to activate** - use `uv run` directly
- **Single tool** - replaces pip, venv, and virtualenv

## Common Commands

| Task | Command |
|------|---------|
| Create env | `uv venv` |
| Install prod deps | `uv pip install -e .` |
| Install with dev | `uv pip install -e ".[dev]"` |
| Add package | `uv pip install package` |
| Run server | `uv run uvicorn main:app --reload` |
| Run tests | `uv run pytest` |
| Format code | `uv run black api/ config/ tests/` |

## Using Make (Recommended)

```bash
# Install and setup
make install-dev

# Development
make dev          # Run server
make test         # Run tests
make test-ci      # Run CI tests
make format       # Format code
make lint         # Run linter
make check        # Run all checks
```

## Project Structure

```
backend/
├── pyproject.toml      # Dependencies and config
├── uv.lock            # Lock file (generated, committed)
├── .venv/             # Virtual environment
├── Makefile           # Common commands
└── README.md          # Full documentation
```

## Migrating from venv

Already using venv? Run:

```bash
make migrate
```

This will:
1. Backup your venv to `venv.backup/`
2. Create a new uv environment
3. Install all dependencies

## Reproducible Builds

To create a lock file for exact dependency versions:

```bash
uv pip compile pyproject.toml -o uv.lock
```

Then install exact versions:

```bash
uv pip sync uv.lock
```
