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
          Schema::create('product', function (Blueprint $table) {
            $table->id();
            $table->string('productName');
            $table->string('productDescription')->nullable();
            $table->decimal('productPrice', 10, 2);
            $table->string('productImage')->nullable();
            $table->string('productVideo')->nullable();
            // $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
          Schema::dropIfExists('product');
    }
};
