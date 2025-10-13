# Render Deployment Guide

## Overview

This application is configured to deploy seamlessly on Render. The port binding issue has been fixed to ensure the app correctly binds to `0.0.0.0` and uses the `PORT` environment variable provided by Render.

## Key Configuration Changes

### 1. Port Binding Fix

**File: `backend/app/core/config.py`**

The configuration now reads `HOST` and `PORT` from environment variables:

```python
# Application
DEBUG: bool = True
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "9000"))
WEBSOCKET_PORT: int = int(os.getenv("PORT", "9000"))
```

**What this means:**
- In production (Render), the app will bind to `0.0.0.0` (all network interfaces)
- The PORT will be automatically set by Render's environment variable
- Local development still works with default port 9000

### 2. Deployment Configuration

**Procfile (for Railway/Render):**
```
web: uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
```

**railway.json:**
```json
{
  "deploy": {
    "startCommand": "uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT"
  }
}
```

## Deploying to Render

### Step 1: Connect Repository

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository

### Step 2: Configure Service

- **Name**: ocean-hazard-api (or your preferred name)
- **Environment**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: Use the Procfile (automatically detected)

### Step 3: Set Environment Variables

Add these environment variables in Render dashboard:

#### Required:
```
HOST=0.0.0.0
PORT=10000  # Render will override this automatically
DEBUG=False
SECRET_KEY=your-secure-secret-key-here
```

#### Optional (based on your needs):
```
DATABASE_URL=your-database-url
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
REDIS_URL=your-redis-url
MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Install dependencies from `requirements.txt`
   - Set the PORT environment variable
   - Run the command from Procfile: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - Make your app available at the assigned URL

## Verification

After deployment, verify the service is running:

1. **Health Check**: Visit `https://your-app.onrender.com/health`
   - Should return: `{"status": "healthy", "service": "Ocean Hazard API"}`

2. **API Documentation**: Visit `https://your-app.onrender.com/api/docs`
   - Should show the Swagger UI

3. **Root Endpoint**: Visit `https://your-app.onrender.com/`
   - Should return the API information

## Troubleshooting

### Port Binding Issues

If you see errors like "Address already in use" or "Port not available":

1. **Check Environment Variables**: Ensure `HOST=0.0.0.0` and `PORT` is set by Render
2. **Verify Procfile**: Should use `--host 0.0.0.0 --port $PORT`
3. **Check Logs**: Use Render's log viewer to see startup messages

### Connection Refused

If you can't access the app:

1. **Verify HOST**: Must be `0.0.0.0` (not `127.0.0.1`)
2. **Check Firewall**: Ensure Render's health checks can reach the app
3. **Review Health Check**: `/health` endpoint must respond within timeout

## Local Development

For local development, the defaults work fine:

```bash
# No environment variables needed for local dev
cd backend
python -m uvicorn app.main:app --reload

# App will bind to 0.0.0.0:9000 by default
# Access at http://localhost:9000
```

To test with different ports locally:

```bash
# Set custom port
export PORT=8080
python -m uvicorn app.main:app --reload

# Or use uvicorn directly
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
```

## Configuration Summary

| Environment | HOST | PORT | Notes |
|------------|------|------|-------|
| Local Dev | 0.0.0.0 | 9000 | Default values |
| Render | 0.0.0.0 | Set by Render | Automatic |
| Docker | 0.0.0.0 | 8000 | Dockerfile default |

## Next Steps

- [ ] Set up database on Render (PostgreSQL recommended)
- [ ] Configure Redis for caching (optional)
- [ ] Set up environment variables for production
- [ ] Enable custom domain (optional)
- [ ] Set up monitoring and alerts
