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
        $requests = RequestModel::where('user_id', $user->id)->get();
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
        $request = RequestModel::where('id', $id)->where('user_id', $user->id)->first();
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
        $requestModel = RequestModel::where('id', $id)->where('user_id', $user->id)->first();
        if (!$requestModel) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        $validated = $request->validate([
            'serve_type' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'location' => 'sometimes|string|max:255',
        ]);

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
