#!/bin/bash
source venv/bin/activate
isort --check-only --diff api/ config/ tests/
