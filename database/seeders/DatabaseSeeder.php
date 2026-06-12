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

        User::factory()->create([
            'name' => 'Student Name',
            'email' => 'student@gmail.com',
            'password' => bcrypt('password'),
            'role' => 'student',
        ]);
    }
}
