<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\QuestionBank;

class QuestionBankController extends Controller
{
    public function index(Request $request)
    {
        $query = QuestionBank::with(['course', 'topic']);

        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }
        if ($request->has('topic_id')) {
            $query->where('topic_id', $request->topic_id);
        }

        return response()->json($query->get());
    }

    public function importJson(Request $request)
    {
        $request->validate([
            'course_id' => 'required|exists:courses,id',
            'topic_id' => 'required|exists:topics,id',
            'questions' => 'required|array',
            'questions.*.question' => 'required|string',
            'questions.*.options' => 'required|array',
            'questions.*.correct_answer' => 'required|string',
            'questions.*.marks' => 'nullable|integer',
            'questions.*.explanation' => 'nullable|string',
        ]);

        $importedCount = 0;

        foreach ($request->questions as $q) {
            QuestionBank::create([
                'course_id' => $request->course_id,
                'topic_id' => $request->topic_id,
                'question_text' => $q['question'],
                'options' => $q['options'],
                'correct_answer' => $q['correct_answer'],
                'marks' => $q['marks'] ?? 1,
                'explanation' => $q['explanation'] ?? null,
            ]);
            $importedCount++;
        }

        return response()->json(['message' => "$importedCount questions imported successfully."]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'topic_id' => 'required|exists:topics,id',
            'question_text' => 'required|string',
            'options' => 'required|array',
            'correct_answer' => 'required|string',
            'marks' => 'nullable|integer',
            'explanation' => 'nullable|string',
        ]);

        $question = QuestionBank::create([
            'course_id' => $validated['course_id'],
            'topic_id' => $validated['topic_id'],
            'question_text' => $validated['question_text'],
            'options' => $validated['options'],
            'correct_answer' => $validated['correct_answer'],
            'marks' => $validated['marks'] ?? 1,
            'explanation' => $validated['explanation'] ?? null,
        ]);

        return response()->json($question, 201);
    }

    public function update(Request $request, $id)
    {
        $question = QuestionBank::findOrFail($id);

        $validated = $request->validate([
            'question_text' => 'sometimes|required|string',
            'options' => 'sometimes|required|array',
            'correct_answer' => 'sometimes|required|string',
            'marks' => 'nullable|integer',
            'explanation' => 'nullable|string',
        ]);

        $question->update($validated);
        return response()->json($question);
    }

    public function destroy($id)
    {
        $question = QuestionBank::findOrFail($id);
        $question->delete();
        return response()->json(null, 204);
    }
}
