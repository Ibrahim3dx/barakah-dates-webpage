<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Support\Str;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $superAdmin = Role::create([
            'name' => 'Super Admin',
            'slug' => 'super-admin',
            'description' => 'Super Administrator with full access'
        ]);

        $admin = Role::create([
            'name' => 'Admin',
            'slug' => 'admin',
            'description' => 'Administrator with limited access'
        ]);

        // Create permissions
        $permissions = [
            // Dashboard permissions
            ['name' => 'View Dashboard', 'slug' => 'view-dashboard'],
            ['name' => 'View Reports', 'slug' => 'view-reports'],
            
            // Product permissions
            ['name' => 'View Products', 'slug' => 'view-products'],
            ['name' => 'Create Products', 'slug' => 'create-products'],
            ['name' => 'Edit Products', 'slug' => 'edit-products'],
            ['name' => 'Delete Products', 'slug' => 'delete-products'],
            
            // Order permissions
            ['name' => 'View Orders', 'slug' => 'view-orders'],
            ['name' => 'Manage Orders', 'slug' => 'manage-orders'],
            
            // User permissions
            ['name' => 'View Users', 'slug' => 'view-users'],
            ['name' => 'Create Users', 'slug' => 'create-users'],
            ['name' => 'Edit Users', 'slug' => 'edit-users'],
            ['name' => 'Delete Users', 'slug' => 'delete-users'],
            
            // Integration permissions
            ['name' => 'Manage Integrations', 'slug' => 'manage-integrations'],
            
            // Settings permissions
            ['name' => 'Manage Settings', 'slug' => 'manage-settings'],
            
            // Action Log permissions
            ['name' => 'View Action Logs', 'slug' => 'view-action-logs'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        // Assign all permissions to super admin
        $superAdmin->permissions()->attach(Permission::all());

        // Assign limited permissions to admin
        $adminPermissions = Permission::whereIn('slug', [
            'view-dashboard',
            'view-reports',
            'view-products',
            'create-products',
            'edit-products',
            'view-orders',
            'manage-orders',
            'view-users',
            'view-action-logs'
        ])->get();

        $admin->permissions()->attach($adminPermissions);
    }
}
