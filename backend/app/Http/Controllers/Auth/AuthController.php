<?php 

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\http\Response;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{
    public function index()
    {
        // Add your methods here for admin authentication
    }

    public function register(Request $request)
    {
        $fields = $request->validate([
            'userFirstName' => 'required|string|',
            'userLastName' => 'required|string|',
            'userEmail' => 'required|string|email|max:255|unique:users,userEmail',
            'userPassword' => 'required|string|confirmed',
            'userBirthDay' => 'nullable|string',
            'userContactNumber' => 'nullable|string|max:15',
            'userAddress' => 'nullable|string|max:255',
        ]);
 
        $user = User::create([

            'userFirstName' => $fields['userFirstName'],
            'userLastName' => $fields['userLastName'], 
            'userEmail' => $fields['userEmail'],
            'userPassword' => bcrypt($fields['userPassword']),
            'userBirthDay' => $fields['userBirthDay']?? null,
            'userContactNumber' => $fields['userContactNumber']?? null,
            'userAddress' => $fields['userAddress']?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response  = [
            'user' => $user,
            'token' => $token,
        ];

        return response($response, 201);
        
    }

    public function login(Request $request)
    {
        $fields = $request->validate([
            'userEmail' => 'required|string|email',
            'userPassword' => 'required|string',
        ]);

        // Check email
        $user = User::where('userEmail', $fields['userEmail'])->first();
        if (!$user || !Hash::check($fields['userPassword'], $user->userPassword)) {
            return response([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = [
            'user' => $user,
            'token' => $token,
        ];

        return response($response, 200);
    }
     public function logout(Request $request)
        {
            $request->user()->tokens()->delete();

            return response([
                'message' => 'Logged out successfully'
            ]);
        }
}

