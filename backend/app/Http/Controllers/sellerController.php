<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SellerController extends Controller
{
    /**
     * Get all sellers
     */
    public function index()
    {
        try {
            $sellers = Seller::select('id', 'name', 'email', 'phone')->get();

            return response()->json([
                'status' => 'success',
                'data' => $sellers
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching sellers: ' . $e->getMessage());
            return response()->json([
                'status' => 'error',
                'message' => 'Unable to fetch sellers'
            ], 500);
        }
    }
}
