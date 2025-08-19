<?php 


namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use app\Models\User;
use app\models\Seller;


class SellerController extends AuthController
{
    /**
     * Display the seller dashboard.
     *
     * @return \Illuminate\View\View
     */
    public function dashboard()
    {
        // You can fetch seller-specific data here, e.g., their products, orders, etc.
        $seller = Auth::user()->seller; // Get the authenticated user's seller profile
        return view('seller.dashboard', compact('seller'));
    }

    /**
     * Implement the editSellerInfo() method from UML.
     * This would typically be a form submission to update seller's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function editSellerInfo(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'userName' => ['required', 'string', 'max:255'],
            'userEmail' => ['required', 'string', 'email', 'max:255', 'unique:users,userEmail,' . $user->userID . ',userID'],
            'userContactNumber' => ['nullable', 'string', 'max:255'],
            'userAddress' => ['nullable', 'string', 'max:255'],
            // Add other user fields that a seller can edit
        ]);

        // $user->update([
        //     'userName' => $request->userName,
        //     'userEmail' => $request->userEmail,
        //     'userContactNumber' => $request->userContactNumber,
        //     'userAddress' => $request->userAddress,
        // ]);

         $user->seller->update([
            'userName' => $request->userName,
            'userEmail' => $request->userEmail,
            'userContactNumber' => $request->userContactNumber,
            'userAddress' => $request->userAddress,
         ]);

        return redirect()->back()->with('success', 'Your seller information has been updated!');
    }

      public function getAllSellers()
    {
        // Eager load user relationship for all sellers
        $sellers = Seller::with('user')->get();

        return response()->json($sellers);
    }

     public function getSellerById($sellerID)
    {
        // Fetch seller with their related user info
        $seller = Seller::with('user')->where('sellerID', $sellerID)->first();

        if (!$seller) {
            return response()->json(['message' => 'Seller not found'], 404);
        }

        return response()->json($seller);
    }
}
