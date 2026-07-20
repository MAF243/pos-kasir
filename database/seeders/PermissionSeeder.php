<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            'view_dashboard',
            'manage_products',
            'manage_categories',
            'manage_suppliers',
            'manage_customers',
            'manage_stock',
            'open_shift',
            'close_shift',
            'process_transaction',
            'view_transactions',
            'void_transaction',
            'manage_purchases',
            'manage_returns',
            'manage_expenses',
            'view_reports',
            'manage_users',
            'manage_roles',
            'manage_settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }
    }
}
