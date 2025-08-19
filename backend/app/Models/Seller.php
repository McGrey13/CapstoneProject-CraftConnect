<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\Order;


class Seller extends Model
{
    use HasFactory;

    

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'sellerID';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'businessName',
        'bio',
        'story',
        'website',
        'profile_picture_path',
        'background_picture_path',
        'promotional_video_path',
        
        // If you had specific seller-only fields not in User, they would go here.
    ];

    /**
     * Get the user that owns the seller profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'userID');
    }

    public function products()
    {
        return $this->hasMany(Product::class, 'seller_id', 'sellerID');
    }

public function orders()
{
    return $this->hasMany(Order::class);
}
}

