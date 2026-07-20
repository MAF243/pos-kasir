<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@pos.test'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
            ]
        );
        $admin->assignRole('Admin');

        $cashier = User::firstOrCreate(
            ['email' => 'cashier@pos.test'],
            [
                'name' => 'John Cashier',
                'password' => Hash::make('password'),
            ]
        );
        $cashier->assignRole('Cashier');
    }
}
