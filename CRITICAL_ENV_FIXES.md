# Critical Environment Variable Fixes

## Issues Found

### 1. ❌ APP_KEY Format is Wrong

**Current:** `APP_KEY=6d4f61b28a84bf8b9c733768104a7a8c`  
**Required:** `APP_KEY=base64:...`

Laravel requires APP_KEY to be in `base64:...` format, not a plain hex string. This is causing Laravel to crash.

### 2. ❌ Database Connection Mismatch

**Current:** `DB_CONNECTION=mysql`  
**Required:** `DB_CONNECTION=pgsql`

Your Dockerfile installs PostgreSQL (`pdo_pgsql`), but your config says MySQL. This mismatch causes database connection failures.

### 3. ❌ Cache/Session Drivers Require Database Tables

**Current:**
- `CACHE_STORE=database` (requires `cache` table)
- `SESSION_DRIVER=database` (requires `sessions` table)

These require database tables that may not exist. Using `file` and `cookie` avoids this.

## Fixes Applied

### 1. Updated Entrypoint Script

The entrypoint script now:
- ✅ Detects incorrect APP_KEY format and regenerates it
- ✅ Converts `DB_CONNECTION=mysql` to `pgsql` automatically
- ✅ Converts `CACHE_STORE=database` to `file` automatically
- ✅ Converts `SESSION_DRIVER=database` to `cookie` automatically

### 2. Manual Fixes Required

You still need to fix these in Render Dashboard:

#### Fix APP_KEY

1. Generate a new key locally:
   ```bash
   cd backend
   php artisan key:generate
   ```

2. Copy the key from `.env` file (it will look like `base64:...`)

3. In Render Dashboard → Backend Service → Environment:
   - Update `APP_KEY` to the new `base64:...` value

#### Fix Database Connection

In Render Dashboard → Backend Service → Environment:
- Change `DB_CONNECTION=mysql` to `DB_CONNECTION=pgsql`

#### Fix Cache and Session (Optional but Recommended)

In Render Dashboard → Backend Service → Environment:
- Change `CACHE_STORE=database` to `CACHE_STORE=file`
- Change `SESSION_DRIVER=database` to `SESSION_DRIVER=cookie`

## Quick Fix Steps

### Step 1: Generate New APP_KEY

```bash
cd backend
php artisan key:generate
```

Copy the entire `APP_KEY` line from `.env` (it will be `base64:...`)

### Step 2: Update Render Environment Variables

Go to Render Dashboard → Backend Service → Environment and update:

```env
# Fix APP_KEY (CRITICAL - must be base64:... format)
APP_KEY=base64:YOUR_NEW_KEY_HERE

# Fix database connection
DB_CONNECTION=pgsql

# Fix cache and session (recommended)
CACHE_STORE=file
SESSION_DRIVER=cookie
```

### Step 3: Redeploy

After updating environment variables, Render will automatically redeploy.

## Why These Fixes Are Needed

### APP_KEY Format

Laravel uses APP_KEY for:
- Encrypting cookies
- Encrypting session data
- Encrypting passwords
- Other security features

Without the correct format, Laravel cannot encrypt/decrypt data and crashes.

### Database Connection

Your Dockerfile installs:
- `pdo_pgsql` (PostgreSQL)
- NOT `pdo_mysql` (MySQL)

Using `mysql` connection with PostgreSQL driver causes connection failures.

### Cache/Session Drivers

Using `database` driver requires:
- `cache` table for cache
- `sessions` table for sessions
- `jobs` table for queues

If these tables don't exist, Laravel crashes. Using `file` and `cookie` avoids this.

## After Fixing

1. **Deploy the updated entrypoint script** (already done)
2. **Update environment variables in Render** (you need to do this)
3. **Redeploy** (automatic after env var changes)
4. **Test `/api/test` endpoint** - should work now

## Expected Results

After fixing:
- ✅ APP_KEY will be in correct format
- ✅ Database connection will use PostgreSQL
- ✅ Cache and sessions will work without database tables
- ✅ Laravel will start successfully
- ✅ `/api/test` endpoint will return JSON instead of 500

## Verification

After deploying, check:
1. Render logs - should show "✅ APP_KEY format is correct"
2. `/api/test` endpoint - should return JSON with system info
3. Other endpoints - should work now

The entrypoint script will automatically fix some issues, but you MUST fix the APP_KEY format manually in Render!

