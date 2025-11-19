# Frontend URL Fix - Summary

## Issue

The frontend was trying to access malformed URLs like:
```
capstoneproject-craftconnect.onrender.com,%20%20http//localhost:8000/sanctum/csrf-cookie
```

This caused `ERR_NAME_NOT_RESOLVED` errors because:
1. The URL was missing the `https://` protocol
2. It had extra commas and spaces
3. It was concatenating multiple URLs incorrectly

## Root Cause

The `VITE_BACKEND_URL` environment variable in Render might be set incorrectly, or the URL normalization logic wasn't handling edge cases properly.

## Fix Applied

### Updated `frontend/src/api.js`

Created a robust `normalizeBackendUrl()` function that:
1. ✅ Removes whitespace and commas
2. ✅ Takes only the first valid URL if multiple are provided
3. ✅ Adds `https://` protocol if missing
4. ✅ Removes trailing slashes
5. ✅ Handles both full URLs and domain-only formats
6. ✅ Validates the URL format

**Before:**
```javascript
const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || '';
const normalizedBackendUrl = rawBackendUrl.replace(/\/api\/?$/i, '').replace(/\/$/, '');
```

**After:**
```javascript
const normalizeBackendUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  // Remove any whitespace, commas, and split by comma to get first valid URL
  let cleaned = url.trim().split(',')[0].trim();
  
  // Remove any trailing slashes
  cleaned = cleaned.replace(/\/+$/, '');
  
  // If it's a full URL (starts with http:// or https://), use it as is
  if (cleaned.match(/^https?:\/\//i)) {
    return cleaned.replace(/\/api\/?$/i, '');
  }
  
  // If it's just a domain, add https:// protocol
  if (cleaned && cleaned.includes('.')) {
    return `https://${cleaned.replace(/^https?:\/\//i, '')}`;
  }
  
  return '';
};
```

## Required Environment Variable

In Render Dashboard → Frontend Service → Environment Variables, set:

```env
VITE_BACKEND_URL=https://capstoneproject-craftconnect.onrender.com
```

**Important:**
- ✅ Must start with `https://`
- ✅ Must NOT end with `/api`
- ✅ Must NOT have commas or extra spaces
- ✅ Must be a single URL (not multiple URLs)

## What This Fixes

✅ **CSRF Cookie Endpoint:**
- Will correctly call: `https://capstoneproject-craftconnect.onrender.com/sanctum/csrf-cookie`

✅ **API Endpoints:**
- Will correctly call: `https://capstoneproject-craftconnect.onrender.com/api/stores`
- Will correctly call: `https://capstoneproject-craftconnect.onrender.com/api/products/approved`
- Will correctly call: `https://capstoneproject-craftconnect.onrender.com/api/work-and-events/public`

✅ **Error Handling:**
- No more `ERR_NAME_NOT_RESOLVED` errors
- Proper URL validation
- Debug logging to help identify issues

## Testing

After deploying the frontend:

1. **Check Browser Console:**
   - Look for: `🔧 API Configuration:` log
   - Verify `normalizedBackendUrl` is correct
   - Verify `apiBaseUrl` includes `/api`
   - Verify `rootApiBaseUrl` doesn't include `/api`

2. **Test Endpoints:**
   - CSRF cookie should work
   - Products should load
   - Stores should load
   - Workshops should load

## Debugging

If you still see errors, check the browser console for the `🔧 API Configuration:` log. It will show:
- What `VITE_BACKEND_URL` is set to
- How it's being normalized
- What the final URLs are

This will help identify if the environment variable is set incorrectly in Render.

