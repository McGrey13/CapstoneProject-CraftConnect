<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->unsignedBigInteger('variation_id')->nullable()->after('product_id');
            $table->string('variation_label')->nullable()->after('variation_id');
            $table->json('variation_attributes')->nullable()->after('variation_label');
            $table->string('sku')->nullable()->after('variation_attributes');
            $table->decimal('unit_price', 12, 2)->nullable()->after('quantity');
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropColumn([
                'variation_id',
                'variation_label',
                'variation_attributes',
                'sku',
                'unit_price',
            ]);
        });
    }
};

