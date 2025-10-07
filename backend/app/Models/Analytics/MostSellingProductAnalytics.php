<?php

namespace App\Models\Analytics;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MostSellingProductAnalytics extends Model
{
    use HasFactory;

    protected $table = 'most_selling_product_analytics';

    protected $fillable = [
        'date',
        'period_type',
        'product_id',
        'product_name',
        'seller_id',
        'seller_name',
        'category',
        'total_orders',
        'total_quantity_sold',
        'total_revenue',
        'average_rating',
        'total_reviews',
        'month_year',
        'year',
    ];

    protected $casts = [
        'date' => 'date',
        'total_revenue' => 'decimal:2',
        'average_rating' => 'decimal:2',
        'total_orders' => 'integer',
        'total_quantity_sold' => 'integer',
        'total_reviews' => 'integer',
    ];

    /**
     * Get most selling products for a specific period
     */
    public static function getMostSellingProducts($periodType = 'monthly', $startDate = null, $endDate = null, $limit = 10)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->orderBy('total_quantity_sold', 'desc')
                    ->orderBy('total_revenue', 'desc')
                    ->limit($limit)
                    ->get();
    }

    /**
     * Get most selling products trend over time
     */
    public static function getMostSellingProductsTrend($periodType = 'monthly', $startDate = null, $endDate = null)
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
                product_name,
                seller_name,
                category,
                SUM(total_quantity_sold) as total_quantity,
                SUM(total_revenue) as total_revenue,
                SUM(total_orders) as total_orders,
                AVG(average_rating) as avg_rating
            ')
            ->groupBy('date', 'product_name', 'seller_name', 'category')
            ->orderBy('date', 'asc')
            ->get();
    }

    /**
     * Get top selling products by category
     */
    public static function getTopSellingProductsByCategory($periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->selectRaw('
                category,
                product_name,
                seller_name,
                SUM(total_quantity_sold) as total_quantity,
                SUM(total_revenue) as total_revenue,
                SUM(total_orders) as total_orders,
                AVG(average_rating) as avg_rating
            ')
            ->groupBy('category', 'product_name', 'seller_name')
            ->orderBy('total_quantity', 'desc')
            ->get()
            ->groupBy('category')
            ->map(function ($products) {
                return $products->take(5); // Top 5 products per category
            });
    }

    /**
     * Get monthly/yearly selling trends for a specific product
     */
    public static function getProductSellingTrend($productId, $periodType = 'monthly', $startDate = null, $endDate = null)
    {
        $query = self::where('product_id', $productId)
                    ->where('period_type', $periodType);
        
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        
        return $query->orderBy('date', 'asc')->get();
    }
}

