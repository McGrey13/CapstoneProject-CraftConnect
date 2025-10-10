<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use App\Models\Payment;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

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

    /**
     * Get all payments for the authenticated seller
     */
    public function getPayments(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get seller record
            $seller = Seller::where('user_id', $user->userID)->first();
            
            if (!$seller) {
                return response()->json([
                    'success' => false,
                    'message' => 'Seller profile not found'
                ], 404);
            }

            Log::info('Fetching payments for seller', [
                'seller_id' => $seller->sellerID,
                'user_id' => $user->userID
            ]);

            // Get all orders for this seller that have online payments
            $orders = Order::with(['customer.user', 'orderProducts.product'])
                ->where('sellerID', $seller->sellerID)
                ->whereIn('payment_method', ['gcash', 'paymaya'])
                ->where('paymentStatus', 'paid')
                ->orderBy('created_at', 'desc')
                ->get();

            Log::info('Found orders with online payments', [
                'count' => $orders->count()
            ]);

            // Transform orders into payment records
            $payments = $orders->map(function($order) {
                $customerName = $order->customer && $order->customer->user 
                    ? $order->customer->user->userName 
                    : 'Unknown Customer';
                
                return [
                    'id' => $order->orderID,
                    'payment_id' => $order->orderID,
                    'reference_number' => $order->order_number ?? 'ORD-' . $order->orderID,
                    'order_id' => $order->order_number ?? 'ORD-' . $order->orderID,
                    'customer_name' => $customerName,
                    'amount' => $order->totalAmount,
                    'payment_method' => $order->payment_method,
                    'payment_status' => $order->paymentStatus,
                    'created_at' => $order->created_at->format('Y-m-d H:i:s')
                ];
            });

            // Calculate statistics
            $stats = [
                'totalEarnings' => $payments->where('payment_status', 'paid')->sum('amount'),
                'pendingPayouts' => $payments->where('payment_status', 'processing')->sum('amount'),
                'gcashPayments' => $payments->where('payment_method', 'gcash')
                                          ->where('payment_status', 'paid')
                                          ->sum('amount'),
                'paymayaPayments' => $payments->where('payment_method', 'paymaya')
                                            ->where('payment_status', 'paid')
                                            ->sum('amount')
            ];
            
            Log::info('Payment statistics', $stats);

            return response()->json([
                'success' => true,
                'payments' => $payments,
                'stats' => $stats
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error fetching seller payments: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Unable to fetch payments',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
