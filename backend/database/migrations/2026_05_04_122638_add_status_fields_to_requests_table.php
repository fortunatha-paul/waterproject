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
        Schema::table('requests', function (Blueprint $table) {
            $table->string('status')->default('Pending')->after('location');
            $table->string('priority')->default('Medium')->after('status');
            $table->string('assigned_staff')->nullable()->after('priority');
            $table->date('deadline')->nullable()->after('assigned_staff');
            $table->json('comments')->nullable()->after('deadline');
            $table->json('timeline')->nullable()->after('comments');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn(['status', 'priority', 'assigned_staff', 'deadline', 'comments', 'timeline']);
        });
    }
};
