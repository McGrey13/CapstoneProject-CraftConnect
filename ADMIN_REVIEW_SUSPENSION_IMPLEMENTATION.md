# Admin Panel Enhancement - Complete Implementation Guide

## Overview
This document outlines all the new features added to the Admin Panel for managing orders and reviews with advanced moderation capabilities.

---

## 1. ORDERS MANAGEMENT ENHANCEMENTS

### Feature: Auto-Cancel Orders After 7 Days

**Location**: `frontend/src/Components/Admin/OrdersOverview.jsx`

**Functionality**:
- Automatically cancels pending/processing orders that are older than 7 days
- Runs check every minute in the background
- Admin can manually cancel orders using the existing cancel button
- Prevents orders from staying in pending state indefinitely

**Implementation**:
```javascript
// Auto-cancel check runs on component mount and every 60 seconds
// Function: isOrderOlderThan7Days() - checks if order date is > 7 days old
// Function: checkAndAutoCancelExpiredOrders() - cancels matching orders
```

**API Endpoint Used**:
- `POST /orders-test/{orderId}/cancel` - Existing endpoint

**Status Badge**: Shows "Cancelled" when auto-cancelled

---

## 2. REVIEW MANAGEMENT - VIOLATION POINTS & SUSPENSION SYSTEM

### Feature: Customer Violation Tracking

**Location**: `frontend/src/Components/Admin/AdminReviews.jsx`

**Violation Points System**:
- Each redaction = 2 violation points
- Displays user violation level and points in review list
- Tracks violation date automatically
- Points reduce by 1 per day if no new violations

**Violation Levels**:
1. **Low Risk** (1-4 points): Blue badge
2. **Medium Risk** (5+ points): Yellow badge  
3. **High Risk** (10+ points): Red badge - auto-suspend pending
4. **Temporarily Suspended**: Orange badge
5. **Permanently Suspended**: Red badge

**Auto-Suspension Rules**:
- **5 points**: Auto-temporary suspension (14 days)
- **10 points**: Auto-permanent suspension
- **0 points after reduction**: Auto-unsuspend (temporary only)

---

### Feature: Content Redaction System

**Admin Can Redact**:
- ✅ Comment text only
- ✅ Images only
- ✅ Video only
- ✅ All content combined
- ✅ Keeps star rating visible (cannot redact)

**Redaction Display**:
- Redacted comments show: "[Unavailable - Redacted by Admin]"
- Images/videos removed from display
- Star rating remains visible
- Redaction reason logged

**API Endpoint**:
- `POST /admin/reviews/{reviewId}/redact`
- Parameters: `redact_type`, `reason`
- Returns: Updated review with redaction flags

---

### Feature: User Suspension System

**Admin Can**:
- ✅ Temporarily suspend users (1-365 days)
- ✅ Permanently suspend users
- ✅ View suspension status in review list
- ✅ Unsuspend users anytime

**Suspension Types**:

1. **Temporary Suspension**:
   - Duration: 1-365 days (admin configurable)
   - Auto-lifts when period expires or violation points reach 0
   - Prevents user from posting reviews/comments

2. **Permanent Suspension**:
   - No expiry date
   - Manual unsuspend required
   - Prevents all platform activity

**Trigger Reasons**:
- Posted hate comments
- Multiple offensive content
- Reached violation threshold

**API Endpoints**:
- `POST /admin/users/{userId}/suspend` - Suspend user
- `POST /admin/users/{userId}/unsuspend` - Unsuspend user

---

## 3. DATABASE MIGRATIONS

### Migration 1: Add Suspension Fields to Users Table
**File**: `backend/database/migrations/2025_11_13_000001_add_suspension_fields_to_users_table.php`

**New Fields**:
```sql
- is_suspended (boolean, default: false)
- suspension_type (enum: 'temporary', 'permanent')
- suspension_until (timestamp, nullable)
- suspension_reason (text, nullable)
- violation_points (integer, default: 0)
- last_violation_date (timestamp, nullable)
```

### Migration 2: Add Redaction Fields to Reviews Table
**File**: `backend/database/migrations/2025_11_13_000002_add_redaction_fields_to_reviews_table.php`

