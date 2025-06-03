<?php
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
        'userAddress', // Add if present in migration
        'userType',
        'email',
        'userPassword', // or 'password' if you use Laravel default
        'email_verified_at',
        'user_contact_number_verified_at',
        'sms_verification_code',
        'sms_code_expires_at',
    ];

    protected $hidden = [
        'userPassword', // or 'password'
        'remember_token',
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

    public function customer()
    {
        return $this->hasOne(Customer::class, 'userID', 'userID');
    }

    public function seller()
    {
        return $this->hasOne(Seller::class, 'userID', 'userID');
    }
// ...existing code...

    public function getAuthPassword()
    {
        return $this->userPassword; // or 'password'
    }

    // Custom method to check if both email and SMS are verified
    public function hasVerifiedBoth()
    {
        return $this->hasVerifiedEmail() && $this->user_contact_number_verified_at !== null;
    }
}