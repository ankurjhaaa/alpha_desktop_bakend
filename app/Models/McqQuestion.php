<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class McqQuestion extends Model
{
    protected $fillable = [
        'mcq_paper_id', 'question_text', 
        'option_a', 'option_b', 'option_c', 'option_d', 
        'correct_option', 'is_active'
    ];

    public function paper()
    {
        return $this->belongsTo(McqPaper::class, 'mcq_paper_id');
    }
}
