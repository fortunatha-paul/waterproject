<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

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
        
        $users = $query->select('id', 'name', 'email', 'phone_number', 'nida', 'house_number', 'district', 'ward', 'role', 'created_at')->get();
        
        return response()->json($users);
    }

    /**
     * Create a new user (MD only)
     */
    public function store(Request $request)
    {
        // Check if user is MD
        if (!$request->user() || !$request->user()->isMD()) {
            return response()->json(['error' => 'Unauthorized. Only MD can create users.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'phone_number' => 'nullable|string|max:20',
            'nida' => 'nullable|string|max:20|unique:users,nida',
            'house_number' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'ward' => 'required|string|max:100',
            'role' => 'required|string|in:customer,customer_service,inspector,hod_sanitation,finance,md',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone_number' => $validated['phone_number'] ?? null,
            'nida' => $validated['nida'] ?? null,
            'house_number' => $validated['house_number'],
            'district' => $validated['district'],
            'ward' => $validated['ward'],
            'role' => $validated['role'],
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => $user->only(['id', 'name', 'email', 'phone_number', 'role'])
        ], 201);
    }

    /**
     * Display the specified user
     */
    public function show(string $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json($user->only(['id', 'name', 'email', 'phone_number', 'nida', 'house_number', 'district', 'ward', 'role', 'created_at']));
    }

    /**
     * Update the specified user (MD only)
     */
    public function update(Request $request, string $id)
    {
        // Check if user is MD
        if (!$request->user() || !$request->user()->isMD()) {
            return response()->json(['error' => 'Unauthorized. Only MD can update users.'], 403);
        }

        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // If the target user is the HOD departmental account, restrict changes: only allow name, phone_number, nida.
        $isHodDept = $user->role === 'hod_sanitation';

        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'nida' => 'nullable|string|max:20|unique:users,nida,' . $id,
            'house_number' => 'sometimes|required|string|max:100',
            'district' => 'sometimes|required|string|max:100',
            'ward' => 'sometimes|required|string|max:100',
        ];

        if (!$isHodDept) {
            $rules['email'] = 'sometimes|required|string|email|max:255|unique:users,email,' . $id;
            $rules['role'] = 'sometimes|required|string|in:customer,customer_service,inspector,hod_sanitation,finance,md';
        }

        $validated = $request->validate($rules);

        // Prevent changing email/role for the HOD departmental account even if sent
        if ($isHodDept) {
            unset($validated['email']);
            unset($validated['role']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->only(['id', 'name', 'email', 'phone_number', 'role'])
        ]);
    }

    /**
     * Delete the specified user (MD only)
     */
    public function destroy(Request $request, string $id)
    {
        // Check if user is MD
        if (!$request->user() || !$request->user()->isMD()) {
            return response()->json(['error' => 'Unauthorized. Only MD can delete users.'], 403);
        }

        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Prevent MD from deleting themselves
        if ($user->id === $request->user()->id) {
            return response()->json(['error' => 'Cannot delete your own account'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    /**
     * Reset user password (MD only)
     */
    public function resetPassword(Request $request, string $id)
    {
        // Check if user is MD
        if (!$request->user() || !$request->user()->isMD()) {
            return response()->json(['error' => 'Unauthorized. Only MD can reset passwords.'], 403);
        }

        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Prevent resetting password for departmental HOD account
        if ($user->role === 'hod_sanitation') {
            return response()->json(['error' => 'Cannot reset password for departmental HOD account.'], 403);
        }

        $validated = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['message' => 'Password reset successfully']);
    }

    /**
     * Return only inspector users.
     */
    public function inspectors()
    {
        $inspectors = User::where('role', 'inspector')
            ->select('id', 'name', 'email', 'phone_number', 'role', 'created_at')
            ->get();

        return response()->json($inspectors);
    }
}
