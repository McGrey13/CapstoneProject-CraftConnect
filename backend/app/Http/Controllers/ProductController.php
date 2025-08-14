<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use App\Models\Product;

class ProductController extends Controller
{
    /**
     * Check if the authenticated user is a seller
     */


     

    private function checkSeller()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
        
        $seller = $user->seller;
        if (!$seller) {
            return response()->json(['message' => 'User is not a seller'], 403);
        }
        
        return $seller;
    }

    /**
     * Check if the product belongs to the authenticated seller
     */
    private function checkProductOwnership(Product $product)
    {
        $seller = $this->checkSeller();
        if ($seller instanceof \Illuminate\Http\JsonResponse) {
            return $seller;
        }
        
        if ($product->seller_id !== $seller->sellerID) {
            return response()->json(['message' => 'Unauthorized - Product does not belong to you'], 403);
        }
        
        return true;
    }
    public function index()
{
    try {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->role === 'administrator') {
            // Admin can view all products with seller info
            Log::info('Admin fetching all products');
            $products = Product::with('seller.user')->get(); 
        } elseif ($user->role === 'seller') {
            $seller = $user->seller;
            if (!$seller) {
                return response()->json(['message' => 'User is not a seller'], 403);
            }

            Log::info('Seller fetching products', ['seller_id' => $seller->sellerID]);
            $products = Product::where('seller_id', $seller->sellerID)->get();
        } else {
            return response()->json(['message' => 'Unauthorized role'], 403);
        }

        return response()->json($products);
    } catch (\Exception $e) {
        Log::error('Error fetching products:', ['error' => $e->getMessage()]);
        return response()->json(['message' => 'Error fetching products: ' . $e->getMessage()], 500);
    }
}

    

    /**
     * Get product statistics for the authenticated seller
     */
    public function stats()
    {
        try {
            $seller = $this->checkSeller();
            if ($seller instanceof \Illuminate\Http\JsonResponse) {
                return $seller;
            }
            
            $sellerId = $seller->sellerID;
            
            $totalProducts = Product::where('seller_id', $sellerId)->count();
            $inStock = Product::where('seller_id', $sellerId)->where('status', 'in stock')->count();
            // Fix: Removed `->now()` which doesn't exist
            $lowStock = Product::where('seller_id', $sellerId)->where('status', 'low stock')->count();
            $outOfStock = Product::where('seller_id', $sellerId)->where('status', 'out of stock')->count();
            
            return response()->json([
                'total_products' => $totalProducts,
                'in_stock' => $inStock,
                'low_stock' => $lowStock,
                'out_of_stock' => $outOfStock
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching product stats:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error fetching product stats: ' . $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        Log::info('Product creation request received', $request->all());

        $seller = $this->checkSeller();
        if ($seller instanceof \Illuminate\Http\JsonResponse) {
            return $seller;
        }
        
        $data = $request->validate([
            'productName' => 'required|string|max:255',
            'productDescription' => 'nullable|string',
            'productPrice' => 'required|numeric',
            'productQuantity' => 'required|integer|min:0',
            'category' => 'required|string',
            'status' => 'nullable|in:in stock,low stock,out of stock',
            'productImage' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'productVideo' => 'nullable|mimes:mp4,avi,mov|max:20480',
        ]);
        
        $sellerId = $seller->sellerID;
        Log::info('Seller ID:', ['seller_id' => $sellerId]);

        // Assign the seller_id to the data array
        $data['seller_id'] = $sellerId;
        
        // Set default status if not provided
        if (!isset($data['status'])) {
            $data['status'] = 'in stock';
        }

        Log::info('Data to be saved:', $data);

        // Handle image upload
        if ($request->hasFile('productImage')) {
            $data['productImage'] = $request->file('productImage')->store('images', 'public');
            Log::info('Image uploaded:', ['path' => $data['productImage']]);
        }

        // Handle video upload
        if ($request->hasFile('productVideo')) {
            $data['productVideo'] = $request->file('productVideo')->store('videos', 'public');
            Log::info('Video uploaded:', ['path' => $data['productVideo']]);
        }

        try {
            $product = Product::create($data);
            Log::info('Product created successfully:', ['product_id' => $product->product_id]);
            return response()->json(['message' => 'Product created successfully!', 'product' => $product]);
        } catch (\Exception $e) {
            Log::error('Error creating product:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error creating product: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, Product $product) // Changed parameter order for consistency
    {
        $ownershipCheck = $this->checkProductOwnership($product);
        if ($ownershipCheck instanceof \Illuminate\Http\JsonResponse) {
            return $ownershipCheck;
        }

        // If you are sending a POST with _method=PUT, Laravel automatically handles it.
        // You don't need a custom check here.
        $data = $request->validate([
            'productName' => 'required|string|max:255',
            'productDescription' => 'nullable|string',
            'productPrice' => 'required|numeric',
            'productQuantity' => 'required|integer|min:0',
            'category' => 'required|string',
            'status' => 'nullable|in:in stock,low stock,out of stock',
            'productImage' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'productVideo' => 'nullable|mimes:mp4,avi,mov|max:20480',
            'approval_status' => $product->approval_status
        ]);

        if ($request->hasFile('productImage')) {
            $data['productImage'] = $request->file('productImage')->store('images', 'public');
        }

        if ($request->hasFile('productVideo')) {
            $data['productVideo'] = $request->file('productVideo')->store('videos', 'public');
        }

        try {
            $product->update($data);
            Log::info('Product updated successfully:', ['product_id' => $product->product_id]);
            return response()->json(['message' => 'Product updated successfully!']);
        } catch (\Exception $e) {
            Log::error('Error updating product:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error updating product: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Product $product)
    {
        $ownershipCheck = $this->checkProductOwnership($product);
        if ($ownershipCheck instanceof \Illuminate\Http\JsonResponse) {
            return $ownershipCheck;
        }

        try {
            $product->delete();
            Log::info('Product deleted successfully:', ['product_id' => $product->product_id]);
            return response()->json(['message' => 'Product deleted successfully!']);
        } catch (\Exception $e) {
            Log::error('Error deleting product:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error deleting product: ' . $e->getMessage()], 500);
        }
    }

    public function search($name)
    {
        $seller = $this->checkSeller();
        if ($seller instanceof \Illuminate\Http\JsonResponse) {
            return $seller;
        }
        
        $sellerId = $seller->sellerID;
        try {
            $products = Product::where('seller_id', $sellerId)
                             ->where('productName', 'like', '%' . $name . '%')
                             ->get();
            Log::info('Products search completed:', ['search_term' => $name, 'count' => $products->count()]);
            return response()->json($products);
        } catch (\Exception $e) {
            Log::error('Error searching products:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Error searching products: ' . $e->getMessage()], 500);
        }
    }

    public function show(Product $product)
    {
        
    try {
        $ownershipCheck = $this->checkProductOwnership($product);
        if ($ownershipCheck instanceof \Illuminate\Http\JsonResponse) {
            return $ownershipCheck;
        }
        
        Log::info('Product retrieved successfully:', ['product_id' => $product->product_id]);
        return $product;
    } catch (\Exception $e) {
        Log::error('Error retrieving product:', ['error' => $e->getMessage()]);
        return response()->json(['message' => 'Error retrieving product: ' . $e->getMessage()], 500);
    }
    }

    // Approve a product
    public function approve($id)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'administrator') {
            return response()->json(['message' => 'Only admins can approve products'], 403);
        }

        // Find the product by its ID
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->approval_status = 'approved';
        $product->save();

        return response()->json(['message' => 'Product approved successfully']);
    }

    // Reject a product
    public function reject($id)
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'administrator') {
            return response()->json(['message' => 'Only admins can reject products'], 403);
        }

        // Find the product by its ID
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }

        $product->approval_status = 'rejected';
        $product->save();

        return response()->json(['message' => 'Product rejected successfully']);
    }

    /**
     * Get all approved products for a given seller
     */
    public function approvedProduct($seller_id)
{
    try {
        $products = Product::where('seller_id', $seller_id)
            ->where('approval_status', 'approved')
            ->get();

        return response()->json($products);
    } catch (\Exception $e) {
        Log::error('Error fetching approved products for seller:', [
            'seller_id' => $seller_id,
            'error' => $e->getMessage()
        ]);
        return response()->json([
            'message' => 'Error fetching approved products: ' . $e->getMessage()
        ], 500);
    }
}


    
}