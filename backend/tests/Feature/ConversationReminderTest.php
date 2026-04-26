<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Services\ConversationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConversationReminderTest extends TestCase
{
    use RefreshDatabase;

    public function test_overdue_conversation_gets_automatic_reminder(): void
    {
        $this->travelTo(now()->startOfHour());

        $owner = User::factory()->create();
        $participant = User::factory()->create();

        $conversation = Conversation::factory()->create([
            'created_by' => $owner->id,
            'status' => ConversationService::STATUS_REVIEWED,
            'status_received_at' => now()->subHours(30),
            'status_reviewed_at' => now()->subHours(30),
            'last_message_at' => now()->subHours(30),
        ]);
        $conversation->participants()->sync([
            $owner->id => ['read_at' => now()->subHours(30)],
            $participant->id => ['read_at' => null],
        ]);

        Artisan::call('conversations:send-overdue-reminders');

        $conversation->refresh();

        $this->assertNotNull($conversation->last_reminder_at);
        $this->assertDatabaseHas('conversation_reminders', [
            'conversation_id' => $conversation->id,
            'type' => ConversationService::REMINDER_TYPE_AUTO_OVERDUE,
        ]);

        $message = $conversation->messages()->latest()->first();
        $this->assertNotNull($message);
        $this->assertSame($owner->id, $message->sender_id);
        $this->assertStringContainsString('Recordatorio automático', $message->body);
    }

    public function test_recent_reminder_is_not_sent_twice(): void
    {
        $this->travelTo(now()->startOfHour());

        $owner = User::factory()->create();
        $participant = User::factory()->create();

        $conversation = Conversation::factory()->create([
            'created_by' => $owner->id,
            'status' => ConversationService::STATUS_REVIEWED,
            'status_received_at' => now()->subHours(50),
            'status_reviewed_at' => now()->subHours(50),
            'last_message_at' => now()->subHours(10),
            'last_reminder_at' => now()->subHours(5),
        ]);
        $conversation->participants()->sync([
            $owner->id => ['read_at' => now()],
            $participant->id => ['read_at' => null],
        ]);

        $conversation->reminders()->create([
            'message_id' => null,
            'sent_by' => $owner->id,
            'type' => ConversationService::REMINDER_TYPE_AUTO_OVERDUE,
            'sent_at' => now()->subHours(5),
        ]);

        Artisan::call('conversations:send-overdue-reminders');

        $this->assertDatabaseCount('conversation_reminders', 1);
    }

    public function test_conversation_api_includes_latest_reminder_for_thread_alert(): void
    {
        $owner = User::factory()->create();
        $participant = User::factory()->create();

        $conversation = Conversation::factory()->create([
            'created_by' => $owner->id,
            'status' => ConversationService::STATUS_REVIEWED,
            'last_reminder_at' => now()->subMinutes(5),
        ]);
        $conversation->participants()->sync([
            $owner->id => ['read_at' => now()],
            $participant->id => ['read_at' => null],
        ]);

        $message = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'sender_id' => $owner->id,
            'body' => 'Recordatorio automático: esta conversación lleva más de 24 horas abierta sin resolverse.',
        ]);

        $conversation->reminders()->create([
            'message_id' => $message->id,
            'sent_by' => $owner->id,
            'type' => ConversationService::REMINDER_TYPE_AUTO_OVERDUE,
            'sent_at' => now()->subMinutes(5),
        ]);

        Sanctum::actingAs($participant);

        $response = $this->getJson("/api/conversations/{$conversation->id}");

        $response->assertOk();
        $response->assertJsonPath('data.latest_reminder.type', ConversationService::REMINDER_TYPE_AUTO_OVERDUE);
        $response->assertJsonPath('data.latest_reminder.sent_by.id', $owner->id);
        $this->assertNotNull($response->json('data.latest_reminder.sent_at'));
    }
}
