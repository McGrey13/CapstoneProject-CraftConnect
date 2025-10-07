<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Analytics Data Verification ===\n\n";

// Check daily data
$dailyCount = DB::table('revenue_analytics')->where('period_type', 'daily')->count();
echo "Daily Revenue Analytics Records: {$dailyCount}\n";

$dailyOrderCount = DB::table('order_analytics')->where('period_type', 'daily')->count();
echo "Daily Order Analytics Records: {$dailyOrderCount}\n";

$dailyReviewCount = DB::table('review_analytics')->where('period_type', 'daily')->count();
echo "Daily Review Analytics Records: {$dailyReviewCount}\n";

$dailyProductCount = DB::table('product_analytics')->where('period_type', 'daily')->count();
echo "Daily Product Analytics Records: {$dailyProductCount}\n";

$dailyModerationCount = DB::table('content_moderation_analytics')->where('period_type', 'daily')->count();
echo "Daily Content Moderation Analytics Records: {$dailyModerationCount}\n";

$dailySellerCount = DB::table('seller_revenue_analytics')->where('period_type', 'daily')->count();
echo "Daily Seller Revenue Analytics Records: {$dailySellerCount}\n";

echo "\n";

// Check monthly data
$monthlyCount = DB::table('revenue_analytics')->where('period_type', 'monthly')->count();
echo "Monthly Revenue Analytics Records: {$monthlyCount}\n";

$monthlyOrderCount = DB::table('order_analytics')->where('period_type', 'monthly')->count();
echo "Monthly Order Analytics Records: {$monthlyOrderCount}\n";

$monthlyReviewCount = DB::table('review_analytics')->where('period_type', 'monthly')->count();
echo "Monthly Review Analytics Records: {$monthlyReviewCount}\n";

$monthlyProductCount = DB::table('product_analytics')->where('period_type', 'monthly')->count();
echo "Monthly Product Analytics Records: {$monthlyProductCount}\n";

$monthlyModerationCount = DB::table('content_moderation_analytics')->where('period_type', 'monthly')->count();
echo "Monthly Content Moderation Analytics Records: {$monthlyModerationCount}\n";

$monthlySellerCount = DB::table('seller_revenue_analytics')->where('period_type', 'monthly')->count();
echo "Monthly Seller Revenue Analytics Records: {$monthlySellerCount}\n";

echo "\n";

// Check date ranges
$firstDaily = DB::table('revenue_analytics')->where('period_type', 'daily')->orderBy('date')->first();
$lastDaily = DB::table('revenue_analytics')->where('period_type', 'daily')->orderBy('date', 'desc')->first();

if ($firstDaily && $lastDaily) {
    echo "Daily Data Range: {$firstDaily->date} to {$lastDaily->date}\n";
}

$firstMonthly = DB::table('revenue_analytics')->where('period_type', 'monthly')->orderBy('date')->first();
$lastMonthly = DB::table('revenue_analytics')->where('period_type', 'monthly')->orderBy('date', 'desc')->first();

if ($firstMonthly && $lastMonthly) {
    echo "Monthly Data Range: {$firstMonthly->date} to {$lastMonthly->date}\n";
}

echo "\n=== Verification Complete ===\n";

