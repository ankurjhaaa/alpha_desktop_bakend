<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\McqPaper;
use App\Models\ExamResult;
use App\Models\McqQuestion;
use Illuminate\Support\Facades\Auth;

class StudentExamController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'student') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Fetch papers for all the student's batches
        $batchIds = $user->batches()->pluck('batches.id')->toArray();
        $papers = McqPaper::with('batch')->whereIn('batch_id', $batchIds)
            ->where('is_active', true)
            ->get()
            ->filter(function ($paper) use ($user) {
                // If selected_student_ids is null, assume all students in the batch are eligible.
                if ($paper->selected_student_ids === null) {
                    return true;
                }
                // If it is an array, only include the student if their ID is in the array.
                return in_array($user->id, collect($paper->selected_student_ids)->map(fn($id) => (int)$id)->toArray(), true);
            })
            ->map(function ($paper) use ($user) {
                $result = ExamResult::where('user_id', $user->id)
                    ->where('mcq_paper_id', $paper->id)
                    ->first();

                return [
                    'id' => $paper->id,
                    'title' => $paper->title,
                    'description' => $paper->description,
                    'exam_date' => $paper->exam_date,
                    'start_time' => $paper->start_time,
                    'end_time' => $paper->end_time,
                    'requires_password' => !empty($paper->exam_password),
                    'is_completed' => $result !== null,
                    'score' => $result ? $result->score : null,
                    'total_questions' => $result ? $result->total_questions : null,
                    'percentage' => $result ? $result->percentage : null,
                    'batch' => $paper->batch ? ['id' => $paper->batch->id, 'name' => $paper->batch->name] : null,
                ];
            })->values();

        return response()->json($papers);
    }

    public function verifyPassword(Request $request, $id)
    {
        $user = Auth::user();
        $batchIds = $user->batches()->pluck('batches.id')->toArray();
        $paper = McqPaper::whereIn('batch_id', $batchIds)->findOrFail($id);

        if ($paper->selected_student_ids !== null) {
            $eligibleIds = collect($paper->selected_student_ids)->map(fn($sid) => (int)$sid)->toArray();
            if (!in_array($user->id, $eligibleIds, true)) {
                return response()->json(['message' => 'You are not authorized to take this exam'], 403);
            }
        }

        if (!empty($paper->exam_password)) {
            $validated = $request->validate([
                'password' => 'required|string',
            ]);
            if ($paper->exam_password !== $validated['password']) {
                return response()->json(['message' => 'Invalid password'], 403);
            }
        }

        if ($paper->exam_date && $paper->exam_date !== date('Y-m-d')) {
             return response()->json(['message' => 'Exam is not scheduled for today'], 403);
        }

        if ($paper->start_time && now()->isBefore($paper->start_time)) {
             return response()->json(['message' => 'Exam has not started yet'], 403);
        }

        if ($paper->end_time && now()->isAfter($paper->end_time)) {
             return response()->json(['message' => 'Exam has already ended'], 403);
        }

        // Check if already taken
        $exists = ExamResult::where('user_id', $user->id)->where('mcq_paper_id', $paper->id)->exists();
        if ($exists) {
            return response()->json(['message' => 'Exam already completed'], 403);
        }

        // Return questions without correct answers if possible, but for now we just return them
        // In a real high-security app we wouldn't send `correct_option` to the client.
        // For now, we fetch questions. We can hide correct_option using a map.
        $questions = $paper->questions()->get()->map(function($q) {
            return [
                'id' => $q->id,
                'question_text' => $q->question_text,
                'option_a' => $q->option_a,
                'option_b' => $q->option_b,
                'option_c' => $q->option_c,
                'option_d' => $q->option_d,
            ];
        });

        return response()->json(['questions' => $questions]);
    }

    public function submit(Request $request, $id)
    {
        $user = Auth::user();
        $batchIds = $user->batches()->pluck('batches.id')->toArray();
        $paper = McqPaper::whereIn('batch_id', $batchIds)->findOrFail($id);

        if ($paper->selected_student_ids !== null) {
            $eligibleIds = collect($paper->selected_student_ids)->map(fn($sid) => (int)$sid)->toArray();
            if (!in_array($user->id, $eligibleIds, true)) {
                return response()->json(['message' => 'You are not authorized to take this exam'], 403);
            }
        }

        // Check if already taken
        $exists = ExamResult::where('user_id', $user->id)->where('mcq_paper_id', $paper->id)->exists();
        if ($exists) {
            return response()->json(['message' => 'Exam already completed'], 403);
        }

        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*' => 'nullable|in:A,B,C,D,a,b,c,d',
        ]);

        $answers = $validated['answers'];
        $questions = $paper->questions()->get()->keyBy('id');
        $score = 0;
        $total = $questions->count();

        foreach ($questions as $qId => $question) {
            if (isset($answers[$qId]) && strtolower($answers[$qId]) === strtolower($question->correct_option)) {
                $score++;
            }
        }

        $percentage = $total > 0 ? ($score / $total) * 100 : 0;

        $result = ExamResult::create([
            'user_id' => $user->id,
            'mcq_paper_id' => $paper->id,
            'score' => $score,
            'total_questions' => $total,
            'percentage' => round($percentage, 2),
            'student_answers' => $answers,
        ]);

        
        $resultArray = $result->toArray();
        $resultArray['paper_title'] = $paper->title;
        $resultArray['batch'] = $paper->batch ? ['id' => $paper->batch->id, 'name' => $paper->batch->name, 'schedule_time' => $paper->batch->schedule_time] : null;
        $resultArray['course'] = $paper->batch && $paper->batch->course ? ['id' => $paper->batch->course->id, 'name' => $paper->batch->course->name] : null;
        return response()->json($resultArray, 201);
    }

    public function leaderboard($id)
    {
        $results = ExamResult::with('user:id,name')
            ->where('mcq_paper_id', $id)
            ->orderBy('score', 'desc')
            ->orderBy('created_at', 'asc') // Tie-breaker: who finished first
            ->get()
            ->map(function ($r) {
                return [
                    'student_name' => $r->user->name ?? 'Unknown',
                    'score' => $r->score,
                    'total_questions' => $r->total_questions,
                    'percentage' => $r->percentage,
                    'submitted_at' => $r->created_at,
                ];
            });

        return response()->json($results);
    }

    public function viewAnswers($id)
    {
        $user = Auth::user();
        $result = ExamResult::where('user_id', $user->id)
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
                'user' => [
                    'name' => $user->name,
                    'registration_id' => $user->registration_id,
                ],
                'score' => $result->score,
                'total_questions' => $result->total_questions,
                'percentage' => $result->percentage,
                'student_answers' => $result->student_answers ?? [],
                'created_at' => $result->created_at,
                'batch' => $paper->batch ? ['id' => $paper->batch->id, 'name' => $paper->batch->name, 'schedule_time' => $paper->batch->schedule_time] : null,
                'course' => $paper->batch && $paper->batch->course ? ['id' => $paper->batch->course->id, 'name' => $paper->batch->course->name] : null,
            ],
            'questions' => $questions,
            'paper_title' => $paper->title,
        ]);
    }

    public function globalLeaderboard()
    {
        $results = ExamResult::select('user_id')
            ->selectRaw('COUNT(id) as total_exams')
            ->selectRaw('ROUND(AVG(percentage), 2) as average_marks')
            ->with('user:id,name,email')
            ->groupBy('user_id')
            ->orderByDesc('total_exams')
            ->orderByDesc('average_marks')
            ->take(10)
            ->get();

        $formatted = $results->map(function ($r) {
            return [
                'user_id' => $r->user_id,
                'student_name' => $r->user->name ?? 'Unknown',
                'student_email' => $r->user->email ?? 'Unknown',
                'total_exams' => $r->total_exams,
                'average_marks' => $r->average_marks,
            ];
        });

        return response()->json($formatted);
    }
}
