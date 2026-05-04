<?php

namespace Database\Seeders;

use App\Models\Request;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RequestSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get customer users
        $john = User::where('email', 'john@example.com')->first();
        $jane = User::where('email', 'jane@example.com')->first();

        // Create sample requests for John
        Request::create([
            'user_id' => $john->id,
            'serve_type' => 'New Connection',
            'description' => 'Need a new water connection for residential property. The building requires separate metering.',
            'location' => 'House 123, Kinondoni',
        ]);

        Request::create([
            'user_id' => $john->id,
            'serve_type' => 'Repair',
            'description' => 'Leaking pipe near the kitchen area causing water wastage. Immediate attention required.',
            'location' => 'House 123, Kinondoni',
        ]);

        // Create sample requests for Jane
        Request::create([
            'user_id' => $jane->id,
            'serve_type' => 'Complaint',
            'description' => 'Low water pressure during morning hours for the past week.',
            'location' => 'House 456, Ubungo',
        ]);

        Request::create([
            'user_id' => $jane->id,
            'serve_type' => 'Billing',
            'description' => 'Incorrect billing amount on last month\'s water bill. Charged for double usage.',
            'location' => 'House 456, Ubungo',
        ]);
    }
}
