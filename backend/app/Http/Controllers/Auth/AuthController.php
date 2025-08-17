<?php 

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Administrator;
use App\Models\Seller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
 

use function Pest\Laravel\withHeaders;

class AuthController extends Controller
{
    /**
     * Show the registration form.
     *
     * @return \Illuminate\View\View
     */

    public function getCustomers()
    {
        return response()->json(User::where('role', 'customer')->get());
    }
public function getSellers()
{
    try {
        $sellers = User::with('seller')
            ->where('role', 'seller')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'userName' => $user->userName,
                    'businessName' => $user->seller->businessName ?? '',
                    'location' => $user->seller->location ?? '',
                    'category' => $user->seller->category ?? '',
                    'revenue' => $user->seller->revenue ?? 0,
                    'productsCount' => $user->seller?->products()->count() ?? 0,
                    'ordersCount' => $user->seller?->orders()->count() ?? 0,
                    'joinDate' => $user->created_at,
                    'status' => $user->status ?? 'active',
                ];
            });

        return response()->json($sellers);

    } catch (\Throwable $e) {
        // Return the actual error message for debugging
        return response()->json([
            'error' => $e->getMessage(),
            'file'  => $e->getFile(),
            'line'  => $e->getLine(),
            'trace' => $e->getTraceAsString(),
        ], 500);
    }
}

    public function getAdmins()
    {
        return response()->json(User::where('role', 'admin')->get());
    }

    public function show(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Return only the basic user data to avoid potential relationship errors
        // You can add more columns here if needed.
        $profileData = [
            'id' => $user->id,
            'userName' => $user->userName,
            'userEmail' => $user->userEmail,
            'role' => $user->role,
            'userBirthday' => $user->userBirthday,
            'userContactNumber' => $user->userContactNumber,
            'userAddress' => $user->userAddress,
        ];
        
        return response()->json($profileData);
    }


    /**
     * Handle user registration.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function register(Request $request)
    {
        
        
        $request->validate([
            'userName' => ['required', 'string', 'max:255'],
            'userEmail' => ['required', 'string', 'email', 'max:255', 'unique:users,userEmail'],
            'userPassword' => ['required', 'string', 'min:8', 'confirmed'],
            'userAge' => ['nullable', 'string', 'max:255'],
            'userBirthday' => ['nullable', 'date'],
            'userContactNumber' => ['nullable', 'string', 'max:255'],
            'userAddress' => ['nullable', 'string', 'max:255'],
            'role' => ['required', 'in:admin,administrator,seller,customer'], // User selects their role
        ]);

        // Create the main User record
        $user = User::create([
            'userName' => $request->userName,
            'userEmail' => $request->userEmail,
            'userPassword' => Hash::make($request->userPassword),
            'userAge' => $request->userAge,
            'userBirthday' => $request->userBirthday,
            'userContactNumber' => $request->userContactNumber,
            'userAddress' => $request->userAddress,
            'role' => $request->role,
            // 'otp'=> rand(100000, 999999),
            // 'otp_expires_at' => Carbon::now()->addMinutes(10)
        ]);

        //
        //

        // Create the specific role record based on selection
        switch ($request->role) {
            case 'admin':
            case 'administrator':
                $user->administrator()->create([]); // Create an empty administrator profile
                break;
            case 'seller':
                $user->seller()->create([]); // Create an empty seller profile
                break;
            case 'customer':
                $user->customer()->create([]); // Create an empty customer profile
                break;
        }

        $token = $user->createToken('auth_token')->plainTextToken;// Create an authentication token

        Auth::login($user); // Log the user in after registration

        $response = [
            'user' => $user,
            'token' => $token,
        ];

        return response($response, 201);
    }

    /**
     * Handle user login.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     * @throws \Illuminate\Validation\ValidationException
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'userEmail' => ['required', 'email'],
            'userPassword' => ['required'],
        ]);

        // Check if user exists and password is correct
        $user = User::where('userEmail', $credentials['userEmail'])->first();
        
        if (!$user || !Hash::check($credentials['userPassword'], $user->userPassword)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Determine user type for frontend routing
        $userType = 'customer'; // default
        if ($user->administrator) {
            $userType = 'admin';
        } elseif ($user->seller) {
            $userType = 'seller';
        }

        return response()->json([
            'user' => $user,
            'token' => $token,
            'user_type' => $userType
        ], 200);
    }

    /**
     * Get the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

     // Log the user out of the application.

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function deactivate(Request $request)
    {
        $userId = Auth::id();
        $user = \App\Models\User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user->status = 'inactive';
        $user->save();

        if (method_exists($user, 'tokens')) {
            $user->tokens()->delete();
        }

        Log::info('User deactivated account.', ['user_id' => $user->id]);

        return response()->json(['message' => 'Account deactivated successfully.']);
    }


     //Permanently delete the authenticated user's account.

    public function destroy(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        
        if ($user instanceof \App\Models\User) {
            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }
            $user->delete();
        } else {
            return response()->json(['message' => 'User instance not found.'], 500);
        }

        Log::info('User deleted account.', ['user_id' => $user->id]);

        return response()->json(['message' => 'Account deleted successfully.']);
    }
}

