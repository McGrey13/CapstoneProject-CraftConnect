<?php

// namespace App\Models;
  
// use Illuminate\Contracts\Auth\MustVerifyEmail;
// use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Foundation\Auth\User as Authenticatable;
// use Illuminate\Notifications\Notifiable;
// use Laravel\Sanctum\HasApiTokens;
   

// class User extends Authenticatable implements MustVerifyEmail
// {
//     use HasApiTokens, HasFactory, Notifiable;

//     protected $fillable = [
//         'userFirstName',
//         'userLastName',
//         'userEmail',
//         'userPassword',
//         'userBirthDay',
//         'userContactNumber',
//         'userAddress',
//         'email_verification_code',
//         'email_verified_at',
//         'user_contact_number_verified_at',
//         'sms_verification_code',
//         'sms_code_expires_at',
//     ];


namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'userID';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'userName',
        'userEmail',
        // 'email_verified_at',
        'userPassword',
        'userAge',
        'userBirthday',
        'userContactNumber',
        'userAddress',
        'role',
        // 'otp',
        // 'otp_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'userPassword',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'userPassword' => 'hashed',
        'userBirthday' => 'date', // Cast birthday to a date object
    ];

    /**
     * Get the password for the user.
     *
     * @return string
     */
    public function getAuthPassword()
    {
        return $this->userPassword;
    }

    /**
     * Get the name of the unique identifier for the user.
     *
     * @return string
     */
    public function getAuthIdentifierName()
    {
        return 'userEmail';
    }

    /**
     * Get the administrator profile associated with the user.
     */
    public function administrator(): HasOne
    {
        return $this->hasOne(Administrator::class, 'user_id', 'userID');
    }

    /**
     * Get the seller profile associated with the user.
     */
    public function seller(): HasOne
    {
        return $this->hasOne(Seller::class, 'user_id', 'userID');
    }

    /**
     * Get the customer profile associated with the user.
     */
    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class, 'user_id', 'userID');
    }

    public function isSeller()
    {
        return $this->seller()->exists();
    }
    // protected $hidden = [
    //     'userPassword',
    //     'remember_token',
    //     'email_verification_code',
    //     'sms_verification_code',
    //     'sms_code_expires_at',
    // ];

    // protected $casts = [
    //     'userBirthDay' => 'date',
    //     'email_verified_at' => 'datetime',
    //     'user_contact_number_verified_at' => 'datetime',
    //     'sms_code_expires_at' => 'datetime',
    // ];

    // public function hasVerifiedBoth()
    // {
    //     return $this->hasVerifiedEmail() && $this->hasVerifiedPhone();
    // }

    // public function hasVerifiedEmail()
    // {
    //     return !is_null($this->email_verified_at);
    // }

    // public function hasVerifiedPhone()
    // {
    //     return !is_null($this->user_contact_number_verified_at);
    // }

    // public function getAuthPassword()
    // {
    //     return $this->userPassword;
    // }

    // // Relationships
    // public function admin()
    // {
    //     return $this->hasOne(Administrator::class, 'user_id');
    // }

    // public function seller()
    // {
    //     return $this->hasOne(Seller::class, 'user_id');
    // }

    // public function customer()
    // {
    //     return $this->hasOne(Customer::class, 'user_id');
    // }
}
