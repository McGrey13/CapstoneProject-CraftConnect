<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // User suspension fields
            $table->boolean('is_suspended')->default(false)->after('status');
            $table->enum('suspension_type', ['temporary', 'permanent'])->nullable()->after('is_suspended');
            $table->timestamp('suspension_until')->nullable()->after('suspension_type');
            $table->text('suspension_reason')->nullable()->after('suspension_until');
            
            // Violation tracking for reviews/comments
            $table->integer('violation_points')->default(0)->after('suspension_reason');
            $table->timestamp('last_violation_date')->nullable()->after('violation_points');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'is_suspended',
                'suspension_type',
                'suspension_until',
                'suspension_reason',
                'violation_points',
                'last_violation_date',
            ]);
        });
    }
};
