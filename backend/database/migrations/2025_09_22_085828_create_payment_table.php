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
        Schema::create('payment', function (Blueprint $table) {
            $table->id('payment_id');
            $table->foreignId('userID')->constrained('users', 'userID')->onDelete('cascade');
            $table->foreignId('orderID')->constrained('orders', 'orderID')->onDelete('cascade');    
            $table->enum('paymentMethod', ['gcash', 'paypal','paymaya']);
            $table->enum('paymentStatus',['pending', 'paid', 'failed', 'refunded']);
            $table->string('shippingAddress');
            $table->date('orderDate');
            $table->date('shippingDate');
            $table->date('deliveryDate');
            $table->text('notes');
            $table->decimal('amount', 10, 2);
            $table->string('currency')->default('PHP');
            $table->string('paymongo_payment_id')->nullable();
            $table->string('paymongo_payment_intent_id')->nullable();
            $table->string('paymongo_source_id')->nullable();
            $table->json('payment_details')->nullable();
            $table->integer('attempt_count')->default(0);
            $table->timestamp('last_attempt_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payment');
    }
};
