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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'father_name')) $table->string('father_name')->nullable();
            if (!Schema::hasColumn('users', 'phone')) $table->string('phone')->nullable();
            if (!Schema::hasColumn('users', 'registration_id')) $table->string('registration_id')->nullable();
            if (!Schema::hasColumn('users', 'address')) $table->text('address')->nullable();
            if (!Schema::hasColumn('users', 'dob')) $table->date('dob')->nullable();
            if (!Schema::hasColumn('users', 'gender')) $table->string('gender')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['father_name', 'phone', 'registration_id', 'address', 'dob', 'gender']);
            $table->unsignedBigInteger('batch_id')->nullable();
        });
    }
};
