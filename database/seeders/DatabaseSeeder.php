<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Course;
use App\Models\Batch;
use App\Models\Setting;
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
        User::create([
            'name' => 'Admin Teacher',
            'email' => 'Razah5367@gmail.com',
            'password' => Hash::make('Alpha@Patna'),
            'role' => 'teacher',
            'is_active' => true,
        ]);

        // 2. Create 4 Courses with Topics
        /*
        $coursesData = [
            [
                'name' => 'DCA',
                'description' => 'Diploma in Computer Applications - Basic computing and MS Office training.',
                'topics' => ['Computer Fundamentals', 'Operating System (Windows)', 'MS Word', 'MS Excel', 'MS PowerPoint', 'Internet & Email'],
                'batches' => [
                    ['name' => 'DCA 7AM', 'schedule' => '07:00 AM - 08:00 AM'],
                    ['name' => 'DCA 8AM', 'schedule' => '08:00 AM - 09:00 AM'],
                ]
            ],
            [
                'name' => 'ADCA',
                'description' => 'Advanced Diploma in Computer Applications - Comprehensive computing, design, and accounting.',
                'topics' => ['Computer Fundamentals', 'Operating System', 'MS Office Suite', 'Tally Prime with GST', 'HTML, CSS & JS', 'Photoshop & CorelDraw'],
                'batches' => [
                    ['name' => 'ADCA 9AM', 'schedule' => '09:00 AM - 10:00 AM'],
                    ['name' => 'ADCA 10AM', 'schedule' => '10:00 AM - 11:00 AM'],
                ]
            ],
            [
                'name' => 'TALLY',
                'description' => 'Professional Financial Accounting & GST using Tally Prime.',
                'topics' => ['Accounting Principles', 'Tally Prime Interface', 'Voucher Entry', 'GST & Taxation', 'Payroll Management', 'Backup & Restore'],
                'batches' => [
                    ['name' => 'TALLY 11AM', 'schedule' => '11:00 AM - 12:00 PM'],
                    ['name' => 'TALLY 12PM', 'schedule' => '12:00 PM - 01:00 PM'],
                ]
            ],
            [
                'name' => 'DTP',
                'description' => 'Desktop Publishing - Graphic design, layouts, and print production.',
                'topics' => ['DTP Concepts', 'PageMaker', 'CorelDraw', 'Photoshop', 'Typography & Layout', 'Printing Technologies'],
                'batches' => [
                    ['name' => 'DTP 1PM', 'schedule' => '01:00 PM - 02:00 PM'],
                    ['name' => 'DTP 2PM', 'schedule' => '02:00 PM - 03:00 PM'],
                ]
            ],
        ];

        // 3. Create Courses, Topics and Batches, and 2 Students for each Batch
        $studentIndex = 1;
        foreach ($coursesData as $courseData) {
            $course = Course::create([
                'name' => $courseData['name'],
                'description' => $courseData['description'],
                'is_active' => true,
            ]);

            // Add Topics
            foreach ($courseData['topics'] as $topicTitle) {
                $course->topics()->create(['title' => $topicTitle]);
            }

            // Add Batches
            foreach ($courseData['batches'] as $batchInfo) {
                $batch = Batch::create([
                    'course_id' => $course->id,
                    'name' => $batchInfo['name'],
                    'schedule_time' => $batchInfo['schedule'],
                    'start_date' => Carbon::now()->format('Y-m-d'),
                    'end_date' => Carbon::now()->addMonths(6)->format('Y-m-d'),
                    'is_active' => true,
                    'is_hidden' => false,
                ]);

                // Create 2 students for this batch
                for ($i = 0; $i < 2; $i++) {
                    $studentName = 'Student ' . $studentIndex;
                    $studentEmail = 'std' . $studentIndex . '@gmail.com';
                    
                    $student = User::create([
                        'name' => $studentName,
                        'email' => $studentEmail,
                        'password' => Hash::make('password'),
                        'role' => 'student',
                        'is_active' => true,
                        'father_name' => 'Father of ' . $studentName,
                        'phone' => '98765432' . str_pad($studentIndex, 2, '0', STR_PAD_LEFT),
                        'gender' => ($studentIndex % 2 == 0) ? 'Female' : 'Male',
                        'registration_id' => 'REG2026' . str_pad($studentIndex, 3, '0', STR_PAD_LEFT),
                        'dob' => Carbon::now()->subYears(20)->format('Y-m-d'),
                        'address' => 'Purnea, Bihar, India',
                        'profile_image' => 'https://ui-avatars.com/api/?name=' . urlencode($studentName) . '&background=random&format=png',
                        'profile_image_file_id' => null,
                    ]);

                    // Enroll in the batch
                    $student->batches()->attach($batch->id);

                    $studentIndex++;
                }
            }
        }

        // 4. Seed Global Settings
        $settings = [
            'company_name' => 'ALPHA GRAPHICS',
            'company_email' => 'contact@alphagraphics.com',
            'company_phone' => '+91 9876543210',
            'company_address' => '123 Main Street, Purnea',
            'logo_url' => 'https://ui-avatars.com/api/?name=AG&background=random&color=fff&format=png',
            'signature_url' => 'https://ui-avatars.com/api/?name=Sign&background=fff&color=000&format=png',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }

        // 5. Seed Materials
        $this->call([
            MaterialSeeder::class,
        ]);
        */
    }
}
