<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = Course::with(['batches', 'topics']);
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%$search%");
        }
        
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'topics' => 'nullable|array',
            'topics.*' => 'required|string|max:255',
        ]);

        $course = Course::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (!empty($validated['topics'])) {
            foreach ($validated['topics'] as $topicTitle) {
                $course->topics()->create(['title' => $topicTitle]);
            }
        }

        return response()->json($course->load('topics'), 201);
    }

    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'topics' => 'nullable|array',
            'topics.*' => 'required|string|max:255',
        ]);

        $course->update([
            'name' => $validated['name'] ?? $course->name,
            'description' => array_key_exists('description', $validated) ? $validated['description'] : $course->description,
            'is_active' => $validated['is_active'] ?? $course->is_active,
        ]);

        if (isset($validated['topics'])) {
            $existingTopics = $course->topics()->pluck('title', 'id')->toArray();
            $newTopics = $validated['topics'];
            
            // Delete topics that are not in the new list
            $topicsToDelete = array_diff($existingTopics, $newTopics);
            if (!empty($topicsToDelete)) {
                $course->topics()->whereIn('id', array_keys($topicsToDelete))->delete();
            }
            
            // Create topics that are in the new list but not in the existing list
            $topicsToCreate = array_diff($newTopics, $existingTopics);
            foreach ($topicsToCreate as $topicTitle) {
                $course->topics()->create(['title' => $topicTitle]);
            }
        }

        return response()->json($course->load('topics'));
    }

    public function destroy(Course $course)
    {
        if ($course->batches()->exists()) {
            return response()->json(['message' => 'Cannot delete course because it has associated batches. Please delete or reassign them first.'], 409);
        }
        $course->delete();
        return response()->json(null, 204);
    }
}
