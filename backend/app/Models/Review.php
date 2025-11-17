<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\Product;

class Review extends Model
{
    protected $primaryKey = 'review_id';
    
    protected $fillable = [
        'user_id',
        'product_id',
        'rating',
        'comment',
        'review_date',
        'images',
        'video_path',
        'is_flagged',
        'flag_reason',
        'is_redacted_text',
        'is_redacted_images',
        'is_redacted_video',
        'redaction_reason',
        'redacted_at',
        'redacted_by_admin',
    ];

    protected $casts = [
        'review_date' => 'datetime',
        'rating' => 'integer',
        'images' => 'array',
        'is_flagged' => 'boolean',
        'is_redacted_text' => 'boolean',
        'is_redacted_images' => 'boolean',
        'is_redacted_video' => 'boolean',
        'redacted_at' => 'datetime',
    ];

    /**
     * Get the user that made the review.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'userID');
    }

    /**
     * Get the product that was reviewed.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'product_id');
    }
}
