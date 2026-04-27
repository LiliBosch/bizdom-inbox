<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ConversationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_conversation_with_first_message(): void
    {
        $sender = User::factory()->create();
        $participant = User::factory()->create();
        $this->actingAsJwt($sender);

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
        $this->actingAsJwt($participant);

        $response = $this->postJson("/api/conversations/{$conversation->id}/messages", [
            'body' => 'Confirmo la recepcion.',
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('messages', ['body' => 'Confirmo la recepcion.']);
    }

    public function test_participant_can_reply_with_attachment(): void
    {
        Storage::fake('local');

        $sender = User::factory()->create();
        $participant = User::factory()->create();
        $conversation = Conversation::factory()->create(['created_by' => $sender->id]);
        $conversation->participants()->sync([$sender->id, $participant->id]);
        $this->actingAsJwt($participant);

        $response = $this->post("/api/conversations/{$conversation->id}/messages", [
            'body' => 'Adjunto evidencia.',
            'attachments' => [
                UploadedFile::fake()->create('evidencia.pdf', 120, 'application/pdf'),
            ],
        ], ['Accept' => 'application/json']);

        $response->assertCreated()
            ->assertJsonPath('data.attachments.0.original_name', 'evidencia.pdf');

        $this->assertDatabaseHas('message_attachments', ['original_name' => 'evidencia.pdf']);
        $attachmentPath = Message::latest()->first()->attachments()->first()->path;
        Storage::disk('local')->assertExists($attachmentPath);
    }

    public function test_attachment_download_is_limited_to_conversation_participants(): void
    {
        Storage::fake('local');

        $sender = User::factory()->create();
        $participant = User::factory()->create();
        $outsider = User::factory()->create();
        $conversation = Conversation::factory()->create(['created_by' => $sender->id]);
        $conversation->participants()->sync([$sender->id, $participant->id]);
        $message = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'body' => 'Adjunto evidencia.',
        ]);
        Storage::disk('local')->put('conversation-attachments/evidencia.pdf', 'contenido');
        $attachment = $message->attachments()->create([
            'original_name' => 'evidencia.pdf',
            'path' => 'conversation-attachments/evidencia.pdf',
            'mime_type' => 'application/pdf',
            'size' => 9,
        ]);

        $this->actingAsJwt($outsider)
            ->get("/api/messages/{$message->id}/attachments/{$attachment->id}")
            ->assertForbidden();

        $this->actingAsJwt($participant)
            ->get("/api/messages/{$message->id}/attachments/{$attachment->id}")
            ->assertOk();
    }

    public function test_non_participant_cannot_read_conversation(): void
    {
        $owner = User::factory()->create();
        $participant = User::factory()->create();
        $outsider = User::factory()->create();
        $conversation = Conversation::factory()->create(['created_by' => $owner->id]);
        $conversation->participants()->sync([$owner->id, $participant->id]);

        $this->actingAsJwt($outsider);

        $response = $this->getJson("/api/conversations/{$conversation->id}");

        $response->assertNotFound();
    }

    public function test_non_participant_cannot_reply_to_conversation(): void
    {
        $owner = User::factory()->create();
        $participant = User::factory()->create();
        $outsider = User::factory()->create();
        $conversation = Conversation::factory()->create(['created_by' => $owner->id]);
        $conversation->participants()->sync([$owner->id, $participant->id]);

        $this->actingAsJwt($outsider);

        $response = $this->postJson("/api/conversations/{$conversation->id}/messages", [
            'body' => 'No deberia poder responder.',
        ]);

        $response->assertForbidden();
    }

    public function test_reply_body_is_required(): void
    {
        $owner = User::factory()->create();
        $participant = User::factory()->create();
        $conversation = Conversation::factory()->create(['created_by' => $owner->id]);
        $conversation->participants()->sync([$owner->id, $participant->id]);

        $this->actingAsJwt($participant);

        $response = $this->postJson("/api/conversations/{$conversation->id}/messages", [
            'body' => '',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['body']);
    }

    public function test_participant_list_is_required_to_create_conversation(): void
    {
        $sender = User::factory()->create();

        $this->actingAsJwt($sender);

        $response = $this->postJson('/api/conversations', [
            'subject' => 'Seguimiento SAT',
            'body' => 'Necesito revisar el caso con soporte.',
            'participant_ids' => [],
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['participant_ids']);
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

        $this->actingAsJwt($user);

        $response = $this->getJson('/api/conversations?per_page=10');
        $response->assertOk();
        $response->assertJsonFragment([
            'id' => $unreadConversation->id,
            'is_unread' => true,
            'status' => $unreadConversation->status,
        ]);
        $response->assertJsonFragment([
            'id' => $readConversation->id,
            'is_unread' => false,
            'status' => $readConversation->status,
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

    public function test_participant_can_update_conversation_status(): void
    {
        $user = User::factory()->create();
        $participant = User::factory()->create();
        $conversation = Conversation::factory()->create([
            'created_by' => $user->id,
            'status' => 'received',
        ]);
        $conversation->participants()->sync([$user->id, $participant->id]);

        $this->actingAsJwt($participant);

        $response = $this->patchJson("/api/conversations/{$conversation->id}/status", [
            'status' => 'resolved',
        ]);

        $response->assertOk();
        $response->assertJsonFragment([
            'id' => $conversation->id,
            'status' => 'resolved',
        ]);
        $this->assertDatabaseHas('conversations', [
            'id' => $conversation->id,
            'status' => 'resolved',
        ]);
    }

    public function test_opening_conversation_sets_reviewed_status_and_marks_message_receipts_read(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $conversation = Conversation::factory()->create([
            'created_by' => $sender->id,
            'status' => 'received',
        ]);
        $conversation->participants()->sync([
            $sender->id => ['read_at' => now()],
            $recipient->id => ['read_at' => null],
        ]);

        $message = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'body' => 'Hola',
        ]);
        $message->recipients()->syncWithPivotValues([$recipient->id], [
            'delivered_at' => now(),
            'read_at' => null,
        ]);

        $this->actingAsJwt($recipient);

        $response = $this->getJson("/api/conversations/{$conversation->id}");
        $response->assertOk();

        $this->assertDatabaseHas('conversations', [
            'id' => $conversation->id,
            'status' => 'reviewed',
        ]);

        $this->assertDatabaseHas('message_user', [
            'message_id' => $message->id,
            'user_id' => $recipient->id,
        ]);

        $this->assertNotNull(
            \DB::table('message_user')
                ->where('message_id', $message->id)
                ->where('user_id', $recipient->id)
                ->value('read_at')
        );
    }
}
