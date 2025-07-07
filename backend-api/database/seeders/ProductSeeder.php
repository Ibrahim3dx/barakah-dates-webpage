<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $products = [
            [
                'category_id' => 1, // Fresh Dates
                'name' => 'Medjool Dates',
                'slug' => 'medjool-dates',
                'description' => 'Premium Medjool dates, known for their large size and rich, caramel-like taste.',
                'retail_price' => 24.99,
                'stock' => 100,
                'image_url' => 'https://images.unsplash.com/photo-1603046891741-c2b738a1c3a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
                'attributes' => json_encode([
                    'weight' => '500g',
                    'origin' => 'Saudi Arabia',
                    'harvest_date' => '2024-03-01',
                ]),
            ],
            [
                'category_id' => 1,
                'name' => 'Ajwa Dates',
                'slug' => 'ajwa-dates',
                'description' => 'Premium Ajwa dates from Madinah, known for their soft texture and unique taste.',
                'retail_price' => 29.99,
                'stock' => 75,
                'image_url' => 'https://images.unsplash.com/photo-1603046891741-c2b738a1c3a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
                'attributes' => json_encode([
                    'weight' => '500g',
                    'origin' => 'Madinah, Saudi Arabia',
                    'harvest_date' => '2024-03-01',
                ]),
            ],
            [
                'category_id' => 2, // Dried Dates
                'name' => 'Dried Khudri Dates',
                'slug' => 'dried-khudri-dates',
                'description' => 'Traditional Khudri dates, dried to perfection while maintaining their natural sweetness.',
                'retail_price' => 19.99,
                'stock' => 150,
                'image_url' => 'https://images.unsplash.com/photo-1603046891741-c2b738a1c3a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
                'attributes' => json_encode([
                    'weight' => '1kg',
                    'origin' => 'Saudi Arabia',
                    'shelf_life' => '12 months',
                ]),
            ],
            [
                'category_id' => 2,
                'name' => 'Dried Sukkari Dates',
                'slug' => 'dried-sukkari-dates',
                'description' => 'Premium Sukkari dates, known for their golden color and sweet taste.',
                'retail_price' => 22.99,
                'stock' => 120,
                'image_url' => 'https://images.unsplash.com/photo-1603046891741-c2b738a1c3a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
                'attributes' => json_encode([
                    'weight' => '1kg',
                    'origin' => 'Saudi Arabia',
                    'shelf_life' => '12 months',
                ]),
            ],
            [
                'category_id' => 3, // Date Products
                'name' => 'Date Syrup',
                'slug' => 'date-syrup',
                'description' => 'Natural date syrup made from premium dates, perfect for sweetening drinks and desserts.',
                'retail_price' => 14.99,
                'stock' => 80,
                'image_url' => 'https://images.unsplash.com/photo-1603046891741-c2b738a1c3a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
                'attributes' => json_encode([
                    'volume' => '500ml',
                    'ingredients' => '100% dates',
                    'shelf_life' => '24 months',
                ]),
            ],
            [
                'category_id' => 3,
                'name' => 'Date Paste',
                'slug' => 'date-paste',
                'description' => 'Smooth date paste made from premium dates, perfect for baking and cooking.',
                'retail_price' => 12.99,
                'stock' => 90,
                'image_url' => 'https://images.unsplash.com/photo-1603046891741-c2b738a1c3a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                'is_active' => true,
                'attributes' => json_encode([
                    'weight' => '500g',
                    'ingredients' => '100% dates',
                    'shelf_life' => '12 months',
                ]),
            ],
        ];

        foreach ($products as $product) {
            DB::table('products')->updateOrInsert(
                ['slug' => $product['slug']],
                [
                    ...$product,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
} 