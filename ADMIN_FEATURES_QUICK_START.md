# Quick Setup Guide - Admin Features

## What Was Added

✅ **Order Management**
- Auto-cancel orders after 7 days
- Manual cancel option
- Status tracking

✅ **Review Management**
- Redact comments, images, or videos separately
- Star ratings stay visible
- Admin logging of actions

✅ **User Suspension System**
- Temporary suspension (1-365 days)
- Permanent suspension
- Auto-suspension at violation thresholds
- Auto-unsuspension when period expires

✅ **Violation Points System**
- Track user violations
- Points reduce daily (-1 per day)
- Auto-suspend at 5 points (temp, 14 days)
- Auto-suspend at 10 points (permanent)
- Visual badges (Low/Medium/High/Suspended)

---

## Installation Steps

### 1. Backend Setup

```bash
cd backend

# Run migrations
php artisan migrate

# Clear cache
php artisan cache:clear
```

### 2. Frontend Ready
No additional setup needed - components are already updated.

### 3. Verify API Routes

```bash
# Check routes are registered
php artisan route:list | grep admin/reviews
php artisan route:list | grep admin/users
```

---

## New Database Tables/Fields

### Users Table (NEW FIELDS)
```
- is_suspended (boolean)
- suspension_type (temporary/permanent)
- suspension_until (datetime)
- suspension_reason (text)
- violation_points (integer)
- last_violation_date (datetime)
```

### Reviews Table (NEW FIELDS)
```
- is_redacted_text (boolean)
- is_redacted_images (boolean)
- is_redacted_video (boolean)
- redaction_reason (text)
- redacted_at (datetime)
- redacted_by_admin (FK to users)
```

---

## API Endpoints Reference

### Get All Reviews (Admin)
```
GET /api/admin/reviews
Authentication: Required (admin)
Response: Array of reviews with user violation info
```

### Redact Review
```
POST /api/admin/reviews/{reviewId}/redact
Payload: {
  "redact_type": "text|images|video|all",
  "reason": "Offensive content" (optional)
}
Effect: Adds 2 violation points to reviewer
```

### Suspend User
```
POST /api/admin/users/{userId}/suspend
Payload: {
  "suspension_type": "temporary|permanent",
  "days": 7 (only for temporary),
  "reason": "Posted offensive content" (optional)
}
```

### Unsuspend User
```
POST /api/admin/users/{userId}/unsuspend
Effect: Removes suspension immediately
```

### Reduce Violation Points (Scheduled)
```
POST /api/admin/violation-points/reduce
Effect: Reduces points by 1 for users with no new violations in 24hrs
* Run daily via cron
```

### Check Suspension Expiry (Scheduled)
```
POST /api/admin/suspension/check-expiry
Effect: Auto-unsuspends expired temporary suspensions
* Run hourly via cron
```

---

## Usage Instructions

### For Admin - Redacting a Review

1. Go to Admin Panel → Reviews & Ratings Management
2. Find the review to redact
3. Click "..." menu → "Redact Content"
4. Select redaction type:
   - **Comment Only**: Hides comment text
   - **Images Only**: Removes images
   - **Video Only**: Removes video
   - **All Content**: Hides everything except rating
5. Click "Redact Content"
6. ✅ Done! Redaction logged, violation points added

### For Admin - Suspending a User

1. In review details, click "..." menu → "Suspend User"
2. Choose suspension type:
   - **Temporary**: Select duration (1-365 days)
   - **Permanent**: No expiration
3. Click "Suspend User"
4. ✅ User account is now restricted

### For Admin - Auto-Cancel Orders

1. Orders are checked automatically every minute
2. Any order > 7 days old (not delivered/cancelled) is auto-cancelled
3. Status changes to "Cancelled" automatically
4. Manual cancel still available for immediate action

---

## Violation Points Flow

```
Action: Redact Review
├─ Points +2 for reviewer
├─ Points -1 daily (if no new violations)
├─ At 5 points: Auto-suspend 14 days
└─ At 10 points: Auto-suspend permanent

Auto-Unsuspend:
├─ Temporary: When suspension expires OR points reach 0
└─ Permanent: Manual only
```

