<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id('message_id');
            $table->foreignId('conversation_id')->constrained('conversations', 'conversation_id')->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users', 'userID')->onDelete('cascade');
            $table->foreignId('receiver_id')->constrained('users', 'userID')->onDelete('cascade');
            $table->text('message');
            $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
         Schema::dropIfExists('messages');
    }
};
