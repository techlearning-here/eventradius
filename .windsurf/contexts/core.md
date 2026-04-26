---
description: Core project rules and conventions
---

# Core Rules

## Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Python 3.12, FastAPI, UV package manager
- **Database**: Supabase (PostgreSQL)
- **Testing**: Playwright (frontend), pytest (backend)

## Code Style
- Python: isort + black, single-quoted SQL literals
- TypeScript: Small/medium components only; never create big .ts/.tsx files
- Refactor large files immediately; max ~150 lines per component
- Minimal comments, no docstrings unless public API
- No type hints on self-evident code

## Practices
- **TDD**: Failing test first, then implementation
- No Supabase imports without env guard
- No pyc files in git
- Use `uv run` for Python commands (no venv activation)

## File Organization
- Frontend: `src/components/`, `src/pages/`, `src/hooks/`
- Backend: `api/` (routes), `models/`, `config/`
- Migrations: `supabase/migrations/`
- Scripts: `scripts/` (bash for automation)

## Commands
```bash
# Backend
uv run uvicorn main:app --reload  # Dev server
uv run pytest                      # Tests
uv run black api/ config/          # Format

# Frontend (from frontend/)
npm run dev      # Dev server
npx playwright test  # E2E tests
```
