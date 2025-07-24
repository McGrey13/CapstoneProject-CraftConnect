<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seller extends Model
{
    protected $fillable = [
        'user_id',
        'sellerEmail',
        'sellerPassword',
    ];

    protected $hidden = [
        'sellerPassword',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
