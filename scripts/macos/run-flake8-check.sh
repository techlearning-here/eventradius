#!/bin/bash
source venv/bin/activate
flake8 api/ config/ tests/ --max-line-length=88 --extend-ignore=E203,W503,E402,F401,F541,F811,E712,E501
