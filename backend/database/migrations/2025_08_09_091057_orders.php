<?php

// Migration for Orders: create_orders_table

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id('orderID');
            $table->foreignId('customer_id')->constrained('customers', 'customerID')->onDelete('cascade'); // Foreign key to the customers table
            $table->decimal('totalAmount', 8, 2);
            $table->string('status')->default('pending'); // e.g., 'pending', 'shipped', 'delivered'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};