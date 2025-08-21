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
       Schema::create('conversations', function (Blueprint $table) {
            $table->id('conversation_id');
            $table->foreignId('customerID')->constrained('users', 'userID')->onDelete('cascade');
            $table->foreignId('sellerID')->constrained('users', 'userID')->onDelete('cascade');
            $table->foreignId('orderID')->nullable()->constrained('orders', 'orderID')->onDelete('set null');
            $table->timestamps();
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
