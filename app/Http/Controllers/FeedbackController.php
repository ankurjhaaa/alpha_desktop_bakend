<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FeedbackController extends Controller
{
    // For Student: View their own feedback
    public function studentIndex(Request $request)
    {
        $feedbacks = Feedback::with('batch:id,name')
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(15);
            
        return response()->json($feedbacks);
    }

    // For Student: Store new feedback
    public function store(Request $request)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'message' => 'required|string',
            'batch_id' => 'nullable|exists:batches,id',
        ]);

        $feedback = Feedback::create([
            'user_id' => Auth::id(),
            'batch_id' => $request->batch_id,
            'rating' => $request->rating,
            'message' => $request->message,
        ]);

        return response()->json($feedback, 201);
    }

    // For Teacher/Admin: View all feedbacks
    public function adminIndex(Request $request)
    {
        $feedbacks = Feedback::with(['user:id,name,email,phone_number', 'batch:id,name'])
            ->latest()
            ->paginate(15);

        return response()->json($feedbacks);
    }
}
