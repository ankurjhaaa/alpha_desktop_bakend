<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Batch extends Model
{
    protected $fillable = ['course_id', 'name', 'fee', 'schedule_time', 'is_active', 'is_hidden'];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class)->where('role', 'student');
    }

    public function mcqPapers()
    {
        return $this->hasMany(McqPaper::class);
    }
}
