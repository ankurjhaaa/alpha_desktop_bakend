<?php

namespace App\Http\Controllers;

use App\Models\McqPaper;
use Illuminate\Http\Request;

class McqPaperController extends Controller
{
    public function index(Request $request)
    {
        $query = McqPaper::with('batch');
        if ($request->has('batch_id')) {
            $query->where('batch_id', $request->batch_id);
        }

        if ($request->has('course_id')) {
            $query->whereHas('batch', function($q) use ($request) {
                $q->where('course_id', $request->course_id);
            });
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%$search%");
        }
        
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'exam_date' => 'nullable|date',
            'exam_password' => 'nullable|string|max:255',
        ]);

        $paper = McqPaper::create($validated);
        return response()->json($paper, 201);
    }

    public function update(Request $request, $id)
    {
        $paper = McqPaper::findOrFail($id);

        $validated = $request->validate([
            'batch_id' => 'sometimes|required|exists:batches,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'exam_date' => 'nullable|date',
            'exam_password' => 'nullable|string|max:255',
        ]);

        $paper->update($validated);
        return response()->json($paper);
    }

    public function destroy($id)
    {
        $paper = McqPaper::findOrFail($id);
        $paper->delete();
        return response()->json(null, 204);
    }
}
