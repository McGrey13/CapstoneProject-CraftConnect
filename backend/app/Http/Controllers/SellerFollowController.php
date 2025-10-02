<?php

namespace App\Http\Controllers;

use App\Models\Seller;
use Illuminate\Http\Request;

class SellerFollowController extends Controller
{
    public function follow(Request $request, $sellerId)
    {
        $user = $request->user();
        $user->followedSellers()->syncWithoutDetaching([$sellerId]);
        return response()->json(['success' => true]);
    }

    public function unfollow(Request $request, $sellerId)
    {
        $user = $request->user();
        $user->followedSellers()->detach($sellerId);
        return response()->json(['success' => true]);
    }

    public function followedSellers(Request $request)
    {
        return $request->user()->followedSellers()->get();
    }
}