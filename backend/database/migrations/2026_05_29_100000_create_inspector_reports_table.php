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
        Schema::create('inspector_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inspector_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('request_id')->nullable()->constrained('requests')->onDelete('set null');
            $table->string('title')->nullable();
            $table->string('area_visited')->nullable();
            $table->date('visit_date')->nullable();
            $table->text('findings')->nullable();
            $table->text('work_done')->nullable();
            $table->text('recommendations')->nullable();
            $table->string('water_supply_status')->nullable();
            $table->string('pipe_condition')->nullable();
            $table->boolean('sewage_issue')->default(false);
            $table->text('sewage_details')->nullable();
            $table->decimal('estimated_cost', 12, 2)->nullable();
            $table->text('billing_notes')->nullable();
            $table->json('images')->nullable();
            $table->string('status')->default('Pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inspector_reports');
    }
};
