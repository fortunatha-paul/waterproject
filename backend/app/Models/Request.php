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
    ];
}