---

## Status Badges

| Badge | Points | Meaning |
|-------|--------|---------|
| 🔵 Low Risk | 1-4 | User has minor violations |
| 🟡 Medium Risk | 5-9 | User at temporary suspension threshold |
| 🔴 High Risk | 10+ | User at permanent suspension threshold |
| 🟠 Temporarily Suspended | - | Restricted for limited time |
| 🔴 Permanently Suspended | - | Account permanently restricted |

---

## Scheduled Tasks (Important!)

For full functionality, add these to your cron schedule:

### Option 1: Linux Cron

```bash
# Edit crontab
crontab -e

# Add lines:
# Run daily at 2:00 AM
0 2 * * * cd /path/to/project/backend && php artisan schedule:run

# Or for individual tasks:
0 2 * * * curl http://localhost:8000/api/admin/violation-points/reduce
0 * * * * curl http://localhost:8000/api/admin/suspension/check-expiry
```

### Option 2: Laravel Scheduler

Add to `app/Console/Kernel.php`:

```php
protected function schedule(Schedule $schedule)
{
    // Reduce violation points daily
    $schedule->call(function () {
        \App\Http\Controllers\Api\AdminReviewController::reduceViolationPoints();
    })->daily()->at('02:00');
    
    // Check suspension expiry hourly
    $schedule->call(function () {
        \App\Http\Controllers\Api\AdminReviewController::checkSuspensionExpiry();
    })->hourly();
}
```

Then run:
```bash
# In your deployment, run scheduler
php artisan schedule:run
```

---

## Testing

### Test Redaction
```bash
# 1. Get a review
curl http://localhost:8000/api/admin/reviews \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Redact it
curl -X POST http://localhost:8000/api/admin/reviews/1/redact \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "redact_type": "text",
    "reason": "Offensive language"
  }'

# 3. Check user violation points increased
curl http://localhost:8000/api/admin/reviews \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Suspension
```bash
# Suspend user temporarily for 7 days
curl -X POST http://localhost:8000/api/admin/users/1/suspend \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "suspension_type": "temporary",
    "days": 7,
    "reason": "Posted hate comments"
  }'

# Verify suspension
curl http://localhost:8000/api/admin/reviews \
  -H "Authorization: Bearer YOUR_TOKEN"
# Check user.is_suspended = true
```

---

## Troubleshooting

**Q: Migration fails with "SQLSTATE[HY000]"**
A: Check MySQL is running. If tables already exist, run: `php artisan migrate:refresh`

**Q: Redaction points not showing**
A: Ensure you're fetching reviews via `/api/admin/reviews` (not product reviews)

**Q: Auto-suspension not working**
A: Check violation points are being added. Also ensure migration ran: `php artisan migrate:status`

**Q: Orders not auto-cancelling**
A: Check browser console for errors. Ensure orders are > 7 days old. Manual cancel still works.

---

## Files Modified/Created

### Frontend
- `frontend/src/Components/Admin/OrdersOverview.jsx` - Auto-cancel logic
- `frontend/src/Components/Admin/AdminReviews.jsx` - Redaction & suspension UI

### Backend
- `backend/app/Http/Controllers/Api/AdminReviewController.php` - NEW
- `backend/app/Models/User.php` - Added fields
- `backend/app/Models/Review.php` - Added fields
- `backend/routes/api.php` - New admin routes
- `backend/database/migrations/2025_11_13_000001_*.php` - NEW
- `backend/database/migrations/2025_11_13_000002_*.php` - NEW

### Documentation
- `ADMIN_REVIEW_SUSPENSION_IMPLEMENTATION.md` - Full documentation

---

## Support

For issues or questions, check:
1. Backend logs: `backend/storage/logs/laravel.log`
2. Browser console: F12 → Console tab
3. Network tab: Check API responses
4. Database: Verify new columns exist

---

**Ready to deploy!** ✅
