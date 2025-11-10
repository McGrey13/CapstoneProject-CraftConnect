<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Product;

class Cart extends Model
{
    use HasFactory;

    protected $primaryKey = 'cart_id';
    protected $fillable = [
        'userID',
        'product_id',
        'variation_id',
        'variation_label',
        'variation_attributes',
        'sku',
        'quantity',
        'unit_price',
    ];

    protected $casts = [
        'variation_attributes' => 'array',
        'unit_price' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'userID', 'userID');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
