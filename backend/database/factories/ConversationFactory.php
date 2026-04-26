<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConversationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'subject' => fake()->sentence(4),
            'created_by' => User::factory(),
            'last_message_at' => now(),
        ];
    }
}
