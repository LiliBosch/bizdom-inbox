<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ConversationService
{
    public const STATUS_RECEIVED = 'received';
    public const STATUS_REVIEWED = 'reviewed';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_RESOLVED = 'resolved';

    public const STATUSES = [
        self::STATUS_RECEIVED,
        self::STATUS_REVIEWED,
        self::STATUS_IN_PROGRESS,
        self::STATUS_RESOLVED,
    ];

    public function createConversation(User $sender, array $data): Conversation
    {
        return DB::transaction(function () use ($sender, $data) {
            $participantIds = collect($data['participant_ids'])
                ->push($sender->id)
                ->unique()
                ->values()
                ->all();

            $conversation = Conversation::create([
                'subject' => $data['subject'],
                'status' => self::STATUS_RECEIVED,
                'created_by' => $sender->id,
                'last_message_at' => now(),
            ]);

            $conversation->participants()->syncWithPivotValues($participantIds, [
                'read_at' => null,
            ]);

            $conversation->participants()->updateExistingPivot($sender->id, [
                'read_at' => now(),
            ]);

            $conversation->messages()->create([
                'sender_id' => $sender->id,
                'body' => $data['body'],
            ]);

            return $conversation->load(['participants', 'messages.sender']);
        });
    }

    public function updateStatus(Conversation $conversation, User $actor, string $status): Conversation
    {
        abort_unless(
            $conversation->participants()->where('users.id', $actor->id)->exists(),
            403,
            'You are not allowed to update this conversation.'
        );

        $conversation->forceFill(['status' => $status])->save();

        return $conversation;
    }

    public function addReply(Conversation $conversation, User $sender, string $body): Message
    {
        return DB::transaction(function () use ($conversation, $sender, $body) {
            abort_unless(
                $conversation->participants()->where('users.id', $sender->id)->exists(),
                403,
                'No puedes responder una conversacion en la que no participas.'
            );

            $message = $conversation->messages()->create([
                'sender_id' => $sender->id,
                'body' => $body,
            ]);

            $conversation->forceFill(['last_message_at' => now()])->save();

            $conversation->participants()
                ->where('users.id', '!=', $sender->id)
                ->pluck('users.id')
                ->each(fn (int $participantId) => $conversation->participants()->updateExistingPivot($participantId, [
                    'read_at' => null,
                ]));

            $conversation->participants()->updateExistingPivot($sender->id, [
                'read_at' => now(),
            ]);

            return $message->load('sender');
        });
    }

    public function markAsRead(Conversation $conversation, User $user): void
    {
        $conversation->participants()->updateExistingPivot($user->id, [
            'read_at' => now(),
        ]);
    }
}
