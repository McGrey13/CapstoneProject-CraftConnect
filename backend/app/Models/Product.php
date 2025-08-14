<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    protected $table = 'products';
    protected $primaryKey = 'product_id';

    protected $fillable = [
        'productName',
        'productDescription',
        'productPrice',
        'productQuantity',
        'status',
        'productImage',
        'productVideo',
        'category',
        'seller_id',
        'approval_status'
    ];

    protected $appends = ['id'];

    public function getIdAttribute()
    {
        return $this->attributes['product_id'];
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Seller::class, 'seller_id', 'sellerID');
    }

    // Automatically set status when quantity changes
    public static function boot()
    {
        parent::boot();

        static::saving(function ($product) {
            if ($product->productQuantity <= 0) {
                $product->status = 'out of stock';
            } elseif ($product->productQuantity <= 5) {
                $product->status = 'low stock';
            } else {
                $product->status = 'in stock';
            }
        });
    }
    
}


