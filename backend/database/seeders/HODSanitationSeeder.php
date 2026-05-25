<?php

namespace Database\Seeders;

use App\Models\Request;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class HODSanitationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create HOD Sanitation user
        User::firstOrCreate(
            ['email' => 'hod@waterproject.com'],
            [
                'name' => 'HOD Sanitation',
                'password' => Hash::make('password'),
                'phone_number' => '+255755123456',
                'nida' => 'HOD123456789',
                'house_number' => 'HOD001',
                'district' => 'Dar es Salaam',
                'ward' => 'Temeke',
                'role' => 'hod_sanitation',
            ]
        );

        // Get customer users
        $john = User::where('email', 'john@example.com')->first();
        $jane = User::where('email', 'jane@example.com')->first();

        if ($john && $jane) {
            // Create sample "New Connection" requests for HOD Sanitation
            Request::firstOrCreate(
                [
                    'user_id' => $john->id,
                    'serve_type' => 'New Connection',
                    'description' => 'Need a new water connection for residential property. The building requires separate metering.',
                    'location' => 'House 123, Kinondoni',
                ],
                [
                    'status' => 'Pending',
                    'priority' => 'High',
                ]
            );

            // Create sample "Sewerage Problem" request
            Request::firstOrCreate(
                [
                    'user_id' => $jane->id,
                    'serve_type' => 'Sewerage Problem',
                    'description' => 'Blocked sewerage line causing backup. Immediate attention required.',
                    'location' => 'House 456, Ubungo',
                ],
                [
                    'status' => 'Pending',
                    'priority' => 'High',
                ]
            );

            // Create additional "New Connection" request
            Request::firstOrCreate(
                [
                    'user_id' => $jane->id,
                    'serve_type' => 'New Connection',
                    'description' => 'Commercial building needs water connection for office complex.',
                    'location' => 'Business Park, Ilala',
                ],
                [
                    'status' => 'In Progress',
                    'priority' => 'Medium',
                ]
            );

            // Create additional "Sewerage Problem" request
            Request::firstOrCreate(
                [
                    'user_id' => $john->id,
                    'serve_type' => 'Sewerage Problem',
                    'description' => 'Foul smell and drainage issues in residential area.',
                    'location' => 'House 789, Chalinze',
                ],
                [
                    'status' => 'Pending',
                    'priority' => 'Medium',
                ]
            );
        }
    }
}