**New Fields**:
```sql
- is_redacted_text (boolean, default: false)
- is_redacted_images (boolean, default: false)
- is_redacted_video (boolean, default: false)
- redaction_reason (text, nullable)
- redacted_at (timestamp, nullable)
- redacted_by_admin (unsignedBigInteger FK to users.userID)
```

---

## 4. BACKEND API CONTROLLER

### New Controller: AdminReviewController
**File**: `backend/app/Http/Controllers/Api/AdminReviewController.php`

**Methods**:

1. **getAllReviews()**
   - Fetches all reviews with user and product data
   - Includes suspension and violation info
   - Route: `GET /admin/reviews`

2. **redactReview()**
   - Redacts text/images/video/all
   - Adds violation points to reviewer
   - Route: `POST /admin/reviews/{reviewId}/redact`
   - Checks for auto-suspension threshold

3. **suspendUser()**
   - Temporary or permanent suspension
   - Sets suspension dates
   - Route: `POST /admin/users/{userId}/suspend`

4. **unsuspendUser()**
   - Removes all suspension flags
   - Route: `POST /admin/users/{userId}/unsuspend`

5. **reduceViolationPoints()** ⚙️ *Scheduled Task*
   - Reduces points by 1 per day if no violations in 24 hours
   - Auto-unsuspends temporary suspensions if points = 0
   - Route: `POST /admin/violation-points/reduce`
   - **Should run daily via cron/scheduler**

6. **checkSuspensionExpiry()** ⚙️ *Scheduled Task*
   - Auto-unsuspends temporary suspension if expired
   - Route: `POST /admin/suspension/check-expiry`
   - **Should run hourly via cron/scheduler**

---

## 5. API ROUTES

**File**: `backend/routes/api.php`

**New Routes** (all protected with `auth:sanctum`):
```php
GET    /admin/reviews                      - Get all reviews
POST   /admin/reviews/{reviewId}/redact    - Redact review
POST   /admin/users/{userId}/suspend       - Suspend user
POST   /admin/users/{userId}/unsuspend     - Unsuspend user
POST   /admin/violation-points/reduce      - Reduce violation points
POST   /admin/suspension/check-expiry      - Check expiry
```

---

## 6. MODEL UPDATES

### User Model
**File**: `backend/app/Models/User.php`

**New Fillable Fields**:
```php
'is_suspended',
'suspension_type',
'suspension_until',
'suspension_reason',
'violation_points',
'last_violation_date',
```

**New Casts**:
```php
'is_suspended' => 'boolean',
'suspension_until' => 'datetime',
'last_violation_date' => 'datetime',
```

### Review Model
**File**: `backend/app/Models/Review.php`

**New Fillable Fields**:
```php
'is_redacted_text',
'is_redacted_images',
'is_redacted_video',
'redaction_reason',
'redacted_at',
'redacted_by_admin',
```

**New Casts**:
```php
'is_redacted_text' => 'boolean',
'is_redacted_images' => 'boolean',
'is_redacted_video' => 'boolean',
'redacted_at' => 'datetime',
```

---

## 7. FRONTEND COMPONENTS

### OrdersOverview.jsx Updates
**New Functions**:
- `isOrderOlderThan7Days()` - Check if order > 7 days
- `checkAndAutoCancelExpiredOrders()` - Auto-cancel logic
- Auto-cancel runs on mount and every minute

### AdminReviews.jsx Updates
**New State Variables**:
```javascript
const [redactDialogOpen, setRedactDialogOpen] = useState(false);
const [redactType, setRedactType] = useState('text');
const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
const [suspensionType, setSuspensionType] = useState('temporary');
const [suspensionDays, setSuspensionDays] = useState(7);
```

**New Functions**:
- `handleRedactReview()` - Submit redaction request
- `handleSuspendUser()` - Submit suspension request
- `handleUnsuspendUser()` - Submit unsuspend request
- `getUserViolationStatus()` - Get violation badge info

**New UI Elements**:
- Redact Content dialog with type selector
- Suspend User dialog with type and duration
- Violation level badge in customer column
- Redacted comment indicator
- Suspend/Unsuspend button in actions menu

