<?php 


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class SellerController extends Controller
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
}
