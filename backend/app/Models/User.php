<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'userFirstName',
        'userLastName',
        'userAge',
        'userBirthDay',
        'userContactNumber',
        'userAddress',
        'userType',
        'email',
        'userPassword',
        'email_verification_code',
        'email_verified_at',
        'user_contact_number_verified_at',
        'sms_verification_code',
        'sms_code_expires_at',
    ];

    protected $hidden = [
        'userPassword',
        'remember_token',
        'email_verification_code',
        'sms_verification_code',
        'sms_code_expires_at',
    ];

    protected $casts = [
        'userBirthDay' => 'date',
        'email_verified_at' => 'datetime',
        'user_contact_number_verified_at' => 'datetime',
        'sms_code_expires_at' => 'datetime',
    ];

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

    public function hasVerifiedBoth()
    {
        return $this->hasVerifiedEmail() && $this->hasVerifiedPhone();
    }

    public function hasVerifiedEmail()
    {
        return !is_null($this->email_verified_at);
    }

    public function hasVerifiedPhone()
    {
        return !is_null($this->user_contact_number_verified_at);
    }

    public function getAuthPassword()
    {
        return $this->userPassword;
    }

    // Relationships
    public function admin()
    {
        return $this->hasOne(Administrator::class, 'user_id');
    }

    public function seller()
    {
        return $this->hasOne(Seller::class, 'user_id');
    }

    public function customer()
    {
        return $this->hasOne(Customer::class, 'user_id');
    }
}
