<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $ana = User::updateOrCreate(
            ['email' => 'ana@bizdom.test'],
            ['name' => 'Ana Ramirez', 'password' => Hash::make('password')],
        );

        $users = collect([
            ['name' => 'Alice Perez', 'email' => 'alice@bizdom.test'],
            ['name' => 'Bob Lopez', 'email' => 'bob@bizdom.test'],
            ['name' => 'Carla Soto', 'email' => 'carla@bizdom.test'],
            ['name' => 'Diego Luna', 'email' => 'diego@bizdom.test'],
            ['name' => 'Equipo Soporte', 'email' => 'soporte@bizdom.test'],
        ])->map(fn (array $data) => User::updateOrCreate(
            ['email' => $data['email']],
            ['name' => $data['name'], 'password' => Hash::make('password')],
        ));

        $users->take(4)->each(function (User $participant, int $index) use ($ana, $users) {
            // For the group chat (index 2), include multiple participants
            if ($index === 2) {
                $conversation = Conversation::factory()->create([
                    'subject' => 'Chat grupal operativo - Equipo de Soporte',
                    'created_by' => $ana->id,
                    'last_message_at' => now()->subMinutes(32),
                ]);

                // Include Ana and 3 more participants (real group chat)
                $groupParticipants = $users->take(3)->pluck('id')->push($ana->id);
                $conversation->participants()->syncWithPivotValues($groupParticipants, [
                    'read_at' => null,
                ]);

                // Ana marks her participation as read
                $conversation->participants()->updateExistingPivot($ana->id, [
                    'read_at' => now(),
                ]);

                Message::factory()->create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $ana->id,
                    'body' => 'Hola equipo, necesitamos coordinar el seguimiento de los tickets pendientes.',
                ]);

                Message::factory()->create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $users->get(0)->id,
                    'body' => 'Yo tengo 3 tickets en progreso, puedo tomar 2 más.',
                ]);

                Message::factory()->create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $users->get(1)->id,
                    'body' => 'Perfecto, yo me encargo de los casos críticos. Actualizo en 1 hora.',
                ]);
            } else {
                // Regular one-to-one conversations
                $subjects = ['Seguimiento de ticket fiscal', 'Revision de acceso', 'Duda sobre factura'];
                $conversation = Conversation::factory()->create([
                    'subject' => $subjects[$index] ?? 'Otra consulta',
                    'created_by' => $ana->id,
                    'last_message_at' => now()->subMinutes($index * 16),
                ]);

                $conversation->participants()->sync([
                    $ana->id => ['read_at' => $index % 2 === 1 ? null : now()],
                    $participant->id => ['read_at' => $index % 2 === 0 ? null : now()],
                ]);

                Message::factory()->create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $ana->id,
                    'body' => 'Hola, comparto el contexto inicial para dar seguimiento a este asunto.',
                ]);

                Message::factory()->create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $participant->id,
                    'body' => 'Recibido, reviso la informacion y te respondo con los siguientes pasos.',
                ]);
            }
        });
    }
}
