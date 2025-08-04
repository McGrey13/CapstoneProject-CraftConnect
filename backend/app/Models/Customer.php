<?php

// namespace App\Models;

// use Illuminate\Database\Eloquent\Model;
// use App\Models\User;

// class Customer extends Model
// {
//     protected $fillable = [
//         'user_id',
//         'customerEmail',
//         'customerPassword',
//         'customerFirstName',
//         'customerLastName',
//         'customerBirthDay',
//         'customerContactNumber',
//         'customerAddress',
//         'email_verification_code',
//         'email_verified_at',
//         'user_contact_number_verified_at',
//         'sms_verification_code',
//         'sms_code_expires_at',
//     ];

//     protected $hidden = [
//         'customerPassword',
//     ];

//      public function user()
//     {
//         return $this->belongsTo(User::class, 'user_id');
//     }


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Customer extends Model
{
    use HasFactory;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'customerID';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        // If you had specific customer-only fields not in User, they would go here.
    ];

    /**
     * Get the user that owns the customer profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'userID');
    }
}
