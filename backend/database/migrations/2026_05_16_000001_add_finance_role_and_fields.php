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
        // Add finance role to users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['customer', 'customer_service', 'inspector', 'finance'])->default('customer')->after('ward');
        });

        // Add finance-specific fields to requests table
        Schema::table('requests', function (Blueprint $table) {
            $table->decimal('amount', 10, 2)->nullable()->after('timeline');
            $table->string('payment_status')->default('Unpaid')->after('amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove finance role from users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['customer', 'customer_service', 'inspector'])->default('customer')->after('ward');
        });

        // Remove finance-specific fields from requests table
        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn(['amount', 'payment_status']);
        });
    }
};
