<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'student')->with('batches.course');
        if ($request->has('batch_id')) {
            $query->whereHas('batches', function ($q) use ($request) {
                $q->where('batches.id', $request->batch_id);
            });
        }

        if ($request->has('course_id')) {
            $query->whereHas('batches', function ($q) use ($request) {
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
            'batch_ids' => 'nullable|array',
            'batch_ids.*' => 'exists:batches,id',
            'is_active' => 'boolean',
            'father_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'registration_id' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'dob' => 'nullable|date',
            'gender' => 'nullable|string|max:20',
        ]);

        $student = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'student',
            'is_active' => $validated['is_active'] ?? true,
            'father_name' => $validated['father_name'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'registration_id' => $validated['registration_id'] ?? null,
            'address' => $validated['address'] ?? null,
            'dob' => $validated['dob'] ?? null,
            'gender' => $validated['gender'] ?? null,
        ]);

        if (!empty($validated['batch_ids'])) {
            $student->batches()->sync($validated['batch_ids']);
        }

        return response()->json($student->load('batches.course'), 201);
    }
    public function show(User $student)
    {
        if ($student->role !== 'student') {
            return response()->json(['message' => 'Not a student'], 403);
        }

        return response()->json($student->load('batches.course'));
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
            'batch_ids' => 'sometimes|nullable|array',
            'batch_ids.*' => 'exists:batches,id',
            'is_active' => 'boolean',
            'father_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'registration_id' => 'nullable|string|max:100',
            'address' => 'nullable|string',
            'dob' => 'nullable|date',
            'gender' => 'nullable|string|max:20',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $student->update($validated);

        if (isset($validated['batch_ids'])) {
            $student->batches()->sync($validated['batch_ids']);
        }

        return response()->json($student->load('batches.course'));
    }

    public function attachBatch(Request $request, User $student)
    {
        if ($student->role !== 'student') {
            return response()->json(['message' => 'Not a student'], 403);
        }

        $validated = $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'amount_paid' => 'nullable|numeric|min:0',
            'transaction_id' => 'nullable|string|max:255',
            'status' => 'required|string|in:paid,partial,unpaid',
        ]);

        // Attach without detaching others
        $student->batches()->syncWithoutDetaching([
            $validated['batch_id'] => [
                'amount_paid' => $validated['amount_paid'],
                'transaction_id' => $validated['transaction_id'],
                'status' => $validated['status'],
            ]
        ]);

        return response()->json($student->load('batches.course'));
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
