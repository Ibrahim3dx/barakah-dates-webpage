<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
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
                'description' => 'Naturally dried dates with concentrated sweetness',
                'image_url' => 'https://images.unsplash.com/photo-1603046891741-c2b738a1c3a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
            [
                'name' => 'Date Products',
                'slug' => 'date-products',
                'description' => 'Products made from dates, including pastes and syrups',
                'image_url' => 'https://images.unsplash.com/photo-1603046891741-c2b738a1c3a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->updateOrInsert(
                ['slug' => $category['slug']],
                $category
            );
        }
    }
} 