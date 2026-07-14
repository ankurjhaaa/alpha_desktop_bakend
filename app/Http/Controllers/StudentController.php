<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Batch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use ImageKit\ImageKit;

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
            'join_date' => 'nullable|date',
            'profile_image' => 'nullable|image|max:2048',
        ]);

        $profileImagePath = null;
        $profileImageFileId = null;
        if ($request->hasFile('profile_image')) {
            try {
                $imageKit = new ImageKit(
                    env('IMAGEKIT_PUBLIC_KEY'),
                    env('IMAGEKIT_PRIVATE_KEY'),
                    env('IMAGEKIT_URL_ENDPOINT')
                );

                $uploadFile = $imageKit->uploadFile([
                    'file' => base64_encode(file_get_contents($request->file('profile_image')->path())),
                    'fileName' => $request->file('profile_image')->getClientOriginalName(),
                    'folder' => '/students/profiles'
                ]);

                if (isset($uploadFile->result->url)) {
                    $profileImagePath = $uploadFile->result->url;
                    $profileImageFileId = $uploadFile->result->fileId;
                }
            } catch (\Exception $e) {
                // fallback or handle error
                \Log::error('ImageKit upload failed: ' . $e->getMessage());
            }
        }

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
            'profile_image' => $profileImagePath,
            'profile_image_file_id' => $profileImageFileId,
        ]);

        if (array_key_exists('join_date', $validated) && $validated['join_date']) {
            $student->created_at = $validated['join_date'];
            $student->save();
        }

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

        return response()->json($student->load(['batches.course', 'examResults.mcqPaper']));
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
            'join_date' => 'nullable|date',
            'profile_image' => 'nullable|image|max:2048',
        ]);

        if (array_key_exists('profile_image', $validated)) {
            unset($validated['profile_image']);
        }

        if ($request->hasFile('profile_image')) {
            try {
                $imageKit = new ImageKit(
                    env('IMAGEKIT_PUBLIC_KEY'),
                    env('IMAGEKIT_PRIVATE_KEY'),
                    env('IMAGEKIT_URL_ENDPOINT')
                );

                $uploadFile = $imageKit->uploadFile([
                    'file' => base64_encode(file_get_contents($request->file('profile_image')->path())),
                    'fileName' => $request->file('profile_image')->getClientOriginalName(),
                    'folder' => '/students/profiles'
                ]);

                if (isset($uploadFile->result->url)) {
                    if ($student->profile_image_file_id) {
                        $this->deleteImageKitFile($student->profile_image_file_id);
                    }
                    $validated['profile_image'] = $uploadFile->result->url;
                    $validated['profile_image_file_id'] = $uploadFile->result->fileId;
                }
            } catch (\Exception $e) {
                \Log::error('ImageKit upload failed: ' . $e->getMessage());
            }
        }

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
        ]);

        // Attach without detaching others
        $student->batches()->syncWithoutDetaching([
            $validated['batch_id']
        ]);

        return response()->json($student->load('batches.course'));
    }

    public function detachBatch(User $student, Batch $batch)
    {
        if ($student->role !== 'student') {
            return response()->json(['message' => 'Not a student'], 403);
        }

        $hasExams = $student->examResults()->whereHas('mcqPaper', function ($query) use ($batch) {
            $query->where('batch_id', $batch->id);
        })->exists();

        if ($hasExams) {
            return response()->json([
                'message' => 'Cannot remove batch because the student has already taken exams in this batch.'
            ], 400);
        }

        $student->batches()->detach($batch->id);

        return response()->json(['message' => 'Batch removed successfully']);
    }

    public function destroy(User $student)
    {
        if ($student->role !== 'student') {
            return response()->json(['message' => 'Not a student'], 403);
        }

        if ($student->profile_image_file_id) {
            $this->deleteImageKitFile($student->profile_image_file_id);
        }

        $student->delete();
        return response()->json(null, 204);
    }

    private function deleteImageKitFile($fileId)
    {
        if (!$fileId) return;
        try {
            $imageKit = new ImageKit(
                env('IMAGEKIT_PUBLIC_KEY'),
                env('IMAGEKIT_PRIVATE_KEY'),
                env('IMAGEKIT_URL_ENDPOINT')
            );
            $imageKit->deleteFile($fileId);
        } catch (\Exception $e) {
            \Log::error('ImageKit delete failed: ' . $e->getMessage());
        }
    }
}
