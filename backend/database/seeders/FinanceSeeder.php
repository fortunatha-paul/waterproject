<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FinanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create first finance user
        User::create([
            'name' => 'Sarah Finance',
            'email' => 'sarah.finance@waterproject.com',
            'password' => Hash::make('password'),
            'phone_number' => '+255333333333',
            'nida' => 'FN333333333',
            'house_number' => 'FN001',
            'district' => 'Dar es Salaam',
            'ward' => 'Kinondoni',
            'role' => 'finance',
        ]);

        // Create second finance user
        User::create([
            'name' => 'Michael Finance',
            'email' => 'michael.finance@waterproject.com',
            'password' => Hash::make('password'),
            'phone_number' => '+255444444444',
            'nida' => 'FN444444444',
            'house_number' => 'FN002',
            'district' => 'Dar es Salaam',
            'ward' => 'Ilala',
            'role' => 'finance',
        ]);
    }
}
