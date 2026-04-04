# Event Management Platform

A modern, full-stack event management platform built with React, TypeScript, and Lovable Cloud. Create, discover, and manage events with an intuitive interface and powerful features.

## 🌟 Features

### ✅ **Tested & Confirmed Working**
- **Google OAuth Login**: ✅ Tested with proper callback handling on Vercel deployment
- **Onboarding Flow**: ✅ Complete flow tested with preferences saving and user creation
- **User Profile Creation**: ✅ Automatic profile generation after OAuth signup
- **Session Management**: ✅ Persistent authentication across browser sessions
- **Event Discovery Page**: ✅ Events list loads and displays properly
- **Protected Routes**: ✅ Authentication redirects working correctly
- **Role Switching System**: ✅ Enhanced Event Discoverer ↔ Event Publisher toggle with:
  - Visual loading feedback during role switches
  - Role-based navigation items in navbar
  - Clear UI distinction between modes
  - Persistent role state across sessions

### 🧪 **Implemented - Needs Testing**
- **Email/Password Auth**: Code implemented but not tested in production
- **Event Creation**: Full form built but not tested end-to-end
- **Event Editing**: Edit interface exists but not tested
- **Event Deletion**: Delete functionality exists but not tested
- **Event Details**: Detail pages built but not tested with real events
- **Event Registration**: Registration system exists but not tested
- **Location & Maps Integration**: Google Maps autocomplete implemented but not tested
- **Image Upload**: Upload functionality exists but not tested
- **Admin Dashboard**: Admin interface built but not tested
- **Organizer Dashboard**: Organizer tools implemented but not tested
- **User Management**: Management interfaces exist but not tested
- **Event Chat**: Chat components built but not tested
- **User Preferences**: Preference system works (tested in onboarding) but full preference management not tested

### 🚧 **In Development**
- **Event Participants**: Participant counting and management (partially implemented)
- **Real-time Updates**: Live event status and chat improvements
- **Push Notifications**: Event reminders and updates
- **Payment Integration**: Ticket sales and event monetization
- **Social Features**: Event sharing, following, and social discovery

## Project info

**URL**: https://lovable.dev/projects/f1ba0c74-af75-4389-a8ae-60baf80911b5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/f1ba0c74-af75-4389-a8ae-60baf80911b5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Configuration

### Google Maps Places Autocomplete

This project uses Google Maps Places API for location autocomplete. To enable this feature:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API (New)** in the API Library
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy the API key
6. Add it to your `.env` file:
   ```
   VITE_GOOGLE_MAPS_API_KEY="your-api-key-here"
   ```

**Optional but recommended:** Restrict your API key to only work with the Places API and your domain for security.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/f1ba0c74-af75-4389-a8ae-60baf80911b5) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 🚀 FastAPI Backend

This project includes a FastAPI-based backend that serves as the API layer between the React frontend and Supabase database.

### Backend Features
- **FastAPI Framework**: Modern Python web framework with automatic OpenAPI documentation
- **Supabase Integration**: PostgreSQL database with real-time capabilities
- **JWT Authentication**: Secure token-based authentication
- **CORS Configuration**: Cross-origin resource sharing for frontend-backend communication
- **Comprehensive API**: Full CRUD operations for events, users, and participation

### Running the Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

5. Start the development server:
   ```bash
   python -m uvicorn main:app --reload --port 8000
   ```

### API Documentation
Once the backend is running:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/health`

### Frontend Integration
The frontend is configured to use the backend API via the `VITE_BACKEND_URL` environment variable. All REST calls from the frontend are routed through the backend, which then communicates with Supabase.

For detailed backend documentation, see [backend/README.md](backend/README.md).

## � Quick Start

### One-command setup (Recommended):
```bash
# Clone and setup everything automatically
git clone <YOUR_GIT_URL> eventradius
cd eventradius
./setup-dev.sh
```

### Manual setup:
```bash
# Clone the repository
git clone <YOUR_GIT_URL> eventradius
cd eventradius

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pre-commit install

# Frontend setup
cd ../frontend
npm install

# Return to root
cd ..
```

### Environment Setup:
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit .env files with your actual credentials
# NEVER commit real credentials to the repository!
```

## �️ Pre-commit Checks

To avoid CI failures and security issues, this project includes pre-commit hooks that automatically run before each push. These hooks catch common issues early:

### What's Checked:
- **Backend**: Black code formatting, Python linting, secret detection
- **Frontend**: ESLint, TypeScript errors, secret detection
- **Security**: Scans for leaked API keys, tokens, and credentials
- **Git**: Prevents pushing large files, ensures proper line endings

### Installation:
```bash
# Install pre-commit hooks (run once)
pip install pre-commit
pre-commit install

# Install gitleaks binary (security scanning)
# macOS: brew install gitleaks
# Linux: wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks-linux-amd64
# Or: https://github.com/gitleaks/gitleaks#install

# Unix/Mac/Linux: Use the automated setup script
./setup-dev.sh

# Windows: Use the automated batch script OR install manually
run-checks.bat
```

