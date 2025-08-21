<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Models\User;
use App\Notifications\VerifyEmailNotification;

// Test route to check email configuration (remove in production)
Route::get('/test-email-config', function () {
    $config = [
        'MAIL_MAILER' => env('MAIL_MAILER'),
        'MAIL_HOST' => env('MAIL_HOST'),
        'MAIL_PORT' => env('MAIL_PORT'),
        'MAIL_USERNAME' => env('MAIL_USERNAME'),
        'MAIL_PASSWORD' => env('MAIL_PASSWORD') ? '***' : 'Not set',
        'MAIL_ENCRYPTION' => env('MAIL_ENCRYPTION'),
        'MAIL_FROM_ADDRESS' => env('MAIL_FROM_ADDRESS'),
        'MAIL_FROM_NAME' => env('MAIL_FROM_NAME'),
    ];

    return response()->json([
        'email_config' => $config,
        'app_url' => config('app.url'),
        'app_env' => config('app.env'),
        'mail_driver' => config('mail.default'),
    ]);
});

// Test route to send a test email
Route::get('/send-test-email', function () {
    try {
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'userFirstName' => 'Test',
                'userLastName' => 'User',
                'userType' => 'customer',
                'userPassword' => bcrypt('password'),
                'email_verification_code' => strtoupper(Str::random(6)),
                'userAge' => 25,
                'userBirthDay' => '2000-01-01',
                'userContactNumber' => '1234567890',
                'userAddress' => 'Test Address',
                'email_verified_at' => null,
                'user_contact_number_verified_at' => null,
                'sms_verification_code' => null,
                'sms_code_expires_at' => null,
                'remember_token' => null
            ]
        );

        $user->notify(new VerifyEmailNotification($user->email_verification_code));
        
        return response()->json([
            'status' => 'success',
            'message' => 'Test email sent to ' . $user->email,
            'verification_code' => $user->email_verification_code,
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
        ], 500);
    }
});
