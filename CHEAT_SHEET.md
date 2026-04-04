# Development Cheat Sheet

Quick reference for common issues and their solutions.

## 🚨 Quick Fixes Before Push

```bash
# Run all checks manually
pre-commit run --all-files

# Fix formatting automatically
black .                    # Backend
npm run lint -- --fix     # Frontend (if available)

# Check for secrets
detect-secrets scan --all-files
gitleaks detect
```

## 🔧 Backend Issues

### Flake8 Line Length (>88 chars)
```python
# ❌ Bad
logger.info(f"Updated OAuth profile for user {user['id']} with provider {profile.provider}")

# ✅ Good
logger.info(
    f"Updated OAuth profile for user {user['id']} "
    f"with provider {profile.provider}"
)
```

### Unused Imports
```python
# ❌ Bad
from config.database import fetch_single_record, get_table, insert_record, update_record

# ✅ Good
from config.database import fetch_single_record, get_table, insert_record
```

### Long Method Chains
```python
# ❌ Bad
mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

# ✅ Good
select_chain = mock_table.select.return_value.eq.return_value.eq.return_value
select_chain.execute.return_value = MagicMock(data=[])
```

### Pytest Return Values
```python
# ❌ Bad - causes warnings
def test_something():
    return True

# ✅ Good - proper pytest
def test_something():
    assert True
```

## ⚛️ Frontend Issues

### ESLint require() imports
```typescript
// ❌ Bad
const mockUseAuthWithBackend = require('../../hooks/useAuthWithBackend');

// ✅ Good
import * as useAuthWithBackend from '../../hooks/useAuthWithBackend';
```

### TypeScript any types
```typescript
// ❌ Bad
function mockApiSuccess(data: any): Promise<any>

// ✅ Good
function mockApiSuccess<T>(data: T): Promise<{ data: T }>
```

### Jest Mock Types
```typescript
// ❌ Bad
verifyApiCall: (mockFn: any, expectedData: any)

// ✅ Good
verifyApiCall: (mockFn: jest.Mock, expectedData: unknown)
```

## 🔒 Security Issues

### Environment Files
```bash
# ❌ Bad - real credentials in .env.example
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# ✅ Good - placeholders only
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Secret Detection
```bash
# Check for secrets
detect-secrets scan --all-files --baseline .secrets.baseline
gitleaks detect --config .gitleaks.toml

# Remove found secrets immediately
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path/to/secret/file'
```

## 🎯 Pre-commit Hook Commands

```bash
# Install hooks
pre-commit install

# Run all hooks
pre-commit run --all-files

# Run specific hook
pre-commit run black
pre-commit run flake8
pre-commit run eslint
pre-commit run detect-secrets
pre-commit run gitleaks

# Update hooks to latest versions
pre-commit autoupdate

# Skip hooks (emergency only)
git push --no-verify
```

## 🐛 Common CI Failures & Solutions

| CI Failure | Cause | Solution |
|------------|-------|----------|
| `black --check` failed | Code not formatted | Run `black .` |
| `flake8` failed | Linting issues | Fix line length, imports, etc. |
| `eslint` failed | Frontend linting | Fix ESLint errors |
| `detect-secrets` | Secrets in code | Remove credentials |
| `gitleaks` | Leaked secrets | Remove leaked data |
| GitHub secret scanning | Real credentials in history | Rewrite git history |

## 📝 Quick Commit Template

```bash
git commit -m "type(scope): description

- Fix specific issue
- Add new feature
- Update documentation

Closes #123"
```

## 🚀 Emergency Commands

```bash
# If pre-commit hooks fail and you need to push urgently
git push --no-verify

# If you accidentally committed secrets
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch file-with-secrets'
git push --force-with-lease

# Reset to last good commit
git reset --hard HEAD~1
```

Remember: **Pre-commit hooks save time by catching issues locally!** 🎉