**New Dropdown Actions**:
- 🔴 Redact Content (with submenu)
- 🚫 Suspend User (if not suspended)
- 🔓 Unsuspend User (if suspended)

---

## 8. HOW TO USE

### For Admin Users

**Manage Reviews**:
1. Go to Admin Panel → Reviews & Ratings Management
2. View all reviews with customer violation status
3. Click "Redact Content" dropdown to censor specific content types
4. Click "Suspend User" to restrict account
5. Use "Unsuspend User" to restore access

**Auto-Cancellation**:
1. Go to Admin Panel → Orders Overview
2. System automatically cancels orders > 7 days old
3. Status changes to "Cancelled" automatically
4. Admins can manually cancel anytime

**Monitor Violations**:
- Customer column shows violation level
- Points reduce automatically each day
- Temporary suspensions lift automatically
- Permanent suspensions require manual unsuspend

---

## 9. SCHEDULED TASKS SETUP

**Required for Full Functionality** ⚙️

These tasks should run automatically:

### Daily: Reduce Violation Points
```bash
# Add to cron: Daily at 2:00 AM
php artisan schedule:run
# Call: POST /admin/violation-points/reduce
```

### Hourly: Check Suspension Expiry
```bash
# Add to cron: Every hour
php artisan schedule:run
# Call: POST /admin/suspension/check-expiry
```

**Laravel Scheduler Alternative**:
```php
// In app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    $schedule->post('/admin/violation-points/reduce')
        ->daily()
        ->at('02:00');
        
    $schedule->post('/admin/suspension/check-expiry')
        ->hourly();
}
```

---

## 10. CONFIGURATION

### Violation Points Constants
**File**: `frontend/src/Components/Admin/AdminReviews.jsx`

```javascript
const VIOLATION_THRESHOLDS = {
    TEMPORARY_SUSPENSION: 5,      // Auto-suspend at 5 points
    PERMANENT_SUSPENSION: 10,     // Auto-suspend at 10 points
    DAILY_REDUCTION: 1            // Reduce by 1 point per day
};
```

**Points Per Action**:
- Redaction: +2 points
- Daily reduction: -1 point (if no violations)

---

## 11. SCREENSHOTS & FLOW

### Admin Review Management Flow
```
1. Admin views reviews list
   ↓
2. Sees customer with violation level (Low/Medium/High/Suspended)
   ↓
3. Clicks dropdown menu
   ├─ "View Details" → See full review
   ├─ "Redact Content" → Choose what to censor
   ├─ "Suspend User" → Set duration
   └─ "Flag Review" → Legacy flagging
   ↓
4. Redaction adds violation points
   ↓
5. System auto-suspends if threshold reached
   ↓
6. Points reduce daily, auto-unsuspend if temporary
```

---

## 12. SECURITY NOTES

✅ All endpoints require `auth:sanctum` middleware
✅ Only admin users can redact/suspend
✅ Suspension changes logged
✅ Violation points immutable (can't be manually set)
✅ Permanent suspensions require manual intervention

---

## 13. TESTING CHECKLIST

- [ ] Run migrations: `php artisan migrate`
- [ ] Test redact review endpoint
- [ ] Test suspend user endpoint
- [ ] Test unsuspend user endpoint
- [ ] Verify violation points increase on redaction
- [ ] Verify auto-suspension at thresholds
- [ ] Test daily point reduction
- [ ] Test suspension expiry check
- [ ] Verify order auto-cancel after 7 days
- [ ] Check UI badges display correctly
- [ ] Confirm redacted content shows "[Unavailable]"

---

## 14. FUTURE ENHANCEMENTS

- [ ] Batch redaction for multiple reviews
- [ ] Appeal system for suspended users
- [ ] Notification to user on suspension
- [ ] Admin dashboard showing violation statistics
- [ ] Custom violation thresholds per category
- [ ] Time-based unlock for temporary suspensions
- [ ] Review restoration option
- [ ] Violation history export

---

**Implementation Date**: November 13, 2025
**Status**: Ready for migration and testing
