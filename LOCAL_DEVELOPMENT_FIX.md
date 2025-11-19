# Local Development Fix - CORS Issue

## Issue

When running the frontend locally on `http://localhost:5173`, it was trying to access the production backend at `https://capstoneproject-craftconnect.onrender.com`, causing CORS errors because:
- The backend CORS configuration doesn't allow `http://localhost:5173` (only allows production frontend URL)
- Cross-origin requests from HTTP to HTTPS have additional restrictions

## Root Cause

The frontend API configuration was using `VITE_BACKEND_URL` even in local development, instead of using the Vite proxy.

## Fix Applied

### Updated `frontend/src/api.js`

**Changes:**
1. ✅ Added `isLocalDevelopment` detection based on `window.location.hostname`
2. ✅ In local development, use relative URLs (Vite proxy handles them)
3. ✅ In production, use the full backend URL from `VITE_BACKEND_URL`

**How it works:**

**Local Development (`http://localhost:5173`):**
- `api` instance uses: `/api` (relative, proxied by Vite to `http://localhost:8000/api`)
- `rootApi` instance uses: `` (empty, relative, proxied by Vite to `http://localhost:8000/sanctum`)

**Production (`https://capstoneproject-craftconnect-1.onrender.com`):**
- `api` instance uses: `https://capstoneproject-craftconnect.onrender.com/api`
- `rootApi` instance uses: `https://capstoneproject-craftconnect.onrender.com`

### Fixed `frontend/vite.config.js`

- ✅ Removed duplicate `build` key in `server` section

## How It Works Now

### Local Development Flow:

1. Frontend runs on: `http://localhost:5173`
2. Frontend makes request to: `/api/stores` (relative URL)
3. Vite proxy intercepts and forwards to: `http://localhost:8000/api/stores`
4. Backend responds (same origin, no CORS issues)

### Production Flow:

1. Frontend runs on: `https://capstoneproject-craftconnect-1.onrender.com`
2. Frontend makes request to: `https://capstoneproject-craftconnect.onrender.com/api/stores`
3. Backend responds with proper CORS headers

## Testing

### Local Development:

1. **Start Backend:**
   ```bash
   cd backend
   php artisan serve
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Check Browser Console:**
   You should see:
   ```
   🔧 API Configuration: {
     isLocalDevelopment: true,
     hostname: "localhost",
     apiBaseUrl: "/api",
     rootApiBaseUrl: "",
     ...
   }
   ```

4. **Verify:**
   - ✅ No CORS errors
   - ✅ CSRF cookie works
   - ✅ Products load
   - ✅ Stores load

### Production:

1. **Deploy Frontend to Render**
2. **Check Browser Console:**
   You should see:
   ```
   🔧 API Configuration: {
     isLocalDevelopment: false,
     hostname: "capstoneproject-craftconnect-1.onrender.com",
     apiBaseUrl: "https://capstoneproject-craftconnect.onrender.com/api",
     rootApiBaseUrl: "https://capstoneproject-craftconnect.onrender.com",
     ...
   }
   ```

## Important Notes

1. **Local Development:**
   - Don't set `VITE_BACKEND_URL` in local `.env` file (or leave it empty)
   - The Vite proxy will handle all API requests
   - Backend must be running on `http://localhost:8000`

2. **Production:**
   - Must set `VITE_BACKEND_URL=https://capstoneproject-craftconnect.onrender.com` in Render
   - Frontend will use this URL directly

3. **Vite Proxy:**
   - The proxy in `vite.config.js` handles:
     - `/api/*` → `http://localhost:8000/api/*`
     - `/sanctum/*` → `http://localhost:8000/sanctum/*`
     - `/storage/*` → `http://localhost:8000/storage/*`
     - `/images/*` → `http://localhost:8000/images/*`

## Troubleshooting

### If you still see CORS errors locally:

1. **Check if backend is running:**
   ```bash
   curl http://localhost:8000/api/test
   ```

2. **Check Vite proxy:**
   - Make sure `vite.config.js` has the proxy configuration
   - Restart the Vite dev server after changes

3. **Check browser console:**
   - Look for the `🔧 API Configuration:` log
   - Verify `isLocalDevelopment: true`
   - Verify `apiBaseUrl: "/api"` (relative, not full URL)

### If production doesn't work:

1. **Check `VITE_BACKEND_URL` in Render:**
   - Must be: `https://capstoneproject-craftconnect.onrender.com`
   - Must NOT have `/api` suffix
   - Must NOT have trailing slash

2. **Check browser console:**
   - Look for the `🔧 API Configuration:` log
   - Verify `isLocalDevelopment: false`
   - Verify URLs are correct

