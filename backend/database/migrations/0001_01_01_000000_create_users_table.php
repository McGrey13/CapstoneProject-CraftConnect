<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, HasApiTokens;

   protected $fillable = [
        'userName',
        'userAge',
        'userBirthDay',
        'userContactNumber',
        'userAddress',
        'userType',
        'email',
        'userPassword',
        'email_verified_at',
        'user_contact_number_verified_at',
        'sms_verification_code',
        'sms_code_expires_at',
        'email_verification_code', 
    ];

    protected $hidden = [
        'userPassword',
        'remember_token',
        'sms_verification_code',
        'sms_code_expires_at',
        'email_verification_code', // <-- add this
    ];
    protected function casts(): array
    {
        return [
            'userBirthDay' => 'date',
            'email_verified_at' => 'datetime',
            'user_contact_number_verified_at' => 'datetime',
            'sms_code_expires_at' => 'datetime',
        ];
    }

    public function isAdmin()
    {
        return $this->userType === 'admin';
    }

    public function isSeller()
    {
        return $this->userType === 'seller';
    }

    public function isCustomer()
    {
        return $this->userType === 'customer';
    }

    public function getAuthPassword()
    {
        return $this->userPassword;
    }

    public function hasVerifiedBoth()
    {
        return $this->hasVerifiedEmail() && $this->user_contact_number_verified_at !== null;
    }

    // Add relationships to profile tables
    public function sellerProfile()
    {
        return $this->hasOne(SellerProfile::class);
    }

    public function customerProfile()
    {
        return $this->hasOne(CustomerProfile::class);
    }
}