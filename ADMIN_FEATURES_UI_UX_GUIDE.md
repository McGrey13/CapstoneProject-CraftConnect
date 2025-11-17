# Admin Features - UI/UX Guide

## 1. Orders Overview - Auto-Cancel Feature

### Visual Changes
```
ORDER LIST
┌─────────────────────────────────────────────────────────────┐
│ Order ID  │ Customer   │ Date       │ Status      │ Actions │
├─────────────────────────────────────────────────────────────┤
│ ORD-001   │ John Doe   │ 10/15/2024 │ ✅ Pending  │ Cancel  │
│ ORD-002   │ Jane Smith │ 10/01/2024 │ ❌ CANCELLED│  (auto) │
│ ORD-003   │ Bob Wilson │ 09/20/2024 │ ❌ CANCELLED│  (auto) │
└─────────────────────────────────────────────────────────────┘

* Orders > 7 days old automatically changed to "CANCELLED"
* Auto-cancel runs every 60 seconds
* Manual cancel button still available
```

### Behind the Scenes
- `isOrderOlderThan7Days()` function checks date difference
- `checkAndAutoCancelExpiredOrders()` runs on mount + every minute
- Status updates in real-time if auto-cancelled

---

## 2. Reviews & Ratings - Admin Actions

### Customer Column Enhancement

#### BEFORE:
```
Customer: John Doe
john@email.com
```

#### AFTER:
```
Customer: John Doe
john@email.com

🔵 Low Risk (2 pts)        ← NEW! Violation indicator
```

### Violation Status Badges

| Status | Badge | Color | Meaning |
|--------|-------|-------|---------|
| No violations | — | — | Clean record |
| Low Risk | 🔵 Low Risk (1-4 pts) | Blue | Minor issues |
| Medium Risk | 🟡 Medium Risk (5-9 pts) | Yellow | Close to temp suspension |
| High Risk | 🔴 High Risk (10+ pts) | Red | Close to permanent suspension |
| Temp Suspended | 🟠 Temporarily Suspended | Orange | Can't post for X days |
| Perm Suspended | 🔴 Permanently Suspended | Red | Banned permanently |

---

## 3. Review Actions Menu

### BEFORE:
```
Actions ▼
├─ View Details
├─ Flag Review
└─ Unflag Review
```

### AFTER:
```
Actions ▼
├─ View Details
├─ 📝 Redact Content          ← NEW!
├─ 🚫 Suspend User            ← NEW!
├─ 🔓 Unsuspend User          ← NEW! (if suspended)
├─ 🚩 Flag Review
└─ 🛡️ Unflag Review
```

---

## 4. Redact Content Dialog

### Dialog Layout

```
┌─────────────────────────────────────────┐
│ Redact Review Content                   │
├─────────────────────────────────────────┤
│ Select what content to redact from this │
│ review. The rating will not be affected.│
│                                         │
│ ⊙ Comment Only      ← Only hide text    │
│ ⊙ Images Only       ← Remove images     │
│ ⊙ Video Only        ← Remove video      │
│ ⊙ All Content       ← Hide everything   │
│   except rating                         │
│                                         │
│ ℹ️ The star rating cannot be redacted   │
│   and will remain visible.              │
│                                         │
│ [Cancel] [Redact Content]               │
└─────────────────────────────────────────┘
```

### Effect on Review Display

#### Comment Redaction
```
BEFORE:
Comment: "This product is terrible! Complete waste of money!"

AFTER:
Comment: [Unavailable - Redacted by Admin]
         (italic, light gray background)
```

#### Images Redaction
```
BEFORE:
📸 4 images

AFTER:
(Images section removed entirely)
```

#### Video Redaction
```
BEFORE:
🎬 Video

AFTER:
(Video section removed entirely)
```

#### All Content Redaction
```
BEFORE:
⭐⭐⭐⭐⭐
"This is awesome!"
📸 2 images
🎬 1 video

AFTER:
⭐⭐⭐⭐⭐  ← Only this remains
(Everything else redacted)
```

---

## 5. Suspend User Dialog

### Dialog Layout

```
┌─────────────────────────────────────────┐
│ Suspend User Account                    │
├─────────────────────────────────────────┤
│ Suspend user for posting offensive or   │
│ hate comments                           │
│                                         │
│ User: Jane Doe                          │
│ jane@email.com                          │
│                                         │
│ Suspension Type:                        │
│ ⊙ Temporary Suspension                  │
│   └─ Duration: [7] days (1-365)         │
│                                         │
│ ⊙ Permanent Suspension                  │
│   └─ No expiration                      │
│                                         │
│ ⚠️ This action will prevent the user    │
│   from posting reviews or comments.     │
│                                         │
│ [Cancel] [Suspend User]                 │
└─────────────────────────────────────────┘
```

### Flow After Suspension

```
Step 1: Admin clicks "Suspend User"
        ↓
Step 2: Dialog opens, admin selects type and duration
        ↓
Step 3: Admin clicks "Suspend User"
        ↓
Step 4: API call sent: POST /admin/users/{id}/suspend
        ↓
Step 5: User marked as suspended
        └─ is_suspended = true
        └─ suspension_type = 'temporary' or 'permanent'
        └─ suspension_until = date (if temporary)
        ↓
Step 6: Review list updates
        ├─ Badge changes to 🟠 Temporarily Suspended
        ├─ Actions menu changes "Suspend User" → "Unsuspend User"
        └─ User cannot post reviews/comments
```

---

## 6. Review Detail View - Enhanced

### Review Information Panel

