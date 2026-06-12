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
        Schema::table('batch_user', function (Blueprint $table) {
            $table->decimal('amount_paid', 10, 2)->nullable();
            $table->string('transaction_id')->nullable();
            $table->string('status')->nullable()->default('unpaid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('batch_user', function (Blueprint $table) {
            $table->dropColumn(['amount_paid', 'transaction_id', 'status']);
        });
    }
};
