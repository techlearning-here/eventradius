---
description: Run all quality checks after feature completion
auto_execution_mode: 1
---

# Post-Feature Checks

Run this after completing any feature to ensure code quality.

## Steps

1. **Run all checks**
   ```bash
   ./scripts/run-all-checks.sh
   ```

2. **If Black formatting fails:**
   ```bash
   cd backend && uv run black api/ config/ tests/
   ```

3. **If Isort fails:**
   ```bash
   cd backend && uv run isort api/ config/ tests/
   ```

4. **If Flake8 fails:**
   - Fix linting errors manually or run with ignore flags as configured

5. **If backend tests fail:**
   ```bash
   cd backend && uv run pytest -v
   ```
   Fix failing tests or update code accordingly

6. **If ESLint fails:**
   ```bash
   cd frontend && npm run lint
   ```
   Auto-fix if available: `npm run lint -- --fix`

7. **If TypeScript fails:**
   ```bash
   cd frontend && npx tsc --noEmit
   ```
   Fix type errors

8. **Re-run checks** after fixes:
   ```bash
   ./scripts/run-all-checks.sh
   ```

## What Each Check Does

| Check | Tool | Scope |
|-------|------|-------|
| Black | Python formatter | `api/`, `config/`, `tests/` |
| Isort | Import sorter | `api/`, `config/`, `tests/` |
| Flake8 | Linter | Same, excludes `tests/manual_IT/` |
| Tests | pytest | Backend test suite |
| ESLint | JS/TS linter | Frontend src |
| TypeScript | tsc | Type checking |
| Unit Tests | Jest | Frontend caching tests |
