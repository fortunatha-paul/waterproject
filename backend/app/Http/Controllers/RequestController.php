<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Request as RequestModel;
use App\Models\User;

class RequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = auth()->user();

        // If user is customer service, show only customer service related requests
        if ($user->isCustomerService()) {
            $requests = RequestModel::with('user')
                ->whereIn('serve_type', ['Meter Repair', 'Meter Replacement', 'No Water Supply'])
                ->get();
        } elseif ($user->isInspector()) {
            // For inspectors, show requests assigned to them
            $requests = RequestModel::with('user')
                ->where('assigned_staff', $user->name)
                ->get();
        } elseif ($user->isFinance()) {
            // For finance, show billing-related requests
            $requests = RequestModel::with('user')
                ->where('serve_type', 'Billing Issue')
                ->get();
        } elseif ($user->isHODSanitation()) {
            // For HOD Sanitation, show new connection and sewerage problem requests
            $requests = RequestModel::with('user')
                ->whereIn('serve_type', ['New Connection', 'Sewerage Problem'])
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

        // If user is customer service, show any customer service related request
        if ($user->isCustomerService()) {
            $request = RequestModel::with('user')
                ->where('id', $id)
                ->whereIn('serve_type', ['Meter Repair', 'Meter Replacement', 'No Water Supply'])
                ->first();
        } elseif ($user->isInspector()) {
            // For inspectors, show requests assigned to them
            $request = RequestModel::with('user')
                ->where('id', $id)
                ->where('assigned_staff', $user->name)
                ->first();
        } elseif ($user->isFinance()) {
            // For finance, show billing-related requests
            $request = RequestModel::with('user')
                ->where('id', $id)
                ->where('serve_type', 'Billing Issue')
                ->first();
        } elseif ($user->isHODSanitation()) {
            // For HOD Sanitation, show new connection and sewerage problem requests
            $request = RequestModel::with('user')
                ->where('id', $id)
                ->whereIn('serve_type', ['New Connection', 'Sewerage Problem'])
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

        // Find request - customer service can update any request, inspectors can update assigned requests, finance can update billing requests, HOD Sanitation can update sanitation requests, others only their own
        if ($user->isCustomerService()) {
            $requestModel = RequestModel::where('id', $id)->first();
        } elseif ($user->isInspector()) {
            // For inspectors, check if request is assigned to them
            $requestModel = RequestModel::where('id', $id)
                ->where('assigned_staff', $user->name)
                ->first();
        } elseif ($user->isFinance()) {
            // For finance, check if request is billing-related
            $requestModel = RequestModel::where('id', $id)
                ->where('serve_type', 'Billing Issue')
                ->first();
        } elseif ($user->isHODSanitation()) {
            // For HOD Sanitation, check if request is new connection or sewerage problem
            $requestModel = RequestModel::where('id', $id)
                ->whereIn('serve_type', ['New Connection', 'Sewerage Problem'])
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
            'amount' => 'sometimes|nullable|numeric|min:0',
            'payment_status' => 'sometimes|string|in:Unpaid,Pending,Paid,Overdue',
        ]);

        // Auto-update status to 'Completed' when inspectorStatus is set to 'Solved'
        if (isset($validated['inspectorStatus']) && $validated['inspectorStatus'] === 'Solved') {
            $validated['status'] = 'Completed';
        }

        $requestModel->update($validated);
        return response()->json($requestModel);
    }

    /**
     * Assign an inspector to a request.
     */
    public function assignInspector(Request $request, string $id)
    {
        $user = auth()->user();

        // Only HOD Sanitation can assign inspectors
        if (!$user->isHODSanitation()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $requestModel = RequestModel::where('id', $id)
            ->whereIn('serve_type', ['New Connection', 'Sewerage Problem'])
            ->first();

        if (!$requestModel) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $validated = $request->validate([
            'inspector_id' => 'required|exists:users,id',
        ]);

        $inspector = User::find($validated['inspector_id']);

        if (!$inspector || !$inspector->isInspector()) {
            return response()->json(['message' => 'Invalid inspector'], 422);
        }

        $requestModel->update([
            'assigned_inspector_id' => $inspector->id,
            'assigned_staff'        => $inspector->name,
            'status'                => 'In Progress',
        ]);

        return response()->json($requestModel->fresh());
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
