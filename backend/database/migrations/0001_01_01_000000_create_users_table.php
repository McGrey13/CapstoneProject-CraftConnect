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
            $table->string('userEmail');
            $table->string('userPassword'); 
            $table->date('userBirthDay');
            $table->string('userContactNumber');
            $table->string('userAddress');
            // $table->timestamp('email_verified_at');
            // $table->timestamp('user_contact_number_verified_at');
            // $table->string('sms_verification_code');
            // $table->timestamp('sms_code_expires_at');
            // $table->string('email_verification_code');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};