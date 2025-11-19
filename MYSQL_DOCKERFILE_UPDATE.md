# MySQL Dockerfile Update

## Changes Made

### 1. ✅ Updated Dockerfile

**Changed from PostgreSQL to MySQL:**
- Removed: `libpq-dev` and `pdo_pgsql`
- Added: `default-mysql-client` and `pdo_mysql`

**Before:**
```dockerfile
libpq-dev \
&& docker-php-ext-install gd pdo pdo_pgsql
```

**After:**
```dockerfile
default-mysql-client \
&& docker-php-ext-install gd pdo pdo_mysql
```

### 2. ✅ Updated Entrypoint Script

**Removed PostgreSQL forcing:**
- No longer converts `mysql` to `pgsql`
- Default port changed from `5432` (PostgreSQL) to `3306` (MySQL)
- Now supports MySQL connection properly

## Environment Variables

Make sure these are set correctly in Render:

```env
DB_CONNECTION=mysql
DB_HOST=your_mysql_host
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

## Important Notes

1. **APP_KEY Format** - Still needs to be fixed:
   - Current: `APP_KEY=6d4f61b28a84bf8b9c733768104a7a8c` (wrong format)
   - Required: `APP_KEY=base64:...` (Laravel format)
   
   Generate a new key:
   ```bash
   cd backend
   php artisan key:generate
   ```

2. **Cache and Session Drivers** - Still recommended to use:
   - `CACHE_STORE=file` (instead of `database`)
   - `SESSION_DRIVER=cookie` (instead of `database`)
   
   This avoids requiring database tables for cache/sessions.

## Next Steps

1. **Deploy the updated Dockerfile** - It will now use MySQL
2. **Fix APP_KEY** in Render environment variables
3. **Verify database connection** - Make sure MySQL credentials are correct
4. **Test `/api/test` endpoint** - Should work after APP_KEY is fixed

The Dockerfile now matches your MySQL database setup!

