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
        // Add hod_sanitation role to users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['customer', 'customer_service', 'inspector', 'finance', 'hod_sanitation'])->default('customer')->after('ward');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove hod_sanitation role from users table
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['customer', 'customer_service', 'inspector', 'finance'])->default('customer')->after('ward');
        });
    }
};
