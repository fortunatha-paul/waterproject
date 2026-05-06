<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Request as RequestModel;

class RequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();
        
        // If user is customer service, show all requests
        if ($user->isCustomerService()) {
            $requests = RequestModel::with('user')->get();
        } elseif ($user->isInspector()) {
            // For inspectors, show requests assigned to them
            $requests = RequestModel::with('user')
                ->where('assigned_staff', $user->name)
                ->get();
        } else {
            // For customers, show only their own requests
            $requests = RequestModel::where('user_id', $user->id)->get();
        }
        
        return response()->json($requests);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'serve_type' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
        ]);

        $validated['user_id'] = auth()->id();
        $newRequest = RequestModel::create($validated);
        return response()->json($newRequest, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = auth()->user();
        
        // If user is customer service, show any request
        if ($user->isCustomerService()) {
            $request = RequestModel::with('user')->where('id', $id)->first();
        } elseif ($user->isInspector()) {
            // For inspectors, show requests assigned to them
            $request = RequestModel::with('user')
                ->where('id', $id)
                ->where('assigned_staff', $user->name)
                ->first();
        } else {
            // For customers, show only their own requests
            $request = RequestModel::where('id', $id)->where('user_id', $user->id)->first();
        }
        
        if (!$request) {
            return response()->json(['message' => 'Request not found'], 404);
        }
        return response()->json($request);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = auth()->user();
        
        // Find request - customer service can update any request, inspectors can update assigned requests, others only their own
        if ($user->isCustomerService()) {
            $requestModel = RequestModel::where('id', $id)->first();
        } elseif ($user->isInspector()) {
            // For inspectors, check if request is assigned to them
            $requestModel = RequestModel::where('id', $id)
                ->where('assigned_staff', $user->name)
                ->first();
        } else {
            $requestModel = RequestModel::where('id', $id)->where('user_id', $user->id)->first();
        }
        
        if (!$requestModel) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $validated = $request->validate([
            'serve_type' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'location' => 'sometimes|string|max:255',
            'status' => 'sometimes|string|in:Pending,In Progress,Rejected,Resolved',
            'inspectorStatus' => 'sometimes|string|in:Solved,Not Solved',
            'priority' => 'sometimes|string|in:Low,Medium,High,Urgent',
            'assigned_staff' => 'sometimes|nullable|string|max:255',
            'deadline' => 'sometimes|nullable|date',
            'comments' => 'sometimes|nullable|array',
            'timeline' => 'sometimes|nullable|array',
        ]);

        // Auto-update status to 'Completed' when inspectorStatus is set to 'Solved'
        if (isset($validated['inspectorStatus']) && $validated['inspectorStatus'] === 'Solved') {
            $validated['status'] = 'Completed';
        }

        $requestModel->update($validated);
        return response()->json($requestModel);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = auth()->user();
        $request = RequestModel::where('id', $id)->where('user_id', $user->id)->first();
        if (!$request) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $request->delete();
        return response()->json(['message' => 'Request deleted successfully']);
    }
}
