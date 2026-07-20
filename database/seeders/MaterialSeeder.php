<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MaterialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        /*
        // Check if there are any batches available
        $batches = \App\Models\Batch::all();

        if ($batches->isEmpty()) {
            return;
        }

        foreach ($batches as $batch) {
            \App\Models\Material::create([
                'batch_id' => $batch->id,
                'title' => 'Sample Physics Notes - ' . $batch->name,
                'description' => 'These are some sample notes provided for this batch.',
                'file_url' => 'https://ik.imagekit.io/demo/img/tr:di-default-image.jpg/default-image.jpg', // Dummy ImageKit URL
                'file_id' => null, // No file_id since it's dummy
            ]);

            \App\Models\Material::create([
                'batch_id' => $batch->id,
                'title' => 'Important Mathematics Formulas - ' . $batch->name,
                'description' => 'A handy list of important formulas.',
                'file_url' => 'https://ik.imagekit.io/demo/img/tr:di-default-image.jpg/default-image.jpg', // Dummy ImageKit URL
                'file_id' => null,
            ]);
        }
        */
    }
}
