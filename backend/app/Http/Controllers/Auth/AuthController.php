<?php 


// use App\Http\Controllers\Controller;
// use Illuminate\Http\Request;
// use App\Models\User;
// use Illuminate\http\Response;
// use Illuminate\Support\Facades\Hash;


// class AuthController extends Controller
// {
//     public function index()
//     {
//         // Add your methods here for admin authentication
//     }

//     public function register(Request $request)
//     {
//         $fields = $request->validate([
//             'userFirstName' => 'required|string|',
//             'userLastName' => 'required|string|',
//             'userEmail' => 'required|string|email|max:255|unique:users,userEmail',
//             'userPassword' => 'required|string|confirmed',
//             'userBirthDay' => 'nullable|string',
//             'userContactNumber' => 'nullable|string|max:15',
//             'userAddress' => 'nullable|string|max:255',
//         ]);
 
//         $user = User::create([

//             'userFirstName' => $fields['userFirstName'],
//             'userLastName' => $fields['userLastName'], 
//             'userEmail' => $fields['userEmail'],
//             'userPassword' => bcrypt($fields['userPassword']),
//             'userBirthDay' => $fields['userBirthDay']?? null,
//             'userContactNumber' => $fields['userContactNumber']?? null,
//             'userAddress' => $fields['userAddress']?? null,
//         ]);

//         $token = $user->createToken('auth_token')->plainTextToken;

//         $response  = [
//             'user' => $user,
//             'token' => $token,
//         ];

//         return response($response, 201);
        
//     }

//     public function login(Request $request)
//     {
//         $fields = $request->validate([
//             'userEmail' => 'required|string|email',
//             'userPassword' => 'required|string',
//         ]);

//         // Check email
//         $user = User::where('userEmail', $fields['userEmail'])->first();
//         if (!$user || !Hash::check($fields['userPassword'], $user->userPassword)) {
//             return response([
//                 'message' => 'Invalid credentials'
//             ], 401);
//         }

//         $token = $user->createToken('auth_token')->plainTextToken;

//         $response = [
//             'user' => $user,
//             'token' => $token,
//         ];

//         return response($response, 200);
//     }
//      public function logout(Request $request)
//         {
//             $request->user()->tokens()->delete();

//             return response([
//                 'message' => 'Logged out successfully'
//             ]);
//         }


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
    public function showRegistrationForm()
    {
        return view('auth.register'); // You'll need to create this Blade view
    }

    public function getCustomers()
    {
        return response()->json(User::where('role', 'customer')->get());
    }

    public function getSellers()
    {
        return response()->json(User::where('role', 'seller')->get());
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
     * Show the login form.
     *
     * @return \Illuminate\View\View
     */
    public function showLoginForm()
    {
        return view('auth.login'); // You'll need to create this Blade view
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

    /**
     * Log the user out of the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function deactivate(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user->status = 'inactive';
        $user->save();

        $user->tokens()->delete();

        Log::info('User deactivated account.', ['user_id' => $user->id]);

        return response()->json(['message' => 'Account deactivated successfully.']);
    }

    /**
     * Permanently delete the authenticated user's account.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }
        
        $user->tokens()->delete();
        $user->delete();

        Log::info('User deleted account.', ['user_id' => $user->id]);

        return response()->json(['message' => 'Account deleted successfully.']);
    }
}

