<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $cashierRole = Role::firstOrCreate(['name' => 'Cashier']);

        // Admin gets all permissions
        $adminRole->syncPermissions(Permission::all());

        // Cashier gets operational permissions
        $cashierRole->syncPermissions([
            'view_dashboard',
            'open_shift',
            'close_shift',
            'process_transaction',
            'view_transactions',
        ]);
    }
}
