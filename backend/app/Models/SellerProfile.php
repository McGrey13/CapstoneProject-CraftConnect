<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SellerProfile extends Model
{
    protected $primaryKey = 'sellerID';
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
