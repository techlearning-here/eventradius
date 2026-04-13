# Render.com Backend Deployment Guide

Deploy the EventRadius FastAPI backend to Render.com using UV package manager.

## Overview

This guide covers deploying the FastAPI backend to Render.com's web service platform using:
- **UV** for fast Python package management
- **Gunicorn** with Uvicorn workers for production
- **Environment variables** for configuration

## Prerequisites

1. **Render.com Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Backend code pushed to GitHub
3. **Supabase Project**: Database and authentication configured

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] `pyproject.toml` has all dependencies listed
- [ ] `.python-version` file exists with `3.10`
- [ ] `render.yaml` is in project root (optional, for blueprint deploy)
- [ ] Environment variables prepared (see list below)
- [ ] Supabase project is running and accessible
- [ ] Frontend deployed (for CORS configuration)
- [ ] All tests pass locally: `make test`

### Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_KEY` | ✅ | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `JWT_SECRET_KEY` | ✅ | Secure random string for JWT signing |
| `JWT_ALGORITHM` | Optional | Default: HS256 |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Optional | Default: 30 |
| `BACKEND_CORS_ORIGINS` | ✅ | Your frontend URL(s) |

## Deployment Methods

### Method 1: Deploy via Render Dashboard (Recommended)

#### Step 1: Create Web Service

