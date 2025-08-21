<?php 


namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Seller;


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

    public function getArtisanDetails($id)
    {
        $seller = Seller::with(['user', 'products' => function ($q) {
            $q->where('approval_status', 'approved');
        }])->where('sellerID', $id)->first();

        if (!$seller) {
            return response()->json(['message' => 'Seller not found'], 404);
        }

        return response()->json([
            'id' => $seller->sellerID,
            'user' => [
                'userName' => $seller->user->userName,
                'userAddress' => $seller->user->userAddress,
                'profile_photo_url' => $seller->user->profile_photo_url ?? '',
            ],
            'specialty' => $seller->specialty ?? '',
            'story' => $seller->story ?? '',
            'video_url' => $seller->video_url ?? '',
            'products' => $seller->products->map(function ($p) {
                return [
                    'id' => $p->id,
                    'productName' => $p->productName,
                    'productPrice' => $p->productPrice,
                    'productImage' => $p->productImage,
                ];
            }),
        ]);
    }

    // Show the authenticated seller's profile
    public function showProfile(Request $request)
    {
        $user = Auth::user();

        // Ensure seller exists
        $seller = $user->seller;
        if (!$seller) {
            $seller = Seller::create([
                'userID' => $user->userID,
                'story' => '',
                'specialty' => '',
                'website' => '',
            ]);
        }

        return response()->json([
            'sellerID' => $seller->sellerID,
            'userName' => $user->userName,
            'userEmail' => $user->userEmail,
            'role' => $user->role,
            'userBirthday' => $user->userBirthday,
            'userContactNumber' => $user->userContactNumber,
            'userAddress' => $user->userAddress,
            'profileImage' => $user->profile_photo_url ?? '',
            'story' => $seller->story ?? '',
            'website' => $seller->website ?? '',
        ]);
}


        // Update the seller's profile
        public function updateProfile(Request $request, $sellerID)
    {
        $seller = Seller::find($sellerID);
        if (!$seller) {
            return response()->json(['message' => 'Seller not found.'], 404);
        }

        $user = $seller->user;
        if (!$user) {
            return response()->json(['message' => 'User not found for this seller.'], 404);
        }

        $request->validate([
            'story' => 'nullable|string|max:1000',
            'userName' => 'nullable|string|max:255',
            'profileImage' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('profileImage')) {
            $path = $request->file('profileImage')->store('profile_images', 'public');
            $user->profile_photo_url = '/storage/' . $path;
            $user->save();
        }

        if ($request->filled('userName')) {
            $user->userName = $request->input('userName');
            $user->save();
        }

        if ($request->filled('story')) {
            $seller->story = $request->input('story');
            $seller->save();
        }

        return response()->json(['message' => 'Profile updated successfully.']);
    }

}
