<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Product;
use App\Models\ProductVariation;
use App\Models\Seller;
use App\Http\Controllers\ChatController;
use App\Services\NotificationService;
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
            $variationIds = $cartItems->pluck('variation_id')->filter()->unique()->toArray();
            $variations = !empty($variationIds)
                ? ProductVariation::whereIn('variation_id', $variationIds)->get()->keyBy('variation_id')
                : collect();

            $formattedCart = $cartItems->map(function($item) use ($products, $variations) {
                $product = $products->get($item->product_id);

                if (!$product) {
                    return null;
                }

                $variation = $item->variation_id ? $variations->get($item->variation_id) : null;

                $sellerName = 'Unknown Seller';
                if ($product->seller) {
                    $seller = $product->seller;
                    $sellerName = $seller->businessName ??
                                ($seller->user ? $seller->user->userName : 'Unknown Seller');
                }

                $unitPrice = $item->unit_price ?? ($variation ? (float) $variation->price : (float) $product->productPrice);
                $availableQuantity = $variation
                    ? (int) ($variation->quantity ?? 0)
                    : (int) ($product->productQuantity ?? 0);

                $variationAttributes = $item->variation_attributes;
                if (is_string($variationAttributes)) {
                    $decodedAttributes = json_decode($variationAttributes, true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decodedAttributes)) {
                        $variationAttributes = $decodedAttributes;
                    } else {
                        $variationAttributes = null;
                    }
                }
                if (!$variationAttributes && $variation) {
                    $variationAttributes = array_filter([
                        'size' => $variation->size,
                        'color' => $variation->color,
                    ]);
                }

                return [
                    'cart_id' => $item->cart_id,
                    'product_id' => $item->product_id,
                    'variation_id' => $item->variation_id,
                    'variation_label' => $item->variation_label ?? ($variation->size ?? null),
                    'variation_attributes' => $variationAttributes ?: null,
                    'sku' => $item->sku ?? ($variation->sku ?? null),
                    'quantity' => $item->quantity,
                    'price' => $unitPrice,
                    'total_price' => $unitPrice * $item->quantity,
                    'unit_price' => $unitPrice,
                    'available_quantity' => $availableQuantity,
                    'product' => [
                        'product_id' => $product->product_id,
                        'productName' => $product->productName ?? 'Unknown Product',
                        'productPrice' => (float) $product->productPrice,
                        'productQuantity' => $availableQuantity,
                        'productImage' => $product->productImage,
                        'seller_name' => $sellerName,
                        'category' => $product->category ?? null,
                        'productDescription' => $product->productDescription ?? null
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
            'variation_id' => 'nullable|exists:product_variations,variation_id',
            'variation_label' => 'nullable|string|max:255',
            'variation_attributes' => 'nullable|array',
            'sku' => 'nullable|string|max:255',
            'unit_price' => 'nullable|numeric|min:0',
        ]);

        $product = Product::findOrFail($validated['product_id']);
        $variation = null;

        if (!empty($validated['variation_id'])) {
            $variation = ProductVariation::where('variation_id', $validated['variation_id'])
                ->where('product_id', $product->product_id)
                ->first();

            if (!$variation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid variation for selected product.'
                ], 422);
            }
        }

        $unitPrice = $validated['unit_price'] ??
            ($variation ? (float) $variation->price : (float) $product->productPrice);

        $variationLabel = $validated['variation_label']
            ?? ($variation ? ($variation->size ?? $variation->color ?? null) : null);

        $variationAttributes = $validated['variation_attributes'] ?? [];
        if (empty($variationAttributes) && $variation) {
            $variationAttributes = array_filter([
                'size' => $variation->size,
                'color' => $variation->color,
            ]);
        }

        $sku = $validated['sku'] ?? ($variation->sku ?? null);

        return DB::transaction(function () use ($validated, $variation, $variationLabel, $variationAttributes, $unitPrice, $sku) {
            $query = Cart::where('userID', Auth::user()->userID)
                ->where('product_id', $validated['product_id']);

            if ($variation) {
                $query->where('variation_id', $variation->variation_id);
            } else {
                $query->whereNull('variation_id');
            }

            $existingCartItem = $query->first();

            if ($existingCartItem) {
                $existingCartItem->update([
                    'quantity' => $existingCartItem->quantity + $validated['quantity'],
                    'unit_price' => $unitPrice,
                    'variation_label' => $variationLabel,
                    'variation_attributes' => !empty($variationAttributes) ? $variationAttributes : null,
                    'sku' => $sku,
                ]);
                $existingCartItem->load('product');
                return response()->json($existingCartItem, 200);
            }

            $cartItem = Cart::create([
                'userID' => Auth::user()->userID,
                'product_id' => $validated['product_id'],
                'variation_id' => $variation->variation_id ?? null,
                'variation_label' => $variationLabel,
                'variation_attributes' => !empty($variationAttributes) ? $variationAttributes : null,
                'sku' => $sku,
                'quantity' => $validated['quantity'],
                'unit_price' => $unitPrice,
            ]);

            $cartItem->load('product');
            return response()->json($cartItem, 201);
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

    public function checkout(Request $request)
    {
        try {
            // Start database transaction
            return DB::transaction(function () use ($request) {
                $user = Auth::user();
                
                // Get selected cart item IDs from request (if provided)
                $selectedCartIds = $request->input('selected_items', []);
                
                Log::info('Checkout request', [
                    'user_id' => $user->userID,
                    'selected_items' => $selectedCartIds,
                    'has_selection' => !empty($selectedCartIds)
                ]);
                
                // If selected items are provided, only checkout those items
                // Otherwise, checkout all items (backward compatibility)
                if (!empty($selectedCartIds)) {
                    $cartItems = Cart::with('product')
                        ->where('userID', $user->userID)
                        ->whereIn('cart_id', $selectedCartIds)
                        ->get();
                    
                    Log::info('Checking out selected items', [
                        'selected_count' => count($selectedCartIds),
                        'found_count' => $cartItems->count()
                    ]);
                } else {
                    $cartItems = Cart::with('product')->where('userID', $user->userID)->get();
                    
                    Log::info('Checking out all cart items (no selection provided)', [
                        'cart_count' => $cartItems->count()
                    ]);
                }

                if ($cartItems->isEmpty()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Your cart is empty or selected items not found'
                    ], 400);
                }
                
                // Validate stock availability BEFORE creating order
                foreach ($cartItems as $item) {
                    $freshProduct = Product::find($item->product_id);
                    if (!$freshProduct) {
                        throw new \Exception("Product no longer exists.");
                    }

                    $variation = null;
                    if ($item->variation_id) {
                        $variation = ProductVariation::find($item->variation_id);
                        if (!$variation || $variation->product_id !== $freshProduct->product_id) {
                            throw new \Exception("Selected variation is no longer available for product: {$freshProduct->productName}.");
                        }
                    }

                    $availableQuantity = $variation
                        ? (int) ($variation->quantity ?? 0)
                        : (int) ($freshProduct->productQuantity ?? 0);

                    Log::info('Stock check', [
                        'product' => $freshProduct->productName,
                        'variation_id' => $variation?->variation_id,
                        'available' => $availableQuantity,
                        'requested' => $item->quantity
                    ]);

                    if ($availableQuantity < $item->quantity) {
                        throw new \Exception("Insufficient stock for product: {$freshProduct->productName}. Available: {$availableQuantity}, Requested: {$item->quantity}");
                    }

                    $item->product = $freshProduct;
                    $item->selected_variation = $variation;
                }

                // Get payment method from request, default to 'cod'
                $paymentMethod = $request->input('payment_method', 'cod');
                Log::info('Checkout with payment method', ['payment_method' => $paymentMethod]);

                // Calculate total amount
                $totalAmount = $cartItems->sum(function ($item) {
                    $unitPrice = $item->unit_price
                        ?? ($item->selected_variation ? (float) $item->selected_variation->price : (float) $item->product->productPrice);
                    return $unitPrice * $item->quantity;
                });

                // Find or create customer record
                $customer = Customer::where('user_id', $user->userID)->first();
                if (!$customer) {
                    $customer = Customer::create([
                        'user_id' => $user->userID
                    ]);
                }

                // Generate unique order number (NOT tracking number yet - that comes when rider is assigned)
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

                // Determine payment status based on payment method
                // COD orders should be 'pending' payment until delivery
                // Online payments (GCash/PayMaya) will be 'pending' until webhook confirms
                $paymentStatus = ($paymentMethod === 'cod') ? 'pending' : 'pending';

                // Create order with pending status (will be confirmed after payment)
                $order = Order::create([
                    'customer_id' => $customer->customerID,
                    'sellerID' => $sellerID,
                    'status' => 'pending', // Set to pending initially
                    'paymentStatus' => $paymentStatus,
                    'payment_method' => $paymentMethod, // Save the payment method
                    'totalAmount' => $totalAmount,
                    'location' => $fullAddress,
                    'tracking_number' => null, // Tracking number will be generated when rider is assigned
                    'order_number' => $orderNumber // Assign unique order number
                ]);
                
                Log::info('Order created', [
                    'order_id' => $order->orderID,
                    'payment_method' => $paymentMethod,
                    'payment_status' => $paymentStatus
                ]);

                // Create order products
                $orderProducts = [];
                foreach ($cartItems as $item) {
                    $variation = $item->selected_variation;
                    $variationAttributes = $item->variation_attributes;
                    if (is_string($variationAttributes)) {
                        $decoded = json_decode($variationAttributes, true);
                        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                            $variationAttributes = $decoded;
                        } else {
                            $variationAttributes = null;
                        }
                    }
                    if (!$variationAttributes && $variation) {
                        $variationAttributes = array_filter([
                            'size' => $variation->size,
                            'color' => $variation->color,
                        ]);
                    }
                    $price = $item->unit_price
                        ?? ($variation ? (float) $variation->price : (float) $item->product->productPrice);
                    $quantity = $item->quantity;
                    
                    $orderProducts[] = [
                        'order_id' => $order->orderID,
                        'product_id' => $item->product_id,
                        'variation_id' => $variation?->variation_id,
                        'size' => $variation->size ?? null,
                        'variation_label' => $item->variation_label ?? ($variation->size ?? $variation->color ?? null),
                        'variation_attributes' => $variationAttributes ? json_encode($variationAttributes) : null,
                        'sku' => $item->sku ?? ($variation->sku ?? null),
                        'quantity' => $quantity,
                        'price' => $price,
                        'created_at' => now(),
                        'updated_at' => now()
                    ];

                    // Update product quantity (if needed) - check if enough stock
                    if ($variation) {
                        if ($variation->quantity < $quantity) {
                            throw new \Exception("Insufficient stock for selected variation: {$item->variation_label}.");
                        }
                        $variation->decrement('quantity', $quantity);
                    }

                    if ($item->product->productQuantity !== null) {
                        if ($item->product->productQuantity < $quantity) {
                            throw new \Exception("Insufficient stock for product: {$item->product->productName}. Available: {$item->product->productQuantity}, Requested: {$quantity}");
                        }
                        $item->product->decrement('productQuantity', $quantity);
                    }
                }

                // Bulk insert order products
                OrderProduct::insert($orderProducts);

                // Clear ONLY the selected cart items (or all if no selection)
                // This ensures unselected items remain in cart
                if (!empty($selectedCartIds)) {
                    // Remove only selected items
                    Cart::where('userID', $user->userID)
                        ->whereIn('cart_id', $selectedCartIds)
                        ->delete();
                    
                    Log::info('Cleared selected cart items', [
                        'cleared_count' => count($selectedCartIds)
                    ]);
                } else {
                    // Remove all cart items (backward compatibility)
                    Cart::where('userID', $user->userID)->delete();
                    
                    Log::info('Cleared all cart items');
                }

                // Load relationships for response
                $order->load('orderProducts.product');

                // Notify seller about new order
                // Note: Payment notification will be sent separately when payment is confirmed
                if ($sellerID) {
                    $seller = Seller::find($sellerID);
                    if ($seller && $seller->user_id) {
                        NotificationService::notifyNewOrder($order, $seller->user_id);
                    }
                }

                // Notify customer about order creation
                NotificationService::notifyOrderStatusChange($order, $user->userID, 'pending');

                // Automatically create a conversation so seller can communicate with customer
                // This allows sellers to send receipts and communicate about the order
                ChatController::createConversationForOrder($order);

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

