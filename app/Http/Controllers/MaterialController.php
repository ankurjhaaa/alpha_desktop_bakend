<?php

namespace App\Http\Controllers;

use App\Models\Material;
use Illuminate\Http\Request;

class MaterialController extends Controller
{
    private function getImageKit()
    {
        return new \ImageKit\ImageKit(
            env('IMAGEKIT_PUBLIC_KEY'),
            env('IMAGEKIT_PRIVATE_KEY'),
            env('IMAGEKIT_URL_ENDPOINT')
        );
    }

    public function index(Request $request)
    {
        $query = Material::with('batch:id,name,course_id')->latest();
        
        if ($request->has('batch_id')) {
            $query->where('batch_id', $request->batch_id);
        }

        // Student access control
        $user = auth()->user();
        if ($user && $user->role === 'student') {
            $batchIds = $user->batches()->pluck('batches.id');
            $query->whereIn('batch_id', $batchIds);
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $file = $request->file('file');
        
        $imageKit = $this->getImageKit();

        // Convert file to base64 for upload
        $base64 = base64_encode(file_get_contents($file->path()));

        $uploadResponse = $imageKit->uploadFile([
            'file' => $base64,
            'fileName' => $file->getClientOriginalName(),
            'folder' => '/study_materials'
        ]);

        if (isset($uploadResponse->error)) {
            return response()->json(['message' => 'ImageKit Upload Failed: ' . $uploadResponse->error->message], 500);
        }

        $material = Material::create([
            'batch_id' => $request->batch_id,
            'title' => $request->title,
            'description' => $request->description,
            'file_url' => $uploadResponse->result->url,
            'file_id' => $uploadResponse->result->fileId,
        ]);

        return response()->json($material, 201);
    }

    public function destroy($id)
    {
        $material = Material::findOrFail($id);

        if ($material->file_id) {
            $imageKit = $this->getImageKit();
            try {
                $imageKit->deleteFile($material->file_id);
            } catch (\Exception $e) {
                // Ignore if it fails
            }
        }

        $material->delete();

        return response()->json(null, 204);
    }
}
