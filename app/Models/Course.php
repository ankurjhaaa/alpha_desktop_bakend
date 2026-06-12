<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = ['name', 'description', 'is_active'];

    public function batches()
    {
        return $this->hasMany(Batch::class);
    }
}
