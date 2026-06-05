<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('requests')
            ->where('status', 'Pending')
            ->whereNull('assigned_staff')
            ->whereNull('assigned_inspector_id')
            ->update(['status' => 'Submitted']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('requests')
            ->where('status', 'Submitted')
            ->whereNull('assigned_staff')
            ->whereNull('assigned_inspector_id')
            ->update(['status' => 'Pending']);
    }
};
