# Environment Variables Setup

## Backend Environment Variables

Create a `.env` file in the `backend` directory with these variables:

### For Local Development

```env
APP_NAME=CraftConnect
APP_ENV=local
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=craftconnect
DB_USERNAME=root
DB_PASSWORD=

CACHE_STORE=file
SESSION_DRIVER=cookie
SESSION_LIFETIME=720
SESSION_DOMAIN=localhost
SESSION_SECURE_COOKIE=false

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://localhost:8000,http://127.0.0.1:5173,http://127.0.0.1:3000,http://127.0.0.1:8000
SANCTUM_STATEFUL_DOMAINS=localhost,localhost:3000,localhost:5173,127.0.0.1,127.0.0.1:8000,127.0.0.1:5173
```

### For Production (Render)

Set these in Render Dashboard → Environment Variables:

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
```

## Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

### For Local Development

```env
# Leave empty or comment out - Vite proxy handles API requests
# VITE_BACKEND_URL=
```

OR if you want to specify explicitly:

```env
VITE_BACKEND_URL=http://localhost:8000
```

### For Production (Render)

Set this in Render Dashboard → Environment Variables:

```env
VITE_BACKEND_URL=https://capstoneproject-craftconnect.onrender.com
```

**Important:** Environment variables in Vite must start with `VITE_` to be accessible in the frontend code.

## Quick Setup Commands

### Backend (Local)

```bash
cd backend
cp .env.example .env  # If .env.example exists, or create .env manually
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

### Frontend (Local)

```bash
cd frontend
# Create .env file manually (see above)
npm install
npm run dev
```


