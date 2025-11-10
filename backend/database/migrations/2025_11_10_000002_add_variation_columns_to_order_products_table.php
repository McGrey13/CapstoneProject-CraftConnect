<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_products', function (Blueprint $table) {
            $table->string('variation_label')->nullable()->after('variation_id');
            $table->json('variation_attributes')->nullable()->after('variation_label');
            $table->string('sku')->nullable()->after('variation_attributes');
        });
    }

    public function down(): void
    {
        Schema::table('order_products', function (Blueprint $table) {
            $table->dropColumn(['variation_label', 'variation_attributes', 'sku']);
        });
    }
};

