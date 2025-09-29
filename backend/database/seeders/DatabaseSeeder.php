<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Seller;
use App\Models\Customer;
use App\Models\Administrator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'userName' => 'Gio Mc Grey O. Calugas',
                'userEmail' => 'giocalugas@example.com',
                'role' => 'customer',
                'userContactNumber' => '09123456789',
                'userAddress' => 'Blk 71 Lot 52, Mabuhay City, Phase 1, Barangay Baclaran',
                'userCity' => 'Cabuyao City',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Shewiliz Antinero',
                'userEmail' => 'shewilizantin@example.com',
                'role' => 'customer',
                'userContactNumber' => '09123456790',
                'userAddress' => 'Cabuyao City',
                'userCity' => 'Cabuyao City',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Denisse Kaith Malabana',
                'userEmail' => 'denissekaith@example.com',
                'role' => 'customer',
                'userContactNumber' => '09123456791',
                'userAddress' => 'Cabuyao',
                'userCity' => 'Cabuyao',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Alex Manalo',
                'userEmail' => 'alexmanalo@example.com',
                'role' => 'seller',
                'userContactNumber' => '09123456790',
                'userAddress' => 'Calamba City',
                'userCity' => 'CalambaCity',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Kuya Galan',
                'userEmail' => 'kuyagala@example.com',
                'role' => 'seller',
                'userContactNumber' => '09123456790',
                'userAddress' => 'Pila',
                'userCity' => 'Pila',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Renel',
                'userEmail' => 'renel@example.com',
                'role' => 'seller',
                'userContactNumber' => '09123456790',
                'userAddress' => 'Pila',
                'userCity' => 'Pila',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Tatay Cesar',
                'userEmail' => 'tataycesar@example.com',
                'role' => 'seller',
                'userContactNumber' => '09123456790',
                'userAddress' => 'Pila',
                'userCity' => 'Pila',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Tatay Tiko',
                'userEmail' => 'tataytiko@example.com',
                'role' => 'seller',
                'userContactNumber' => '09123456790',
                'userAddress' => 'Duhat, Sta. Cruz',
                'userCity' => 'Sta. Cruz',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Mami Baby',
                'userEmail' => 'mamibaby@example.com',
                'role' => 'seller',
                'userContactNumber' => '09123456789',
                'userAddress' => ' Binan City',
                'userCity' => 'Binan City',
                'userProvince' => 'Laguna',
            ],

            [
                'userName' => 'Woodcrafters ',
                'userEmail' => 'woodcrafter@example.com',
                'role' => 'seller',
                'userContactNumber' => '09123456790',
                'userAddress' => 'Platero, Binan City',
                'userCity' => 'Binan City',
                'userProvince' => 'Laguna',
            ],


            [
                'userName' => 'adminuser',
                'userEmail' => 'adminuser@example.com',
                'role' => 'administrator',
                'userContactNumber' => '09123456791',
                'userAddress' => '789 Admin Boulevard, Manila',
                'userCity' => 'Manila',
                'userProvince' => 'Metro Manila',
            ],
        ];

        foreach ($users as $userData) {
            // Check if user already exists
            $existingUser = User::where('userEmail', $userData['userEmail'])->first();
            
            if ($existingUser) {
                echo "User with email {$userData['userEmail']} already exists. Skipping...\n";
                continue;
            }

            $user = User::create([
                'userName' => $userData['userName'],
                'userEmail' => $userData['userEmail'],
                'userPassword' => Hash::make('password123'),
                'userContactNumber' => $userData['userContactNumber'],
                'userAddress' => $userData['userAddress'],
                'userCity' => $userData['userCity'],
                'userProvince' => $userData['userProvince'],
                'role' => $userData['role'],
                'is_verified' => true, // bypass 2FA
            ]);

            // Create role-specific profile only if table exists
            switch ($user->role) {
                case 'customer':
                    if (Schema::hasTable('customers')) {
                        Customer::create([
                            'user_id' => $user->userID,
                            'profile_picture_path' => null,
                        ]);
                    } else {
                        echo "Warning: customers table does not exist. Skipping customer profile creation.\n";
                    }
                    break;

                case 'seller':
                    if (Schema::hasTable('sellers')) {
                        Seller::create([
                            'user_id' => $user->userID,
                            'businessName' => $user->userName . "'s Shop",
                            'story' => 'This is the story of ' . $user->userName,
                            'website' => null,
                            'profile_picture_path' => null,
                            'background_picture_path' => null,
                            'promotional_video_path' => null,
                        ]);
                    } else {
                        echo "Warning: sellers table does not exist. Skipping seller profile creation.\n";
                    }
                    break;

                case 'administrator':
                    if (Schema::hasTable('administrators')) {
                        Administrator::create([
                            'user_id' => $user->userID,
                            'profile_picture_path' => null,
                        ]);
                    } else {
                        echo "Warning: administrators table does not exist. Skipping administrator profile creation.\n";
                    }
                    break;
            }

            // Generate Sanctum token
            $token = $user->createToken($userData['role'] . 'Token')->plainTextToken;

            // Print info in console
            echo "\n=================================\n";
            echo ucfirst($userData['role']) . " User Created:\n";
            echo "Name: {$userData['userName']}\n";
            echo "Email: {$userData['userEmail']}\n";
            echo "Password: password123\n";
            echo "API Token: {$token}\n";
            echo "=================================\n";
        }
    }
}