<?php 

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use app\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class CustomerAuthController extends Controller
{
    public function index()
    {
        $customer  = Customer::all();
    }
    
    public function register(Request $request)
    {
        // Logic for customer registration
         // Validate the request data
        $customerData = $request->validate([
            'customerEmail' => 'required|email|unique:customers,customerEmail',
            'customerPassword' => 'required|min:8',
            'customerFirstName' => 'required|string|max:255',
            'customerLastName' => 'required|string|max:255',
        ]);

        $user = User::create([
            'customerFirstName' => 'required|string|max:255',
            'customerLastName' => 'required|string|max:255',
            'customerBirthDay' => 'nullable|date',
            'customerContactNumber' => 'nullable|string|max:15',
            'customerAddress' => 'nullable|string|max:255',
        ]);

             $customer = Customer::create([
            'user_id' => $user->id,
            'customerEmail' => $request->email,
            'customerPassword' => Hash::make($request->password),
        ]);

        // Create a new customer record
        Customer::create($customerData);
        // Return a response or redirect
        return redirect()->route('customer.dashboard')->with('success', 'Account created successfully!');
    }

    public function login(Request $request)
    {
        // Logic for customer login
        $credentials = $request->validate([
            'customerEmail' => 'required|email',
            'customerPassword' => 'required|min:8, ',
        ]);

      $customer = Customer::where('email', $request->email)->first();

       if ($customer && Hash::check($request->password, $customer->password)) {
            Auth::login($customer->user);
            return redirect()->route('customer.dashboard')->with('success', 'Login successful!');
        }

        return back()->withErrors(['email' => 'Invalid credentials.']);
    }
}
