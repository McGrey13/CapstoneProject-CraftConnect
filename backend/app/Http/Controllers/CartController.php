<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    // View all cart items for logged-in user
    public function index()
    {
        $cart = Cart::with('product')->where('user_id', Auth::id())->get();
        return response()->json($cart);
    }

    // Add product to cart
    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
        ]);

        $cartItem = Cart::updateOrCreate( 
            [
                'user_id' => Auth::id(),
                'product_id' => $validated['product_id'],
            ],
            [
                'quantity' => DB::raw("quantity + {$validated['quantity']}"),
            ]
        );

        return response()->json($cartItem, 201);
    }

    // Remove product from cart
    public function destroy($id)
    {
        $cartItem = Cart::where('user_id', Auth::id())->findOrFail($id);
        $cartItem->delete();

        return response()->json(['message' => 'Item removed from cart']);
    }

    // Checkout: convert cart items into Order + OrderProducts
    public function checkout()
    {
        $cartItems = Cart::with('product')->where('user_id', Auth::id())->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }

        // Create order
        $order = Order::create([
            'user_id' => Auth::id(),
            'status'  => 'pending',
        ]);

        // Create order_products
        foreach ($cartItems as $item) {
            OrderProduct::create([
                'order_id'     => $order->id,
                'product_id'   => $item->product_id,
                'total_amount' => $item->product->price * $item->quantity, // assumes "price" column in products
                'status'       => 'pending',
            ]);
        }

        // Clear cart
        Cart::where('user_id', Auth::id())->delete();

        return response()->json(['message' => 'Checkout successful', 'order' => $order->load('products')]);
    }
}
