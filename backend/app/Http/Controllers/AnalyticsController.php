<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\Seller;
use App\Models\User;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Get comprehensive admin analytics dashboard data
     */
    public function getAdminAnalytics(Request $request)
    {
        try {
            $periodType = $request->get('period', 'monthly');
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            
            // Set default date range if not provided
            if (!$startDate || !$endDate) {
                $endDate = Carbon::now();
                $startDate = Carbon::now()->subMonths(12);
            }

            return response()->json([
                'revenue' => $this->getRevenueAnalytics($periodType, $startDate, $endDate),
                'seller_revenue' => $this->getSellerRevenueAnalytics($periodType, $startDate, $endDate),
                'orders' => $this->getOrderAnalytics($periodType, $startDate, $endDate),
                'reviews' => $this->getReviewAnalytics($periodType, $startDate, $endDate),
                'products' => $this->getProductAnalytics($periodType, $startDate, $endDate),
                'moderation' => $this->getModerationAnalytics($periodType, $startDate, $endDate),
                'summary' => $this->getSummaryMetrics($periodType, $startDate, $endDate)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch analytics data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get revenue analytics
     */
    private function getRevenueAnalytics($periodType, $startDate, $endDate)
    {
        // Get all delivered orders (ignore date range for now to see all data)
        $orders = Order::where('status', 'delivered');
        
        $totalRevenue = $orders->sum('totalAmount');
        $platformCommission = $totalRevenue * 0.1; // 10% commission
        $paymentFees = $totalRevenue * 0.029; // 2.9% payment processing fee

        // Generate trend data for the last 12 months
        $trendData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthOrders = Order::where('status', 'delivered')
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('totalAmount');
            
            $trendData[] = [
                'month' => $date->format('M Y'),
                'revenue' => $monthOrders,
                'commission' => $monthOrders * 0.1,
                'fees' => $monthOrders * 0.029
            ];
        }

        return [
            'total_revenue' => $totalRevenue,
            'growth_rate' => 0, // Simplified for now
            'trend_data' => $trendData,
            'platform_commission' => $platformCommission,
            'payment_fees' => $paymentFees,
            'net_revenue' => $totalRevenue - $paymentFees
        ];
    }

    /**
     * Get seller revenue analytics
     */
    private function getSellerRevenueAnalytics($periodType, $startDate, $endDate)
    {
        $totalSellers = Seller::count();
        $activeSellers = Seller::whereHas('user', function($query) {
            $query->where('is_verified', true);
        })->count();

        return [
            'top_sellers' => [], // Simplified for now
            'average_revenue_per_seller' => 0, // Simplified for now
            'total_sellers' => $totalSellers,
            'active_sellers' => $activeSellers
        ];
    }

    /**
     * Get order analytics
     */
    private function getOrderAnalytics($periodType, $startDate, $endDate)
    {
        // Get all orders (ignore date range for now to see all data)
        $orders = Order::all();
        
        $totalOrders = $orders->count();
        $completedOrders = $orders->where('status', 'delivered')->count();
        $pendingOrders = $orders->where('status', 'pending')->count();
        $processingOrders = $orders->where('status', 'packing')->count();
        $shippedOrders = $orders->where('status', 'shipped')->count();
        
        $completionRate = $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0;
        $avgOrderValue = $totalOrders > 0 ? $orders->avg('totalAmount') : 0;

        // Generate order trend data for the last 12 months
        $orderTrendData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthOrders = Order::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month);
            
            $orderTrendData[] = [
                'month' => $date->format('M Y'),
                'total' => $monthOrders->count(),
                'completed' => $monthOrders->where('status', 'delivered')->count(),
                'pending' => $monthOrders->where('status', 'pending')->count(),
                'processing' => $monthOrders->where('status', 'packing')->count(),
                'shipped' => $monthOrders->where('status', 'shipped')->count()
            ];
        }

        return [
            'total_orders' => $totalOrders,
            'completion_rate' => $completionRate,
            'average_order_value' => $avgOrderValue,
            'status_distribution' => [
                'total' => $totalOrders,
                'completed' => $completedOrders,
                'pending' => $pendingOrders,
                'processing' => $processingOrders,
                'shipped' => $shippedOrders,
                'cancelled' => 0,
                'refunded' => 0
            ],
            'trend_data' => $orderTrendData
        ];
    }

    /**
     * Get review analytics
     */
    private function getReviewAnalytics($periodType, $startDate, $endDate)
    {
        // Get all reviews (ignore date range for now to see all data)
        $reviews = Review::all();
        
        $totalReviews = $reviews->count();
        $avgRating = $reviews->avg('rating') ?? 0;
        
        $fiveStar = $reviews->where('rating', 5)->count();
        $fourStar = $reviews->where('rating', 4)->count();
        $threeStar = $reviews->where('rating', 3)->count();
        $twoStar = $reviews->where('rating', 2)->count();
        $oneStar = $reviews->where('rating', 1)->count();

        // Generate review trend data for the last 12 months
        $reviewTrendData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthReviews = Review::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month);
            
            $reviewTrendData[] = [
                'month' => $date->format('M Y'),
                'reviews' => $monthReviews->count(),
                'avg_rating' => $monthReviews->avg('rating') ?? 0,
                'five_star' => $monthReviews->where('rating', 5)->count(),
                'four_star' => $monthReviews->where('rating', 4)->count(),
                'three_star' => $monthReviews->where('rating', 3)->count(),
                'two_star' => $monthReviews->where('rating', 2)->count(),
                'one_star' => $monthReviews->where('rating', 1)->count()
            ];
        }

        return [
            'total_reviews' => $totalReviews,
            'average_rating' => $avgRating,
            'response_rate' => 0, // Simplified for now
            'score_distribution' => [
                'total' => $totalReviews,
                'five_star' => $fiveStar,
                'four_star' => $fourStar,
                'three_star' => $threeStar,
                'two_star' => $twoStar,
                'one_star' => $oneStar
            ],
            'rating_trend' => $reviewTrendData,
            'trend_data' => $reviewTrendData
        ];
    }

    /**
     * Get product analytics
     */
    private function getProductAnalytics($periodType, $startDate, $endDate)
    {
        $products = Product::all();
        
        $totalProducts = $products->count();
        $activeProducts = $products->where('status', 'in stock')->count();
        $inactiveProducts = $products->where('status', 'inactive')->count();
        $outOfStockProducts = $products->where('status', 'out of stock')->count();
        $lowStockProducts = $products->where('status', 'low stock')->count();
        $featuredProducts = $products->where('is_featured', true)->count();
        
        $productsWithImages = $products->whereNotNull('productImage')->count();
        $productsWithVideos = $products->whereNotNull('productVideo')->count();
        $productsWithoutImages = $totalProducts - $productsWithImages;
        
        $avgRating = $products->avg('average_rating') ?? 0;

        // Generate product trend data for the last 12 months
        $productTrendData = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthProducts = Product::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month);
            
            $productTrendData[] = [
                'month' => $date->format('M Y'),
                'total' => $monthProducts->count(),
                'active' => $monthProducts->where('status', 'in stock')->count(),
                'inactive' => $monthProducts->where('status', 'inactive')->count(),
                'out_of_stock' => $monthProducts->where('status', 'out of stock')->count(),
                'low_stock' => $monthProducts->where('status', 'low stock')->count(),
                'featured' => $monthProducts->where('is_featured', true)->count()
            ];
        }

        return [
            'total_products' => $totalProducts,
            'average_rating' => $avgRating,
            'image_quality' => [
                'total_products' => $totalProducts,
                'products_with_images' => $productsWithImages,
                'products_with_videos' => $productsWithVideos,
                'products_without_images' => $productsWithoutImages,
                'image_coverage_percentage' => $totalProducts > 0 ? ($productsWithImages / $totalProducts) * 100 : 0,
                'video_coverage_percentage' => $totalProducts > 0 ? ($productsWithVideos / $totalProducts) * 100 : 0,
                'missing_images_percentage' => $totalProducts > 0 ? ($productsWithoutImages / $totalProducts) * 100 : 0
            ],
            'status_distribution' => [
                'total' => $totalProducts,
                'active' => $activeProducts,
                'inactive' => $inactiveProducts,
                'out_of_stock' => $outOfStockProducts,
                'low_stock' => $lowStockProducts,
                'featured' => $featuredProducts
            ],
            'trend_data' => $productTrendData
        ];
    }

    /**
     * Get content moderation analytics
     */
    private function getModerationAnalytics($periodType, $startDate, $endDate)
    {
        $products = Product::whereBetween('created_at', [$startDate, $endDate]);
        $reviews = Review::whereBetween('created_at', [$startDate, $endDate]);
        
        $totalProductsSubmitted = $products->count();
        $totalReviewsSubmitted = $reviews->count();
        $productsApproved = $products->where('status', 'in stock')->count();
        $reviewsApproved = $reviews->count(); // Assuming all reviews are approved by default
        
        $totalSubmissions = $totalProductsSubmitted + $totalReviewsSubmitted;
        $totalApproved = $productsApproved + $reviewsApproved;
        $approvalRate = $totalSubmissions > 0 ? ($totalApproved / $totalSubmissions) * 100 : 0;

        return [
            'total_submissions' => $totalSubmissions,
            'approval_rate' => $approvalRate,
            'average_processing_time' => 0, // Simplified for now
            'flagged_content' => 0, // Simplified for now
            'trend_data' => [
                'total_products_submitted' => $totalProductsSubmitted,
                'products_approved' => $productsApproved,
                'products_rejected' => $totalProductsSubmitted - $productsApproved,
                'total_reviews_submitted' => $totalReviewsSubmitted,
                'reviews_approved' => $reviewsApproved,
                'reviews_rejected' => 0,
                'total_users_flagged' => 0,
                'users_actioned' => 0
            ]
        ];
    }

    /**
     * Get summary metrics for dashboard
     */
    private function getSummaryMetrics($periodType, $startDate, $endDate)
    {
        // Get all data (ignore date range for now to see all data)
        $orders = Order::all();
        $reviews = Review::all();
        
        $totalRevenue = $orders->where('status', 'delivered')->sum('totalAmount');
        $totalOrders = $orders->count();
        $completedOrders = $orders->where('status', 'delivered')->count();
        $completionRate = $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0;
        $avgOrderValue = $totalOrders > 0 ? $orders->avg('totalAmount') : 0;
        $avgRating = $reviews->avg('rating') ?? 0;
        $totalProducts = Product::count();
        $activeSellers = Seller::whereHas('user', function($query) {
            $query->where('is_verified', true);
        })->count();

        return [
            'total_revenue' => $totalRevenue,
            'total_orders' => $totalOrders,
            'completion_rate' => $completionRate,
            'average_order_value' => $avgOrderValue,
            'average_rating' => $avgRating,
            'total_products' => $totalProducts,
            'active_sellers' => $activeSellers
        ];
    }

    /**
     * Generate sample analytics data for testing
     */
    public function generateAnalyticsData(Request $request)
    {
        try {
            // Generate sample orders
            $ordersCreated = $this->generateSampleOrders();
            
            // Generate sample products
            $productsCreated = $this->generateSampleProducts();
            
            // Generate sample reviews
            $reviewsCreated = $this->generateSampleReviews();
            
            return response()->json([
                'message' => 'Sample analytics data generated successfully!',
                'data_created' => [
                    'orders' => $ordersCreated,
                    'products' => $productsCreated,
                    'reviews' => $reviewsCreated
                ],
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to generate analytics data',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate sample orders
     */
    private function generateSampleOrders()
    {
        $statuses = ['delivered', 'pending', 'packing', 'shipped'];
        $startDate = now()->subDays(30);
        $created = 0;
        
        // Generate 10-15 random orders
        $orderCount = rand(10, 15);
        
        for ($i = 0; $i < $orderCount; $i++) {
            try {
                Order::create([
                    'customer_id' => 1, // Assuming customer with ID 1 exists
                    'totalAmount' => rand(50, 500),
                    'status' => $statuses[array_rand($statuses)],
                    'location' => 'Sample Location ' . ($i + 1),
                    'created_at' => $startDate->copy()->addDays(rand(0, 30)),
                    'updated_at' => now()
                ]);
                $created++;
            } catch (\Exception $e) {
                // Skip if there's an error (e.g., duplicate)
                continue;
            }
        }
        
        return $created;
    }

    /**
     * Generate sample products
     */
    private function generateSampleProducts()
    {
        $statuses = ['in stock', 'out of stock', 'low stock', 'inactive'];
        $categories = ['Handmade', 'Art', 'Craft', 'Jewelry', 'Home Decor', 'Textiles', 'Pottery', 'Woodwork'];
        $productNames = [
            'Handmade Ceramic Bowl', 'Artisan Wooden Spoon', 'Custom Jewelry Set', 'Handwoven Scarf',
            'Decorative Pottery Vase', 'Handcrafted Candle', 'Artistic Wall Hanging', 'Custom Leather Bag',
            'Handmade Soap Set', 'Artisan Coffee Mug', 'Custom Painting', 'Handwoven Basket'
        ];
        
        $created = 0;
        $productCount = rand(5, 10);
        
        for ($i = 0; $i < $productCount; $i++) {
            try {
                $productId = 'GEN' . time() . rand(1000, 9999); // Unique ID
                
                Product::create([
                    'product_id' => $productId,
                    'seller_id' => 1,
                    'productName' => $productNames[array_rand($productNames)] . ' ' . ($i + 1),
                    'productDescription' => 'This is a beautiful handcrafted item created by our talented artisans. Perfect for adding a unique touch to your home or as a special gift.',
                    'productPrice' => rand(25, 300),
                    'productQuantity' => rand(1, 50),
                    'status' => $statuses[array_rand($statuses)],
                    'category' => $categories[array_rand($categories)],
                    'average_rating' => rand(3, 5) + (rand(0, 10) / 10), // 3.0 to 5.9 rating
                    'is_featured' => rand(0, 1),
                    'created_at' => now()->subDays(rand(0, 30)),
                    'updated_at' => now()
                ]);
                $created++;
            } catch (\Exception $e) {
                // Skip if there's an error
                continue;
            }
        }
        
        return $created;
    }

    /**
     * Generate sample reviews
     */
    private function generateSampleReviews()
    {
        // Get all products to create reviews for
        $products = Product::all();
        $created = 0;
        
        if ($products->count() > 0) {
            $reviewCount = rand(8, 15);
            $reviewComments = [
                'Amazing quality! Highly recommend this product.',
                'Beautiful craftsmanship, exactly as described.',
                'Fast shipping and great customer service.',
                'Love this item! Perfect addition to my collection.',
                'Excellent quality for the price. Will buy again.',
                'Unique and well-made. Very satisfied with my purchase.',
                'Great product, arrived quickly and in perfect condition.',
                'Beautiful design and excellent quality. Highly recommend!',
                'Exactly what I was looking for. Great value for money.',
                'Outstanding craftsmanship and attention to detail.'
            ];
            
            for ($i = 0; $i < $reviewCount; $i++) {
                try {
                    $product = $products->random();
                    $userId = 1; // Use user ID 1
                    
                    // Check if review already exists for this user-product combination
                    $existingReview = Review::where('user_id', $userId)
                        ->where('product_id', $product->product_id)
                        ->first();
                    
                    if (!$existingReview) {
                        Review::create([
                            'user_id' => $userId,
                            'product_id' => $product->product_id,
                            'rating' => rand(3, 5), // Mostly positive reviews (3-5 stars)
                            'comment' => $reviewComments[array_rand($reviewComments)],
                            'review_date' => now()->subDays(rand(0, 30)),
                            'created_at' => now()->subDays(rand(0, 30)),
                            'updated_at' => now()
                        ]);
                        $created++;
                    }
                } catch (\Exception $e) {
                    // Skip if there's an error
                    continue;
                }
            }
        }
        
        return $created;
    }
}