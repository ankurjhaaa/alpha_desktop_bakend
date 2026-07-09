<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class McqPaper extends Model
{
    protected $fillable = ['batch_id', 'topic_id', 'title', 'description', 'is_active', 'exam_date', 'exam_password', 'start_time', 'end_time', 'invigilators', 'selected_student_ids'];

    protected $casts = [
        'selected_student_ids' => 'array',
    ];

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }

    public function questions()
    {
        return $this->hasMany(McqQuestion::class);
    }

    public function results()
    {
        return $this->hasMany(ExamResult::class);
    }
}
