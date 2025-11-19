# Debugging 500 Errors on Render

## Quick Diagnostic Steps

### Step 1: Check Render Logs

1. Go to Render Dashboard → Your Backend Service → Logs
2. Look for the entrypoint script output - you should see:
   ```
   ==========================================
   Starting Laravel Application
   ==========================================
   📋 Checking environment variables...
   APP_KEY: SET (hidden) or NOT SET - CRITICAL!
   ⚙️  Caching configuration...
   ✅ Config cached successfully (or error)
   🛣️  Caching routes...
   ✅ Routes cached successfully (or error)
   ```

### Step 2: Test the Simple Endpoint

Try accessing this endpoint in your browser or with curl:
```
https://capstoneproject-craftconnect.onrender.com/api/test
```

This endpoint is designed to work even if other things are broken. It will show:
- If Laravel is loading
- PHP version
- Laravel version
- App environment
- If APP_KEY is set
- Any errors that occur

### Step 3: Check Laravel Logs in Render Shell

1. Go to Render Dashboard → Your Backend Service → Shell
2. Run:
   ```bash
   tail -n 200 storage/logs/laravel.log
   ```
3. Look for:
   - "API Exception" entries
   - "Exception occurred" entries
   - Any error messages

### Step 4: Check Environment Variables

In Render Shell, run:
```bash
# Check if .env exists
ls -la .env

# Check APP_KEY
grep APP_KEY .env

# Check database config
grep DB_ .env | head -5

# Check if config is cached
ls -la bootstrap/cache/config.php
```

## Common Issues and Fixes

### Issue 1: Missing APP_KEY

**Symptom:**
- Entrypoint logs show "APP_KEY: NOT SET - CRITICAL!"
- All endpoints return 500

**Fix:**
1. Go to Render Dashboard → Backend Service → Environment
2. Add: `APP_KEY=base64:YOUR_KEY_HERE`
3. To generate a key locally:
   ```bash
   cd backend
   php artisan key:generate
   ```
4. Copy the key from `.env` file
5. Set it in Render and redeploy

### Issue 2: Config Cache Failing

**Symptom:**
- Entrypoint logs show "❌ Config cache failed!"
- Error output shows specific error

**Common Causes:**
- Missing environment variables
- Invalid config syntax
- Database connection required during config load

**Fix:**
1. Check the error output in Render logs
2. Verify all required environment variables are set
3. Check `backend/config/production.php` for syntax errors
4. Temporarily set `APP_DEBUG=true` to see actual errors

### Issue 3: Route Cache Failing

**Symptom:**
- Entrypoint logs show "❌ Route cache failed!"
- Routes return 404 or 500

**Common Causes:**
- Route syntax errors
- Missing controller classes
- Middleware issues

**Fix:**
1. Check the error output in Render logs
2. Verify all controllers exist
3. Check `backend/routes/api.php` for syntax errors
4. Try clearing route cache manually:
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

### Issue 5: Missing Middleware Classes

**Symptom:**
- Error: "Class 'App\Http\Middleware\...' not found"
- Routes return 500

**Fix:**
1. Check if middleware files exist
2. Verify namespace is correct
3. Run `composer dump-autoload` in Render Shell

## Manual Debugging Commands

Run these in Render Shell to diagnose:

```bash
# Test if Laravel loads
php artisan --version

# Test config
php artisan config:show app.url
php artisan config:show app.key

# Test routes
php artisan route:list | head -20

# Test database
php artisan tinker --execute="DB::connection()->getPdo();"

# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Try to recache
php artisan config:cache
php artisan route:cache

# Check Laravel logs
tail -n 100 storage/logs/laravel.log

# Check if storage is writable
ls -la storage/logs/
touch storage/logs/test.log
rm storage/logs/test.log
```

## What to Look For in Logs

### Entrypoint Script Output

Look for these messages:
- ✅ "APP_KEY generated successfully" - Good
- ❌ "APP_KEY: NOT SET" - Bad, needs fixing
- ✅ "Config cached successfully" - Good
- ❌ "Config cache failed!" - Bad, check error output
- ✅ "Routes cached successfully" - Good
- ❌ "Route cache failed!" - Bad, check error output

### Laravel Logs

Look for:
- "API Exception" - Shows what exception occurred
- "Exception occurred" - Shows unhandled exceptions
- Stack traces - Shows where the error occurred
- File and line numbers - Shows exact location

## Next Steps

1. **Check Render logs** for entrypoint script output
2. **Test `/api/test` endpoint** - it should work even if others don't
3. **Check Laravel logs** in Render Shell
4. **Identify the specific error** from the logs
5. **Fix the issue** based on the error message
6. **Redeploy** if needed

## If Still Not Working

If you've checked everything and it's still not working:

1. **Enable full debug mode:**
   - Set `APP_DEBUG=true` in Render
   - Set `LOG_LEVEL=debug` in Render
   - Redeploy

2. **Check the `/api/test` endpoint response:**
   - It will show what's working and what's not
   - Copy the full response and share it

3. **Share the Render logs:**
   - Copy the entrypoint script output
   - Copy any error messages
   - Share the Laravel log entries

The `/api/test` endpoint is your best friend for debugging - it will tell you exactly what's wrong!

