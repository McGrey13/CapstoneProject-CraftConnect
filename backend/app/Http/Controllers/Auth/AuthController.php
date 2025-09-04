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
use Laravel\Socialite\Facades\Socialite;
use Exception;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;

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
        $sellers = Seller::with(['user', 'products'])->get()->map(function ($seller) {
            return [
                'sellerID' => $seller->sellerID,
                'businessName' => $seller->businessName,
                'specialty' => $seller->specialty,
                'status' => $seller->status,
                'created_at' => $seller->created_at,
                'updated_at' => $seller->updated_at,
                'profile_image_url' => $seller->profile_image_url,
                'products_count' => $seller->products->count(),
                'user' => [
                    'id' => $seller->user->id,
                    'userName' => $seller->user->userName,
                    'userEmail' => $seller->user->userEmail,
                    'userAddress' => $seller->user->userAddress,
                    'userContactNumber' => $seller->user->userContactNumber,
                ]
            ];
        });

        return response()->json($sellers);
    }

    public function getSellerById($id)
    {
        try {
            $seller = Seller::where('user_id', $id)
                ->with('user') // eager load the user relationship
                ->first();

            if (!$seller) {
                return response()->json(['message' => 'Seller not found'], 404);
            }

            return response()->json([
                'id' => $seller->id,
                'shop_name' => $seller->shop_name ?? null,
                'shop_description' => $seller->shop_description ?? null,
                'created_at' => $seller->created_at,
                'updated_at' => $seller->updated_at,

                // pull user fields
                'user' => [
                    'id' => $seller->user->id,
                    'userName' => $seller->user->userName,
                    'userEmail' => $seller->user->userEmail,
                    'userAddress' => $seller->user->userAddress,
                    'userContactNumber' => $seller->user->userContactNumber,
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Error fetching seller: ' . $e->getMessage()
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
        'userName' => 'required|string|max:255',
        'userEmail' => 'required|string|email|max:255|unique:users,userEmail',
        'userPassword' => 'required|string|min:8|confirmed',
        'userContactNumber' => 'required|string|max:15',
        'role' => 'required|string|in:administrator,seller,customer',
    ]);

    $otp = rand(100000, 999999);

    $user = User::create([
        'userName' => $request->userName,
        'userEmail' => $request->userEmail,
        'userPassword' => Hash::make($request->userPassword),
        'userContactNumber' => $request->userContactNumber,
        'role' => $request->role,
        'otp' => $otp,
        'otp_expires_at' => Carbon::now()->addMinutes(10),
        'is_verified' => false, // default
    ]);

    // Assign role relationships
    if ($request->role === 'administrator') {
        Administrator::create(['user_id' => $user->userID]);
    } elseif ($request->role === 'seller') {
        Seller::create(['user_id' => $user->userID]);
    } elseif ($request->role === 'customer') {
        Customer::create(['user_id' => $user->userID]);
    }

    // Send OTP
    Mail::raw("Your OTP is: {$otp}", function ($message) use ($user) {
        $message->to($user->userEmail)->subject('Your OTP Code');
    });

    return response()->json([
        'message' => 'User registered successfully. Please verify with the OTP sent to your email.',
        'userEmail' => $user->userEmail, 
    ], 201);
}

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

        if (!$user->is_verified) {
            return response()->json(['message' => 'Please verify your account before logging in.'], 403);
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

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'userEmail' => 'required|email',
            'otp' => 'required'
        ]);
    
        $user = User::where('userEmail', $request->userEmail)->first();
    
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
    
        if ($user->otp !== $request->otp || Carbon::now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'Invalid or expired OTP'], 400);
        }
    
        $user->is_verified = true;
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();
    
        // 🔑 Create token after successful verification
        $token = $user->createToken('auth_token')->plainTextToken;
    
        return response()->json([
            'message' => 'Account verified successfully',
            'token' => $token,
            'user' => $user
        ]);
    }
    
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
    
            $user = User::where('userEmail', $googleUser->getEmail())->first();
    
            if (!$user) {
                $user = User::create([
                    'userName'      => $googleUser->getName(),
                    'userEmail'     => $googleUser->getEmail(),
                    'userPassword'  => bcrypt(Str::random(16)),
                    'role'          => 'customer',
                ]);
            }
    
            $token = $user->createToken('auth_token')->plainTextToken;
    
            return redirect("http://localhost:5173/login?token={$token}");
        } catch (Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    
    public function deactivate(Request $request)
    {
        $userId = Auth::id();
        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user->status = 'inactive';
        $user->save();

        if (method_exists($user, 'tokens')) {
            $user->tokens()->delete();
        }

        Log::info('User deactivated account.', ['userID' => $user->id]);

        return response()->json(['message' => 'Account deactivated successfully.']);
    }

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

        Log::info('User deleted account.', ['userID' => $user->id]);

        return response()->json(['message' => 'Account deleted successfully.']);
    }
}

