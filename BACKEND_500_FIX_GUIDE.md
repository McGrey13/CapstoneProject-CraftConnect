# Backend 500 Error Fix Guide

## Current Issue

All API endpoints are returning 500 Internal Server Error. This indicates Laravel is crashing before it can handle requests.

## Root Causes

1. **Missing APP_KEY** - Laravel requires APP_KEY to be set. Without it, encryption/decryption fails and Laravel crashes.
2. **Config cache failing** - If config cache fails, Laravel may not load properly.
3. **Route cache failing** - If route cache fails, routes won't be registered.
4. **Database connection issues** - If database is required during bootstrap and connection fails, Laravel crashes.

## Fix Applied

### Updated `backend/docker-entrypoint.sh`

**Key Changes:**
1. ✅ Changed `set -e` to `set +e` - Script won't exit on errors, allowing us to see what's failing
2. ✅ Added APP_KEY check and auto-generation if missing
3. ✅ Set `APP_DEBUG=true` temporarily to see actual errors
4. ✅ Set `LOG_LEVEL=debug` to get more detailed logs
5. ✅ Better error capture and reporting for config/route cache
6. ✅ Added route verification to confirm routes are loaded
7. ✅ Added Laravel bootstrap test

## What to Check After Deployment

### 1. Check Render Logs

After deploying, check the Render logs. You should see:

```
==========================================
Starting Laravel Application
==========================================
📋 Checking environment variables...
APP_ENV: production
APP_URL: https://capstoneproject-craftconnect.onrender.com
DB_CONNECTION: pgsql
APP_KEY: SET (hidden) or NOT SET - CRITICAL!
```

**If APP_KEY is NOT SET:**
- The script will try to generate it
- Check if generation succeeds: `✅ APP_KEY generated successfully`

### 2. Check Config Cache

Look for:
```
⚙️  Caching configuration...
✅ Config cached successfully
```

**If it fails:**
```
❌ Config cache failed!
Error output:
[Error details here]
```

### 3. Check Route Cache

Look for:
```
🛣️  Caching routes...
✅ Routes cached successfully
```

**If it fails:**
```
❌ Route cache failed!
Error output:
[Error details here]
```

### 4. Check Route Verification

Look for:
```
📋 Verifying routes...
GET|HEAD  api/stores ................ stores.index
GET|HEAD  api/products/approved ..... products.approved
```

## Common Issues and Fixes

### Issue 1: APP_KEY Missing

**Symptom:**
- All endpoints return 500
- Logs show "APP_KEY is not set"

**Fix:**
1. Go to Render Dashboard → Backend Service → Environment
2. Add environment variable:
   ```
   APP_KEY=base64:YOUR_KEY_HERE
   ```
3. To generate a key locally:
   ```bash
   cd backend
   php artisan key:generate
   ```
4. Copy the key from `.env` file
5. Set it in Render environment variables

### Issue 2: Config Cache Failing

**Symptom:**
- Config cache step shows error
- Laravel crashes on requests

**Common Causes:**
- Missing environment variables
- Invalid config syntax
- Database connection required during config load

**Fix:**
1. Check the error output in logs
2. Verify all required environment variables are set
3. Check `backend/config/production.php` for syntax errors
4. Temporarily set `APP_DEBUG=true` to see actual errors

### Issue 3: Route Cache Failing

**Symptom:**
- Route cache step shows error
- Routes return 404 or 500

**Common Causes:**
- Route syntax errors
- Missing controller classes
- Middleware issues

**Fix:**
1. Check the error output in logs
2. Verify all controllers exist
3. Check `backend/routes/api.php` for syntax errors
4. Try clearing route cache manually in Render Shell:
   ```bash
   php artisan route:clear
   php artisan route:cache
   ```

### Issue 4: Database Connection Failing

**Symptom:**
- Database test shows error
- Laravel crashes when trying to access database

**Fix:**
1. Verify database credentials in Render:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_DATABASE`
   - `DB_USERNAME`
   - `DB_PASSWORD`
2. Check if database is accessible from Render
3. Test connection in Render Shell:
   ```bash
   php artisan tinker
   DB::connection()->getPdo();
   ```

## Debugging Steps

### Step 1: Check Laravel Logs

In Render Shell:
```bash
tail -n 100 storage/logs/laravel.log
```

Look for:
- Fatal errors
- Exception stack traces
- Missing class errors
- Database connection errors

### Step 2: Test Laravel Manually

In Render Shell:
```bash
# Test if Laravel loads
php artisan --version

# Test config
php artisan config:show app.url

# Test routes
php artisan route:list | grep stores
php artisan route:list | grep products

# Test database
php artisan tinker
DB::connection()->getPdo();
```

### Step 3: Clear All Caches

In Render Shell:
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Then recache
php artisan config:cache
php artisan route:cache
```

### Step 4: Check Environment Variables

In Render Shell:
```bash
# Check .env file
cat .env | grep -E "APP_KEY|APP_URL|DB_"

# Check if APP_KEY is set
php artisan tinker --execute="echo config('app.key');"
```

## Required Environment Variables

Make sure ALL of these are set in Render:

```env
APP_NAME=CraftConnect
APP_ENV=production
APP_DEBUG=false  # Set to true temporarily for debugging
APP_URL=https://capstoneproject-craftconnect.onrender.com
APP_KEY=base64:YOUR_KEY_HERE  # CRITICAL - Must be set!

DB_CONNECTION=pgsql
DB_HOST=YOUR_DB_HOST
DB_PORT=5432
DB_DATABASE=YOUR_DB_NAME
DB_USERNAME=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD

CACHE_STORE=file
SESSION_DRIVER=cookie
SESSION_DOMAIN=.onrender.com
SESSION_SECURE_COOKIE=true

CORS_ALLOWED_ORIGINS=https://capstoneproject-craftconnect-1.onrender.com
SANCTUM_STATEFUL_DOMAINS=capstoneproject-craftconnect-1.onrender.com
```

## Next Steps

1. **Deploy the updated entrypoint script**
2. **Check Render logs** - Look for the detailed output
3. **Identify the failing step** - Config cache, route cache, or APP_KEY
4. **Fix the specific issue** based on the error messages
5. **Redeploy** if needed

## After Fixing

Once the backend is working:
1. Set `APP_DEBUG=false` in production
2. Set `LOG_LEVEL=error` in production
3. Verify all endpoints work:
   - `/api/test`
   - `/api/stores`
   - `/api/products/approved`
   - `/api/work-and-events/public`
   - `/sanctum/csrf-cookie`

