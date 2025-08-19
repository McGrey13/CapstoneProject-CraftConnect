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
        Schema::create('coupons', function (Blueprint $table) {
            $table->id(';coupons_id');
            $table->string('code')->unique();
            $table->enum('type', ['fixed', 'percentage']);
            $table->decimal('value', 8, 2);
            $table->integer('usage_limit')->nullable();
            $table->integer('times_used')->default(0);
            $table->dateTime('expires_at')->nullable();
            $table->timestamps();

            $table->foreignId('created_by')->constrained('users', 'userID')->onDelete('cascade'); // Foreign key to users table
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};