1. Log in to [render.com](https://render.com)
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository (select `eventradius`)
4. Configure settings (see below)
5. Click **"Create Web Service"**

**What happens during first deploy:**
- Render detects Python project
- Runs your build command (~2-3 minutes)
- Starts the Gunicorn server
- Health check at `/` endpoint
- Service becomes available at `https://your-service.onrender.com`

**Basic Settings:**
- **Name**: `eventradius-backend` (or your preferred name)
- **Runtime**: `Python 3`
- **Build Command**: 
  ```bash
  pip install uv && uv venv && uv pip install -e ".[dev]"
  ```
- **Start Command**:
  ```bash
  uv run gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT
  ```

**Instance Type**: 
- Start with **Free** or **Starter** ($7/month)
- Upgrade to **Standard** ($25/month) for production

#### Step 2: Configure Environment Variables

1. In Render Dashboard, click your service
2. Go to **"Environment"** tab
3. Add each variable:

**Supabase Settings:**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs...  # Find in Supabase Dashboard → Settings → API
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...  # Service role key (keep secret!)
```

**JWT Security:**
```bash
JWT_SECRET_KEY=your-secure-random-secret-key  # Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**CORS Configuration:**
```bash
BACKEND_CORS_ORIGINS=https://your-frontend.vercel.app,https://www.yourdomain.com
```

4. Click **"Save Changes"**
5. Service will automatically redeploy

#### Step 3: Verify Deployment

After deployment completes (~3-5 minutes):

1. **Check logs** in Render Dashboard → Logs
   - Look for "Application startup complete"
   - No error messages

2. **Test health endpoint:**
   ```bash
   curl https://your-service.onrender.com/
   ```
   Expected response:
   ```json
   {"message": "EventPinger Backend API", "status": "healthy"}
   ```

3. **Test API endpoints:**
   ```bash
   # Get events (public endpoint)
   curl https://your-service.onrender.com/api/events/
   
   # Check docs
   open https://your-service.onrender.com/docs
   ```

4. **Verify CORS** (if frontend is deployed):
   - Open frontend
   - Check browser console for CORS errors
   - If errors, update `BACKEND_CORS_ORIGINS` in Render

---

### Method 2: Deploy via render.yaml (Infrastructure as Code)

Create `render.yaml` in your project root:

```yaml
services:
  - type: web
    name: eventradius-backend
    runtime: python
    plan: free  # or starter, standard, etc.
    
    # Build commands
    buildCommand: |
      pip install uv && 
      uv venv && 
      uv pip install -e ".[dev]"
    
    # Start command
    startCommand: |
      uv run gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT
    
    # Environment variables (set in dashboard or use envVarGroups)
    envVars:
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_KEY
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: JWT_SECRET_KEY
        sync: false
      - key: JWT_ALGORITHM
        value: HS256
      - key: JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        value: "30"
      - key: BACKEND_CORS_ORIGINS
        value: "*"  # Update with your frontend URL
```

Deploy via Render CLI:
```bash
# Install Render CLI
npm install -g @render/cli

# Login
render login

# Deploy
render blueprint apply
```

---

## Build & Start Commands Explained

### Build Command
```bash
pip install uv && uv venv && uv pip install -e ".[dev]"
```

1. `pip install uv` - Install UV package manager
2. `uv venv` - Create virtual environment at `.venv`
3. `uv pip install -e ".[dev]"` - Install with dev dependencies (includes gunicorn)

### Start Command
```bash
uv run gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT
```

- `-w 4` - 4 worker processes (adjust based on plan: 2 for Free/Starter, 4+ for higher)
- `-k uvicorn.workers.UvicornWorker` - Uvicorn ASGI worker
- `--bind 0.0.0.0:$PORT` - Bind to Render's provided PORT

---

## Instance Type Recommendations

| Plan | Workers | Best For |
|------|---------|----------|
| **Free** | 2 | Development, testing |
| **Starter** ($7) | 2-3 | Small production apps |
| **Standard** ($25) | 4 | Medium traffic |
| **Pro** ($85+) | 8+ | High traffic |

---

## Health Checks

Your FastAPI app already has a health endpoint at `/`.

Verify deployment:
```bash
curl https://your-service.onrender.com/
# Expected: {"message": "EventPinger Backend API", "status": "healthy"}
```

---

## Step-by-Step First Deploy Walkthrough

### For Beginners

If this is your first Render deployment:

1. **Prepare your repo:**
   ```bash
   git add render.yaml
   git commit -m "Add Render deployment config"
   git push origin main
   ```

2. **In Render Dashboard:**
   - Click "New" → "Web Service"
   - Select "Build and deploy from a Git repository"
   - Click "Connect" next to your GitHub account
   - Find and select `eventradius` repository
   - Click "Connect"

3. **Configure service:**
   - Name: `eventradius-backend`
   - Region: `Oregon (US West)` (or closest to your users)
   - Branch: `main`
   - Runtime: `Python 3`
   - Build Command: (copy from above)
   - Start Command: (copy from above)
   - Plan: `Free`
   - Click "Create Web Service"

4. **Wait for build** (~3 minutes):
   - Watch the logs in real-time
   - Green checkmark = success

5. **Add environment variables** (see Step 2 above)

6. **Test your API:**
   - Copy the URL (e.g., `https://eventradius-backend.onrender.com`)
   - Test in browser or with curl

## Post-Deployment Tasks

### 1. Update Frontend API URL

In your frontend `.env`:
```bash
VITE_API_BASE_URL=https://your-service.onrender.com
```

### 2. Configure Supabase CORS

In Supabase Dashboard:
- Go to Settings → API → CORS
- Add your Render domain: `https://your-service.onrender.com`

### 3. Set Up Custom Domain (Optional)

In Render Dashboard:
- Go to Settings → Custom Domains
- Add your domain (e.g., `api.yourdomain.com`)
- Follow DNS configuration instructions

### 4. Enable Auto-Deploy (Default On)

Render auto-deploys on every push to `main`. To disable:
- Dashboard → Settings → Auto-Deploy → Off

## Troubleshooting

### Build Failures

**"uv: command not found"
- UV is installed during build, but path may not persist
- Use `pip install uv` in every build

**"No module named 'uvicorn'"**
- Ensure `[dev]` extras are installed (includes gunicorn/uvicorn)
- Check `uv pip install -e ".[dev]"` is in build command

### Runtime Errors

**"Port already in use"**
- Always use `$PORT` environment variable
- Render assigns a dynamic port

**"Module not found" errors**
- Verify `pyproject.toml` dependencies are correct
- Check `[project.dependencies]` includes all required packages

### Memory Issues (Free/Starter plans)

Reduce workers:
```bash
# Free plan - use 2 workers
uv run gunicorn -w 2 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT
```

---

## Environment-Specific Settings

### Production CORS

Update `BACKEND_CORS_ORIGINS` to only allow your frontend:
```bash
BACKEND_CORS_ORIGINS=https://your-app.vercel.app,https://www.yourdomain.com
```

### Production JWT Secret

Generate a secure secret:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Continuous Deployment

Render automatically deploys on push to:
- `main` branch → Production
- Other branches → Preview (if enabled)

Disable auto-deploy in Dashboard → Settings if needed.

---

## Monitoring

### Render Dashboard
- **Metrics**: CPU, memory, request count
- **Logs**: Real-time application logs
- **Events**: Build and deployment history

### Add External Monitoring
Consider adding:
- **Sentry** for error tracking
- **LogRocket** or **Datadog** for APM

---

## Cost Optimization

### Free Tier Limits
- 512 MB RAM
- 0.1 CPU
- Spins down after 15 min inactivity (cold starts ~30s)

### When to Upgrade
- Consistent traffic (avoid cold starts)
- Need >512MB RAM
- CPU-intensive operations

---

## Quick Reference

```bash
# Build Command
pip install uv && uv venv && uv pip install -e ".[dev]"

# Start Command (Free plan)
uv run gunicorn -w 2 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT

# Start Command (Standard+ plan)
uv run gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT
```

---

## Deployment Checklist Summary

Use this checklist for each deployment:

### Before Deploy
- [ ] All code committed and pushed to `main`
- [ ] Tests pass locally: `make test`
- [ ] `pyproject.toml` dependencies up to date
- [ ] Environment variables documented

### During Deploy
- [ ] Build command runs successfully
- [ ] Start command starts server
- [ ] Health check passes (`/` endpoint)
- [ ] No errors in logs

### After Deploy
- [ ] API endpoints respond correctly
- [ ] Swagger docs accessible (`/docs`)
- [ ] Frontend can connect (CORS working)
- [ ] Environment variables all set
- [ ] Custom domain configured (if needed)
- [ ] Monitoring/alerts set up (if production)

---

## Related Documentation

- [Render Python Docs](https://render.com/docs/python)
- [Render Web Services](https://render.com/docs/web-services)
- [Gunicorn Configuration](https://docs.gunicorn.org/en/stable/configure.html)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [UV Documentation](https://docs.astral.sh/uv/)
