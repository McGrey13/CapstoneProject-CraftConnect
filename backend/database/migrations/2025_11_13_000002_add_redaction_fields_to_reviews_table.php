<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Redaction fields
            $table->boolean('is_redacted_text')->default(false)->after('comment');
            $table->boolean('is_redacted_images')->default(false)->after('is_redacted_text');
            $table->boolean('is_redacted_video')->default(false)->after('is_redacted_images');
            $table->text('redaction_reason')->nullable()->after('is_redacted_video');
            $table->timestamp('redacted_at')->nullable()->after('redaction_reason');
            
            // Admin action tracking
            $table->unsignedBigInteger('redacted_by_admin')->nullable()->after('redacted_at');
            $table->foreign('redacted_by_admin')->references('userID')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropForeign(['redacted_by_admin']);
            $table->dropColumn([
                'is_redacted_text',
                'is_redacted_images',
                'is_redacted_video',
                'redaction_reason',
                'redacted_at',
                'redacted_by_admin',
            ]);
        });
    }
};
