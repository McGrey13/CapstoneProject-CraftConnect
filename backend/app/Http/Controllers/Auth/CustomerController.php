<?php 

// namespace App\Http\Controllers;

// use Illuminate\Http\Request;
// use App\Models\Customer;
// use app\Models\User;
// use Illuminate\Support\Facades\Auth;
// use Illuminate\Support\Facades\Hash;

// class CustomerAuthController extends Controller
// {
//     public function index()
//     {
//         $customer  = Customer::all();
//     }
    
//     public function register(Request $request)
//     {
//         // Logic for customer registration
//          // Validate the request data
//         $customerData = $request->validate([
//             'customerEmail' => 'required|email|unique:customers,customerEmail',
//             'customerPassword' => 'required|min:8',
//             'customerFirstName' => 'required|string|max:255',
//             'customerLastName' => 'required|string|max:255',
//         ]);

//         $user = User::create([
//             'customerFirstName' => 'required|string|max:255',
//             'customerLastName' => 'required|string|max:255',
//             'customerBirthDay' => 'nullable|date',
//             'customerContactNumber' => 'nullable|string|max:15',
//             'customerAddress' => 'nullable|string|max:255',
//         ]);

//              $customer = Customer::create([
//             'user_id' => $user->id,
//             'customerEmail' => $request->email,
//             'customerPassword' => Hash::make($request->password),
//         ]);

//         // Create a new customer record
//         Customer::create($customerData);
//         // Return a response or redirect
//         return redirect()->route('customer.dashboard')->with('success', 'Account created successfully!');
//     }

//     public function login(Request $request)
//     {
//         // Logic for customer login
//         $credentials = $request->validate([
//             'customerEmail' => 'required|email',
//             'customerPassword' => 'required|min:8, ',
//         ]);

//       $customer = Customer::where('email', $request->email)->first();

//        if ($customer && Hash::check($request->password, $customer->password)) {
//             Auth::login($customer->user);
//             return redirect()->route('customer.dashboard')->with('success', 'Login successful!');
//         }

//         return back()->withErrors(['email' => 'Invalid credentials.']);
//     }


namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CustomerController extends Controller
{
    /**
     * Display the customer dashboard.
     *
     * @return \Illuminate\View\View
     */
    public function dashboard()
    {
        // You can fetch customer-specific data here, e.g., their orders, wishlists, etc.
        $customer = Auth::user()->customer; // Get the authenticated user's customer profile
        return view('customer.dashboard', compact('customer'));
    }

    /**
     * Implement the editCustomerInformation() method from UML.
     * This would typically be a form submission to update customer's profile.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function editCustomerInformation(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'userName' => ['required', 'string', 'max:255'],
            'userEmail' => ['required', 'string', 'email', 'max:255', 'unique:users,userEmail,' . $user->userID . ',userID'],
            'userContactNumber' => ['nullable', 'string', 'max:255'],
            'userAddress' => ['nullable', 'string', 'max:255'],
            // Add other user fields that a customer can edit
        ]);

        $user->customer->update([
            'userName' => $request->userName,
            'userEmail' => $request->userEmail,
            'userContactNumber' => $request->userContactNumber,
            'userAddress' => $request->userAddress,
        ]);

        return redirect()->back()->with('success', 'Your customer information has been updated!');
    }
}
