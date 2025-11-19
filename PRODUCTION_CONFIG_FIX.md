# Production Config Fix - Summary

## Issue Fixed

The backend was crashing with a 500 error due to:
```
Deprecated: parse_url(): Passing null to parameter #1 ($url) is deprecated 
in /var/www/html/config/production.php on line 47
```

## Root Cause

The `production.php` config file was calling `parse_url(env('APP_URL'))` without checking if `APP_URL` was set. When the environment variable was missing or null, PHP 8.2+ throws a deprecation error that crashes the application.

## Changes Made

### 1. Fixed `backend/config/production.php`

**Before (Lines 44-48):**
```php
'cors' => [
    'allowed_origins' => [
        env('APP_URL'),
        'https://' . parse_url(env('APP_URL'), PHP_URL_HOST),
        'https://www.' . parse_url(env('APP_URL'), PHP_URL_HOST),
    ],
```

**After:**
```php
'cors' => [
    'allowed_origins' => array_filter(array_merge(
        [env('APP_URL')],
        (function() {
            $url = env('APP_URL', '');
            $origins = [];
            if (!empty($url)) {
                $host = parse_url($url, PHP_URL_HOST);
                if ($host) {
                    $origins[] = 'https://' . $host;
                    $origins[] = 'https://www.' . $host;
                }
            }
            return $origins;
        })()
    )),
```

**What this does:**
- Safely checks if `APP_URL` exists before parsing
- Returns empty array if URL is missing
- Filters out null/empty values
- Prevents the deprecated warning

### 2. Updated `backend/Dockerfile`

**Changes:**
1. **PostgreSQL Support**: Changed from `pdo_mysql` to `pdo_pgsql` (Render uses PostgreSQL)
2. **Storage Permissions**: Added proper chmod permissions
3. **Config Caching**: Added entrypoint script that:
   - Clears old config cache
   - Caches config for production (after .env is available)
   - Starts Apache

**Key additions:**
```dockerfile
# PostgreSQL extensions
libpq-dev
docker-php-ext-install gd pdo pdo_pgsql

# Entrypoint script for config caching
CMD ["/usr/local/bin/docker-entrypoint.sh"]
```

## Required Environment Variables on Render

Make sure these are set in Render Dashboard → Environment Variables:

```env
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

# Session & Cookies
SESSION_DRIVER=cookie
SESSION_DOMAIN=.onrender.com
SESSION_SECURE_COOKIE=true

# CORS & Sanctum
CORS_ALLOWED_ORIGINS=https://capstoneproject-craftconnect-1.onrender.com
SANCTUM_STATEFUL_DOMAINS=capstoneproject-craftconnect-1.onrender.com

# Cache
CACHE_STORE=file
```

## Testing After Fix

1. **Deploy the updated code to Render**
2. **Check logs** - Should no longer see the parse_url deprecation error
3. **Test endpoints:**
   - `https://capstoneproject-craftconnect.onrender.com/api/test`
   - `https://capstoneproject-craftconnect.onrender.com/sanctum/csrf-cookie`
   - `https://capstoneproject-craftconnect.onrender.com/api/stores`
   - `https://capstoneproject-craftconnect.onrender.com/api/products/approved`

## Expected Results

✅ **Backend:**
- No more 500 errors
- `/sanctum/csrf-cookie` returns 204
- API routes return JSON responses
- Config is properly cached

✅ **Frontend:**
- No more 404 errors for `/api/...`
- No more Axios "UT" errors
- Category, FeaturedProducts, and Workshops will load
- Authentication will work

## Next Steps

1. Commit and push these changes
2. Render will automatically rebuild the Docker image
3. Verify the fix in Render logs
4. Test all endpoints
5. If issues persist, check Render logs for new error messages


