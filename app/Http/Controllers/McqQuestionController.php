<?php

namespace App\Http\Controllers;

use App\Models\McqQuestion;
use Illuminate\Http\Request;

class McqQuestionController extends Controller
{
    public function index(Request $request)
    {
        $query = McqQuestion::with('paper');
        if ($request->has('mcq_paper_id')) {
            $query->where('mcq_paper_id', $request->mcq_paper_id);
        }
        
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('question_text', 'like', "%$search%");
        }
        
        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'mcq_paper_id' => 'required|exists:mcq_papers,id',
            'question_text' => 'required|string',
            'option_a' => 'required|string',
            'option_b' => 'required|string',
            'option_c' => 'required|string',
            'option_d' => 'required|string',
            'correct_option' => 'required|in:a,b,c,d,A,B,C,D',
            'is_active' => 'boolean',
        ]);

        if (\App\Models\ExamResult::where('mcq_paper_id', $validated['mcq_paper_id'])->exists()) {
            return response()->json(['message' => 'Cannot add question because one or more students have already submitted this exam.'], 403);
        }

        $question = McqQuestion::create($validated);
        return response()->json($question, 201);
    }

    public function update(Request $request, $id)
    {
        $question = McqQuestion::findOrFail($id);

        if (\App\Models\ExamResult::where('mcq_paper_id', $question->mcq_paper_id)->exists()) {
            return response()->json(['message' => 'Cannot edit this question because one or more students have already submitted this exam.'], 403);
        }

        $validated = $request->validate([
            'mcq_paper_id' => 'sometimes|required|exists:mcq_papers,id',
            'question_text' => 'sometimes|required|string',
            'option_a' => 'sometimes|required|string',
            'option_b' => 'sometimes|required|string',
            'option_c' => 'sometimes|required|string',
            'option_d' => 'sometimes|required|string',
            'correct_option' => 'sometimes|required|in:a,b,c,d,A,B,C,D',
            'is_active' => 'boolean',
        ]);

        $question->update($validated);
        return response()->json($question);
    }

    public function destroy($id)
    {
        $question = McqQuestion::findOrFail($id);

        if (\App\Models\ExamResult::where('mcq_paper_id', $question->mcq_paper_id)->exists()) {
            return response()->json(['message' => 'Cannot delete this question because one or more students have already submitted this exam.'], 403);
        }

        $question->delete();
        return response()->json(null, 204);
    }

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'questions' => 'required|array',
            'questions.*.mcq_paper_id' => 'required|exists:mcq_papers,id',
            'questions.*.question_text' => 'required|string',
            'questions.*.option_a' => 'required|string',
            'questions.*.option_b' => 'required|string',
            'questions.*.option_c' => 'required|string',
            'questions.*.option_d' => 'required|string',
            'questions.*.correct_option' => 'required|in:a,b,c,d,A,B,C,D',
            'questions.*.is_active' => 'boolean',
        ]);

        // Assuming all questions in a bulk request belong to the same paper, we just check the first one
        if (count($validated['questions']) > 0) {
            $paperId = $validated['questions'][0]['mcq_paper_id'];
            if (\App\Models\ExamResult::where('mcq_paper_id', $paperId)->exists()) {
                return response()->json(['message' => 'Cannot add questions because one or more students have already submitted this exam.'], 403);
            }
        }

        $inserted = [];
        foreach ($validated['questions'] as $qData) {
            if(!isset($qData['is_active'])) $qData['is_active'] = true;
            $qData['correct_option'] = strtolower($qData['correct_option']);
            $inserted[] = McqQuestion::create($qData);
        }

        return response()->json(['message' => 'Questions imported successfully', 'count' => count($inserted)], 201);
    }
}

