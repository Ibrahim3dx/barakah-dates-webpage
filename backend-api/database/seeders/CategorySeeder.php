<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Fresh Dates',
                'slug' => 'fresh-dates',
                'description' => 'Fresh and delicious dates harvested at peak ripeness',
                'image_url' => 'https://images.unsplash.com/photo-1603046891741-c2b738a1c3a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
            [
                'name' => 'Dried Dates',
                'slug' => 'dried-dates',
                'description' => 'Premium quality dried dates with natural sweetness',
                'image_url' => 'https://images.unsplash.com/photo-1603046891741-c2b738a1c3a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
            [
                'name' => 'Date Products',
                'slug' => 'date-products',
                'description' => 'Various products made from dates',
                'image_url' => 'https://images.unsplash.com/photo-1603046891741-c2b738a1c3a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->insert([
                ...$category,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
} 