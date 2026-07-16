<?php

namespace App\Http\Controllers;

use App\Models\McqPaper;
use Illuminate\Http\Request;

class McqPaperController extends Controller
{
    public function index(Request $request)
    {
        $query = McqPaper::with(['batch', 'topic'])->withCount(['questions', 'results']);
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

    public function show($id)
    {
        $paper = McqPaper::with('batch')->findOrFail($id);
        return response()->json($paper);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'topic_id' => 'required|exists:topics,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'exam_date' => 'required|date',
            'exam_password' => 'required|string|max:255',
            'start_time' => 'required|date_format:Y-m-d H:i:s',
            'end_time' => 'required|date_format:Y-m-d H:i:s|after:start_time',
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

        if (\App\Models\ExamResult::where('mcq_paper_id', $id)->exists()) {
            return response()->json(['message' => 'Cannot edit this paper because one or more students have already submitted their exam.'], 403);
        }

        $validated = $request->validate([
            'batch_id' => 'required|exists:batches,id',
            'topic_id' => 'required|exists:topics,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'exam_date' => 'required|date',
            'exam_password' => 'required|string|max:255',
            'start_time' => 'required|date_format:Y-m-d H:i:s',
            'end_time' => 'required|date_format:Y-m-d H:i:s|after:start_time',
            'invigilators' => 'nullable|string',
            'selected_student_ids' => 'nullable|array',
            'selected_student_ids.*' => 'integer',
        ]);

        $paper->update($validated);
        return response()->json($paper);
    }

    public function importQuestionsFromBank(Request $request, $id)
    {
        $paper = McqPaper::with('batch')->findOrFail($id);
        
        $request->validate([
            'start_number' => 'required|integer|min:1',
            'end_number' => 'required|integer|gte:start_number',
            'course_id' => 'nullable|integer',
            'topic_id' => 'nullable|integer',
        ]);

        $course_id = $request->course_id ?? $paper->batch->course_id;
        $topic_id = $request->topic_id ?? $paper->topic_id;

        if (!$course_id) {
            return response()->json(['message' => 'No course selected or available.'], 400);
        }

        if (\App\Models\ExamResult::where('mcq_paper_id', $id)->exists()) {
            return response()->json(['message' => 'Cannot import questions because one or more students have already submitted their exam.'], 403);
        }

        // Fetch questions from bank
        $query = \App\Models\QuestionBank::where('course_id', $course_id);
        if ($topic_id) {
            $query->where('topic_id', $topic_id);
        }

        $questions = $query->orderBy('id', 'asc') // Assuming order is by ID
            ->skip($request->start_number - 1)
            ->take($request->end_number - $request->start_number + 1)
            ->get();

        if ($questions->isEmpty()) {
            return response()->json(['message' => 'No questions found in the specified range for this course/topic.'], 404);
        }

        $importedCount = 0;
        foreach ($questions as $q) {
            $options = $q->options ?? [];
            $correctOptionStr = strtolower(trim($q->correct_answer));
            
            if (!in_array($correctOptionStr, ['a', 'b', 'c', 'd'])) {
                $mapped = 'a';
                if (!empty($options)) {
                    foreach ($options as $idx => $opt) {
                        if (strtolower(trim($opt)) === $correctOptionStr) {
                            $mapped = ['a', 'b', 'c', 'd'][$idx] ?? 'a';
                            break;
                        }
                    }
                }
                $correctOptionStr = $mapped;
            }

            \App\Models\McqQuestion::create([
                'mcq_paper_id' => $paper->id,
                'question_text' => $q->question_text,
                'option_a' => $options[0] ?? '',
                'option_b' => $options[1] ?? '',
                'option_c' => $options[2] ?? '',
                'option_d' => $options[3] ?? '',
                'correct_option' => $correctOptionStr,
                'is_active' => true,
            ]);
            $importedCount++;
        }

        return response()->json(['message' => "$importedCount questions imported successfully to the exam."]);
    }

    public function destroy($id)
    {
        $paper = McqPaper::findOrFail($id);
        
        if (\App\Models\ExamResult::where('mcq_paper_id', $id)->exists()) {
            return response()->json(['message' => 'Cannot delete this paper because one or more students have already submitted their exam.'], 403);
        }

        $paper->delete();
        return response()->json(null, 204);
    }

    public function results($id)
    {
        $paper = McqPaper::with('batch.course')->findOrFail($id);
        
        $eligibleStudentIds = [];
        if (!empty($paper->selected_student_ids)) {
            $eligibleStudentIds = $paper->selected_student_ids;
        } else {
            // Find all students in this batch
            $batchId = $paper->batch_id;
            $eligibleStudentIds = \App\Models\User::where('role', 'student')
                ->whereHas('batches', function($q) use ($batchId) {
                    $q->where('batches.id', $batchId);
                })->pluck('id')->toArray();
        }

        $allStudents = \App\Models\User::whereIn('id', $eligibleStudentIds)->get();
        $resultsQuery = \App\Models\ExamResult::where('mcq_paper_id', $id)->get()->keyBy('user_id');
        $totalQuestions = $paper->questions()->count();

        $finalResults = [];
        
        foreach ($allStudents as $student) {
            if ($resultsQuery->has($student->id)) {
                $r = $resultsQuery->get($student->id);
                $finalResults[] = [
                    'id' => $r->id,
                    'user_id' => $r->user_id,
                    'student_name' => $student->name ?? 'Unknown',
                    'student_email' => $student->email ?? 'N/A',
                    'registration_id' => $student->registration_id ?? 'N/A',
                    'father_name' => $student->father_name ?? 'N/A',
                    'course_name' => $paper->batch->course->name ?? 'N/A',
                    'batch_name' => $paper->batch->name ?? 'N/A',
                    'batch_timing' => $paper->batch->schedule_time ?? 'N/A',
                    'profile_image' => $student->profile_image ?? null,
                    'score' => $r->score,
                    'total_questions' => $r->total_questions,
                    'percentage' => $r->percentage,
                    'submitted_at' => $r->created_at,
                    'status' => 'submitted'
                ];
            } else {
                $finalResults[] = [
                    'id' => null,
                    'user_id' => $student->id,
                    'student_name' => $student->name ?? 'Unknown',
                    'student_email' => $student->email ?? 'N/A',
                    'registration_id' => $student->registration_id ?? 'N/A',
                    'father_name' => $student->father_name ?? 'N/A',
                    'course_name' => $paper->batch->course->name ?? 'N/A',
                    'batch_name' => $paper->batch->name ?? 'N/A',
                    'batch_timing' => $paper->batch->schedule_time ?? 'N/A',
                    'profile_image' => $student->profile_image ?? null,
                    'score' => 0,
                    'total_questions' => $totalQuestions,
                    'percentage' => 0,
                    'submitted_at' => null,
                    'status' => 'missed'
                ];
            }
        }
        
        // Sort by score desc
        usort($finalResults, function($a, $b) {
            if ($a['status'] === 'missed' && $b['status'] !== 'missed') return 1;
            if ($a['status'] !== 'missed' && $b['status'] === 'missed') return -1;
            
            if ($b['score'] == $a['score']) {
                return strcmp($a['student_name'], $b['student_name']);
            }
            return $b['score'] - $a['score'];
        });

        return response()->json($finalResults);
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
