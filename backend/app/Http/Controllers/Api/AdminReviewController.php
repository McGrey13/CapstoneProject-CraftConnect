<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AdminReviewController extends Controller
{
    /**
     * Get all reviews for admin management
     */
    public function getAllReviews(Request $request)
    {
        try {
            $reviews = Review::with([
                'user' => function($query) {
                    $query->select('userID', 'userName', 'userEmail', 'is_suspended', 'suspension_type', 'violation_points');
                },
                'product' => function($query) {
                    $query->select('product_id', 'productName');
                }
            ])
            ->latest()
            ->get();

            return response()->json([
                'success' => true,
                'data' => $reviews
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching reviews for admin:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Redact review content (censor text, images, or video)
     */
    public function redactReview(Request $request, $reviewId)
    {
        try {
            $review = Review::findOrFail($reviewId);
            
            $validated = $request->validate([
                'redact_type' => 'required|in:text,images,video,all',
                'reason' => 'nullable|string'
            ]);

            $redactType = $validated['redact_type'];
            $reason = $validated['reason'] ?? 'Offensive content';

            // Update redaction flags based on type
            if (in_array($redactType, ['text', 'all'])) {
                $review->is_redacted_text = true;
            }
            if (in_array($redactType, ['images', 'all'])) {
                $review->is_redacted_images = true;
            }
            if (in_array($redactType, ['video', 'all'])) {
                $review->is_redacted_video = true;
            }

            $review->redaction_reason = $reason;
            $review->redacted_at = now();
            // Ensure we store the numeric admin user ID (userID) if available; Auth::id() may return an identifier string
            $adminId = null;
            if (Auth::user()) {
                $adminId = Auth::user()->userID ?? Auth::id();
            } else {
                $adminId = is_numeric(Auth::id()) ? intval(Auth::id()) : null;
            }
            $review->redacted_by_admin = $adminId;
            $review->save();

            // Add violation points to reviewer
            $user = $review->user;
            if ($user) {
                $user->violation_points += 2; // 2 points for each redaction
                $user->last_violation_date = now();
                
                // Check if should be auto-suspended
                $this->checkAndSuspendUser($user);
                $user->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Review content redacted successfully',
                'review' => $review
            ]);
        } catch (\Exception $e) {
            Log::error('Error redacting review:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to redact review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Suspend a user for offensive content
     */
    public function suspendUser(Request $request, $userId)
    {
        try {
            $user = User::findOrFail($userId);
            
            $validated = $request->validate([
                'suspension_type' => 'required|in:temporary,permanent',
                'days' => 'nullable|integer|min:1|max:365',
                'reason' => 'nullable|string'
            ]);

            $suspensionType = $validated['suspension_type'];
            $days = $validated['days'] ?? 7;
            $reason = $validated['reason'] ?? 'Posted offensive content';

            $user->is_suspended = true;
            $user->suspension_type = $suspensionType;
            $user->suspension_reason = $reason;

            if ($suspensionType === 'temporary') {
                $user->suspension_until = now()->addDays($days);
            } else {
                $user->suspension_until = null; // Permanent - no end date
            }

            $user->save();

            Log::info("User {$userId} suspended: {$suspensionType}", [
                'suspension_reason' => $reason,
                'suspension_until' => $user->suspension_until
            ]);

            return response()->json([
                'success' => true,
                'message' => "User {$suspensionType} suspension applied successfully",
                'user' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Error suspending user:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to suspend user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Unsuspend a user
     */
    public function unsuspendUser(Request $request, $userId)
    {
        try {
            $user = User::findOrFail($userId);
            
            $user->is_suspended = false;
            $user->suspension_type = null;
            $user->suspension_until = null;
            $user->suspension_reason = null;
            $user->save();

            Log::info("User {$userId} unsuspended");

            return response()->json([
                'success' => true,
                'message' => 'User suspension removed successfully',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            Log::error('Error unsuspending user:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to unsuspend user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if user should be auto-suspended based on violation points
     */
    private function checkAndSuspendUser(User $user)
    {
        $VIOLATION_THRESHOLD_PERMANENT = 10;
        $VIOLATION_THRESHOLD_TEMPORARY = 5;

        if ($user->violation_points >= $VIOLATION_THRESHOLD_PERMANENT) {
            // Auto-suspend permanently
            $user->is_suspended = true;
            $user->suspension_type = 'permanent';
            $user->suspension_reason = 'Auto-suspended: Reached permanent suspension threshold';
            $user->suspension_until = null;
            
            Log::warning("User {$user->userID} auto-suspended permanently due to violation points ({$user->violation_points})");
        } elseif ($user->violation_points >= $VIOLATION_THRESHOLD_TEMPORARY && !$user->is_suspended) {
            // Auto-suspend temporarily for 14 days
            $user->is_suspended = true;
            $user->suspension_type = 'temporary';
            $user->suspension_reason = 'Auto-suspended: Reached temporary suspension threshold';
            $user->suspension_until = now()->addDays(14);
            
            Log::warning("User {$user->userID} auto-suspended temporarily due to violation points ({$user->violation_points})");
        }
    }

    /**
     * Reduce violation points daily if no new violations
     * This should be called via a scheduled task/artisan command
     */
    public function reduceViolationPoints()
    {
        try {
            $DAILY_REDUCTION = 1;
            $ONE_DAY_AGO = now()->subDay();

            // Get users with violation points and no violations in the last 24 hours
            $users = User::where('violation_points', '>', 0)
                ->where(function($query) use ($ONE_DAY_AGO) {
                    $query->whereNull('last_violation_date')
                          ->orWhere('last_violation_date', '<', $ONE_DAY_AGO);
                })
                ->get();

            foreach ($users as $user) {
                $user->violation_points = max(0, $user->violation_points - $DAILY_REDUCTION);
                
                // If points reduced to 0 and user was temporarily suspended, consider unsuspending
                if ($user->violation_points === 0 && $user->is_suspended && $user->suspension_type === 'temporary') {
                    $user->is_suspended = false;
                    $user->suspension_type = null;
                    $user->suspension_until = null;
                    Log::info("User {$user->userID} auto-unsuspended: violation points reduced to 0");
                }
                
                $user->save();
            }

            return response()->json([
                'success' => true,
                'message' => "Violation points reduced for {$users->count()} users"
            ]);
        } catch (\Exception $e) {
            Log::error('Error reducing violation points:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to reduce violation points',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check temporary suspension expiry and auto-unsuspend
     */
    public function checkSuspensionExpiry()
    {
        try {
            $now = now();
            
            // Find temporarily suspended users whose suspension has expired
            $expiredUsers = User::where('is_suspended', true)
                ->where('suspension_type', 'temporary')
                ->where('suspension_until', '<', $now)
                ->get();

            foreach ($expiredUsers as $user) {
                $user->is_suspended = false;
                $user->suspension_type = null;
                $user->suspension_until = null;
                $user->save();
                
                Log::info("User {$user->userID} auto-unsuspended: temporary suspension expired");
            }

            return response()->json([
                'success' => true,
                'message' => "Auto-unsuspended {$expiredUsers->count()} users"
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking suspension expiry:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to check suspension expiry',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
