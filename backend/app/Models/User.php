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


// namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
// use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Illuminate\Foundation\Auth\User as Authenticatable;
// use Illuminate\Notifications\Notifiable;
// use Laravel\Sanctum\HasApiTokens;
// use Illuminate\Database\Eloquent\Relations\HasOne;

// class User extends Authenticatable
// {
//     use HasApiTokens, HasFactory, Notifiable;

//     /**
//      * The primary key for the model.
//      */
//     protected $primaryKey = 'userID';

//     /**
//      * The attributes that are mass assignable.
//      */
//     protected $fillable = [
//         'userName',
//         'userEmail',
//         'userPassword',
//         'userAge',
//         'userBirthday',
//         'userContactNumber',
//         'userAddress',
//         'userCity',
//         'userPostalCode',
//         'role',
//         'otp',
//         'otp_expires_at',
//         'is_verified',
//     ];

//     /**
//      * The attributes that should be hidden for serialization.
//      */
//     protected $hidden = [
//         'userPassword',
//         'remember_token',
//     ];
    
        
//     //The attributes that should be cast.
//     protected $casts = [
//         'email_verified_at' => 'datetime',
//         'userPassword' => 'hashed',
//         'userBirthday' => 'date', 
//     ];

//     //Get the password for the user.

//     public function getAuthPassword()
//     {
//         return $this->userPassword;
//     }


//      //Get the name of the unique identifier for the user.

//     public function getAuthIdentifierName()
//     {
//         return 'userEmail';
//     }

//     //Get the administrator profile associated with the user.

//     public function administrator(): HasOne
//     {
//         return $this->hasOne(Administrator::class, 'user_id', 'userID');
    
//     }
    

//      //Get the seller profile associated with the user.
//     public function seller(): HasOne
//     {
//         return $this->hasOne(Seller::class, 'user_id', 'userID');
//     }

    
//      //Get the customer profile associated with the user.

//     public function customer(): HasOne
//     {
//         return $this->hasOne(Customer::class, 'user_id', 'userID');
//     }

//     public function isSeller()
//     {
//         return $this->seller()->exists();
//     }

//     //for getting the email of user for OTP
//     public function getEmailAttribute()
//     {
//         return $this->userEmail;
//     }


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'userID';

    protected $fillable = [
        'userName',
        'userEmail',
        'userPassword',
        'userContactNumber',
        'role',
        'otp',
        'otp_expires_at',
        'is_verified',
    ];

    protected $hidden = [
        'userPassword',
        'remember_token',
        'otp', // hide OTP too
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'userBirthday' => 'date', 
        'otp_expires_at' => 'datetime',
        'is_verified' => 'boolean',
    ];

    /**
     * Override default password field
     */
    public function getAuthPassword()
    {
        return $this->userPassword;
    }

    /**
     * Override default email field
     */
    public function getAuthIdentifierName()
    {
        return 'userEmail';
    }

    // === RELATIONSHIPS ===
    public function administrator(): HasOne
    {
        return $this->hasOne(Administrator::class, 'user_id', 'userID');
    }

    public function seller(): HasOne
    {
        return $this->hasOne(Seller::class, 'user_id', 'userID');
    }

    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class, 'user_id', 'userID');
    }

    public function isSeller()
    {
        return $this->seller()->exists();
    }

    // Allow accessing $user->email instead of $user->userEmail
    public function getEmailAttribute()
    {
        return $this->userEmail;
    }
}

