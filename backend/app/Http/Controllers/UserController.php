<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of users filtered by role.
     */
    public function index(Request $request)
    {
        $query = User::query();
        
        // Filter by role if provided
        if ($request->has('role')) {
            $query->where('role', $request->role);
        }
        
        $users = $query->select('id', 'name', 'email', 'role')->get();
        
        return response()->json($users);
    }
}
