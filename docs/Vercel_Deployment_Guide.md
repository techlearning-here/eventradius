# Vercel Deployment Guide for EventRadius Frontend

This guide provides step-by-step instructions for deploying the EventRadius frontend to Vercel.

## Project Overview

The EventRadius frontend is a React application built with:
- **Vite** as the build tool
- **TypeScript** for type safety
- **React 18** with React Router DOM for routing
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Supabase** for authentication and real-time features
- **Google Maps API** for location services

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket Account**: Your repository must be hosted on one of these platforms
3. **Environment Variables**: Gather required API keys (see below)

## Deployment Steps

### 1. Prepare Your Repository

Ensure your frontend code is in a Git repository (GitHub, GitLab, or Bitbucket). The frontend is located in the `frontend/` directory of the main project.

### 2. Set Up Environment Variables

Create a `.env.production` file or configure environment variables in Vercel dashboard with the following:

```env
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_API_BASE_URL=https://your-backend-api.vercel.app  # or your backend URL
```

**Important Notes:**
- For local development, use `.env.local` (gitignored)
- For production, set these in Vercel's Environment Variables section
- The `VITE_API_BASE_URL` should point to your deployed FastAPI backend

### 3. Deploy via Vercel Dashboard

#### Option A: Import from Git Repository
1. Log in to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### 4. Configure Vercel Project Settings

After initial deployment, configure these settings in the Vercel dashboard:

#### Build & Development Settings
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node.js Version**: 18.x or higher

#### Environment Variables
Add all required environment variables in the Vercel project settings:
- Go to Project → Settings → Environment Variables
- Add each variable from the list above

#### Custom Domains (Optional)
- Go to Project → Settings → Domains
- Add your custom domain and follow DNS configuration instructions

### 5. Configure CORS for Backend API

If your backend is hosted separately, ensure CORS is configured to allow requests from your Vercel domain:

```python
# In your FastAPI backend (example)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-vercel-app.vercel.app",
        "http://localhost:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Build Configuration

### vercel.json (Optional)

Create a `vercel.json` file in the `frontend/` directory for advanced configuration:

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "NODE_VERSION": "18"
  }
}
```

### Package.json Scripts

The project includes these relevant scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview"
  }
}
```

Vercel will automatically use `npm run build` during deployment.

## Troubleshooting

### Common Issues

#### 1. Build Failures
- **Error**: "Cannot find module"
  - Solution: Ensure all dependencies are in package.json and run `npm install` locally to verify

- **Error**: TypeScript compilation errors
  - Solution: Fix TypeScript errors locally before deploying
  - Check `tsconfig.json` settings

#### 2. Environment Variables Not Loading
- **Symptom**: API calls fail with "API key missing"
  - Solution: Verify environment variables are set in Vercel dashboard
  - Ensure variable names start with `VITE_` for Vite to expose them

#### 3. Routing Issues (404 on page refresh)
- **Cause**: Vercel tries to serve static files for client-side routes
- **Solution**: Add a `vercel.json` with rewrite rules:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Or configure in Vercel dashboard:
- Go to Project → Settings → Git
- Under "Ignored Build Step", add override for Framework Preset
- Or use the "Clean URLs" feature

#### 4. Google Maps API Key Restrictions
- Restrict your Google Maps API key to your Vercel domain:
  - Go to Google Cloud Console → APIs & Services → Credentials
  - Add your Vercel domain (e.g., `*.vercel.app`) to HTTP referrers

#### 5. Supabase CORS Configuration
- In Supabase Dashboard → Settings → API
- Add your Vercel domain to allowed CORS origins

## Continuous Deployment

### Automatic Deployments
Vercel automatically deploys when you push to:
- `main` branch → Production deployment
- Other branches → Preview deployments

### Manual Deployments
- Use `vercel --prod` from CLI
- Or trigger from Vercel dashboard

### Preview Deployments
Each pull request gets a unique preview URL for testing.

## Monitoring and Analytics

### Vercel Analytics
- Go to Project → Analytics for performance metrics
- Monitor Core Web Vitals

### Error Tracking
- Consider integrating with Sentry or similar services
- Add error boundary components in React

## Performance Optimization

### Vite Build Optimizations
The Vite configuration is already optimized for production builds:
- Code splitting enabled
- Minification enabled
- Tree-shaking for unused code

### Additional Optimizations
1. **Image Optimization**: Use Vercel's Image Optimization API
2. **CDN**: Vercel automatically serves assets via global CDN
3. **Edge Functions**: Consider moving API calls to Vercel Edge Functions for reduced latency

## Security Considerations

1. **Never commit sensitive keys** to repository
2. **Use environment variables** for all secrets
3. **Restrict API keys** to your Vercel domains
4. **Enable Vercel Security Headers** (automatically applied)

## Rollback Procedures

If a deployment causes issues:
1. Go to Project → Deployments
2. Find the previous working deployment
3. Click "..." → "Promote to Production"

## Cost Considerations

Vercel's Hobby plan includes:
- 100GB bandwidth/month
- Unlimited deployments
- Custom domains
- Sufficient for most small to medium projects

Upgrade to Pro for:
- More bandwidth
- Team features
- Advanced analytics

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [React Router Vercel Configuration](https://reactrouter.com/en/main/guides/deploying#vercel)

## Quick Reference

```bash
# Local development
cd frontend
npm install
npm run dev

# Build locally to test
npm run build
npm run preview

# Deploy to Vercel
vercel
vercel --prod

# Environment variables to set in Vercel:
# VITE_GOOGLE_MAPS_API_KEY
# VITE_SUPABASE_PROJECT_ID
# VITE_SUPABASE_PUBLISHABLE_KEY
# VITE_SUPABASE_URL
# VITE_API_BASE_URL
```

---

*Last Updated: $(date)*
*Maintained by: EventRadius Development Team*