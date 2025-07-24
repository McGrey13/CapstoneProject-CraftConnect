<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('userFirstName');
            $table->string('userLastName');
            $table->integer('userAge');
            $table->date('userBirthDay');
            $table->string('userContactNumber');
            $table->string('userAddress');
            $table->string('userType');
            $table->string('email')->unique();
            $table->string('userPassword');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('user_contact_number_verified_at')->nullable();
            $table->string('sms_verification_code')->nullable();
            $table->timestamp('sms_code_expires_at')->nullable();
            $table->string('email_verification_code')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};