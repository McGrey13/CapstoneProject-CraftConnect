<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Messages extends Model
{
    protected $fillable = [
            'conversation_id',
             'sender_id',
              'message',
              'receiver_id',
              'message_type',
              'attachment_url',
              'is_read',
              'created_at',
              'updated_at'
        ];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }
}