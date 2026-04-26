<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ConversationFactory extends Factory
{
    protected $model = Conversation::class;

    public function definition(): array
    {
        return [
            'subject' => fake()->sentence(4),
            'status' => 'received',
            'created_by' => User::factory(),
            'last_message_at' => now(),
        ];
    }
}
