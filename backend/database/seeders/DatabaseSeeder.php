<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

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
                    'status' => 'in_progress',
                    'status_received_at' => now()->subMinutes(60),
                    'status_reviewed_at' => now()->subMinutes(55),
                    'status_in_progress_at' => now()->subMinutes(45),
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

                $m1 = Message::factory()->create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $ana->id,
                    'body' => 'Hola equipo, necesitamos coordinar el seguimiento de los tickets pendientes.',
                ]);

                $m2 = Message::factory()->create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $users->get(0)->id,
                    'body' => 'Yo tengo 3 tickets en progreso, puedo tomar 2 más.',
                ]);

                $m3 = Message::factory()->create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $users->get(1)->id,
                    'body' => 'Perfecto, yo me encargo de los casos críticos. Actualizo en 1 hora.',
                ]);

                $this->seedReceiptsForMessage($conversation, $m1);
                $this->seedReceiptsForMessage($conversation, $m2);
                $this->seedReceiptsForMessage($conversation, $m3);
            } else {
                // Regular one-to-one conversations
                $subjects = ['Seguimiento de ticket fiscal', 'Revision de acceso', 'Duda sobre factura'];

                $status = $index === 0 ? 'received' : ($index === 1 ? 'reviewed' : 'resolved');
                $conversation = Conversation::factory()->create([
                    'subject' => $subjects[$index] ?? 'Otra consulta',
                    'status' => $status,
                    'status_received_at' => now()->subMinutes($index * 18 + 40),
                    'status_reviewed_at' => $status === 'reviewed' || $status === 'resolved'
                        ? now()->subMinutes($index * 18 + 30)
                        : null,
                    'status_resolved_at' => $status === 'resolved'
                        ? now()->subMinutes($index * 18 + 10)
                        : null,
                    'created_by' => $ana->id,
                    'last_message_at' => now()->subMinutes($index * 16),
                ]);

                $conversation->participants()->sync([
                    $ana->id => ['read_at' => $status === 'resolved' ? now() : ($index % 2 === 1 ? null : now())],
                    $participant->id => ['read_at' => $status === 'resolved' ? now() : ($index % 2 === 0 ? null : now())],
                ]);

                $m1 = Message::factory()->create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $ana->id,
                    'body' => $status === 'resolved'
                        ? 'Hola, cierro este ticket ya que el caso quedó resuelto. Quedo atenta si surge algo más.'
                        : 'Hola, comparto el contexto inicial para dar seguimiento a este asunto.',
                ]);

                $m2 = Message::factory()->create([
                    'conversation_id' => $conversation->id,
                    'sender_id' => $participant->id,
                    'body' => $status === 'resolved'
                        ? 'Confirmado. Caso resuelto y documentado. Gracias.'
                        : 'Recibido, reviso la informacion y te respondo con los siguientes pasos.',
                ]);

                $this->seedReceiptsForMessage($conversation, $m1);
                $this->seedReceiptsForMessage($conversation, $m2);
            }
        });
    }

    private function seedReceiptsForMessage(Conversation $conversation, Message $message): void
    {
        $recipientIds = $conversation->participants()
            ->where('users.id', '!=', $message->sender_id)
            ->pluck('users.id')
            ->all();

        foreach ($recipientIds as $userId) {
            DB::table('message_user')->updateOrInsert(
                ['message_id' => $message->id, 'user_id' => $userId],
                [
                    'delivered_at' => now()->subMinutes(20),
                    'read_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
