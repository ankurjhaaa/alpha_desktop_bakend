<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class McqPaper extends Model
{
    protected $fillable = ['batch_id', 'title', 'description', 'is_active'];

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function questions()
    {
        return $this->hasMany(McqQuestion::class);
    }
}
