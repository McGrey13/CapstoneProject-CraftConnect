<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\Seller;
use App\Models\User;
use App\Models\Analytics\DetailedReviewAnalytics;
use App\Models\Analytics\SellerComparisonAnalytics;
use App\Models\Analytics\CategoryPerformanceAnalytics;
use App\Models\Analytics\MostSellingProductAnalytics;
use App\Models\Analytics\HighestSalesSellerAnalytics;
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
                'micro_analytics' => $this->getMicroAnalytics($periodType, $startDate, $endDate),
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
        // Get all delivered orders within date range
        $orders = Order::where('status', 'delivered')
            ->whereBetween('created_at', [$startDate, $endDate]);
        
        $totalRevenue = $orders->sum('totalAmount');
        $platformCommission = $totalRevenue * 0.1; // 10% commission
        $paymentFees = $totalRevenue * 0.029; // 2.9% payment processing fee

        // Generate trend data based on period type and date range
        $trendData = [];
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        
        if ($periodType === 'yearly') {
            // Generate yearly data points
            $currentYear = $start->year;
            $endYear = $end->year;
            
            for ($year = $currentYear; $year <= $endYear; $year++) {
                $yearOrders = Order::where('status', 'delivered')
                    ->whereYear('created_at', $year)
                    ->sum('totalAmount');
                
                $trendData[] = [
                    'month' => $year,
                    'revenue' => $yearOrders,
                    'commission' => $yearOrders * 0.1,
                    'fees' => $yearOrders * 0.029
                ];
            }
        } elseif ($periodType === 'monthly') {
            // Generate monthly data points
            $current = $start->copy()->startOfMonth();
            
            while ($current->lte($end)) {
                $monthOrders = Order::where('status', 'delivered')
                    ->whereYear('created_at', $current->year)
                    ->whereMonth('created_at', $current->month)
                    ->sum('totalAmount');
                
                $trendData[] = [
                    'month' => $current->format('M Y'),
                    'revenue' => $monthOrders,
                    'commission' => $monthOrders * 0.1,
                    'fees' => $monthOrders * 0.029
                ];
                
                $current->addMonth();
            }
        } else {
            // Generate daily data points (limit to last 90 days for performance)
            $dailyStart = $end->copy()->subDays(90);
            if ($start->lt($dailyStart)) {
                $dailyStart = $start->copy();
            }
            
            $current = $dailyStart->copy();
            
            while ($current->lte($end)) {
                $dayOrders = Order::where('status', 'delivered')
                    ->whereDate('created_at', $current->format('Y-m-d'))
                    ->sum('totalAmount');
                
                $trendData[] = [
                    'month' => $current->format('M d'),
                    'revenue' => $dayOrders,
                    'commission' => $dayOrders * 0.1,
                    'fees' => $dayOrders * 0.029
                ];
                
                $current->addDay();
            }
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
        // Get seller revenue analytics data from seeded data
        // Try to get data for the requested period type, fallback to daily if not found
        $sellerRevenueData = \App\Models\Analytics\SellerRevenueAnalytics::with('seller')
            ->where('period_type', $periodType)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();
            
        // If no data found for the requested period type, try daily data
        if ($sellerRevenueData->isEmpty()) {
            $sellerRevenueData = \App\Models\Analytics\SellerRevenueAnalytics::with('seller')
                ->where('period_type', 'daily')
                ->whereBetween('date', [$startDate, $endDate])
                ->get();
        }

        $totalSellers = Seller::count();
        $activeSellers = Seller::whereHas('user', function($query) {
            $query->where('is_verified', true);
        })->count();

        // Calculate total revenue from all sellers
        $totalSellerRevenue = $sellerRevenueData->sum('total_revenue');
        $averageRevenuePerSeller = $totalSellers > 0 ? $totalSellerRevenue / $totalSellers : 0;

        // Get top performing sellers by revenue
        $topSellers = $sellerRevenueData->groupBy('seller_id')
            ->map(function($sellerData) {
                $seller = $sellerData->first()->seller;
                return [
                    'seller_id' => $sellerData->first()->seller_id,
                    'seller' => $seller ? [
                        'businessName' => $seller->businessName ?? 'Unknown Seller'
                    ] : null,
                    'total_revenue' => $sellerData->sum('total_revenue'),
                    'total_orders' => $sellerData->sum('total_orders'),
                    'products_sold' => $sellerData->sum('products_sold'),
                    'average_order_value' => $sellerData->avg('average_order_value')
                ];
            })
            ->sortByDesc('total_revenue')
            ->take(5)
            ->values();

        // Get seller performance metrics
        $sellerPerformance = [
            'high_performers' => $sellerRevenueData->where('total_revenue', '>', $averageRevenuePerSeller * 1.5)->count(),
            'average_performers' => $sellerRevenueData->whereBetween('total_revenue', [$averageRevenuePerSeller * 0.5, $averageRevenuePerSeller * 1.5])->count(),
            'low_performers' => $sellerRevenueData->where('total_revenue', '<', $averageRevenuePerSeller * 0.5)->count(),
        ];

        return [
            'top_sellers' => $topSellers,
            'average_revenue_per_seller' => $averageRevenuePerSeller,
            'total_sellers' => $totalSellers,
            'active_sellers' => $activeSellers,
            'total_seller_revenue' => $totalSellerRevenue,
            'seller_performance' => $sellerPerformance,
            'revenue_distribution' => [
                'top_20_percent' => $topSellers->take(2)->sum('total_revenue'),
                'middle_60_percent' => $sellerRevenueData->sortByDesc('total_revenue')->skip(2)->take(4)->sum('total_revenue'),
                'bottom_20_percent' => $sellerRevenueData->sortByDesc('total_revenue')->skip(6)->sum('total_revenue')
            ]
        ];
    }

    /**
     * Get order analytics
     */
    private function getOrderAnalytics($periodType, $startDate, $endDate)
    {
        // Get orders within date range
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])->get();
        
        $totalOrders = $orders->count();
        $completedOrders = $orders->where('status', 'delivered')->count();
        $pendingOrders = $orders->where('status', 'pending')->count();
        $processingOrders = $orders->where('status', 'packing')->count();
        $shippedOrders = $orders->where('status', 'shipped')->count();
        
        $completionRate = $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0;
        $avgOrderValue = $totalOrders > 0 ? $orders->avg('totalAmount') : 0;

        // Generate order trend data based on period type and date range
        $orderTrendData = [];
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        
        if ($periodType === 'yearly') {
            // Generate yearly data points
            $currentYear = $start->year;
            $endYear = $end->year;
            
            for ($year = $currentYear; $year <= $endYear; $year++) {
                $yearOrders = Order::whereYear('created_at', $year)->get();
                
                $orderTrendData[] = [
                    'month' => $year,
                    'total' => $yearOrders->count(),
                    'completed' => $yearOrders->where('status', 'delivered')->count(),
                    'pending' => $yearOrders->where('status', 'pending')->count(),
                    'processing' => $yearOrders->where('status', 'packing')->count(),
                    'shipped' => $yearOrders->where('status', 'shipped')->count()
                ];
            }
        } elseif ($periodType === 'monthly') {
            // Generate monthly data points
            $current = $start->copy()->startOfMonth();
            
            while ($current->lte($end)) {
                $monthOrders = Order::whereYear('created_at', $current->year)
                    ->whereMonth('created_at', $current->month)
                    ->get();
                
                $orderTrendData[] = [
                    'month' => $current->format('M Y'),
                    'total' => $monthOrders->count(),
                    'completed' => $monthOrders->where('status', 'delivered')->count(),
                    'pending' => $monthOrders->where('status', 'pending')->count(),
                    'processing' => $monthOrders->where('status', 'packing')->count(),
                    'shipped' => $monthOrders->where('status', 'shipped')->count()
                ];
                
                $current->addMonth();
            }
        } else {
            // Generate daily data points (limit to last 90 days for performance)
            $dailyStart = $end->copy()->subDays(90);
            if ($start->lt($dailyStart)) {
                $dailyStart = $start->copy();
            }
            
            $current = $dailyStart->copy();
            
            while ($current->lte($end)) {
                $dayOrders = Order::whereDate('created_at', $current->format('Y-m-d'))->get();
                
                $orderTrendData[] = [
                    'month' => $current->format('M d'),
                    'total' => $dayOrders->count(),
                    'completed' => $dayOrders->where('status', 'delivered')->count(),
                    'pending' => $dayOrders->where('status', 'pending')->count(),
                    'processing' => $dayOrders->where('status', 'packing')->count(),
                    'shipped' => $dayOrders->where('status', 'shipped')->count()
                ];
                
                $current->addDay();
            }
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
        // Get reviews within date range
        $reviews = Review::whereBetween('created_at', [$startDate, $endDate])->get();
        
        $totalReviews = $reviews->count();
        $avgRating = $reviews->avg('rating') ?? 0;
        
        $fiveStar = $reviews->where('rating', 5)->count();
        $fourStar = $reviews->where('rating', 4)->count();
        $threeStar = $reviews->where('rating', 3)->count();
        $twoStar = $reviews->where('rating', 2)->count();
        $oneStar = $reviews->where('rating', 1)->count();

        // Generate review trend data based on period type and date range
        $reviewTrendData = [];
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        
        if ($periodType === 'yearly') {
            // Generate yearly data points
            $currentYear = $start->year;
            $endYear = $end->year;
            
            for ($year = $currentYear; $year <= $endYear; $year++) {
                $yearReviews = Review::whereYear('created_at', $year)->get();
                
                $reviewTrendData[] = [
                    'month' => $year,
                    'reviews' => $yearReviews->count(),
                    'avg_rating' => $yearReviews->avg('rating') ?? 0
                ];
            }
        } elseif ($periodType === 'monthly') {
            // Generate monthly data points
            $current = $start->copy()->startOfMonth();
            
            while ($current->lte($end)) {
                $monthReviews = Review::whereYear('created_at', $current->year)
                    ->whereMonth('created_at', $current->month)
                    ->get();
                
                $reviewTrendData[] = [
                    'month' => $current->format('M Y'),
                    'reviews' => $monthReviews->count(),
                    'avg_rating' => $monthReviews->avg('rating') ?? 0
                ];
                
                $current->addMonth();
            }
        } else {
            // Generate daily data points (limit to last 90 days for performance)
            $dailyStart = $end->copy()->subDays(90);
            if ($start->lt($dailyStart)) {
                $dailyStart = $start->copy();
            }
            
            $current = $dailyStart->copy();
            
            while ($current->lte($end)) {
                $dayReviews = Review::whereDate('created_at', $current->format('Y-m-d'))->get();
                
                $reviewTrendData[] = [
                    'month' => $current->format('M d'),
                    'reviews' => $dayReviews->count(),
                    'avg_rating' => $dayReviews->avg('rating') ?? 0
                ];
                
                $current->addDay();
            }
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
        // Get moderation analytics data from the seeded data
        // Try to get data for the requested period type, fallback to daily if not found
        $moderationData = \App\Models\Analytics\ContentModerationAnalytics::where('period_type', $periodType)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();
            
        // If no data found for the requested period type, try daily data
        if ($moderationData->isEmpty()) {
            $moderationData = \App\Models\Analytics\ContentModerationAnalytics::where('period_type', 'daily')
                ->whereBetween('date', [$startDate, $endDate])
                ->get();
        }

        // Calculate totals from the analytics data
        $totalProductsSubmitted = $moderationData->sum('products_pending_approval') + 
                                 $moderationData->sum('products_approved') + 
                                 $moderationData->sum('products_rejected');
        
        $totalProductsApproved = $moderationData->sum('products_approved');
        $totalProductsRejected = $moderationData->sum('products_rejected');
        $totalProductsPending = $moderationData->sum('products_pending_approval');
        
        $totalReviewsFlagged = $moderationData->sum('reviews_flagged');
        $totalReviewsApproved = $moderationData->sum('reviews_approved');
        $totalReviewsRemoved = $moderationData->sum('reviews_removed');
        
        $totalUsersSuspended = $moderationData->sum('users_suspended');
        $totalUsersReactivated = $moderationData->sum('users_reactivated');
        
        // Calculate approval rate from the data
        $avgApprovalRate = $moderationData->avg('approval_rate') ?? 0;
        $avgRejectionRate = $moderationData->avg('rejection_rate') ?? 0;

        // Get seller-specific moderation data
        $sellers = Seller::withCount(['products as total_products', 'products as pending_products' => function($query) {
            $query->where('approval_status', 'pending');
        }, 'products as approved_products' => function($query) {
            $query->where('approval_status', 'approved');
        }, 'products as rejected_products' => function($query) {
            $query->where('approval_status', 'rejected');
        }])->get();

        // Calculate seller moderation statistics
        $sellerStats = [
            'total_sellers' => $sellers->count(),
            'sellers_with_pending_products' => $sellers->where('pending_products', '>', 0)->count(),
            'sellers_with_approved_products' => $sellers->where('approved_products', '>', 0)->count(),
            'sellers_with_rejected_products' => $sellers->where('rejected_products', '>', 0)->count(),
        ];

        return [
            'statistics' => [
                'products' => [
                    'pending' => $totalProductsPending,
                    'approved' => $totalProductsApproved,
                    'rejected' => $totalProductsRejected,
                    'approval_rate' => $totalProductsSubmitted > 0 ? ($totalProductsApproved / $totalProductsSubmitted) * 100 : 0
                ],
                'reviews' => [
                    'flagged' => $totalReviewsFlagged,
                    'approved' => $totalReviewsApproved,
                    'removed' => $totalReviewsRemoved,
                    'approval_rate' => ($totalReviewsFlagged + $totalReviewsApproved + $totalReviewsRemoved) > 0 ? ($totalReviewsApproved / ($totalReviewsFlagged + $totalReviewsApproved + $totalReviewsRemoved)) * 100 : 0
                ],
                'users' => [
                    'suspended' => $totalUsersSuspended,
                    'reactivated' => $totalUsersReactivated
                ]
            ],
            'total_submissions' => $totalProductsSubmitted + $totalReviewsFlagged,
            'approval_rate' => $avgApprovalRate,
            'rejection_rate' => $avgRejectionRate,
            'average_processing_time' => rand(1, 3), // Random processing time in hours
            'flagged_content' => $totalReviewsFlagged,
            'seller_moderation' => $sellerStats,
            'trend_data' => $this->generateModerationTrendData($periodType, $startDate, $endDate)
        ];
    }

    /**
     * Generate moderation trend data
     */
    private function generateModerationTrendData($periodType, $startDate, $endDate)
    {
        $trendData = [];
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        
        if ($periodType === 'yearly') {
            // Generate yearly data points
            $currentYear = $start->year;
            $endYear = $end->year;
            
            for ($year = $currentYear; $year <= $endYear; $year++) {
                $yearProducts = Product::whereYear('created_at', $year)->get();
                $yearReviews = Review::whereYear('created_at', $year)->get();
                
                $trendData[] = [
                    'month' => $year,
                    'total_products_submitted' => $yearProducts->count(),
                    'products_approved' => $yearProducts->where('approval_status', 'approved')->count(),
                    'products_rejected' => $yearProducts->where('approval_status', 'rejected')->count(),
                    'products_pending' => $yearProducts->where('approval_status', 'pending')->count(),
                    'total_reviews_submitted' => $yearReviews->count(),
                    'reviews_approved' => $yearReviews->where('rating', '>=', 3)->count(),
                    'reviews_flagged' => $yearReviews->where('rating', '<', 3)->count(),
                    'approval_rate' => $yearProducts->count() > 0 ? ($yearProducts->where('approval_status', 'approved')->count() / $yearProducts->count()) * 100 : 0
                ];
            }
        } elseif ($periodType === 'monthly') {
            // Generate monthly data points
            $current = $start->copy()->startOfMonth();
            
            while ($current->lte($end)) {
                $monthProducts = Product::whereYear('created_at', $current->year)
                    ->whereMonth('created_at', $current->month)
                    ->get();
                $monthReviews = Review::whereYear('created_at', $current->year)
                    ->whereMonth('created_at', $current->month)
                    ->get();
                
                $trendData[] = [
                    'month' => $current->format('M Y'),
                    'total_products_submitted' => $monthProducts->count(),
                    'products_approved' => $monthProducts->where('approval_status', 'approved')->count(),
                    'products_rejected' => $monthProducts->where('approval_status', 'rejected')->count(),
                    'products_pending' => $monthProducts->where('approval_status', 'pending')->count(),
                    'total_reviews_submitted' => $monthReviews->count(),
                    'reviews_approved' => $monthReviews->where('rating', '>=', 3)->count(),
                    'reviews_flagged' => $monthReviews->where('rating', '<', 3)->count(),
                    'approval_rate' => $monthProducts->count() > 0 ? ($monthProducts->where('approval_status', 'approved')->count() / $monthProducts->count()) * 100 : 0
                ];
                
                $current->addMonth();
            }
        } else {
            // Generate daily data points (limit to last 90 days for performance)
            $dailyStart = $end->copy()->subDays(90);
            if ($start->lt($dailyStart)) {
                $dailyStart = $start->copy();
            }
            
            $current = $dailyStart->copy();
            
            while ($current->lte($end)) {
                $dayProducts = Product::whereDate('created_at', $current->format('Y-m-d'))->get();
                $dayReviews = Review::whereDate('created_at', $current->format('Y-m-d'))->get();
                
                $trendData[] = [
                    'month' => $current->format('M d'),
                    'total_products_submitted' => $dayProducts->count(),
                    'products_approved' => $dayProducts->where('approval_status', 'approved')->count(),
                    'products_rejected' => $dayProducts->where('approval_status', 'rejected')->count(),
                    'products_pending' => $dayProducts->where('approval_status', 'pending')->count(),
                    'total_reviews_submitted' => $dayReviews->count(),
                    'reviews_approved' => $dayReviews->where('rating', '>=', 3)->count(),
                    'reviews_flagged' => $dayReviews->where('rating', '<', 3)->count(),
                    'approval_rate' => $dayProducts->count() > 0 ? ($dayProducts->where('approval_status', 'approved')->count() / $dayProducts->count()) * 100 : 0
                ];
                
                $current->addDay();
            }
        }
        
        return $trendData;
    }

    /**
     * Get summary metrics for dashboard
     */
    private function getSummaryMetrics($periodType, $startDate, $endDate)
    {
        // Get data within date range
        $orders = Order::whereBetween('created_at', [$startDate, $endDate])->get();
        $reviews = Review::whereBetween('created_at', [$startDate, $endDate])->get();
        
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

    /**
     * Get micro analytics data including detailed rating breakdown and seller comparisons
     */
    private function getMicroAnalytics($periodType, $startDate, $endDate)
    {
        return [
            'detailed_reviews' => $this->getDetailedReviewAnalytics($periodType, $startDate, $endDate),
            'seller_comparisons' => $this->getSellerComparisonAnalytics($periodType, $startDate, $endDate),
            'category_performance' => $this->getCategoryPerformanceAnalytics($periodType, $startDate, $endDate)
        ];
    }

    /**
     * Get detailed review analytics with user identification
     */
    private function getDetailedReviewAnalytics($periodType, $startDate, $endDate)
    {
        // Get detailed review analytics data
        $detailedReviews = DetailedReviewAnalytics::where('period_type', $periodType)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        // If no data found, try daily data
        if ($detailedReviews->isEmpty()) {
            $detailedReviews = DetailedReviewAnalytics::where('period_type', 'daily')
                ->whereBetween('date', [$startDate, $endDate])
                ->get();
        }

        // Get rating distribution
        $ratingDistribution = DetailedReviewAnalytics::getRatingDistribution($periodType, $startDate, $endDate);

        // Get detailed breakdown for each rating
        $ratingBreakdowns = [];
        for ($rating = 5; $rating >= 1; $rating--) {
            $ratingBreakdowns[$rating . '_star'] = DetailedReviewAnalytics::getDetailedRatingBreakdown(
                $rating, $periodType, $startDate, $endDate, 20
            );
        }

        // Get top reviewers
        $topReviewers = DetailedReviewAnalytics::getTopReviewers(null, $periodType, $startDate, $endDate, 10);

        // Get rating trends
        $ratingTrends = DetailedReviewAnalytics::getRatingTrends($periodType, $startDate, $endDate);

        return [
            'rating_distribution' => $ratingDistribution,
            'rating_breakdowns' => $ratingBreakdowns,
            'top_reviewers' => $topReviewers,
            'rating_trends' => $ratingTrends,
            'total_detailed_reviews' => $detailedReviews->count()
        ];
    }

    /**
     * Get seller comparison analytics
     */
    private function getSellerComparisonAnalytics($periodType, $startDate, $endDate)
    {
        // Get seller comparison data
        $sellerComparisons = SellerComparisonAnalytics::where('period_type', $periodType)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        // If no data found, try daily data
        if ($sellerComparisons->isEmpty()) {
            $sellerComparisons = SellerComparisonAnalytics::where('period_type', 'daily')
                ->whereBetween('date', [$startDate, $endDate])
                ->get();
        }

        // Get top sellers by category
        $topSellersByCategory = SellerComparisonAnalytics::getTopSellersByCategory(null, $periodType, $startDate, $endDate, 10);

        // Get category comparison
        $categoryComparison = SellerComparisonAnalytics::getCategoryComparison(null, $periodType, $startDate, $endDate);

        // Get market share analysis
        $marketShareAnalysis = SellerComparisonAnalytics::getMarketShareAnalysis(null, $periodType, $startDate, $endDate);

        // Get products with multiple sellers
        $productsWithMultipleSellers = $sellerComparisons->groupBy('product_id')
            ->filter(function($productData) {
                return $productData->count() > 1;
            })
            ->map(function($productData) {
                return [
                    'product_id' => $productData->first()->product_id,
                    'product_name' => $productData->first()->product_name,
                    'category' => $productData->first()->category,
                    'sellers' => $productData->sortByDesc('total_revenue')->values(),
                    'total_sellers' => $productData->count(),
                    'top_seller' => $productData->sortByDesc('total_revenue')->first()
                ];
            })
            ->sortByDesc('total_sellers')
            ->take(10);

        return [
            'top_sellers_by_category' => $topSellersByCategory,
            'category_comparison' => $categoryComparison,
            'market_share_analysis' => $marketShareAnalysis,
            'products_with_multiple_sellers' => $productsWithMultipleSellers,
            'total_comparisons' => $sellerComparisons->count()
        ];
    }

    /**
     * Get category performance analytics
     */
    private function getCategoryPerformanceAnalytics($periodType, $startDate, $endDate)
    {
        // Get category performance data
        $categoryPerformance = CategoryPerformanceAnalytics::where('period_type', $periodType)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        // If no data found, try daily data
        if ($categoryPerformance->isEmpty()) {
            $categoryPerformance = CategoryPerformanceAnalytics::where('period_type', 'daily')
                ->whereBetween('date', [$startDate, $endDate])
                ->get();
        }

        // Get category comparison
        $categoryComparison = CategoryPerformanceAnalytics::getCategoryComparison($periodType, $startDate, $endDate);

        // Get top categories
        $topCategories = CategoryPerformanceAnalytics::getTopCategories($periodType, $startDate, $endDate, 10);

        // Get category trends
        $categoryTrends = CategoryPerformanceAnalytics::getCategoryTrends(null, $periodType, $startDate, $endDate);

        return [
            'category_comparison' => $categoryComparison,
            'top_categories' => $topCategories,
            'category_trends' => $categoryTrends,
            'total_categories' => $categoryPerformance->count()
        ];
    }

    /**
     * Get detailed rating breakdown for specific rating
     */
    public function getDetailedRatingBreakdown(Request $request)
    {
        try {
            $rating = $request->get('rating');
            $periodType = $request->get('period', 'monthly');
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $limit = $request->get('limit', 50);

            if (!$startDate || !$endDate) {
                $endDate = Carbon::now();
                $startDate = Carbon::now()->subMonths(12);
            }

            $breakdown = DetailedReviewAnalytics::getDetailedRatingBreakdown(
                $rating, $periodType, $startDate, $endDate, $limit
            );

            return response()->json([
                'rating' => $rating,
                'breakdown' => $breakdown,
                'total_count' => $breakdown->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch rating breakdown',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get seller comparison for specific product
     */
    public function getProductSellerComparison(Request $request)
    {
        try {
            $productId = $request->get('product_id');
            $periodType = $request->get('period', 'monthly');
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');

            if (!$productId) {
                return response()->json(['error' => 'Product ID is required'], 400);
            }

            if (!$startDate || !$endDate) {
                $endDate = Carbon::now();
                $startDate = Carbon::now()->subMonths(12);
            }

            $comparison = SellerComparisonAnalytics::getProductComparison(
                $productId, $periodType, $startDate, $endDate
            );

            return response()->json([
                'product_id' => $productId,
                'comparison' => $comparison,
                'total_sellers' => $comparison->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch product comparison',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get competitive analysis for specific seller
     */
    public function getCompetitiveAnalysis(Request $request)
    {
        try {
            $sellerId = $request->get('seller_id');
            $periodType = $request->get('period', 'monthly');
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');

            if (!$sellerId) {
                return response()->json(['error' => 'Seller ID is required'], 400);
            }

            if (!$startDate || !$endDate) {
                $endDate = Carbon::now();
                $startDate = Carbon::now()->subMonths(12);
            }

            $analysis = SellerComparisonAnalytics::getCompetitiveAnalysis(
                $sellerId, $periodType, $startDate, $endDate
            );

            return response()->json([
                'seller_id' => $sellerId,
                'analysis' => $analysis
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch competitive analysis',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get most selling products analytics
     */
    public function getMostSellingProducts(Request $request)
    {
        try {
            $periodType = $request->get('period', 'monthly');
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $limit = $request->get('limit', 10);
            
            // Set default date range if not provided
            if (!$startDate || !$endDate) {
                $endDate = Carbon::now();
                $startDate = Carbon::now()->subMonths(12);
            }

            $mostSellingProducts = MostSellingProductAnalytics::getMostSellingProducts(
                $periodType, $startDate, $endDate, $limit
            );

            $trendData = MostSellingProductAnalytics::getMostSellingProductsTrend(
                $periodType, $startDate, $endDate
            );

            $categoryData = MostSellingProductAnalytics::getTopSellingProductsByCategory(
                $periodType, $startDate, $endDate
            );

            return response()->json([
                'most_selling_products' => $mostSellingProducts,
                'trend_data' => $trendData,
                'category_breakdown' => $categoryData,
                'period' => $periodType,
                'date_range' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch most selling products analytics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get highest sales sellers analytics
     */
    public function getHighestSalesSellers(Request $request)
    {
        try {
            $periodType = $request->get('period', 'monthly');
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $limit = $request->get('limit', 10);
            
            // Set default date range if not provided
            if (!$startDate || !$endDate) {
                $endDate = Carbon::now();
                $startDate = Carbon::now()->subMonths(12);
            }

            $highestSalesSellers = HighestSalesSellerAnalytics::getHighestSalesSellers(
                $periodType, $startDate, $endDate, $limit
            );

            $trendData = HighestSalesSellerAnalytics::getHighestSalesSellersTrend(
                $periodType, $startDate, $endDate
            );

            $categoryData = HighestSalesSellerAnalytics::getSellerPerformanceByCategory(
                $periodType, $startDate, $endDate
            );

            $growthData = HighestSalesSellerAnalytics::getSellerGrowthComparison(
                $periodType, $startDate, $endDate
            );

            return response()->json([
                'highest_sales_sellers' => $highestSalesSellers,
                'trend_data' => $trendData,
                'category_breakdown' => $categoryData,
                'growth_comparison' => $growthData,
                'period' => $periodType,
                'date_range' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch highest sales sellers analytics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get product selling trend for specific product
     */
    public function getProductSellingTrend(Request $request, $productId)
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

            $trendData = MostSellingProductAnalytics::getProductSellingTrend(
                $productId, $periodType, $startDate, $endDate
            );

            return response()->json([
                'product_id' => $productId,
                'trend_data' => $trendData,
                'period' => $periodType,
                'date_range' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch product selling trend',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get seller sales trend for specific seller
     */
    public function getSellerSalesTrend(Request $request, $sellerId)
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

            $trendData = HighestSalesSellerAnalytics::getSellerSalesTrend(
                $sellerId, $periodType, $startDate, $endDate
            );

            return response()->json([
                'seller_id' => $sellerId,
                'trend_data' => $trendData,
                'period' => $periodType,
                'date_range' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch seller sales trend',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}