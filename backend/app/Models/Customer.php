<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Customer extends Model
{
    protected $fillable = [
        'user_id',
        'customerEmail',
        'customerPassword',
        'customerFirstName',
        'customerLastName',
        'customerBirthDay',
        'customerContactNumber',
        'customerAddress',
        'email_verification_code',
        'email_verified_at',
        'user_contact_number_verified_at',
        'sms_verification_code',
        'sms_code_expires_at',
    ];

    protected $hidden = [
        'customerPassword',
    ];

     public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
