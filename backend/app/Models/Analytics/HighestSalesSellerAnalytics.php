<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HighestSalesSellerAnalytics extends Model
{
    use HasFactory;

    protected $table = 'highest_sales_seller_analytics';

    protected $fillable = [
        'date',
        'period_type',
        'seller_id',
        'seller_name',
        'business_name',
        'total_revenue',
        'total_orders',
        'total_products_sold',
        'unique_products',
        'average_order_value',
        'completion_rate',
        'average_rating',
        'total_reviews',
        'top_category',
        'month_year',
        'year',
    ];

    protected $casts = [
        'date' => 'date',
        'total_revenue' => 'decimal:2',
        'average_order_value' => 'decimal:2',
        'completion_rate' => 'decimal:2',
        'average_rating' => 'decimal:2',
        'total_orders' => 'integer',
        'total_products_sold' => 'integer',
        'unique_products' => 'integer',
        'total_reviews' => 'integer',
    ];

    /**
     * Get highest sales sellers for a specific period
     */
    public static function getHighestSalesSellers($periodType = 'monthly', $startDate = null, $endDate = null, $limit = 10)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->orderBy('total_revenue', 'desc')
                    ->orderBy('total_orders', 'desc')
                    ->limit($limit)
                    ->get();
    }

    /**
     * Get highest sales sellers trend over time
     */
    public static function getHighestSalesSellersTrend($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->selectRaw('
                date,
                seller_name,
                business_name,
                SUM(total_revenue) as total_revenue,
                SUM(total_orders) as total_orders,
                SUM(total_products_sold) as total_products,
                AVG(average_order_value) as avg_order_value,
                AVG(completion_rate) as avg_completion_rate,
                AVG(average_rating) as avg_rating
            ')
            ->groupBy('date', 'seller_name', 'business_name')
            ->orderBy('date', 'asc')
            ->get();
    }

    /**
     * Get seller performance by category
     */
    public static function getSellerPerformanceByCategory($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->selectRaw('
                top_category,
                seller_name,
                business_name,
                SUM(total_revenue) as total_revenue,
                SUM(total_orders) as total_orders,
                SUM(total_products_sold) as total_products,
                AVG(average_rating) as avg_rating,
                COUNT(DISTINCT seller_id) as seller_count
            ')
            ->groupBy('top_category', 'seller_name', 'business_name')
            ->orderBy('total_revenue', 'desc')
            ->get()
            ->groupBy('top_category')
            ->map(function ($sellers) {
                return $sellers->take(5); // Top 5 sellers per category
            });
    }

    /**
     * Get monthly/yearly sales trends for a specific seller
     */
    public static function getSellerSalesTrend($sellerId, $periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('seller_id', $sellerId)
                    ->where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->orderBy('date', 'asc')->get();
    }

    /**
     * Get seller growth rate comparison
     */
    public static function getSellerGrowthComparison($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        $sellers = $query->selectRaw('
                seller_id,
                seller_name,
                business_name,
                SUM(total_revenue) as total_revenue,
                SUM(total_orders) as total_orders,
                AVG(average_rating) as avg_rating,
                MIN(date) as first_period,
                MAX(date) as last_period
            ')
            ->groupBy('seller_id', 'seller_name', 'business_name')
            ->orderBy('total_revenue', 'desc')
            ->get();

        // Calculate growth rate for each seller
        return $sellers->map(function ($seller) use ($periodType) {
            $firstPeriod = self::where('seller_id', $seller->seller_id)
                             ->where('period_type', $periodType)
                             ->where('date', $seller->first_period)
                             ->first();
            
            $lastPeriod = self::where('seller_id', $seller->seller_id)
                             ->where('period_type', $periodType)
                             ->where('date', $seller->last_period)
                             ->first();
            
            $growthRate = 0;
            if ($firstPeriod && $lastPeriod && $firstPeriod->total_revenue > 0) {
                $growthRate = (($lastPeriod->total_revenue - $firstPeriod->total_revenue) / $firstPeriod->total_revenue) * 100;
            }
            
            return [
                'seller_id' => $seller->seller_id,
                'seller_name' => $seller->seller_name,
                'business_name' => $seller->business_name,
                'total_revenue' => $seller->total_revenue,
                'total_orders' => $seller->total_orders,
                'avg_rating' => $seller->avg_rating,
                'growth_rate' => round($growthRate, 2),
                'first_period' => $seller->first_period,
                'last_period' => $seller->last_period,
            ];
        });
    }
}

