<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Batch;
use App\Models\McqPaper;
use App\Models\McqQuestion;
use App\Models\ExamResult;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 1. Create Teacher
        $teacher = User::create([
            'name' => 'Admin Teacher',
            'email' => 'teacher@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'teacher',
            'is_active' => true,
        ]);

        // 2. Create Courses
        $coursesData = [
            ['name' => 'Full Stack Web Development', 'description' => 'Master Laravel, React, and Flutter from scratch.'],
            ['name' => 'Data Science Bootcamp', 'description' => 'Learn Python, Pandas, Machine Learning, and AI.'],
            ['name' => 'Mobile App Mastery', 'description' => 'Build iOS and Android apps using Flutter.'],
        ];

        $courses = [];
        foreach ($coursesData as $data) {
            $courses[] = Course::create($data);
        }

        // 3. Create Batches
        $batchesData = [
            ['course_id' => $courses[0]->id, 'name' => 'Web Morning 2026', 'fee' => 5000, 'schedule_time' => '09:00 AM - 11:00 AM'],
            ['course_id' => $courses[0]->id, 'name' => 'Web Evening 2026', 'fee' => 5000, 'schedule_time' => '06:00 PM - 08:00 PM'],
            ['course_id' => $courses[1]->id, 'name' => 'Data Sci Weekend', 'fee' => 8000, 'schedule_time' => '10:00 AM - 02:00 PM'],
            ['course_id' => $courses[2]->id, 'name' => 'Flutter FastTrack', 'fee' => 6000, 'schedule_time' => '04:00 PM - 06:00 PM'],
        ];

        $batches = [];
        foreach ($batchesData as $data) {
            $batches[] = Batch::create($data);
        }

        // 4. Create Students
        $studentsData = [
            ['name' => 'John Doe', 'email' => 'john@gmail.com', 'father_name' => 'Richard Doe', 'phone' => '1234567890', 'gender' => 'Male'],
            ['name' => 'Jane Smith', 'email' => 'jane@gmail.com', 'father_name' => 'Robert Smith', 'phone' => '0987654321', 'gender' => 'Female'],
            ['name' => 'Alice Johnson', 'email' => 'alice@gmail.com', 'father_name' => 'Michael Johnson', 'phone' => '1122334455', 'gender' => 'Female'],
            ['name' => 'Bob Brown', 'email' => 'bob@gmail.com', 'father_name' => 'David Brown', 'phone' => '5566778899', 'gender' => 'Male'],
            ['name' => 'Charlie Davis', 'email' => 'student@gmail.com', 'father_name' => 'William Davis', 'phone' => '9988776655', 'gender' => 'Male'],
        ];

        $students = [];
        foreach ($studentsData as $index => $data) {
            $students[] = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('password'),
                'role' => 'student',
                'is_active' => true,
                'father_name' => $data['father_name'],
                'phone' => $data['phone'],
                'gender' => $data['gender'],
                'registration_id' => 'REG2026' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'dob' => Carbon::now()->subYears(20 + $index)->format('Y-m-d'),
                'address' => '123 Fake Street, City ' . $index,
                'profile_image' => 'https://ui-avatars.com/api/?name=' . urlencode($data['name']) . '&background=random&format=png',
                'profile_image_file_id' => null,
            ]);
        }

        // 5. Enroll Students in Batches with Pivot Data
        $students[0]->batches()->attach($batches[0]->id, ['amount_paid' => 5000, 'status' => 'paid', 'transaction_id' => 'TXN1001']);
        $students[1]->batches()->attach($batches[0]->id, ['amount_paid' => 2500, 'status' => 'partial', 'transaction_id' => 'TXN1002']);
        $students[2]->batches()->attach($batches[1]->id, ['amount_paid' => 0, 'status' => 'unpaid']);
        $students[3]->batches()->attach($batches[2]->id, ['amount_paid' => 8000, 'status' => 'paid', 'transaction_id' => 'TXN1003']);
        $students[4]->batches()->attach($batches[0]->id, ['amount_paid' => 5000, 'status' => 'paid', 'transaction_id' => 'TXN1004']);
        $students[4]->batches()->attach($batches[3]->id, ['amount_paid' => 3000, 'status' => 'partial', 'transaction_id' => 'TXN1005']);

        // 6. Create MCQ Papers
        $paper1 = McqPaper::create([
            'batch_id' => $batches[0]->id, // Web Morning
            'title' => 'Laravel Basics Exam',
            'description' => 'Test your routing, MVC, and Blade knowledge.',
            'is_active' => true,
            'exam_date' => Carbon::now()->toDateString(),
            'exam_password' => '1234',
            'start_time' => Carbon::now()->addHour(),
            'end_time' => Carbon::now()->addHours(2),
            'invigilators' => 'Admin Teacher',
        ]);

        $paper2 = McqPaper::create([
            'batch_id' => $batches[2]->id, // Data Science
            'title' => 'Python Fundamentals',
            'description' => 'Basic syntax, loops, and Pandas.',
            'is_active' => true,
            'exam_date' => Carbon::now()->addDays(2)->toDateString(),
            'exam_password' => 'python26',
            'start_time' => Carbon::now()->addDays(2)->setTime(10, 0),
            'end_time' => Carbon::now()->addDays(2)->setTime(12, 0),
            'invigilators' => 'Admin Teacher',
        ]);

        // 7. Create MCQ Questions for Paper 1
        $questions1 = [
            ['question_text' => 'What is the command to run migrations in Laravel?', 'option_a' => 'php artisan migrate', 'option_b' => 'php artisan db:migrate', 'option_c' => 'laravel migrate', 'option_d' => 'composer migrate', 'correct_option' => 'a'],
            ['question_text' => 'Which file contains database configuration in Laravel?', 'option_a' => 'config.php', 'option_b' => 'database.php', 'option_c' => '.env', 'option_d' => 'settings.json', 'correct_option' => 'c'],
            ['question_text' => 'Which facade is used to access the authenticated user?', 'option_a' => 'User::auth()', 'option_b' => 'Auth::user()', 'option_c' => 'Login::user()', 'option_d' => 'Session::user()', 'correct_option' => 'b'],
            ['question_text' => 'What is the templating engine used in Laravel?', 'option_a' => 'Twig', 'option_b' => 'Smarty', 'option_c' => 'Blade', 'option_d' => 'Pug', 'correct_option' => 'c'],
        ];

        foreach ($questions1 as $q) {
            McqQuestion::create(array_merge(['mcq_paper_id' => $paper1->id], $q));
        }

        // 8. Create MCQ Questions for Paper 2
        $questions2 = [
            ['question_text' => 'Which keyword is used to define a function in Python?', 'option_a' => 'func', 'option_b' => 'define', 'option_c' => 'def', 'option_d' => 'function', 'correct_option' => 'c'],
            ['question_text' => 'What is the output of print(2 ** 3)?', 'option_a' => '5', 'option_b' => '6', 'option_c' => '8', 'option_d' => '9', 'correct_option' => 'c'],
        ];

        foreach ($questions2 as $q) {
            McqQuestion::create(array_merge(['mcq_paper_id' => $paper2->id], $q));
        }

        // 9. Create Exam Results
        // John Doe takes Laravel Exam
        ExamResult::create([
            'user_id' => $students[0]->id,
            'mcq_paper_id' => $paper1->id,
            'score' => 3,
            'total_questions' => 4,
            'percentage' => 75.0,
        ]);

        // Charlie Davis takes Laravel Exam
        ExamResult::create([
            'user_id' => $students[4]->id,
            'mcq_paper_id' => $paper1->id,
            'score' => 4,
            'total_questions' => 4,
            'percentage' => 100.0,
        ]);
        
        // Bob Brown takes Python Exam
        ExamResult::create([
            'user_id' => $students[3]->id,
            'mcq_paper_id' => $paper2->id,
            'score' => 1,
            'total_questions' => 2,
            'percentage' => 50.0,
        ]);

        // 10. Seed Global Settings
        $settings = [
            'company_name' => 'ALPHA GRAPHICS',
            'company_email' => 'contact@alphagraphics.com',
            'company_phone' => '+91 9876543210',
            'company_address' => '123 Main Street, Purnea',
            'logo_url' => 'https://ui-avatars.com/api/?name=AG&background=random&color=fff&format=png',
            'signature_url' => 'https://ui-avatars.com/api/?name=Sign&background=fff&color=000&format=png',
        ];

        foreach ($settings as $key => $value) {
            \App\Models\Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        $this->call([
            MaterialSeeder::class,
        ]);
    }
}

