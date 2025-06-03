<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerProfile extends Model
{
    protected $primaryKey = 'customerID';
    public $timestamps = false;

    protected $fillable = [
        'userID',
        'email',
        'userPassword',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'userID', 'userID');
    }
}
