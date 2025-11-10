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
        Schema::create('product_variations', function (Blueprint $table) {
            $table->id('variation_id');
            $table->unsignedBigInteger('product_id');
            $table->string('size', 50)->nullable(); // e.g., "S", "M", "L", "XL", "6", "7", "8", etc.
            $table->string('color', 50)->nullable(); // Optional: for future color variations
            $table->integer('quantity')->default(0);
            $table->decimal('price', 10, 2)->nullable(); // Optional: different price per size
            $table->string('sku', 100)->nullable(); // Optional: SKU for this specific variation
            $table->timestamps();
            
            $table->foreign('product_id')->references('product_id')->on('products')->onDelete('cascade');
            $table->index(['product_id', 'size']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variations');
    }
};
