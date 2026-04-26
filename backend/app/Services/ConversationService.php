<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ConversationService
{
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
