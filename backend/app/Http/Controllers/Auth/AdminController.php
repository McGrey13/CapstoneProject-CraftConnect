<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Seller;
use App\Models\Customer;
use App\Models\Administrator;
use App\Models\Store;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AdminController extends AuthController
{
    /**
     * Check if the current user is an admin
     */
    private function checkAdminRole()
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'administrator') {
            abort(403, 'Unauthorized: Admin access required.');
        }
    }

    /**
     * Display the administrator dashboard.
     *
     * @return \Illuminate\View\View
     */
    public function dashboard()
    {
        // Example: Fetch some data for the admin dashboard
        $totalUsers = User::count();
        $totalSellers = Seller::count();
        $totalCustomers = Customer::count();

    }

    /**
     * Implement the addNewAdmin() method from UML.
     * This would typically be a form submission to create a new admin user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function addNewAdmin(Request $request)
    {
        $request->validate([
            'userName' => ['required', 'string', 'max:255'],
            'userEmail' => ['required', 'string', 'email', 'max:255', 'unique:users,userEmail'],
            'userPassword' => ['required', 'string', 'min:8'], // No 'confirmed' if admin sets password
        ]);

        $user = User::create([
            'userName' => $request->userName,
            'userEmail' => $request->userEmail,
            'userPassword' => Hash::make($request->userPassword),
            // Other user fields can be added here if needed
        ]);

        $user->administrator()->create([]);

        return redirect()->back()->with('success', 'New administrator added successfully!');
    }

    /**
     * Implement the displayAdmin() method from UML.
     *
     * @param  int  $id
     * @return \Illuminate\View\View
     */
    public function displayAdmin($id)
    {
        $admin = Administrator::with('user')->findOrFail($id);
        return view('admin.show_admin', compact('admin'));
    }

    /**
     * Implement the updateAdministrator() method from UML.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function updateAdministrator(Request $request, $id)
    {
        $admin = Administrator::findOrFail($id);
        $user = $admin->user; // Get the associated User model

        $request->validate([
            'userName' => ['required', 'string', 'max:255'],
            'userEmail' => ['required', 'string', 'email', 'max:255', 'unique:users,userEmail,' . $user->userID . ',userID'],
            // Add other user fields to validate/update
        ]);

        $user->update([
            'userName' => $request->userName,
            'userEmail' => $request->userEmail,
            // Update other user fields
        ]);

        // If there were specific admin fields, update them here:
        // $admin->update([...]);

        return redirect()->back()->with('success', 'Administrator updated successfully!');
    }

    /**
     * Implement the displayAllCustomer() method from UML.
     *
     * @return \Illuminate\View\View
     */
    public function displayAllCustomers()
    {
        $customers = Customer::with('user')->get();
        return view('admin.customers', compact('customers'));
    }

    /**
     * Implement the displayAllSeller() method from UML.
     *
     * @return \Illuminate\View\View
     */
    public function displayAllSellers()
    {
        $sellers = Seller::with('user')->get();
        return view('admin.sellers', compact('sellers'));
    }

    /**
     * Implement the blockCustomer() method from UML.
     * This is a conceptual example; blocking might involve a 'status' column on the User model.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function blockCustomer($id)
    {
        $customer = Customer::findOrFail($id);
        $user = $customer->user;
        // Example: Add a 'status' column (e.g., 'active', 'blocked') to the users table
        // $user->update(['status' => 'blocked']);
        return redirect()->back()->with('success', 'Customer ' . $user->userName . ' blocked.');
    }

    /**
     * Implement the blockSeller() method from UML.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function blockSeller($id)
    {
        $seller = Seller::findOrFail($id);
        $user = $seller->user;
        // Example: Add a 'status' column (e.g., 'active', 'blocked') to the users table
        // $user->update(['status' => 'blocked']);
        return redirect()->back()->with('success', 'Seller ' . $user->userName . ' blocked.');
    } 

    // verify seller
    public function verifySeller($sellerID)
    {
        $seller = Seller::find($sellerID);
        $seller->is_verified = true;
        $seller->save();
        return response()->json(['message' => 'Seller verified successfully']);
    }

    /**
     * Get all stores for admin verification
     */
    public function getAllStores(Request $request)
    {
        $this->checkAdminRole();
        
        $query = Store::with(['seller.user', 'user'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by store name or owner name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('store_name', 'like', "%{$search}%")
                  ->orWhere('owner_name', 'like', "%{$search}%")
                  ->orWhereHas('user', function($userQuery) use ($search) {
                      $userQuery->where('userName', 'like', "%{$search}%");
                  });
            });
        }

        $stores = $query->paginate(15);

        // Add document URLs
        $stores->getCollection()->transform(function ($store) {
            $store->logo_url = $store->logo_path ? url('storage/' . $store->logo_path) : null;
            $store->bir_url = $store->bir_path ? url('storage/' . $store->bir_path) : null;
            $store->dti_url = $store->dti_path ? url('storage/' . $store->dti_path) : null;
            $store->id_image_url = $store->id_image_path ? url('storage/' . $store->id_image_path) : null;
            return $store;
        });

        return response()->json($stores);
    }

    /**
     * Get store details for verification
     */
    public function getStoreDetails($storeId)
    {
        $store = Store::with(['seller.user', 'user'])
            ->findOrFail($storeId);

        $store->logo_url = $store->logo_path ? url('storage/' . $store->logo_path) : null;
        $store->bir_url = $store->bir_path ? url('storage/' . $store->bir_path) : null;
        $store->dti_url = $store->dti_path ? url('storage/' . $store->dti_path) : null;
        $store->id_image_url = $store->id_image_path ? url('storage/' . $store->id_image_path) : null;

        return response()->json($store);
    }

    /**
     * Approve store and verify seller
     */
    public function approveStore($storeId)
    {
        $this->checkAdminRole();
        
        $store = Store::findOrFail($storeId);
        
        // Update store status
        $store->update(['status' => 'approved']);
        
        // Verify the seller
        $seller = $store->seller;
        if ($seller) {
            $seller->update(['is_verified' => true]);
        }

        return response()->json([
            'message' => 'Store approved and seller verified successfully',
            'store' => $store
        ]);
    }

    /**
     * Reject store with reason
     */
    public function rejectStore(Request $request, $storeId)
    {
        $this->checkAdminRole();
        
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        $store = Store::findOrFail($storeId);
        
        // Update store status with rejection reason
        $store->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason
        ]);

        return response()->json([
            'message' => 'Store rejected successfully',
            'reason' => $request->reason
        ]);
    }

    /**
     * Get store documents for viewing
     */
    public function getStoreDocuments($storeId)
    {
        $store = Store::findOrFail($storeId);
        
        $documents = [
            'logo' => $store->logo_path ? [
                'path' => $store->logo_path,
                'url' => url('storage/' . $store->logo_path),
                'type' => 'image'
            ] : null,
            'bir_permit' => $store->bir_path ? [
                'path' => $store->bir_path,
                'url' => url('storage/' . $store->bir_path),
                'type' => $this->getFileType($store->bir_path)
            ] : null,
            'dti_permit' => $store->dti_path ? [
                'path' => $store->dti_path,
                'url' => url('storage/' . $store->dti_path),
                'type' => $this->getFileType($store->dti_path)
            ] : null,
            'id_document' => $store->id_image_path ? [
                'path' => $store->id_image_path,
                'url' => url('storage/' . $store->id_image_path),
                'type' => $this->getFileType($store->id_image_path),
                'id_type' => $store->id_type
            ] : null,
        ];

        return response()->json([
            'store_id' => $store->storeID,
            'store_name' => $store->store_name,
            'owner_name' => $store->owner_name,
            'tin_number' => $store->tin_number,
            'documents' => $documents
        ]);
    }

    /**
     * Get store verification statistics
     */
    public function getVerificationStats()
    {
        $this->checkAdminRole();
        
        $stats = [
            'total_stores' => Store::count(),
            'pending_stores' => Store::where('status', 'pending')->count(),
            'approved_stores' => Store::where('status', 'approved')->count(),
            'rejected_stores' => Store::where('status', 'rejected')->count(),
            'verified_sellers' => Seller::where('is_verified', true)->count(),
            'unverified_sellers' => Seller::where('is_verified', false)->count(),
            'total_customers' => User::where('role', 'customer')->count(),
            'total_artisans' => User::where('role', 'seller')->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Helper method to determine file type
     */
    private function getFileType($filePath)
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        
        if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'svg'])) {
            return 'image';
        } elseif (in_array($extension, ['pdf'])) {
            return 'pdf';
        } else {
            return 'file';
        }
    }
}
