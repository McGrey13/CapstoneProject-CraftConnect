<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use app\Models\Messages;

    namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    protected $fillable = [
        'customer_id', 
        'seller_id',
        'order_id',
        'product_id'
    ];

    public function messages()
    {
        return $this->hasMany(Messages::class);
    }
}
