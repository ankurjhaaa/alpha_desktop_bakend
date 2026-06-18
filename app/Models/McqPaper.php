<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class McqPaper extends Model
{
    protected $fillable = ['batch_id', 'title', 'description', 'is_active', 'exam_date', 'exam_password', 'start_time', 'end_time', 'invigilators', 'selected_student_ids'];

    protected $casts = [
        'selected_student_ids' => 'array',
    ];

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function questions()
    {
        return $this->hasMany(McqQuestion::class);
    }
}
