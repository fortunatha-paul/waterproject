<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->unsignedBigInteger('assigned_inspector_id')->nullable()->after('assigned_staff');
            $table->foreign('assigned_inspector_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropForeign(['assigned_inspector_id']);
            $table->dropColumn('assigned_inspector_id');
        });
    }
};