### Automated Setup (Choose your platform):

**macOS:**
```bash
./setup-dev.sh
```

**Linux:**
```bash
./setup-dev.sh
```

**Windows:**
```batch
run-checks.bat
```

### Manual Installation (if automated scripts fail):

**All Platforms:**
```bash
# Install pre-commit
pip install pre-commit

# Install pre-commit hooks
pre-commit install
```

**Windows Additional:**
```batch
# Install gitleaks for security scanning
# Download from: https://github.com/gitleaks/gitleaks/releases
# Extract and add to PATH, or use chocolatey:
choco install gitleaks
```

**macOS Additional:**
```bash
# Install gitleaks (recommended)
brew install gitleaks

# Alternative: Download binary
# https://github.com/gitleaks/gitleaks/releases
```

**Linux Additional:**
```bash
# Download gitleaks binary
wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks-linux-amd64
chmod +x gitleaks-linux-amd64
sudo mv gitleaks-linux-amd64 /usr/local/bin/gitleaks
```

### Manual Usage:

**macOS & Linux:**
```bash
# Run all checks manually
pre-commit run --all-files

# Run specific hook
pre-commit run black
pre-commit run eslint
pre-commit run detect-secrets
```

**Windows:**
```batch
REM Run all checks manually
pre-commit run --all-files

REM Run specific hooks
pre-commit run black
pre-commit run flake8
pre-commit run isort
pre-commit run eslint
pre-commit run detect-secrets
pre-commit run gitleaks

REM Quick checks for common issues
pre-commit run trailing-whitespace
pre-commit run end-of-file-fixer
pre-commit run check-yaml
pre-commit run check-json
```

### Windows Batch Script (save as run-checks.bat):
```batch
@echo off
echo Running pre-commit checks...

REM Install pre-commit if not present
where pre-commit >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing pre-commit...
    pip install pre-commit
)

REM Run all checks
echo Running all pre-commit checks...
pre-commit run --all-files

REM Check results
if %ERRORLEVEL% EQU 0 (
    echo All checks passed!
) else (
    echo Some checks failed. Please fix the issues above.
    echo You can run individual checks:
    echo   pre-commit run black
    echo   pre-commit run eslint
    echo   pre-commit run detect-secrets
)

pause
```

### Bypassing Hooks (Not Recommended):
```bash
# Only skip if absolutely necessary
git push --no-verify
```

### Troubleshooting:
If hooks fail, fix the issues they report:

#### **Backend Issues:**
- **Black formatting errors**: Run `black .` or let hooks auto-fix
- **Flake8 linting**:
  - Long lines (>88 chars): Break long strings/log messages
  - Unused imports: Remove unused imports
  - Method chains: Break long chained calls into variables
- **Test warnings**: Use `assert` instead of `return` in pytest functions

#### **Frontend Issues:**
- **ESLint errors**:
  - Replace `require()` with ES6 imports
  - Replace `any` types with proper TypeScript types
  - Fix React hooks dependency arrays
- **TypeScript errors**: Add proper type annotations

#### **Security Issues:**
- **Secret detection**: Remove any leaked credentials immediately
  - Check `.env.example` files for real credentials
  - Never commit actual API keys or tokens
  - Use placeholder values in example files

#### **Common Failure Patterns We've Fixed:**
```bash
# ❌ Avoid: Long lines in logs
logger.info(f"Updated OAuth profile for user {user['id']} with provider {profile.provider}")

# ✅ Use: Line breaks
logger.info(
    f"Updated OAuth profile for user {user['id']} "
    f"with provider {profile.provider}"
)

# ❌ Avoid: Unused imports
from config.database import fetch_single_record, get_table, insert_record, update_record

# ✅ Use: Only needed imports
from config.database import fetch_single_record, get_table, insert_record

# ❌ Avoid: Long method chains
mock_table.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])

# ✅ Use: Break into variables
select_chain = mock_table.select.return_value.eq.return_value.eq.return_value
select_chain.execute.return_value = MagicMock(data=[])

# ❌ Avoid: pytest return values
def test_something():
    return True  # Causes warnings

# ✅ Use: assert statements
def test_something():
    assert True  # Proper pytest pattern
```

These hooks save time by catching issues locally before they reach CI/CD pipelines.

## 📋 Quick Reference

For a comprehensive guide to common issues and solutions, see **[CHEAT_SHEET.md](CHEAT_SHEET.md)** - it contains all the failure patterns we've encountered and their fixes.

### Most Common Issues:
- **Long lines** (>88 chars) → Break with f-string concatenation
- **Unused imports** → Remove unused import statements
- **ESLint errors** → Use ES6 imports, proper TypeScript types
- **Secret leaks** → Never commit real credentials, use placeholders
- **Test warnings** → Use `assert` instead of `return` in pytest
