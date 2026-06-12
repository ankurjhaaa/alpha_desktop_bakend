<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamResult extends Model
{
    protected $fillable = ['user_id', 'mcq_paper_id', 'score', 'total_questions', 'percentage', 'student_answers'];

    protected $casts = [
        'student_answers' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function mcqPaper()
    {
        return $this->belongsTo(McqPaper::class);
    }
}
