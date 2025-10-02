<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Customer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            [
                'userName' => 'John Customer',
                'userEmail' => 'john.customer@example.com',
                'userContactNumber' => '09123456789',
                'userAddress' => '123 Main Street, Quezon City',
                'userCity' => 'Quezon City',
                'userProvince' => 'Metro Manila',
            ],
            [
                'userName' => 'Jane Customer',
                'userEmail' => 'jane.customer@example.com',
                'userContactNumber' => '09123456790',
                'userAddress' => '456 Oak Avenue, Makati City',
                'userCity' => 'Makati City',
                'userProvince' => 'Metro Manila',
            ],
            [
                'userName' => 'Mike Customer',
                'userEmail' => 'mike.customer@example.com',
                'userContactNumber' => '09123456791',
                'userAddress' => '789 Pine Street, Cebu City',
                'userCity' => 'Cebu City',
                'userProvince' => 'Cebu',
            ],
        ];

        foreach ($customers as $customerData) {
            // Check if user already exists
            $existingUser = User::where('userEmail', $customerData['userEmail'])->first();
            
            if (!$existingUser) {
                $user = User::create([
                    'userName' => $customerData['userName'],
                    'userEmail' => $customerData['userEmail'],
                    'userPassword' => Hash::make('password123'),
                    'userContactNumber' => $customerData['userContactNumber'],
                    'userAddress' => $customerData['userAddress'],
                    'userCity' => $customerData['userCity'],
                    'userProvince' => $customerData['userProvince'],
                    'role' => 'customer',
                    'is_verified' => true,
                ]);

                // Create customer profile
                Customer::create([
                    'user_id' => $user->userID,
                    'profile_picture_path' => null,
                ]);

                // Generate Sanctum token
                $token = $user->createToken('customerToken')->plainTextToken;

                echo "\n=================================\n";
                echo "Customer Created:\n";
                echo "Name: {$customerData['userName']}\n";
                echo "Email: {$customerData['userEmail']}\n";
                echo "Password: password123\n";
                echo "API Token: {$token}\n";
                echo "=================================\n";
            } else {
                echo "Customer with email {$customerData['userEmail']} already exists.\n";
            }
        }
    }
}