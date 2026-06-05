<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Request extends Model
{
    protected $fillable = [
        'user_id',
        'serve_type',
        'description',
        'location',
        'status',
        'inspectorStatus',
        'priority',
        'assigned_staff',
        'assigned_inspector_id',
        'deadline',
        'comments',
        'timeline',
        'amount',
        'payment_status',
    ];

    protected $attributes = [
        'status' => 'Submitted',
        'inspectorStatus' => 'Not Solved',
        'priority' => 'Medium',
    ];

    protected $casts = [
        'comments' => 'array',
        'timeline' => 'array',
    ];

    /**
     * Get the user that owns the request.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
