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
                ->whereIn('serve_type', ['Repair', 'Meter Replacement', 'Complaint','No Water Supply', 'Other'])
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
            // For HOD Sanitation, show new connection and remove sewage water requests
            $requests = RequestModel::with('user')
                ->whereIn('serve_type', ['New Connection', 'Remove Sewage Water'])
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

        // Default initial status for new requests
        $validated['user_id'] = auth()->id();
        $validated['status'] = 'Submitted';
        $validated['inspectorStatus'] = $validated['inspectorStatus'] ?? 'Not Solved';
        // Ensure no accidental assignment on create
        $validated['assigned_staff'] = null;
        $validated['assigned_inspector_id'] = null;
        // Initialize timeline with submitted event
        $validated['timeline'] = [
            [
                'date' => now()->toDateString(),
                'event' => 'Request Submitted',
                'by' => auth()->user()->name ?? 'Customer',
            ]
        ];

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
                ->whereIn('serve_type', ['Repair', 'Meter Replacement', 'Complaint', 'Other'])
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
            // For HOD Sanitation, show new connection and remove sewage water requests
            $request = RequestModel::with('user')
                ->where('id', $id)
                ->whereIn('serve_type', ['New Connection', 'Remove Sewage Water'])
                ->first();
        } else {
            // For customers, show only their own requests
            $request = RequestModel::where('id', $id)->where('user_id', $user->id)->first();
        }

        if (!$request) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        // When HOD or Customer Service views a freshly submitted request, mark it as Reviewed
        if (($user->isCustomerService() || $user->isHODSanitation()) && $request->status === 'Submitted') {
            $request->status = 'Reviewed';
            $timeline = is_array($request->timeline) ? $request->timeline : (json_decode($request->timeline, true) ?: []);
            $timeline[] = [
                'date' => now()->toDateString(),
                'event' => 'Request Reviewed',
                'by' => $user->name,
            ];
            $request->timeline = $timeline;
            $request->save();
        }
        if (($user->isHODSanitation() || $user->isCustomerService() || $user->isFinance())
    && $request && $request->status === 'Submitted') {
    $request->update(['status' => 'Reviewed']);
    $request = $request->fresh();
}

        return response()->json($request);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = auth()->user();

        // Find request - customer service can update customer service requests, inspectors can update assigned requests, finance can update billing requests, HOD Sanitation can update sanitation requests, others only their own
        if ($user->isCustomerService()) {
            $requestModel = RequestModel::where('id', $id)
                ->whereIn('serve_type', ['Repair', 'Meter Replacement', 'Complaint', 'No Water Supply','Other'])
                ->first();
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
            // For HOD Sanitation, check if request is new connection or remove sewage water
            $requestModel = RequestModel::where('id', $id)
                ->whereIn('serve_type', ['New Connection', 'Remove Sewage Water'])
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
            'status' => 'sometimes|string|in:Submitted,Reviewed,Assigned,In Progress,Rejected,Resolved,Completed,Pending',
            'inspectorStatus' => 'sometimes|string|in:Solved,Not Solved,Ongoing',
            'priority' => 'sometimes|string|in:Low,Medium,High,Urgent',
            'assigned_staff' => 'sometimes|nullable|string|max:255',
            'deadline' => 'sometimes|nullable|date',
            'comments' => 'sometimes|nullable|array',
            'timeline' => 'sometimes|nullable|array',
            'amount' => 'sometimes|nullable|numeric|min:0',
            'payment_status' => 'sometimes|string|in:Unpaid,Pending,Paid,Overdue',
        ]);

        // Map inspectorStatus to request status
        if (isset($validated['inspectorStatus'])) {
            if ($validated['inspectorStatus'] === 'Solved') {
                $validated['status'] = 'Completed';
            } elseif ($validated['inspectorStatus'] === 'Ongoing') {
                $validated['status'] = 'In Progress';
            }
        }

        // Prevent setting status to 'Assigned' unless an inspector is actually assigned
        if (isset($validated['status']) && $validated['status'] === 'Assigned') {
            $hasAssignment = (!empty($validated['assigned_staff']) || !empty($validated['assigned_inspector_id']));
            if (!$hasAssignment) {
                // Remove status change so it won't be set to Assigned without assignment
                unset($validated['status']);
            }
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
            ->whereIn('serve_type', ['New Connection', 'Remove Sewage Water'])
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
            // When assigning, mark request as 'Assigned' so inspector can later start (Ongoing)
            'status'                => 'Assigned',
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
