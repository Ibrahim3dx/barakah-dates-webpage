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
            'guard_name' => 'super-admin'
        ]);

        $admin = Role::create([
            'name' => 'Admin',
            'guard_name' => 'admin'
        ]);

        // Create permissions
        $permissions = [
            // Dashboard permissions
            ['name' => 'View Dashboard', 'guard_name' => 'view-dashboard'],
            ['name' => 'View Reports', 'guard_name' => 'view-reports'],

            // Product permissions
            ['name' => 'View Products', 'guard_name' => 'view-products'],
            ['name' => 'Create Products', 'guard_name' => 'create-products'],
            ['name' => 'Edit Products', 'guard_name' => 'edit-products'],
            ['name' => 'Delete Products', 'guard_name' => 'delete-products'],

            // Order permissions
            ['name' => 'View Orders', 'guard_name' => 'view-orders'],
            ['name' => 'Manage Orders', 'guard_name' => 'manage-orders'],

            // User permissions
            ['name' => 'View Users', 'guard_name' => 'view-users'],
            ['name' => 'Create Users', 'guard_name' => 'create-users'],
            ['name' => 'Edit Users', 'guard_name' => 'edit-users'],
            ['name' => 'Delete Users', 'guard_name' => 'delete-users'],

            // Integration permissions
            ['name' => 'Manage Integrations', 'guard_name' => 'manage-integrations'],

            // Settings permissions
            ['name' => 'Manage Settings', 'guard_name' => 'manage-settings'],

            // Action Log permissions
            ['name' => 'View Action Logs', 'guard_name' => 'view-action-logs'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        // Assign all permissions to super admin
        $superAdmin->permissions()->attach(Permission::all());

        // Assign limited permissions to admin
        $adminPermissions = Permission::whereIn('guard_name', [
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
