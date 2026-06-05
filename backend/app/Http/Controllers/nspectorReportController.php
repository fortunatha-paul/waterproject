<?php
 
namespace App\Http\Controllers;
 
use Illuminate\Http\Request;
use App\Models\InspectorReport;
 
class InspectorReportController extends Controller
{
    /**
     * List reports.
     *
     * - Inspector:         sees only their own reports
     * - HOD Sanitation:    sees all reports
     * - Customer Service:  sees all reports
     * - Finance:           sees all reports (with billing info)
     */
    public function index()
    {
        $user = auth()->user();
 
        if ($user->isInspector()) {
            $reports = InspectorReport::with(['inspector', 'request'])
                ->where('inspector_id', $user->id)
                ->orderByDesc('created_at')
                ->get();
        } else {
            // HOD Sanitation, Customer Service, Finance all see everything
            $reports = InspectorReport::with(['inspector', 'request'])
                ->orderByDesc('created_at')
                ->get();
        }
 
        return response()->json($reports);
    }
 
    /**
     * Create a new report.
     * Only inspectors can create reports.
     */
    public function store(Request $request)
    {
        $user = auth()->user();
 
        if (!$user->isInspector()) {
            return response()->json(['message' => 'Only inspectors can create reports.'], 403);
        }
 
        $validated = $request->validate([
            'request_id'          => 'nullable|exists:requests,id',
            'title'               => 'required|string|max:255',
            'area_visited'        => 'required|string|max:255',
            'visit_date'          => 'required|date',
            'findings'            => 'required|string',
            'work_done'           => 'required|string',
            'recommendations'     => 'required|string',
            'water_supply_status' => 'required|string|in:Normal,Low,No Supply',
            'pipe_condition'      => 'required|string|in:Good,Damaged,Critical',
            'sewage_issue'        => 'required|boolean',
            'sewage_details'      => 'nullable|string',
            'estimated_cost'      => 'nullable|numeric|min:0',
            'billing_notes'       => 'nullable|string|max:500',
            'images'              => 'nullable|array',
        ]);
 
        $validated['inspector_id'] = $user->id;
        $validated['status']       = 'Submitted';
 
        $report = InspectorReport::create($validated);
 
        return response()->json($report->load(['inspector', 'request']), 201);
    }
 
    /**
     * Show a single report.
     */
    public function show(string $id)
    {
        $user   = auth()->user();
        $report = InspectorReport::with(['inspector', 'request'])->findOrFail($id);
 
        // Inspectors can only see their own
        if ($user->isInspector() && $report->inspector_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
 
        return response()->json($report);
    }
 
    /**
     * Update a report.
     * - Inspector:   can edit if status is still 'Submitted'
     * - HOD / CS / Finance: can change status to 'Reviewed' or 'Actioned'
     */
    public function update(Request $request, string $id)
    {
        $user   = auth()->user();
        $report = InspectorReport::findOrFail($id);
 
        if ($user->isInspector()) {
            // Inspector can only edit their own report while it's still Submitted
            if ($report->inspector_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            if ($report->status !== 'Submitted') {
                return response()->json(['message' => 'Report can no longer be edited after review.'], 422);
            }
 
            $validated = $request->validate([
                'title'               => 'sometimes|string|max:255',
                'area_visited'        => 'sometimes|string|max:255',
                'visit_date'          => 'sometimes|date',
                'findings'            => 'sometimes|string',
                'work_done'           => 'sometimes|string',
                'recommendations'     => 'sometimes|string',
                'water_supply_status' => 'sometimes|string|in:Normal,Low,No Supply',
                'pipe_condition'      => 'sometimes|string|in:Good,Damaged,Critical',
                'sewage_issue'        => 'sometimes|boolean',
                'sewage_details'      => 'nullable|string',
                'estimated_cost'      => 'nullable|numeric|min:0',
                'billing_notes'       => 'nullable|string|max:500',
            ]);
        } else {
            // Managers can mark report as Reviewed or Actioned
            $validated = $request->validate([
                'status' => 'required|string|in:Submitted,Reviewed,Actioned',
            ]);
        }
 
        $report->update($validated);
        return response()->json($report->fresh()->load(['inspector', 'request']));
    }
 
    /**
     * Delete a report (inspector only, while still Submitted).
     */
    public function destroy(string $id)
    {
        $user   = auth()->user();
        $report = InspectorReport::findOrFail($id);
 
        if (!$user->isInspector() || $report->inspector_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if ($report->status !== 'Submitted') {
            return response()->json(['message' => 'Cannot delete a reviewed report.'], 422);
        }
 
        $report->delete();
        return response()->json(['message' => 'Report deleted.']);
    }
}