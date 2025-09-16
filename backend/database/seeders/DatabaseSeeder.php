<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Seller;
use App\Models\Customer;
use App\Models\Administrator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'userName' => 'customeruser',
                'userEmail' => 'customeruser@example.com',
                'role' => 'customer',
            ],
            [
                'userName' => 'selleruser',
                'userEmail' => 'selleruser@example.com',
                'role' => 'seller',
            ],
            [
                'userName' => 'adminuser',
                'userEmail' => 'adminuser@example.com',
                'role' => 'administrator',
            ],
        ];

        foreach ($users as $userData) {
            $user = User::create([
                'userName' => $userData['userName'],
                'userEmail' => $userData['userEmail'],
                'userPassword' => Hash::make('password123'),
                'userContactNumber' => '09123456789',
                'role' => $userData['role'],
                'is_verified' => true, // bypass 2FA
            ]);

            // Create role-specific profile
            switch ($user->role) {
                case 'customer':
                    Customer::create([
                        'user_id' => $user->userID,
                        'profile_picture_path' => null,
                    ]);
                    break;

                case 'seller':
                    Seller::create([
                        'user_id' => $user->userID,
                        'businessName' => $user->userName . "'s Shop",
                        'story' => 'This is the story of ' . $user->userName,
                        'website' => null,
                        'profile_picture_path' => null,
                        'background_picture_path' => null,
                        'promotional_video_path' => null,
                    ]);
                    break;

                case 'administrator':
                    Administrator::create([
                        'user_id' => $user->userID,
                        'profile_picture_path' => null,
                    ]);
                    break;
            }

            // Generate Sanctum token
            $token = $user->createToken($userData['role'] . 'Token')->plainTextToken;

            // Print info in console
            echo "\n=================================\n";
            echo ucfirst($userData['role']) . " User Created:\n";
            echo "Email: {$userData['userEmail']}\n";
            echo "Password: password123\n";
            echo "API Token: {$token}\n";
            echo "=================================\n";
        }
    }
}
