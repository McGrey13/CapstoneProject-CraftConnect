<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('carts', function (Blueprint $table) {
            if (!Schema::hasColumn('carts', 'variation_id')) {
                $table->unsignedBigInteger('variation_id')->nullable()->after('product_id');
            }

            if (!Schema::hasColumn('carts', 'variation_options')) {
                $table->json('variation_options')->nullable()->after('variation_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('carts', function (Blueprint $table) {
            if (Schema::hasColumn('carts', 'variation_options')) {
                $table->dropColumn('variation_options');
            }

            if (Schema::hasColumn('carts', 'variation_id')) {
                $table->dropColumn('variation_id');
            }
        });
    }
};
