<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@albarakadates.com',
            'password' => Hash::make('12345678'),
        ]);

        $superAdminRole = Role::where('slug', 'super-admin')->first();
        $superAdmin->roles()->attach($superAdminRole);
    }
}
