<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Teacher Name',
            'email' => 'teacher@gmail.com',
            'password' => bcrypt('password'),
            'role' => 'teacher',
        ]);

        $course = \App\Models\Course::create([
            'name' => 'Full Stack Web Development',
            'description' => 'Learn Laravel and Flutter from scratch to advanced level.',
        ]);

        $batch = \App\Models\Batch::create([
            'course_id' => $course->id,
            'name' => 'Morning Batch 2026',
            'fee' => 5000,
            'schedule_time' => '10:00 AM - 12:00 PM',
        ]);

        User::factory()->create([
            'name' => 'Student Name',
            'email' => 'student@gmail.com',
            'password' => bcrypt('password'),
            'role' => 'student',
            'batch_id' => $batch->id,
        ]);

        $paper = \App\Models\McqPaper::create([
            'batch_id' => $batch->id,
            'title' => 'Laravel Basics Quiz',
            'description' => 'Test your knowledge on Laravel basics like routing and controllers.',
        ]);

        \App\Models\McqQuestion::create([
            'mcq_paper_id' => $paper->id,
            'question_text' => 'What command is used to create a controller in Laravel?',
            'option_a' => 'php artisan make:controller',
            'option_b' => 'php artisan create:controller',
            'option_c' => 'php create controller',
            'option_d' => 'laravel new controller',
            'correct_option' => 'a',
        ]);

        \App\Models\McqQuestion::create([
            'mcq_paper_id' => $paper->id,
            'question_text' => 'Which database is the default in Laravel 11+?',
            'option_a' => 'MySQL',
            'option_b' => 'PostgreSQL',
            'option_c' => 'SQLite',
            'option_d' => 'MongoDB',
            'correct_option' => 'c',
        ]);
    }
}
