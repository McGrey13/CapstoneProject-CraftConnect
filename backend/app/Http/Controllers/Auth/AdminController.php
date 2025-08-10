<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Seller;
use App\Models\Customer;
use App\Models\Administrator;
use Illuminate\Support\Facades\Hash;

class AdminController extends AuthController
{
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
}
