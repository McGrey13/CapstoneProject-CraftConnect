<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['orderProducts.product' => function($query) {
                $query->select('product_id', 'productName', 'productPrice', 'productImage', 'sellerID');
            }, 'orderProducts.product.seller.user'])
            ->where('userID', Auth::user()->userID)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($order) {
                return [
                    'orderID' => $order->orderID,
                    'orderDate' => $order->orderDate,
                    'status' => $order->status,
                    'totalAmount' => $order->totalAmount,
                    'items' => $order->orderProducts->map(function($item) {
                        return [
                            'order_product_id' => $item->order_product_id,
                            'product_id' => $item->product_id,
                            'product_name' => $item->product->productName ?? 'Product Unavailable',
                            'product_image' => $item->product->productImage ?? null,
                            'seller_name' => $item->product->seller->businessName ?? 'Unknown Seller',
                            'price' => $item->price,
                            'quantity' => $item->quantity,
                            'total_amount' => $item->total_amount
                        ];
                    })
                ];
            });

        return response()->json($orders);
    }
}
