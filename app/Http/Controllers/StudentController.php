<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'student')->with('batch');
        if ($request->has('batch_id')) {
            $query->where('batch_id', $request->batch_id);
        }

        if ($request->has('course_id')) {
            $query->whereHas('batch', function ($q) use ($request) {
                $q->where('course_id', $request->course_id);
            });
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
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
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'batch_id' => 'required|exists:batches,id',
            'is_active' => 'boolean',
        ]);

        $student = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'student',
            'batch_id' => $validated['batch_id'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json($student, 201);
    }

    public function update(Request $request, User $student)
    {
        if ($student->role !== 'student') {
            return response()->json(['message' => 'Not a student'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $student->id,
            'password' => 'nullable|string|min:8',
            'batch_id' => 'sometimes|required|exists:batches,id',
            'is_active' => 'boolean',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $student->update($validated);
        return response()->json($student);
    }

    public function destroy(User $student)
    {
        if ($student->role !== 'student') {
            return response()->json(['message' => 'Not a student'], 403);
        }

        $student->delete();
        return response()->json(null, 204);
    }
}
