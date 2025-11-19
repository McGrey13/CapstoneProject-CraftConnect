# Render Deployment Checklist

## Backend Deployment Steps

### 1. Create Web Service on Render
- [ ] Go to Render Dashboard → New → Web Service
- [ ] Connect GitHub repository
- [ ] Set root directory to `backend`
- [ ] Environment: PHP
- [ ] Build Command: `composer install --no-dev --optimize-autoloader`
- [ ] Start Command: `php artisan serve --host=0.0.0.0 --port=$PORT`

### 2. Set Environment Variables
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `APP_URL=https://capstoneproject-craftconnect.onrender.com`
- [ ] `APP_KEY` (generate with `php artisan key:generate`)
- [ ] Database credentials (PostgreSQL recommended)
- [ ] `CACHE_STORE=file`
- [ ] `SESSION_DRIVER=cookie`
- [ ] `SESSION_DOMAIN=.onrender.com`
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] `CORS_ALLOWED_ORIGINS=https://capstoneproject-craftconnect-1.onrender.com`
- [ ] `SANCTUM_STATEFUL_DOMAINS=capstoneproject-craftconnect-1.onrender.com`

### 3. Database Setup
- [ ] Create PostgreSQL database on Render
- [ ] Run migrations: `php artisan migrate --force` (in Render Shell)
- [ ] Create storage link: `php artisan storage:link` (in Render Shell)

### 4. Verify Deployment
- [ ] Backend URL is accessible: `https://capstoneproject-craftconnect.onrender.com`
- [ ] Health check endpoint works: `https://capstoneproject-craftconnect.onrender.com/up`
- [ ] API endpoint works: `https://capstoneproject-craftconnect.onrender.com/api/test`

## Frontend Deployment Steps

### 1. Create Static Site on Render
- [ ] Go to Render Dashboard → New → Static Site
- [ ] Connect GitHub repository
- [ ] Set root directory to `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`

### 2. Set Environment Variables
- [ ] `VITE_BACKEND_URL=https://capstoneproject-craftconnect.onrender.com`

### 3. Verify Deployment
- [ ] Frontend URL is accessible: `https://capstoneproject-craftconnect-1.onrender.com`
- [ ] Frontend can connect to backend API
- [ ] Login functionality works
- [ ] Cookies are being set correctly

## Common Issues & Solutions

### Issue: CORS Errors
**Solution:**
- Verify `CORS_ALLOWED_ORIGINS` includes frontend URL
- Check `supports_credentials` is `true` in `backend/config/cors.php`
- Run `php artisan config:clear` in Render Shell

### Issue: Authentication Not Working
**Solution:**
- Verify `SANCTUM_STATEFUL_DOMAINS` includes frontend domain
- Check `SESSION_DOMAIN=.onrender.com` is set
- Ensure `SESSION_SECURE_COOKIE=true` in production
- Check browser DevTools → Application → Cookies

### Issue: 500 Errors
**Solution:**
- Check Render logs for specific error
- Verify all environment variables are set
- Run `php artisan config:clear` and `php artisan cache:clear`
- Check database connection

### Issue: Cache Errors
**Solution:**
- Set `CACHE_STORE=file` (recommended for Render)
- Or create cache table if using database cache:
  ```bash
  php artisan cache:table
  php artisan migrate
  ```

## Testing Checklist

### Local Testing
- [ ] Backend runs on `http://localhost:8000`
- [ ] Frontend runs on `http://localhost:5173`
- [ ] Login works locally
- [ ] API calls work locally

### Production Testing
- [ ] Backend accessible at Render URL
- [ ] Frontend accessible at Render URL
- [ ] Login works in production
- [ ] API calls work in production
- [ ] Cookies are set correctly
- [ ] No CORS errors in console
- [ ] Images/assets load correctly

## URLs Reference

- **Backend**: https://capstoneproject-craftconnect.onrender.com
- **Frontend**: https://capstoneproject-craftconnect-1.onrender.com
- **Backend API**: https://capstoneproject-craftconnect.onrender.com/api
- **CSRF Cookie**: https://capstoneproject-craftconnect.onrender.com/sanctum/csrf-cookie

