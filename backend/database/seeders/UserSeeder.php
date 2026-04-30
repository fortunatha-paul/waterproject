<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create customer service user
        User::create([
            'name' => 'Customer Service Admin',
            'email' => 'cs@waterproject.com',
            'password' => Hash::make('password'),
            'phone_number' => '+255123456789',
            'nida' => 'CS123456789',
            'house_number' => 'CS001',
            'district' => 'Dar es Salaam',
            'ward' => 'Kinondoni',
            'role' => 'customer_service',
        ]);

        // Create inspector user
        User::create([
            'name' => 'Inspector Admin',
            'email' => 'inspector@waterproject.com',
            'password' => Hash::make('password'),
            'phone_number' => '+255987654321',
            'nida' => 'IN987654321',
            'house_number' => 'IN001',
            'district' => 'Dar es Salaam',
            'ward' => 'Ilala',
            'role' => 'inspector',
        ]);

        // Create regular customer users
        User::create([
            'name' => 'John Customer',
            'email' => 'john@example.com',
            'password' => Hash::make('password'),
            'phone_number' => '+255111111111',
            'nida' => 'CU111111111',
            'house_number' => 'CU001',
            'district' => 'Dar es Salaam',
            'ward' => 'Temeke',
            'role' => 'customer',
        ]);

        User::create([
            'name' => 'Jane Customer',
            'email' => 'jane@example.com',
            'password' => Hash::make('password'),
            'phone_number' => '+255222222222',
            'nida' => 'CU222222222',
            'house_number' => 'CU002',
            'district' => 'Dar es Salaam',
            'ward' => 'Ubungo',
            'role' => 'customer',
        ]);
    }
}
