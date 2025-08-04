<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;


class ProductController extends Controller
{

    public function index () {
        // $product  = Product::all();
        // return view('product.index', ['product'=> $product]);

        return Product::all();
    }

    // public function create() {
    //     // return view('product.create');
    // } 

    public function store(Request $request) {

        // dd($request);
        // return redirect()->route('product.index')->with('success', 'Product created successfully!');

        $data = $request->validate([
        'productName' => 'required|string|max:255', 
        'productDescription' => 'nullable|string',
        'productPrice' => 'required|numeric',
        'productImage' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        'productVideo' => 'nullable|mimes:mp4,avi,mov|max:20480',
        ]);

    //        if ($request->hasFile('productImage')) {
    //     $data['productImage'] = $request->file('productImage')->store('images', 'public');
    // }

    // // Handle video upload
    // if ($request->hasFile('productVideo')) {
    //     $data['productVideo'] = $request->file('productVideo')->store('videos', 'public');  
    // }

        Product::create($data);

        //  return redirect()->route('product.index')->with('success', 'Product created successfully!');
    }
    public function update (Product $product, Request $request){
        $data = $request->validate([
        'productName' => 'required|string|max:255', 
        'productDescription' => 'nullable|string',
        'productPrice' => 'required|numeric',
        'productImage' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        'productVideo' => 'nullable|mimes:mp4,avi,mov|max:20480',
        ]);

        $product->update($data);

        // return redirect()->route('product.index')->with('success', 'Product updated successfully!');
    }

    public function destroy(Product $product) {
        $product->delete();
        // return redirect()->route('product.index')->with('success', 'Product deleted successfully!');
    }

    public function search ($name){
        $products = Product::where('productName', 'like', '%' . $name . '%')->get();
        return response()->json($products);
    }
}
  