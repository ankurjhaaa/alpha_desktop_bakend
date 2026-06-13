<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Material extends Model
{
    protected $fillable = [
        'batch_id', 'title', 'description', 'file_url', 'file_id'
    ];

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }
}
