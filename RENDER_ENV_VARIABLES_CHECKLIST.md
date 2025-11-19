# Render Environment Variables Checklist

## Frontend (Static Site)

### Required Environment Variable

**Service:** Frontend Static Site  
**Location:** Render Dashboard → Frontend Service → Environment → Environment Variables

```env
VITE_BACKEND_URL=https://capstoneproject-craftconnect.onrender.com
```

**⚠️ CRITICAL:**
- ✅ Must be exactly: `https://capstoneproject-craftconnect.onrender.com`
- ✅ Must start with `https://`
- ✅ Must NOT end with `/api`
- ✅ Must NOT have trailing slash
- ✅ Must NOT have commas or spaces
- ✅ Must be a single URL (not multiple)

**❌ WRONG Examples:**
```
❌ capstoneproject-craftconnect.onrender.com
❌ https://capstoneproject-craftconnect.onrender.com/
❌ https://capstoneproject-craftconnect.onrender.com/api
❌ https://capstoneproject-craftconnect.onrender.com, http://localhost:8000
❌ capstoneproject-craftconnect.onrender.com,  http://localhost:8000
```

**✅ CORRECT:**
```
✅ https://capstoneproject-craftconnect.onrender.com
```

## Backend (Web Service)

### Required Environment Variables

**Service:** Backend Web Service  
**Location:** Render Dashboard → Backend Service → Environment → Environment Variables

```env
# Application
APP_NAME=CraftConnect
APP_ENV=production
APP_DEBUG=false
APP_URL=https://capstoneproject-craftconnect.onrender.com
APP_KEY=base64:YOUR_APP_KEY_HERE

# Database (PostgreSQL)
DB_CONNECTION=pgsql
DB_HOST=YOUR_DB_HOST
DB_PORT=5432
DB_DATABASE=YOUR_DB_NAME
DB_USERNAME=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD

# Cache & Session
CACHE_STORE=file
SESSION_DRIVER=cookie
SESSION_LIFETIME=720
SESSION_DOMAIN=.onrender.com
SESSION_SECURE_COOKIE=true

# CORS & Sanctum
CORS_ALLOWED_ORIGINS=https://capstoneproject-craftconnect-1.onrender.com
SANCTUM_STATEFUL_DOMAINS=capstoneproject-craftconnect-1.onrender.com

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=error
```

## How to Set Environment Variables in Render

### For Frontend (Static Site):

1. Go to Render Dashboard
2. Click on your Frontend service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Key: `VITE_BACKEND_URL`
6. Value: `https://capstoneproject-craftconnect.onrender.com`
7. Click "Save Changes"
8. The site will automatically rebuild

### For Backend (Web Service):

1. Go to Render Dashboard
2. Click on your Backend service
3. Go to "Environment" tab
4. Add each environment variable one by one
5. Click "Save Changes" after each addition
6. The service will automatically redeploy

## Verification

### Check Frontend Environment Variable:

After setting `VITE_BACKEND_URL`, rebuild the frontend and check the browser console. You should see:

```
🔧 API Configuration: {
  rawBackendUrl: "https://capstoneproject-craftconnect.onrender.com",
  normalizedBackendUrl: "https://capstoneproject-craftconnect.onrender.com",
  apiBaseUrl: "https://capstoneproject-craftconnect.onrender.com/api",
  rootApiBaseUrl: "https://capstoneproject-craftconnect.onrender.com",
  ...
}
```

### Check Backend Environment Variables:

In Render Shell, run:
```bash
php artisan tinker
config('app.url')
env('APP_URL')
env('DB_CONNECTION')
```

## Common Mistakes

1. **Frontend:**
   - ❌ Setting `VITE_BACKEND_URL` with `/api` suffix
   - ❌ Setting multiple URLs separated by commas
   - ❌ Missing `https://` protocol
   - ❌ Adding trailing slash

2. **Backend:**
   - ❌ Missing `APP_KEY`
   - ❌ Wrong database credentials
   - ❌ `SESSION_DOMAIN` not set to `.onrender.com`
   - ❌ `SESSION_SECURE_COOKIE` set to `false` (should be `true` for HTTPS)

## Quick Fix for Current Issue

If you're seeing `ERR_NAME_NOT_RESOLVED` errors:

1. **Check Frontend Environment Variable:**
   - Go to Render → Frontend Service → Environment
   - Verify `VITE_BACKEND_URL` is set to: `https://capstoneproject-craftconnect.onrender.com`
   - If it has commas, spaces, or extra URLs, fix it
   - Save and rebuild

2. **Rebuild Frontend:**
   - After fixing the environment variable, Render will automatically rebuild
   - Or manually trigger a rebuild from the Render dashboard

3. **Check Browser Console:**
   - After rebuild, check the console for `🔧 API Configuration:` log
   - Verify the URLs are correct

