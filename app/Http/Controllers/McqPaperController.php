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
            'start_time' => 'nullable|date_format:Y-m-d H:i:s',
            'end_time' => 'nullable|date_format:Y-m-d H:i:s',
            'invigilators' => 'nullable|string',
            'selected_student_ids' => 'nullable|array',
            'selected_student_ids.*' => 'integer',
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
            'start_time' => 'nullable|date_format:Y-m-d H:i:s',
            'end_time' => 'nullable|date_format:Y-m-d H:i:s',
            'invigilators' => 'nullable|string',
            'selected_student_ids' => 'nullable|array',
            'selected_student_ids.*' => 'integer',
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

    public function results($id)
    {
        $results = \App\Models\ExamResult::with('user:id,name,email')
            ->where('mcq_paper_id', $id)
            ->orderBy('score', 'desc')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($r) {
                return [
                    'user_id' => $r->user_id,
                    'student_name' => $r->user->name ?? 'Unknown',
                    'student_email' => $r->user->email ?? 'N/A',
                    'score' => $r->score,
                    'total_questions' => $r->total_questions,
                    'percentage' => $r->percentage,
                    'submitted_at' => $r->created_at,
                ];
            });

        return response()->json($results);
    }

    public function studentAnswers($id, $user_id)
    {
        $result = \App\Models\ExamResult::with('user:id,name,registration_id')
            ->where('user_id', $user_id)
            ->where('mcq_paper_id', $id)
            ->firstOrFail();

        $paper = McqPaper::with(['questions', 'batch.course'])->findOrFail($id);
        
        $questions = $paper->questions->map(function ($q) {
            return [
                'id' => $q->id,
                'question_text' => $q->question_text,
                'option_a' => $q->option_a,
                'option_b' => $q->option_b,
                'option_c' => $q->option_c,
                'option_d' => $q->option_d,
                'correct_option' => $q->correct_option,
            ];
        });

        return response()->json([
            'result' => [
                'user' => $result->user,
                'score' => $result->score,
                'total_questions' => $result->total_questions,
                'percentage' => $result->percentage,
                'student_answers' => $result->student_answers ?? [],
                'submitted_at' => $result->created_at,
                'created_at' => $result->created_at,
                'batch' => $paper->batch ? ['id' => $paper->batch->id, 'name' => $paper->batch->name, 'schedule_time' => $paper->batch->schedule_time] : null,
                'course' => $paper->batch && $paper->batch->course ? ['id' => $paper->batch->course->id, 'name' => $paper->batch->course->name] : null,
            ],
            'questions' => $questions,
            'paper_title' => $paper->title,
        ]);
    }

    public function revokeResult($id, $user_id)
    {
        $result = \App\Models\ExamResult::where('user_id', $user_id)
            ->where('mcq_paper_id', $id)
            ->firstOrFail();
            
        $result->delete();
        
        return response()->json(null, 204);
    }
}
