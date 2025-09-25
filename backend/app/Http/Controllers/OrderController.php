<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Get customer record for the user
        $customer = \App\Models\Customer::where('user_id', $user->userID)->first();
        if (!$customer) {
            return response()->json(['error' => 'Customer record not found'], 404);
        }

        $orders = Order::with(['orderProducts.product' => function($query) {
                $query->select('product_id', 'productName', 'productPrice', 'productImage', 'seller_id');
            }, 'orderProducts.product.seller.user'])
            ->where('customer_id', $customer->customerID)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($order) {
                return [
                    'orderID' => $order->orderID,
                    'orderDate' => $order->created_at->format('Y-m-d H:i:s'),
                    'status' => $order->status,
                    'totalAmount' => $order->totalAmount,
                    'items' => $order->orderProducts->map(function($item) {
                        return [
                            'order_product_id' => $item->orderProducts_id,
                            'product_id' => $item->product_id,
                            'product_name' => $item->product->productName ?? 'Product Unavailable',
                            'product_image' => $item->product->productImage ?? null,
                            'seller_name' => $item->product->seller->businessName ?? 'Unknown Seller',
                            'price' => $item->price,
                            'quantity' => $item->quantity,
                            'total_amount' => $item->price * $item->quantity
                        ];
                    })
                ];
            });

        return response()->json($orders);
    }
}
