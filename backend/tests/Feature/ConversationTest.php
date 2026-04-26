<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConversationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_conversation_with_first_message(): void
    {
        $sender = User::factory()->create();
        $participant = User::factory()->create();
        Sanctum::actingAs($sender);

        $response = $this->postJson('/api/conversations', [
            'subject' => 'Seguimiento SAT',
            'body' => 'Necesito revisar el caso con soporte.',
            'participant_ids' => [$participant->id],
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('conversations', ['subject' => 'Seguimiento SAT']);
        $this->assertDatabaseHas('messages', ['body' => 'Necesito revisar el caso con soporte.']);
    }

    public function test_participant_can_reply_to_conversation(): void
    {
        $sender = User::factory()->create();
        $participant = User::factory()->create();
        $conversation = Conversation::factory()->create(['created_by' => $sender->id]);
        $conversation->participants()->sync([$sender->id, $participant->id]);
        Sanctum::actingAs($participant);

        $response = $this->postJson("/api/conversations/{$conversation->id}/messages", [
            'body' => 'Confirmo la recepcion.',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('messages', ['body' => 'Confirmo la recepcion.']);
    }

    public function test_conversations_endpoint_marks_unread_conversations(): void
    {
        $user = User::factory()->create();
        $participant = User::factory()->create();

        $unreadConversation = Conversation::factory()->create([
            'created_by' => $participant->id,
            'last_message_at' => now(),
        ]);
        $unreadConversation->participants()->sync([
            $user->id => ['read_at' => null],
            $participant->id => ['read_at' => now()],
        ]);

        $readConversation = Conversation::factory()->create([
            'created_by' => $participant->id,
            'last_message_at' => now()->subMinute(),
        ]);
        $readConversation->participants()->sync([
            $user->id => ['read_at' => now()],
            $participant->id => ['read_at' => now()],
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/conversations?per_page=10');
        $response->assertOk();
        $response->assertJsonFragment([
            'id' => $unreadConversation->id,
            'is_unread' => true,
        ]);
        $response->assertJsonFragment([
            'id' => $readConversation->id,
            'is_unread' => false,
        ]);

        $unreadOnlyResponse = $this->getJson('/api/conversations?unread=true&per_page=10');
        $unreadOnlyResponse->assertOk();
        $unreadOnlyResponse->assertJsonFragment([
            'id' => $unreadConversation->id,
            'is_unread' => true,
        ]);
        $unreadOnlyResponse->assertJsonCount(1, 'data');
        $unreadOnlyResponse->assertJsonPath('data.0.id', $unreadConversation->id);
    }
}
