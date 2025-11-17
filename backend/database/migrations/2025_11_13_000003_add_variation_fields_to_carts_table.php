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
        Schema::table('carts', function (Blueprint $table) {
            // Add variation-related columns if they don't exist
            if (!Schema::hasColumn('carts', 'variation_id')) {
                $table->unsignedBigInteger('variation_id')->nullable()->after('product_id');
            }
            
            if (!Schema::hasColumn('carts', 'variation_label')) {
                $table->string('variation_label')->nullable()->after('variation_id');
            }
            
            if (!Schema::hasColumn('carts', 'variation_attributes')) {
                $table->json('variation_attributes')->nullable()->after('variation_label');
            }
            
            if (!Schema::hasColumn('carts', 'sku')) {
                $table->string('sku')->nullable()->after('variation_attributes');
            }
            
            if (!Schema::hasColumn('carts', 'unit_price')) {
                $table->decimal('unit_price', 10, 2)->nullable()->after('quantity');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            // Drop columns in reverse order
            $table->dropColumn([
                'unit_price',
                'sku',
                'variation_attributes',
                'variation_label',
                'variation_id'
            ]);
        });
    }
};
