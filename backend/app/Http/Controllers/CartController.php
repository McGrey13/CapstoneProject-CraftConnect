<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    // View all cart items for logged-in user
    /**
     * Get all cart items for the authenticated user
     */
    public function index()
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            // First, get all cart items for the user
            $cartItems = Cart::where('userID', $user->userID)->get();
            
            if ($cartItems->isEmpty()) {
                return response()->json([]);
            }

            // Get all product IDs from the cart
            $productIds = $cartItems->pluck('product_id')->unique()->toArray();
            
            // Eager load products with their relationships
            $products = Product::with([
                'seller.user' => function($query) {
                    $query->select('userID', 'userName');
                }
            ])
            ->whereIn('product_id', $productIds)
            ->get()
            ->keyBy('product_id');

            // Map cart items with product data
            $formattedCart = $cartItems->map(function($item) use ($products) {
                $product = $products->get($item->product_id);
                
                if (!$product) {
                    return null;
                }

                $sellerName = 'Unknown Seller';
                if ($product->seller) {
                    $seller = $product->seller;
                    $sellerName = $seller->businessName ?? 
                                ($seller->user ? $seller->user->userName : 'Unknown Seller');
                }

                return [
                    'cart_id' => $item->cart_id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => (float) $product->productPrice,
                    'total_price' => (float) $product->productPrice * $item->quantity,
                    'product' => [
                        'product_id' => $product->product_id,
                        'productName' => $product->productName ?? 'Unknown Product',
                        'productPrice' => (float) $product->productPrice,
                        'productImage' => $product->productImage,
                        'seller_name' => $sellerName
                    ]
                ];
            })->filter()->values();

            return response()->json($formattedCart);

        } catch (\Exception $e) {
            Log::error('CartController error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to fetch cart items',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Add product to cart
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = Cart::where('userID', Auth::user()->userID)
                        ->where('cart_id', $id)
                        ->firstOrFail();
        $cartItem->update(['quantity' => $validated['quantity']]);

        return response()->json([
            'success' => true,
            'message' => 'Cart item updated successfully', 
            'cart_item' => $cartItem
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,product_id',
            'quantity'   => 'required|integer|min:1',
        ]);

        // Use database transaction to prevent race conditions
        return DB::transaction(function () use ($validated) {
            // Check if item already exists in cart
            $existingCartItem = Cart::where('userID', Auth::user()->userID)
                                   ->where('product_id', $validated['product_id'])
                                   ->first();

            if ($existingCartItem) {
                // Update existing item quantity
                $existingCartItem->update([
                    'quantity' => $existingCartItem->quantity + $validated['quantity']
                ]);
                $existingCartItem->load('product');
                return response()->json($existingCartItem, 200);
            } else {
                // Create new cart item
                $cartItem = Cart::create([
                    'userID' => Auth::user()->userID,
                    'product_id' => $validated['product_id'],
                    'quantity' => $validated['quantity'],
                ]);
                
                // Load the product relationship to include in the response
                $cartItem->load('product');
                return response()->json($cartItem, 201);
            }
        });
    }

    // Remove product from cart
    public function destroy($id)
    {
        $cartItem = Cart::where('userID', Auth::user()->userID)->where('cart_id', operator: $id)->firstOrFail();
        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Item removed from cart'
        ]);
    }

    // Checkout: convert cart items into Order + OrderProducts
    public function clear()
    {
        Cart::where('userID', Auth::user()->userID)->delete();
        return response()->json([
            'success' => true,
            'message' => 'Cart cleared successfully'
        ]);
    }

    public function checkout()
    {
        try {
            // Start database transaction
            return DB::transaction(function () {
                $user = Auth::user();
                $cartItems = Cart::with('product')->where('userID', $user->userID)->get();

                if ($cartItems->isEmpty()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Your cart is empty'
                    ], 400);
                }

                // Calculate total amount
                $totalAmount = $cartItems->sum(function ($item) {
                    return $item->product->productPrice * $item->quantity;
                });

                // Find or create customer record
                $customer = Customer::where('user_id', $user->userID)->first();
                if (!$customer) {
                    $customer = Customer::create([
                        'user_id' => $user->userID
                    ]);
                }

                // Generate unique tracking number and order number
                $trackingNumber = $this->generateTrackingNumber();
                $orderNumber = $this->generateOrderNumber();
                
                // Get seller ID from first cart item (assuming single seller per order)
                $firstProduct = $cartItems->first()->product;
                $sellerID = $firstProduct->seller_id ?? null;
                
                // Build complete customer address
                $fullAddress = implode(', ', array_filter([
                    $user->userAddress,
                    $user->userCity,
                    $user->userProvince
                ])) ?: 'Not specified';

                // Create order with pending status (will be confirmed after payment)
                $order = Order::create([
                    'customer_id' => $customer->customerID,
                    'sellerID' => $sellerID,
                    'status' => 'pending', // Set to pending for COD orders
                    'totalAmount' => $totalAmount,
                    'location' => $fullAddress,
                    'tracking_number' => $trackingNumber, // Assign tracking immediately
                    'order_number' => $orderNumber // Assign unique order number
                ]);

                // Create order products
                $orderProducts = [];
                foreach ($cartItems as $item) {
                    $price = $item->product->productPrice;
                    $quantity = $item->quantity;
                    
                    $orderProducts[] = [
                        'order_id' => $order->orderID,
                        'product_id' => $item->product_id,
                        'quantity' => $quantity,
                        'price' => $price,
                        'created_at' => now(),
                        'updated_at' => now()
                    ];

                    // Update product quantity (if needed) - check if enough stock
                    if ($item->product->productQuantity >= $quantity) {
                        $item->product->decrement('productQuantity', $quantity);
                    } else {
                        throw new \Exception("Insufficient stock for product: {$item->product->productName}. Available: {$item->product->productQuantity}, Requested: {$quantity}");
                    }
                }

                // Bulk insert order products
                OrderProduct::insert($orderProducts);

                // DON'T clear cart here - only clear after successful payment
                // Cart will be cleared by the frontend after successful payment

                // Load relationships for response
                $order->load('orderProducts.product');

                return response()->json([
                    'success' => true,
                    'message' => 'Order placed successfully!',
                    'order' => $order
                ]);
            });
        } catch (\Exception $e) {
            Log::error('CartController error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to process checkout',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate unique tracking number
     */
    private function generateTrackingNumber()
    {
        do {
            $trackingNumber = 'CC' . date('Ymd') . strtoupper(substr(md5(uniqid()), 0, 6));
        } while (Order::where('tracking_number', $trackingNumber)->exists() || 
                 \App\Models\Shipping::where('tracking_number', $trackingNumber)->exists());

        return $trackingNumber;
    }

    /**
     * Generate unique order number
     */
    private function generateOrderNumber()
    {
        do {
            $orderNumber = 'ORD-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
        } while (Order::where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}

