# Backend 500 Errors - Troubleshooting Guide

## Common Causes of 500 Errors on Render

### 1. Database Connection Issues

**Symptoms:**
- 500 errors on API endpoints
- Errors in logs mentioning database connection

**Fix:**
1. Verify database credentials in Render environment variables:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=YOUR_DB_HOST
   DB_PORT=5432
   DB_DATABASE=YOUR_DB_NAME
   DB_USERNAME=YOUR_DB_USER
   DB_PASSWORD=YOUR_DB_PASSWORD
   ```

2. Test database connection in Render Shell:
   ```bash
   php artisan tinker
   DB::connection()->getPdo();
   ```

3. If connection fails, check:
   - Database is created and running
   - Credentials are correct
   - Database allows connections from Render IPs

### 2. Missing Migrations

**Symptoms:**
- 500 errors when accessing database-related endpoints
- Errors mentioning "table doesn't exist"

**Fix:**
Run migrations in Render Shell:
```bash
php artisan migrate --force
```

### 3. Missing APP_KEY

**Symptoms:**
- 500 errors on all endpoints
- Encryption errors in logs

**Fix:**
1. Generate APP_KEY locally:
   ```bash
   php artisan key:generate
   ```

2. Copy the key and set it in Render environment variables:
   ```env
   APP_KEY=base64:YOUR_GENERATED_KEY_HERE
   ```

### 4. Storage Permissions

**Symptoms:**
- 500 errors when uploading files
- Permission denied errors

**Fix:**
In Render Shell:
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

Or ensure Dockerfile sets permissions:
```dockerfile
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache
```

### 5. Missing Storage Link

**Symptoms:**
- 404 errors on image URLs
- Storage files not accessible

**Fix:**
In Render Shell:
```bash
php artisan storage:link
```

### 6. Cache/Config Issues

**Symptoms:**
- Inconsistent errors
- Old configuration being used

**Fix:**
In Render Shell:
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
```

### 7. Missing Environment Variables

**Symptoms:**
- 500 errors on specific features
- Null reference errors

**Fix:**
Ensure all required environment variables are set in Render:
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://capstoneproject-craftconnect.onrender.com`
- `CORS_ALLOWED_ORIGINS`
- `SANCTUM_STATEFUL_DOMAINS`
- Database credentials
- Mail configuration (if using)

## Quick Diagnostic Steps

1. **Check Render Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Look for specific error messages

2. **Test Database Connection:**
   ```bash
   php artisan tinker
   DB::connection()->getPdo();
   ```

3. **Test Routes:**
   ```bash
   php artisan route:list | grep stores
   ```

4. **Check Storage:**
   ```bash
   ls -la storage/
   ls -la public/storage
   ```

5. **Test API Endpoint:**
   ```bash
   curl https://capstoneproject-craftconnect.onrender.com/api/test
   ```

## Common Error Messages and Solutions

### "SQLSTATE[HY000] [2002] Connection refused"
- Database host/port incorrect
- Database not accessible from Render

### "Table 'xyz' doesn't exist"
- Run migrations: `php artisan migrate --force`

### "No application encryption key has been specified"
- Set `APP_KEY` in environment variables

### "The stream or file could not be opened"
- Fix storage permissions
- Create storage link

### "Route [xyz] not defined"
- Clear route cache: `php artisan route:clear`
- Rebuild route cache: `php artisan route:cache`

## Prevention Checklist

Before deploying:
- [ ] All environment variables set
- [ ] APP_KEY generated and set
- [ ] Database created and accessible
- [ ] Migrations tested locally
- [ ] Storage permissions correct
- [ ] Storage link created
- [ ] Config cached for production

After deployment:
- [ ] Run migrations
- [ ] Create storage link
- [ ] Clear and cache config
- [ ] Test API endpoints
- [ ] Check logs for errors


