<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Messages extends Model
{
    protected $fillable = [
            'conversation_id',
             'sender_id',
              'message',
              'receiver_id'
        ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }
}