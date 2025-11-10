<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
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
     * Check for offensive language in text
     */
    private function containsOffensiveLanguage($text)
    {
        if (empty($text)) {
            return false;
        }

        // List of offensive words/phrases (basic implementation)
        // In production, consider using a more sophisticated profanity filter library
        $offensiveWords = [
            'damn', 'hell', 'crap', 'stupid', 'idiot', 'moron', 'fool',
            'hate', 'kill', 'die', 'death', 'murder', 'violence',
            // Add more offensive terms as needed
        ];

        $textLower = strtolower($text);
        
        foreach ($offensiveWords as $word) {
            if (strpos($textLower, $word) !== false) {
                return true;
            }
        }

        return false;
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

            // Check for offensive language
            if ($commentText && $this->containsOffensiveLanguage($commentText)) {
                // Notify admins about the offensive language attempt
                try {
                    $product = \App\Models\Product::find($productId);
                    $customerName = $user->userName ?? 'Unknown Customer';
                    $productName = $product ? $product->productName : 'Unknown Product';
                    
                    \App\Services\NotificationService::notifyAdminsFlaggedReview(
                        null, // Review ID is null since review is not saved
                        $productName,
                        $customerName,
                        $commentText
                    );
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning('Failed to send admin notification for offensive review: ' . $e->getMessage());
                }
                
                return response()->json([
                    'success' => false,
                    'message' => 'Your review contains inappropriate language. Please revise your review and avoid using offensive words.',
                    'error' => 'offensive_language'
                ], 400);
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
                $existingReview->comment = $commentText;
                $existingReview->review_date = now();
                $existingReview->images = !empty($imagePaths) ? $imagePaths : null;
                $existingReview->video_path = $videoPath;
                $existingReview->save();
                $existingReview->load('user');

                return response()->json([
                    'success' => true,
                    'message' => 'Review updated successfully',
                    'data' => $existingReview
                ], 200);
            }

            $review = new Review([
                'user_id' => $user->userID,
                'product_id' => $productId,
                'rating' => $request->rating,
                'comment' => $commentText,
                'review_date' => now(),
                'images' => !empty($imagePaths) ? $imagePaths : null,
                'video_path' => $videoPath,
            ]);

            $review->save();
            $review->load('user');

            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully',
                'data' => $review
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
