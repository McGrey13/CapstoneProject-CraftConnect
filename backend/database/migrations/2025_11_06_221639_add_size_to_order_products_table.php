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
        Schema::table('order_products', function (Blueprint $table) {
            $table->string('size', 50)->nullable()->after('product_id');
            $table->unsignedBigInteger('variation_id')->nullable()->after('size');
            
            $table->foreign('variation_id')->references('variation_id')->on('product_variations')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_products', function (Blueprint $table) {
            $table->dropForeign(['variation_id']);
            $table->dropColumn(['size', 'variation_id']);
        });
    }
};
