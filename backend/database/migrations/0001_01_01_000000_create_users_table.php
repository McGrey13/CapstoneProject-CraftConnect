<?php

// use Illuminate\Database\Migrations\Migration;
// use Illuminate\Database\Schema\Blueprint;
// use Illuminate\Support\Facades\Schema;

// return new class extends Migration
// {
//     public function up()
//     {
//         Schema::create('users', function (Blueprint $table) {
//             $table->id();
//             $table->string('userFirstName');
//             $table->string('userLastName');
//             $table->string('userEmail');
//             $table->string('userPassword'); 
//             $table->date('userBirthDay');
//             $table->string('userContactNumber');
//             $table->string('userAddress');
//             $table->boolean('type')->default(false); // add type boolean Users: 0=>Customer, 1=>Seller , 3 =>Admin
//             // $table->timestamp('email_verified_at');
//             // $table->timestamp('user_contact_number_verified_at');
//             // $table->string('sms_verification_code');
//             // $table->timestamp('sms_code_expires_at');
//             // $table->string('email_verification_code');
//             $table->rememberToken();
//             $table->timestamps();
//         });
//     }

//     public function down()
//     {
//         Schema::dropIfExists('users');
//     }


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
        Schema::create('users', function (Blueprint $table) {
            $table->id('userID'); // Changed to userID as per UML
            $table->string('userName');
            $table->string('userEmail')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('userPassword'); // Changed to userPassword
            $table->string('userAge')->nullable(); // Assuming age can be a string (e.g., "25-30") or convert to int
            $table->date('userBirthday')->nullable();
            $table->string('userContactNumber')->nullable();
            $table->string('userAddress')->nullable();
            $table->enum('role', ['administrator', 'seller', 'customer'])->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};