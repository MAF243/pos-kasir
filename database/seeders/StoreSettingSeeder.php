<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StoreSetting;

class StoreSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        StoreSetting::firstOrCreate(
            ['id' => 1],
            [
                'name' => 'POS Kasir Modern',
                'address' => 'Jl. Kebon Jeruk Raya No. 27, Jakarta Barat',
                'phone' => '081234567890',
                'receipt_footer' => 'Terima kasih atas kunjungan Anda. Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.',
            ]
        );
    }
}
