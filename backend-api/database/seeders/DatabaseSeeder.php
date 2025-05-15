<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use App\Models\Product;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
        ]);

        // Create permissions
        $permissions = [
            'view-dashboard',
            'view-products',
            'create-products',
            'edit-products',
            'delete-products',
            'view-orders',
            'manage-orders',
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',
            'manage-settings',
            'manage-integrations'
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create roles
        $adminRole = Role::create(['name' => 'admin']);
        $managerRole = Role::create(['name' => 'manager']);
        $staffRole = Role::create(['name' => 'staff']);

        // Assign all permissions to admin
        $adminRole->givePermissionTo($permissions);

        // Assign limited permissions to manager
        $managerRole->givePermissionTo([
            'view-dashboard',
            'view-products',
            'create-products',
            'edit-products',
            'view-orders',
            'manage-orders',
            'view-users'
        ]);

        // Assign basic permissions to staff
        $staffRole->givePermissionTo([
            'view-dashboard',
            'view-products',
            'view-orders',
            'manage-orders'
        ]);

        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123')
        ]);
        $admin->assignRole($adminRole);

        // Create test products
        $products = [
            [
                'name' => 'Product 1',
                'description' => 'Test product 1 description',
                'price' => 100.00,
                'wholesale_price' => 80.00,
                'wholesale_threshold' => 5,
                'stock' => 100,
                'is_active' => true
            ],
            [
                'name' => 'Product 2',
                'description' => 'Test product 2 description',
                'price' => 150.00,
                'wholesale_price' => 120.00,
                'wholesale_threshold' => 3,
                'stock' => 50,
                'is_active' => true
            ],
            [
                'name' => 'Product 3',
                'description' => 'Test product 3 description',
                'price' => 200.00,
                'wholesale_price' => 160.00,
                'wholesale_threshold' => 4,
                'stock' => 75,
                'is_active' => true
            ]
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}
