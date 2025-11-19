# Deployment Guide for CraftConnect

This guide will help you deploy CraftConnect to Render and ensure it works both locally and in production.

## Prerequisites

- Render account (free tier works)
- GitHub repository with your code
- Database (PostgreSQL recommended for Render, MySQL works too)

## Backend Deployment (Render)

### Step 1: Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the `backend` folder as the root directory

### Step 2: Configure Build Settings

- **Name**: `capstoneproject-craftconnect` (or your preferred name)
- **Environment**: `PHP`
- **Build Command**: `composer install --no-dev --optimize-autoloader`
- **Start Command**: `php artisan serve --host=0.0.0.0 --port=$PORT`

### Step 3: Set Environment Variables in Render

Add these environment variables in the Render dashboard:

```env
APP_NAME=CraftConnect
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://capstoneproject-craftconnect.onrender.com

DB_CONNECTION=pgsql
DB_HOST=YOUR_DB_HOST
DB_PORT=5432
DB_DATABASE=YOUR_DB_NAME
DB_USERNAME=YOUR_DB_USER
DB_PASSWORD=YOUR_DB_PASSWORD

CACHE_STORE=file
SESSION_DRIVER=cookie
SESSION_LIFETIME=720
SESSION_DOMAIN=.onrender.com
SESSION_SECURE_COOKIE=true

CORS_ALLOWED_ORIGINS=https://capstoneproject-craftconnect-1.onrender.com
SANCTUM_STATEFUL_DOMAINS=capstoneproject-craftconnect-1.onrender.com

MAIL_MAILER=smtp
MAIL_HOST=YOUR_MAIL_HOST
MAIL_PORT=587
MAIL_USERNAME=YOUR_MAIL_USERNAME
MAIL_PASSWORD=YOUR_MAIL_PASSWORD
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@craftconnect.com
MAIL_FROM_NAME="CraftConnect"
```

**Important Notes:**
- Generate `APP_KEY` by running `php artisan key:generate` locally and copy the key
- Replace database credentials with your Render PostgreSQL database credentials
- `SESSION_DOMAIN=.onrender.com` allows cookies to work across Render subdomains
- `SESSION_SECURE_COOKIE=true` is required for HTTPS

### Step 4: Run Database Migrations

After the first deployment, run migrations:

1. Go to your Render service
2. Click "Shell" tab
3. Run: `php artisan migrate --force`

### Step 5: Create Storage Link

In the Render shell, run:
```bash
php artisan storage:link
```

## Frontend Deployment (Render)

### Step 1: Create a New Static Site on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Static Site"
3. Connect your GitHub repository
4. Select the `frontend` folder as the root directory

### Step 2: Configure Build Settings

- **Name**: `capstoneproject-craftconnect-1` (or your preferred name)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

### Step 3: Set Environment Variables

Add this environment variable:

```env
VITE_BACKEND_URL=https://capstoneproject-craftconnect.onrender.com
```

**Important:** The environment variable must start with `VITE_` to be accessible in the frontend code.

## Local Development Setup

### Backend Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Generate application key:
   ```bash
   php artisan key:generate
   ```

3. Configure your `.env` file with local database settings:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=craftconnect
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. Run migrations:
   ```bash
   php artisan migrate
   ```

5. Create storage link:
   ```bash
   php artisan storage:link
   ```

6. Start the server:
   ```bash
   php artisan serve
   ```

### Frontend Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. For local development, you can leave `VITE_BACKEND_URL` empty or comment it out. The Vite proxy will handle API requests.

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Environment-Specific Configuration

### Local Development

**Backend `.env`:**
- `APP_ENV=local`
- `APP_DEBUG=true`
- `APP_URL=http://localhost:8000`
- `SESSION_SECURE_COOKIE=false`
- `CORS_ALLOWED_ORIGINS` includes localhost URLs

**Frontend `.env`:**
- `VITE_BACKEND_URL` can be empty (uses Vite proxy) or `http://localhost:8000`

### Production (Render)

**Backend Environment Variables:**
- `APP_ENV=production`
- `APP_DEBUG=false`
- `APP_URL=https://capstoneproject-craftconnect.onrender.com`
- `SESSION_SECURE_COOKIE=true`
- `SESSION_DOMAIN=.onrender.com`
- `CORS_ALLOWED_ORIGINS` includes production frontend URL

**Frontend Environment Variables:**
- `VITE_BACKEND_URL=https://capstoneproject-craftconnect.onrender.com`

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check that `CORS_ALLOWED_ORIGINS` includes your frontend URL
2. Verify `supports_credentials` is `true` in `backend/config/cors.php`
3. Clear config cache: `php artisan config:clear`

### Authentication Issues

If authentication doesn't work:
1. Verify `SANCTUM_STATEFUL_DOMAINS` includes your frontend domain
2. Check that `SESSION_DOMAIN` is set correctly (`.onrender.com` for production)
3. Ensure `SESSION_SECURE_COOKIE=true` in production
4. Verify cookies are being set in browser DevTools

### 500 Errors

If you see 500 errors:
1. Check Render logs for specific error messages
2. Verify all environment variables are set correctly
3. Run `php artisan config:clear` and `php artisan cache:clear`
4. Check that database migrations have been run

### Cache Issues

If you see cache-related errors:
1. Set `CACHE_STORE=file` in production (database cache requires cache table)
2. Clear cache: `php artisan cache:clear`
3. Clear config: `php artisan config:clear`

## Testing

### Test Locally

1. Start backend: `cd backend && php artisan serve`
2. Start frontend: `cd frontend && npm run dev`
3. Open `http://localhost:5173`
4. Test login and other features

### Test Production

1. Deploy both backend and frontend to Render
2. Open your frontend URL: `https://capstoneproject-craftconnect-1.onrender.com`
3. Test login and other features
4. Check browser console for any errors

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Laravel Deployment Guide](https://laravel.com/docs/deployment)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)