```
┌─────────────────────────────────────────┐
│ Review Details                          │
│ Review ID: #12345                       │
├─────────────────────────────────────────┤
│                                         │
│ Product: Handmade Ceramic Vase          │
│ Customer: John Doe                      │
│           john@email.com                │
│           🔵 Low Risk (2 pts)  ← NEW!   │
│                                         │
│ Rating: ⭐⭐⭐⭐⭐                      │
│ Date: Nov 13, 2025 @ 10:30 AM          │
│                                         │
│ Comment:                                │
│ "Amazing quality! Exceeded expectations"│
│ (or: [Unavailable - Redacted by Admin]) │
│                                         │
│ Images: 3                               │
│ [Image 1] [Image 2] [Image 3]          │
│                                         │
│ Video: 1                                │
│ [▶ Play Video]                          │
│                                         │
│ [Close]                                 │
└─────────────────────────────────────────┘
```

---

## 7. Violation Points Timeline

### Example User Journey

```
Day 1: User posts review with offensive language
       └─ Admin redacts text
          └─ violation_points = 2
          └─ Status: 🔵 Low Risk

Day 3: Another review flagged and redacted
       └─ violation_points = 4
       └─ Status: 🔵 Low Risk

Day 6: User posts hate comments, redacted
       └─ violation_points = 6 (exceeded 5 threshold!)
       └─ AUTO-SUSPENSION: Temporarily suspended 14 days
       └─ Status: 🟠 Temporarily Suspended
       └─ User cannot post

Day 7-10: No new violations, daily reduction
       └─ Day 8: violation_points = 5
       └─ Day 9: violation_points = 4  
       └─ Day 10: violation_points = 3
          └─ Status: 🔵 Low Risk (back)

Day 14: Suspension expires OR points hit 0
       └─ is_suspended = false
       └─ suspension_type = null
       └─ AUTO-UNSUSPEND
       └─ User can post again
       └─ Status: 🔵 Low Risk
```

---

## 8. Admin Actions Flowchart

```
┌─────────────────────────────────┐
│  Admin Views Reviews            │
└────────────┬────────────────────┘
             │
             ├─→ [View Details]
             │   └─→ See full review info
             │
             ├─→ [Redact Content]  ✅ NEW
             │   ├─→ Select type
             │   │   ├─ Text only
             │   │   ├─ Images only
             │   │   ├─ Video only
             │   │   └─ All content
             │   └─→ +2 violation pts
             │       ├─ Check thresholds
             │       └─ Auto-suspend if needed
             │
             ├─→ [Suspend User]  ✅ NEW
             │   ├─→ Temporary (1-365 days)
             │   │   └─ Expires after period
             │   └─→ Permanent
             │       └─ Manual unsuspend only
             │
             ├─→ [Unsuspend User]  ✅ NEW
             │   └─→ Restore access
             │
             ├─→ [Flag Review] (existing)
             │   └─→ Mark as inappropriate
             │
             └─→ [Unflag Review] (existing)
                 └─→ Revert flag
```

---

## 9. Color Scheme

| Element | Color | Hex |
|---------|-------|-----|
| Low Risk Badge | Light Blue | #E0F2FE |
| Medium Risk Badge | Light Yellow | #FEF3C7 |
| High Risk Badge | Light Red | #FEE2E2 |
| Temp Suspended | Light Orange | #FED7AA |
| Perm Suspended | Light Red | #FEE2E2 |
| Redacted Text | Light Gray | #F3F4F6 |
| Action Buttons | Primary Red | #9F2936 |

---

## 10. Responsive Design

### Mobile (< 768px)
- Actions menu becomes vertical dropdown
- Violation badges stack below customer name
- Dialog dialogs take full screen width
- Redaction type uses full-width radio buttons

### Tablet (768px - 1024px)
- Reviews table slightly compressed
- Actions menu with icons only (tooltip on hover)
- Dialog normal size

### Desktop (> 1024px)
- Full table with all columns
- Action menu with icons + text
- Dialog centered

---

## 11. Accessibility Features

✅ Keyboard navigation
- Tab through action buttons
- Enter to open dialogs
- Escape to close dialogs

✅ Screen reader support
- Badges have descriptive text
- Dialog titles announced
- Icons have aria-labels

✅ Color contrast
- All text meets WCAG AA standards
- Icons have text labels
- Status indicators use color + text

---

## 12. Animation/Transitions

```
Redact Dialog:
┌─────────────────┐
│                 │  Fade in (200ms)
│  [Dialog]       │
│                 │
└─────────────────┘

Suspension Dialog:
┌─────────────────┐
│                 │  Slide up (300ms)
│  [Dialog]       │
│                 │
└─────────────────┘

Badge Update:
Normal ──[fade]──→ 🔵 Low Risk (badge appears)

Auto-Cancel:
Pending ──[update]──→ Cancelled (status changes)
```

---

## 13. Toast Notifications

```
Success:
┌────────────────────────────────┐
│ ✓ Review content redacted      │
│   successfully                 │
└────────────────────────────────┘
(Green, 3 seconds, auto-dismiss)

Success:
┌────────────────────────────────┐
│ ✓ User temporarily suspended   │
│   successfully                 │
└────────────────────────────────┘

Error:
┌────────────────────────────────┐
│ ✗ Error redacting review       │
│   Please try again             │
└────────────────────────────────┘
(Red, stays visible, clickable close)
```

---

## 14. Empty States

### No Reviews
```
┌──────────────────────────────┐
│         💬                   │
│  No reviews found            │
│                              │
│  [Refresh]                   │
└──────────────────────────────┘
```

### No Violations
```
✓ Clean record - no violations logged
```

---

**UI/UX Implementation Complete!** ✅
