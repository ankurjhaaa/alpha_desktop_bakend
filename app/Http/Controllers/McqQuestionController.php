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
            'correct_option' => 'required|in:a,b,c,d',
            'is_active' => 'boolean',
        ]);

        $question = McqQuestion::create($validated);
        return response()->json($question, 201);
    }

    public function update(Request $request, $id)
    {
        $question = McqQuestion::findOrFail($id);

        $validated = $request->validate([
            'mcq_paper_id' => 'sometimes|required|exists:mcq_papers,id',
            'question_text' => 'sometimes|required|string',
            'option_a' => 'sometimes|required|string',
            'option_b' => 'sometimes|required|string',
            'option_c' => 'sometimes|required|string',
            'option_d' => 'sometimes|required|string',
            'correct_option' => 'sometimes|required|in:a,b,c,d',
            'is_active' => 'boolean',
        ]);

        $question->update($validated);
        return response()->json($question);
    }

    public function destroy($id)
    {
        $question = McqQuestion::findOrFail($id);
        $question->delete();
        return response()->json(null, 204);
    }
}
