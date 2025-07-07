<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class SpatiePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // Dashboard permissions
            'view-dashboard',
            'view-reports',

            // Product permissions
            'view-products',
            'create-products',
            'edit-products',
            'delete-products',

            // Order permissions
            'view-orders',
            'manage-orders',

            // User permissions
            'view-users',
            'create-users',
            'edit-users',
            'delete-users',

            // Integration permissions
            'manage-integrations',

            // Settings permissions
            'manage-settings',

            // Action Log permissions
            'view-action-logs',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'sanctum']);
        }

        // Create roles and assign permissions
        $superAdmin = Role::create(['name' => 'Super Admin', 'guard_name' => 'sanctum']);
        $superAdmin->givePermissionTo(Permission::all());

        $admin = Role::create(['name' => 'Admin', 'guard_name' => 'sanctum']);
        $admin->givePermissionTo([
            'view-dashboard',
            'view-reports',
            'view-products',
            'create-products',
            'edit-products',
            'view-orders',
            'manage-orders',
            'view-users',
            'view-action-logs'
        ]);

        $manager = Role::create(['name' => 'Manager', 'guard_name' => 'sanctum']);
        $manager->givePermissionTo([
            'view-dashboard',
            'view-reports',
            'view-products',
            'view-orders',
        ]);

        $user = Role::create(['name' => 'User', 'guard_name' => 'sanctum']);
    }
}
