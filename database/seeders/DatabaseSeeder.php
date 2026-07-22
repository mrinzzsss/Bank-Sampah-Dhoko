<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\Sampah;
use App\Models\SampahCategory;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with realistic initial data.
     */
    public function run(): void
    {
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $nasabahRole = Role::firstOrCreate(['name' => 'nasabah', 'guard_name' => 'web']);

        // 1. Super Admin Account
        $superAdmin = User::factory()->create([
            'name' => 'Super Admin KKN',
            'email' => 'super_admin@example.com',
            'role' => 'super_admin',
            'password' => Hash::make('password'),
            'phone_number' => '081100001111',
            'address' => 'Posko Utama KKN Aktivis Doko',
        ]);
        $superAdmin->assignRole($superAdminRole);

        // 2. Admin (Pengepul / Petugas POS Bank Sampah) Accounts
        $admin1 = User::factory()->create([
            'name' => 'Petugas POS Doko (Pengepul Utama)',
            'email' => 'admin@example.com',
            'role' => 'admin',
            'password' => Hash::make('password'),
            'phone_number' => '081234567890',
            'address' => 'Pos Penimbangan Dusun Doko RT 01 / RW 02',
        ]);
        $admin1->assignRole($adminRole);

        $admin2 = User::factory()->create([
            'name' => 'Petugas POS Sukomulyo',
            'email' => 'admin2@example.com',
            'role' => 'admin',
            'password' => Hash::make('password'),
            'phone_number' => '081987654321',
            'address' => 'Pos Penimbangan Dusun Sukomulyo RT 03 / RW 01',
        ]);
        $admin2->assignRole($adminRole);

        // 3. Nasabah (Warga Desa) Accounts with realistic Indonesian names & phone numbers
        $nasabahsData = [
            [
                'name' => 'Nasabah User (Demo)',
                'email' => 'test@example.com',
                'phone' => '081200000000',
                'address' => 'Dusun Doko RT 01 / RW 02, Desa Doko',
            ],
            [
                'name' => 'Budi Santoso',
                'email' => 'budi@example.com',
                'phone' => '081298765432',
                'address' => 'Dusun Doko RT 01 / RW 02, Desa Doko',
            ],
            [
                'name' => 'Siti Aminah',
                'email' => 'siti@example.com',
                'phone' => '085712345678',
                'address' => 'Dusun Doko RT 03 / RW 02, Desa Doko',
            ],
            [
                'name' => 'Eko Prasetyo',
                'email' => 'eko@example.com',
                'phone' => '081388776655',
                'address' => 'Dusun Sukomulyo RT 02 / RW 01, Desa Doko',
            ],
            [
                'name' => 'Dewi Lestari',
                'email' => 'dewi@example.com',
                'phone' => '081544332211',
                'address' => 'Dusun Sukomulyo RT 04 / RW 03, Desa Doko',
            ],
            [
                'name' => 'Rahmat Hidayat',
                'email' => 'rahmat@example.com',
                'phone' => '087811223344',
                'address' => 'Dusun Krajan RT 01 / RW 03, Desa Doko',
            ],
            [
                'name' => 'Tri Wahyuni',
                'email' => 'tri@example.com',
                'phone' => '082199887766',
                'address' => 'Dusun Krajan RT 02 / RW 04, Desa Doko',
            ],
            [
                'name' => 'Ahmad Dahlan',
                'email' => 'ahmad@example.com',
                'phone' => '085677889900',
                'address' => 'Dusun Krajan RT 05 / RW 04, Desa Doko',
            ],
        ];

        $nasabahs = [];
        foreach ($nasabahsData as $nd) {
            $user = User::factory()->create([
                'name' => $nd['name'],
                'email' => $nd['email'],
                'role' => 'nasabah',
                'password' => Hash::make('password'),
                'address' => $nd['address'],
                'phone_number' => $nd['phone'],
            ]);
            $user->assignRole($nasabahRole);
            $nasabahs[] = $user;
        }

        // 4. Sampah Categories
        $categories = [
            'Plastik' => 'Kategori limbah plastik bersih seperti botol, gelas, dan wadah plastik.',
            'Kertas' => 'Kategori koran, kardus bekas, majalah, HVS, dan kertas bekas.',
            'Logam' => 'Kategori besi tua, aluminium kaleng, tembaga, dan kuningan.',
            'Kaca' => 'Kategori botol kaca, sirup, kecap, dan botol selai bersih.',
        ];

        $categoryModels = [];
        foreach ($categories as $name => $desc) {
            $categoryModels[$name] = SampahCategory::create([
                'name' => $name,
                'description' => $desc,
            ]);
        }

        // 5. Sampah Items (Default reference prices)
        $sampahItems = [
            [
                'category' => 'Plastik',
                'name' => 'Botol Plastik PET Bersih',
                'price' => 3000,
            ],
            [
                'category' => 'Plastik',
                'name' => 'Gelas Plastik Bersih',
                'price' => 2500,
            ],
            [
                'category' => 'Plastik',
                'name' => 'Plastik Campur / Bodong',
                'price' => 1500,
            ],
            [
                'category' => 'Kertas',
                'name' => 'Kardus Bekas Cokelat',
                'price' => 2000,
            ],
            [
                'category' => 'Kertas',
                'name' => 'Koran / HVS Bekas',
                'price' => 2500,
            ],
            [
                'category' => 'Logam',
                'name' => 'Kaleng Aluminium Minuman',
                'price' => 10000,
            ],
            [
                'category' => 'Logam',
                'name' => 'Besi Tua / Scrap',
                'price' => 4500,
            ],
            [
                'category' => 'Kaca',
                'name' => 'Botol Kaca Kecap / Sirup',
                'price' => 1200,
            ],
        ];

        $sampahModels = [];
        foreach ($sampahItems as $item) {
            $sampahModels[] = Sampah::create([
                'category_id' => $categoryModels[$item['category']]->id,
                'name' => $item['name'],
                'price_per_kg' => $item['price'],
            ]);
        }

        // 6. Seed Realistic Historical Transactions Recorded by Admins for Nasabahs
        $admins = [$admin1, $admin2];
        $startDate = Carbon::now()->subDays(30);
        $endDate = Carbon::now();

        while ($startDate->lessThanOrEqualTo($endDate)) {
            // Random 1-3 transactions per day
            $dailyTx = rand(1, 3);
            for ($i = 0; $i < $dailyTx; $i++) {
                $targetAdmin = $admins[array_rand($admins)];
                $targetNasabah = $nasabahs[array_rand($nasabahs)];
                $targetSampah = $sampahModels[array_rand($sampahModels)];

                $weight = round(rand(2, 25) + (rand(0, 9) / 10), 1); // 2.0 to 25.9 kg
                $customPricePerKg = $targetSampah->price_per_kg + rand(-200, 300); // Admin custom pricing variation
                if ($customPricePerKg <= 0) {
                    $customPricePerKg = $targetSampah->price_per_kg;
                }

                $income = (int) round($weight * $customPricePerKg);
                $txDate = $startDate->copy()->addHours(rand(8, 16))->addMinutes(rand(0, 59));

                Transaction::create([
                    'user_id' => $targetNasabah->id,
                    'admin_id' => $targetAdmin->id,
                    'sampah_id' => $targetSampah->id,
                    'total_weight' => $weight,
                    'total_income' => $income,
                    'point_received' => 0,
                    'created_at' => $txDate,
                    'updated_at' => $txDate,
                ]);
            }

            $startDate->addDay();
        }

        // 7. Seed Audit Logs
        $auditLogs = [
            [
                'user_id' => $superAdmin->id,
                'action' => 'login',
                'desc' => 'Super Admin masuk ke portal sistem.',
                'date' => Carbon::now()->subDays(10),
            ],
            [
                'user_id' => $admin1->id,
                'action' => 'create_transaction',
                'desc' => 'Admin POS Doko mencatat setoran sampah untuk Budi Santoso (12.5 kg Kardus Bekas Cokelat).',
                'date' => Carbon::now()->subDays(5),
            ],
            [
                'user_id' => $admin2->id,
                'action' => 'create_transaction',
                'desc' => 'Admin POS Sukomulyo mencatat setoran sampah untuk Siti Aminah (8.0 kg Botol Plastik PET Bersih).',
                'date' => Carbon::now()->subDays(3),
            ],
        ];

        foreach ($auditLogs as $log) {
            AuditLog::create([
                'user_id' => $log['user_id'],
                'action' => $log['action'],
                'description' => $log['desc'],
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'created_at' => $log['date'],
                'updated_at' => $log['date'],
            ]);
        }
    }
}
