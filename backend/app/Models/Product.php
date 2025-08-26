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

public function seller()
{
    return $this->belongsTo(Seller::class, 'seller_id', 'sellerID');
}

    /**
     * Get the full URL for the product image
     */
    public function getProductImageUrlAttribute()
    {
        if (!$this->productImage) {
            return null;
        }
        
        if (str_starts_with($this->productImage, 'http')) {
            return $this->productImage;
        }
        
        return url('storage/' . ltrim($this->productImage, '/'));
    }

    /**
     * Get the full URL for the product video
     */
    public function getProductVideoUrlAttribute()
    {
        if (!$this->productVideo) {
            return null;
        }
        
        if (str_starts_with($this->productVideo, 'http')) {
            return $this->productVideo;
        }
        
        return url('storage/' . ltrim($this->productVideo, '/'));
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

     public function ratings()
    {
        return $this->hasMany(Ratings::class, 'product_id', 'product_id');
    }
    
}


