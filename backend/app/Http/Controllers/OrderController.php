<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Seller;
use App\Models\Store;
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
            ->where('status', '!=', 'pending_payment') // Only show confirmed orders
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

    public function sellerOrders()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Get seller record for the user
        $seller = Seller::where('user_id', $user->userID)->first();
        if (!$seller) {
            return response()->json(['error' => 'Seller record not found'], 404);
        }

        // Get orders that contain products from this seller
        $orders = Order::with([
                'orderProducts.product' => function($query) use ($seller) {
                    $query->where('seller_id', $seller->sellerID);
                },
                'orderProducts.product.seller.user',
                'user'
            ])
            ->whereHas('orderProducts.product', function($query) use ($seller) {
                $query->where('seller_id', $seller->sellerID);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($order) use ($seller) {
                // Filter order products to only include products from this seller
                $sellerProducts = $order->orderProducts->filter(function($item) use ($seller) {
                    return $item->product && $item->product->seller_id == $seller->sellerID;
                });

                return [
                    'id' => 'ORD-' . $order->orderID,
                    'customer' => $order->user ? $order->user->userName : 'Unknown Customer',
                    'date' => $order->created_at->format('Y-m-d'),
                    'total' => '₱' . number_format($sellerProducts->sum(function($item) {
                        return $item->price * $item->quantity;
                    }), 2),
                    'status' => ucfirst($order->status),
                    'items' => $sellerProducts->sum('quantity'),
                    'order_id' => $order->orderID,
                    'customer_email' => $order->user ? $order->user->userEmail : 'N/A',
                    'products' => $sellerProducts->map(function($item) {
                        return [
                            'product_name' => $item->product->productName ?? 'Product Unavailable',
                            'product_image' => $item->product->productImage ?? null,
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
