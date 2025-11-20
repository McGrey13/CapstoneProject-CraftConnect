<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ReviewController extends Controller
{
    /**
     * Get all reviews for a product
     *
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function index($productId)
    {
        try {
            $product = Product::findOrFail($productId);
            $reviews = $product->reviews()
                ->with(['user' => function($query) {
                    $query->select('userID', 'userName');
                }])
                ->latest()
                ->get();

            return response()->json($reviews);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check for offensive language in text (English and Tagalog)
     */
    private function containsOffensiveLanguage($text)
    {
        if (empty($text)) {
            return false;
        }

        // List of offensive words/phrases in English
        $offensiveWordsEnglish = [
            'damn', 'hell', 'crap', 'stupid', 'idiot', 'moron', 'fool',
            'hate', 'kill', 'die', 'death', 'murder', 'violence',
            'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'piss',
            'crap', 'damn', 'hell', 'stupid', 'idiot', 'moron',
            // Add more offensive terms as needed
        ];

        // List of offensive words/phrases in Tagalog
        $offensiveWordsTagalog = [
            'putang ina', 'putangina', 'puta', 'tang ina', 'tangina',
            'gago', 'gaga', 'bobo', 'tanga', 'ulol', 'ulol ka',
            'walang hiya', 'walanghiya', 'hayop', 'hayop ka',
            'tarantado', 'tarantada', 'lintik', 'lintik ka',
            'leche', 'lechugas', 'pakshet', 'pakyu', 'pak yu',
            'sira ulo', 'siraulo', 'baliw', 'baliw ka',
            'kupal', 'kupal ka', 'buwisit', 'buwisit ka',
            // Add more Tagalog offensive terms as needed
        ];

        $textLower = strtolower($text);
        
        // Check English offensive words
        foreach ($offensiveWordsEnglish as $word) {
            if (strpos($textLower, $word) !== false) {
                return true;
            }
        }

        // Check Tagalog offensive words
        foreach ($offensiveWordsTagalog as $word) {
            if (strpos($textLower, $word) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Redact offensive content from text
     */
    private function redactOffensiveContent($text)
    {
        if (empty($text)) {
            return $text;
        }

        // List of offensive words (same as detection)
        $offensiveWordsEnglish = [
            'damn', 'hell', 'crap', 'stupid', 'idiot', 'moron', 'fool',
            'hate', 'kill', 'die', 'death', 'murder', 'violence',
            'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'piss',
        ];

        $offensiveWordsTagalog = [
            'putang ina', 'putangina', 'puta', 'tang ina', 'tangina',
            'gago', 'gaga', 'bobo', 'tanga', 'ulol', 'ulol ka',
            'walang hiya', 'walanghiya', 'hayop', 'hayop ka',
            'tarantado', 'tarantada', 'lintik', 'lintik ka',
            'leche', 'lechugas', 'pakshet', 'pakyu', 'pak yu',
            'sira ulo', 'siraulo', 'baliw', 'baliw ka',
            'kupal', 'kupal ka', 'buwisit', 'buwisit ka',
        ];

        $textLower = strtolower($text);
        $redactedText = $text;
        $allOffensiveWords = array_merge($offensiveWordsEnglish, $offensiveWordsTagalog);

        // Sort by length (longest first) to handle multi-word phrases correctly
        usort($allOffensiveWords, function($a, $b) {
            return strlen($b) - strlen($a);
        });

        foreach ($allOffensiveWords as $word) {
            // Case-insensitive replacement with asterisks
            $pattern = '/\b' . preg_quote($word, '/') . '\b/i';
            $replacement = str_repeat('*', strlen($word));
            $redactedText = preg_replace($pattern, $replacement, $redactedText);
        }

        return $redactedText;
    }

    /**
     * Check if user should be auto-suspended based on violation points
     */
    private function checkAndSuspendUser($user)
    {
        $VIOLATION_THRESHOLD_PERMANENT = 10;
        $VIOLATION_THRESHOLD_TEMPORARY = 5;

        if ($user->violation_points >= $VIOLATION_THRESHOLD_PERMANENT) {
            // Auto-suspend permanently
            $user->is_suspended = true;
            $user->suspension_type = 'permanent';
            $user->suspension_reason = 'Auto-suspended: Reached permanent suspension threshold due to offensive language violations';
            $user->suspension_until = null;
            
            Log::warning("User {$user->userID} auto-suspended permanently due to violation points ({$user->violation_points})");
        } elseif ($user->violation_points >= $VIOLATION_THRESHOLD_TEMPORARY && !$user->is_suspended) {
            // Auto-suspend temporarily for 14 days
            $user->is_suspended = true;
            $user->suspension_type = 'temporary';
            $user->suspension_reason = 'Auto-suspended: Reached temporary suspension threshold due to offensive language violations';
            $user->suspension_until = now()->addDays(14);
            
            Log::warning("User {$user->userID} auto-suspended temporarily due to violation points ({$user->violation_points})");
        }
    }

    /**
     * Store a newly created review in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, $product)
    {
        try {
            // Handle both route parameter name variations
            $productId = is_numeric($product) ? $product : $product->product_id ?? $product;
            
            $validator = Validator::make($request->all(), [
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:1000',
                'review' => 'nullable|string|max:1000', // allow alternate field name from frontend
                'images' => 'nullable|array|max:5',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max per image
                'video' => 'nullable|file|mimes:mp4,mov,avi|max:20480', // 20MB max for video
                'order_id' => 'nullable|integer', // Allow order_id but don't require it
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $product = Product::findOrFail($productId);
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated'
                ], 401);
            }

            // Choose comment content from either 'comment' or 'review'
            $commentText = $request->input('comment', $request->input('review'));
            $originalCommentText = $commentText;
            $hasOffensiveLanguage = false;
            $redactedCommentText = $commentText;

            // Check for offensive language
            if ($commentText && $this->containsOffensiveLanguage($commentText)) {
                $hasOffensiveLanguage = true;
                // Redact offensive content
                $redactedCommentText = $this->redactOffensiveContent($commentText);
                
                // Notify admins about the offensive language attempt
                try {
                    $product = \App\Models\Product::find($productId);
                    $customerName = $user->userName ?? 'Unknown Customer';
                    $productName = $product ? $product->productName : 'Unknown Product';
                    
                    \App\Services\NotificationService::notifyAdminsFlaggedReview(
                        null, // Review ID is null since review is not saved yet
                        $productName,
                        $customerName,
                        $originalCommentText
                    );
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning('Failed to send admin notification for offensive review: ' . $e->getMessage());
                }
            }

            // Handle image uploads
            $imagePaths = [];
            if ($request->hasFile('images')) {
                $images = $request->file('images');
                // Handle both array and single file
                if (!is_array($images)) {
                    $images = [$images];
                }
                foreach ($images as $image) {
                    if ($image && $image->isValid()) {
                        $path = $image->store('reviews/images', 'public');
                        $imagePaths[] = $path;
                    }
                }
            }

            // Handle video upload
            $videoPath = null;
            if ($request->hasFile('video')) {
                $videoPath = $request->file('video')->store('reviews/videos', 'public');
            }

            // Check if user has already reviewed this product
            $existingReview = Review::where('user_id', $user->userID)
                ->where('product_id', $productId)
                ->first();

            // If offensive language detected, flag and redact the review
            if ($hasOffensiveLanguage) {
                // Apply violation points and check for suspension
                $user->violation_points += 2; // 2 points for offensive language
                $user->last_violation_date = now();
                $this->checkAndSuspendUser($user);
                $user->save();
            }

            if ($existingReview) {
                // Delete old images and video if updating
                if ($existingReview->images) {
                    foreach ($existingReview->images as $oldImage) {
                        if (Storage::disk('public')->exists($oldImage)) {
                            Storage::disk('public')->delete($oldImage);
                        }
                    }
                }
                if ($existingReview->video_path && Storage::disk('public')->exists($existingReview->video_path)) {
                    Storage::disk('public')->delete($existingReview->video_path);
                }

                // Update existing review
                $existingReview->rating = $request->rating;
                $existingReview->comment = $redactedCommentText; // Use redacted text
                $existingReview->review_date = now();
                $existingReview->images = !empty($imagePaths) ? $imagePaths : null;
                $existingReview->video_path = $videoPath;
                
                // Auto-flag and redact if offensive language detected
                if ($hasOffensiveLanguage) {
                    $existingReview->is_flagged = true;
                    $existingReview->flag_reason = 'Auto-flagged: Contains offensive language (English/Tagalog)';
                    $existingReview->is_redacted_text = true;
                    $existingReview->redaction_reason = 'Auto-redacted: Offensive language detected and censored';
                    $existingReview->redacted_at = now();
                }
                
                $existingReview->save();
                $existingReview->load('user');

                $message = $hasOffensiveLanguage 
                    ? 'Review updated successfully. Offensive language has been automatically flagged and redacted. Violation points have been applied.'
                    : 'Review updated successfully';

                return response()->json([
                    'success' => true,
                    'message' => $message,
                    'data' => $existingReview,
                    'was_flagged' => $hasOffensiveLanguage
                ], 200);
            }

            $review = new Review([
                'user_id' => $user->userID,
                'product_id' => $productId,
                'rating' => $request->rating,
                'comment' => $redactedCommentText, // Use redacted text
                'review_date' => now(),
                'images' => !empty($imagePaths) ? $imagePaths : null,
                'video_path' => $videoPath,
            ]);

            // Auto-flag and redact if offensive language detected
            if ($hasOffensiveLanguage) {
                $review->is_flagged = true;
                $review->flag_reason = 'Auto-flagged: Contains offensive language (English/Tagalog)';
                $review->is_redacted_text = true;
                $review->redaction_reason = 'Auto-redacted: Offensive language detected and censored';
                $review->redacted_at = now();
            }

            $review->save();
            $review->load('user');

            $message = $hasOffensiveLanguage 
                ? 'Review submitted successfully. Offensive language has been automatically flagged and redacted. Violation points have been applied.'
                : 'Review submitted successfully';

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $review,
                'was_flagged' => $hasOffensiveLanguage
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error storing review: ' . $e->getMessage(), [
                'product_id' => $productId ?? null,
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit review: ' . $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified review.
     *
     * @param  int  $productId
     * @param  int  $reviewId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($productId, $reviewId)
    {
        try {
            $review = Review::with(['user' => function($query) {
                    $query->select('userID', 'userName');
                }])
                ->where('product_id', $productId)
                ->findOrFail($reviewId);

            return response()->json([
                'success' => true,
                'data' => $review
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Review not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Get all reviews for a specific product
     *
     * @param int $productId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProductReviews($productId)
    {
        try {
            $reviews = Review::with(['user' => function($query) {
                    $query->select('userID', 'userName', 'userEmail');
                }])
                ->where('product_id', $productId)
                ->latest('review_date')
                ->get();

            // Format reviews for frontend
            $formattedReviews = $reviews->map(function($review) {
                // Process review images
                $imageUrls = [];
                if ($review->images) {
                    // Handle both array and JSON string
                    $images = $review->images;
                    if (is_string($images)) {
                        $images = json_decode($images, true);
                    }
                    
                    if (is_array($images)) {
                        foreach ($images as $image) {
                            if ($image) {
                                $imageUrls[] = asset('storage/' . ltrim($image, '/'));
                            }
                        }
                    }
                }
                
                // Process review video
                $videoUrl = null;
                if ($review->video_path) {
                    $videoUrl = asset('storage/' . ltrim($review->video_path, '/'));
                }
                
                return [
                    'review_id' => $review->review_id,
                    'id' => $review->review_id, // For compatibility
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'review_date' => $review->review_date,
                    'created_at' => $review->created_at,
                    'images' => $imageUrls,
                    'video_path' => $videoUrl,
                    'is_flagged' => $review->is_flagged ?? false,
                    'flag_reason' => $review->flag_reason,
                    'user' => $review->user ? [
                        'userName' => $review->user->userName,
                        'userEmail' => $review->user->userEmail,
                    ] : null,
                ];
            });

            $averageRating = $reviews->avg('rating');
            $totalReviews = $reviews->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'reviews' => $formattedReviews,
                    'average_rating' => $averageRating ? round($averageRating, 1) : 0,
                    'total_reviews' => $totalReviews
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching product reviews: ' . $e->getMessage(), [
                'product_id' => $productId,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check in batch which products the authenticated user has reviewed.
     * Request: { product_ids: number[] }
     * Response: { reviewed: { [product_id: number]: boolean } }
     */
    public function userReviewedBatch(Request $request)
    {
        try {
            $data = $request->validate([
                'product_ids' => 'required|array|min:1',
                'product_ids.*' => 'integer'
            ]);

            $user = Auth::user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            $productIds = $data['product_ids'];

            $reviewedIds = Review::where('user_id', $user->userID)
                ->whereIn('product_id', $productIds)
                ->pluck('product_id')
                ->unique()
                ->values()
                ->all();

            $reviewedMap = [];
            foreach ($productIds as $pid) {
                $reviewedMap[$pid] = in_array($pid, $reviewedIds, true);
            }

            return response()->json([
                'success' => true,
                'reviewed' => $reviewedMap
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
