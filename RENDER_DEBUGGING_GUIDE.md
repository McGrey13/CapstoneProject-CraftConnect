z   # Render Backend Debugging Guide

## Current Issue: 500 Errors on All Endpoints

The backend is deployed but returning 500 errors on all API endpoints. This guide will help you debug and fix the issue.

## Step 1: Check Render Logs

1. Go to Render Dashboard → Your Backend Service → Logs
2. Look for error messages after the "Starting Apache..." line
3. The new entrypoint script will show detailed error messages

## Step 2: Common Causes and Fixes

### Issue 1: Database Connection Failed

**Symptoms:**
- 500 errors on all endpoints
- Logs show "SQLSTATE" errors

**Fix:**
1. Verify database credentials in Render Environment Variables:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=YOUR_DB_HOST
   DB_PORT=5432
   DB_DATABASE=YOUR_DB_NAME
   DB_USERNAME=YOUR_DB_USER
   DB_PASSWORD=YOUR_DB_PASSWORD
   ```

2. Test connection in Render Shell:
   ```bash
   php artisan tinker
   DB::connection()->getPdo();
   ```

### Issue 2: Missing Migrations

**Symptoms:**
- 500 errors mentioning "table doesn't exist"

**Fix:**
Run migrations in Render Shell:
```bash
php artisan migrate --force
```

### Issue 3: Missing APP_KEY

**Symptoms:**
- 500 errors on all endpoints
- Encryption errors

**Fix:**
1. Generate key locally:
   ```bash
   php artisan key:generate
   ```

2. Copy the key and set in Render:
   ```env
   APP_KEY=base64:YOUR_KEY_HERE
   ```

### Issue 4: Config Cache Failed

**Symptoms:**
- Entrypoint script shows "Config cache failed"

**Fix:**
The entrypoint script will show the actual error. Common issues:
- Missing environment variables
- Invalid config syntax
- Database connection required for config loading

**Temporary fix:** Set `APP_DEBUG=true` to see actual errors:
```env
APP_DEBUG=true
```

### Issue 5: Storage Permissions

**Symptoms:**
- 500 errors when accessing files
- Permission denied errors

**Fix:**
The entrypoint script sets permissions automatically, but you can verify:
```bash
ls -la storage/
chmod -R 775 storage bootstrap/cache
```

## Step 3: Enable Debug Mode Temporarily

To see actual error messages, temporarily set in Render:

```env
APP_DEBUG=true
APP_ENV=production
```

**⚠️ Remember to set `APP_DEBUG=false` after fixing!**

## Step 4: Check Specific Endpoints

After deployment, test these endpoints:

1. **Health Check:**
   ```
   https://capstoneproject-craftconnect.onrender.com/up
   ```
   Should return: `{"status":"ok"}`

2. **Test Endpoint:**
   ```
   https://capstoneproject-craftconnect.onrender.com/api/test
   ```
   Should return: `{"message":"API is working!","timestamp":"..."}`

3. **CSRF Cookie:**
   ```
   https://capstoneproject-craftconnect.onrender.com/sanctum/csrf-cookie
   ```
   Should return: `204 No Content`

## Step 5: View Laravel Logs

In Render Shell, check Laravel logs:

```bash
tail -f storage/logs/laravel.log
```

Or view the last 50 lines:
```bash
tail -n 50 storage/logs/laravel.log
```

## Step 6: Manual Setup in Render Shell

If automatic setup fails, run manually:

```bash
# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Test database
php artisan tinker
DB::connection()->getPdo();

# Run migrations
php artisan migrate --force

# Create storage link
php artisan storage:link

# Cache config
php artisan config:cache

# Cache routes
php artisan route:cache
```

## Required Environment Variables Checklist

Make sure ALL of these are set in Render:

- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false` (or `true` for debugging)
- [ ] `APP_URL=https://capstoneproject-craftconnect.onrender.com`
- [ ] `APP_KEY=base64:...` (REQUIRED!)
- [ ] `DB_CONNECTION=pgsql`
- [ ] `DB_HOST=...`
- [ ] `DB_PORT=5432`
- [ ] `DB_DATABASE=...`
- [ ] `DB_USERNAME=...`
- [ ] `DB_PASSWORD=...`
- [ ] `CACHE_STORE=file`
- [ ] `SESSION_DRIVER=cookie`
- [ ] `SESSION_DOMAIN=.onrender.com`
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] `CORS_ALLOWED_ORIGINS=https://capstoneproject-craftconnect-1.onrender.com`
- [ ] `SANCTUM_STATEFUL_DOMAINS=capstoneproject-craftconnect-1.onrender.com`

## What the New Entrypoint Script Does

The updated `docker-entrypoint.sh` will:

1. ✅ Create `.env` file from Render environment variables if missing
2. ✅ Show which environment variables are set
3. ✅ Clear all caches
4. ✅ Test database connection
5. ✅ Run migrations
6. ✅ Create storage link
7. ✅ Cache config and routes (with error messages if they fail)
8. ✅ Set proper permissions
9. ✅ Start Apache

All steps show output, so you can see exactly where it fails.

## Next Steps

1. **Deploy the updated code** (with new entrypoint script)
2. **Check Render logs** - you'll see detailed output from the entrypoint script
3. **Identify the failing step** from the logs
4. **Fix the specific issue** (database, migrations, env vars, etc.)
5. **Redeploy** if needed

## Quick Test Commands

After deployment, test in Render Shell:

```bash
# Test if Laravel is working
php artisan --version

# Test database
php artisan tinker --execute="DB::connection()->getPdo();"

# Test a route
php artisan route:list | grep stores

# Check config
php artisan config:show app.url
```

