<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'orders';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'orderID';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'userID',
        'status',
        'totalAmount',
        'shippingAddress',
        'paymentMethod',
        'paymentStatus',
        'orderDate',
        'shippingDate',
        'deliveryDate',
        'notes'
    ];

    protected $dates = [
        'orderDate',
        'shippingDate',
        'deliveryDate'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'userID', 'userID');
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'order_products', 'order_id', 'product_id')
            ->withPivot(['quantity', 'price', 'total_amount'])
            ->withTimestamps();
    }

    public function orderProducts()
    {
        return $this->hasMany(OrderProduct::class, 'order_id', 'orderID');
    }

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    // protected $casts = [
    //     'status' => \App\Enums\OrderStatus::class, // Assuming you create an enum for status
    // ];

    /**
     * Get the customer that owns the order.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'customerID');
    }
}