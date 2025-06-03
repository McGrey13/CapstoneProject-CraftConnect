<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
      public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || $user->email_verification_code !== $request->code) {
            return response()->json(['message' => 'Invalid code.'], 422);
        }

        $user->email_verified_at = now();
        $user->email_verification_code = null;
        $user->save();

        return response()->json(['message' => 'Email verified.']);
    }

    public function verifySms(Request $request)
    {
        $request->validate([
            'userContactNumber' => 'required',
            'code' => 'required'
        ]);

        $user = User::where('userContactNumber', $request->userContactNumber)->first();

        if (!$user || $user->sms_verification_code !== $request->code || now()->gt($user->sms_code_expires_at)) {
            return response()->json(['message' => 'Invalid or expired code.'], 422);
        }

        $user->user_contact_number_verified_at = now();
        $user->sms_verification_code = null;
        $user->sms_code_expires_at = null;
        $user->save();

        return response()->json(['message' => 'Phone number verified.']);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'userPassword' => 'required'
        ]);

        $profile = Customer::where('email', $request->email)->first();
        $userType = 'customer';

        if (!$profile) {
            $profile = Seller::where('email', $request->email)->first();
            $userType = 'seller';
        }

        if (!$profile || !\Hash::check($request->userPassword, $profile->userPassword)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $user = $profile->user;

        // Check verification, then issue token
        $token = $user->createToken('api-token')->plainTextToken;
        return response()->json(['token' => $token, 'user' => $user, 'userType' => $userType]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'userName' => 'required|string|max:255',
            'userType' => 'required|in:customer,seller',
            'email' => 'required|email',
            'userPassword' => 'required|string|min:6',
            // ...other fields...
        ]);

        $user = User::create([
            'userName' => $request->userName,
            'userType' => $request->userType,
            // ...other user fields...
        ]);

        if ($request->userType === 'customer') {
            Customer::create([
                'userID' => $user->userID,
                'email' => $request->email,
                'userPassword' => bcrypt($request->userPassword),
                'userContactNumber' => $request->userContactNumber,
                // ...other fields...
            ]);
        } else {
            Seller::create([
                'userID' => $user->userID,
                'email' => $request->email,
                'userPassword' => bcrypt($request->userPassword),
                'userContactNumber' => $request->userContactNumber,
                // ...other fields...
            ]);
        }

        // Send verification codes as before...
    }
    
}