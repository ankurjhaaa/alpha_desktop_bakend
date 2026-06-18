<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use Illuminate\Http\Request;

class BatchController extends Controller
{
    public function index(Request $request)
    {
        $query = Batch::with('course');
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%$search%");
        }
        
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('is_hidden')) {
            $query->where('is_hidden', filter_var($request->is_hidden, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'name' => 'required|string|max:255',
            'schedule_time' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'is_hidden' => 'boolean',
        ]);

        $batch = Batch::create($validated);
        return response()->json($batch, 201);
    }

    public function update(Request $request, Batch $batch)
    {
        $validated = $request->validate([
            'course_id' => 'sometimes|required|exists:courses,id',
            'name' => 'sometimes|required|string|max:255',
            'schedule_time' => 'nullable|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'boolean',
            'is_hidden' => 'boolean',
        ]);

        $batch->update($validated);
        return response()->json($batch);
    }

    public function destroy(Batch $batch)
    {
        $batch->delete();
        return response()->json(null, 204);
    }
}
