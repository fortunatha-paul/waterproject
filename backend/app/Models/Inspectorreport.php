<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InspectorReport extends Model
{
    protected $fillable = [
        'inspector_id',
        'request_id',
        'title',
        'area_visited',
        'visit_date',
        'findings',
        'work_done',
        'recommendations',
        'water_supply_status',
        'pipe_condition',
        'sewage_issue',
        'sewage_details',
        'estimated_cost',
        'billing_notes',
        'images',
        'status',
    ];

    protected $casts = [
        'visit_date'   => 'date',
        'sewage_issue' => 'boolean',
        'images'       => 'array',
        'estimated_cost' => 'decimal:2',
    ];

    /**
     * The inspector who wrote this report.
     */
    public function inspector()
    {
        return $this->belongsTo(User::class, 'inspector_id');
    }

    /**
     * The related service request (optional).
     */
    public function request()
    {
        return $this->belongsTo(Request::class, 'request_id');
    }
}