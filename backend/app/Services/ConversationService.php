<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\ConversationReminder;
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

    public const REMINDER_TYPE_AUTO_OVERDUE = 'auto_overdue';

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
                'status_received_at' => now(),
                'created_by' => $sender->id,
                'last_message_at' => now(),
                'last_reminder_at' => null,
            ]);

            $conversation->participants()->syncWithPivotValues($participantIds, [
                'read_at' => null,
            ]);

            $conversation->participants()->updateExistingPivot($sender->id, [
                'read_at' => now(),
            ]);

            $message = $conversation->messages()->create([
                'sender_id' => $sender->id,
                'body' => $data['body'],
            ]);

            $recipientIds = $conversation->participants()
                ->where('users.id', '!=', $sender->id)
                ->pluck('users.id')
                ->all();

            if (count($recipientIds) > 0) {
                $message->recipients()->syncWithPivotValues($recipientIds, [
                    'delivered_at' => now(),
                    'read_at' => null,
                ]);
            }

            return $conversation->load(['participants', 'messages.sender', 'messages.recipients', 'latestReminder.sender']);
        });
    }

    public function updateStatus(Conversation $conversation, User $actor, string $status): Conversation
    {
        abort_unless(
            $conversation->participants()->where('users.id', $actor->id)->exists(),
            403,
            'You are not allowed to update this conversation.'
        );

        $conversation->forceFill(['status' => $status]);

        if ($status === self::STATUS_IN_PROGRESS && $conversation->status_in_progress_at === null) {
            $conversation->forceFill(['status_in_progress_at' => now()]);
        }

        if ($status === self::STATUS_RESOLVED && $conversation->status_resolved_at === null) {
            $conversation->forceFill(['status_resolved_at' => now()]);
        }

        $conversation->save();

        return $conversation->loadMissing(['latestReminder.sender']);
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

            $recipientIds = $conversation->participants()
                ->where('users.id', '!=', $sender->id)
                ->pluck('users.id')
                ->all();

            if (count($recipientIds) > 0) {
                $message->recipients()->syncWithPivotValues($recipientIds, [
                    'delivered_at' => now(),
                    'read_at' => null,
                ]);
            }

            $conversation->forceFill([
                'last_message_at' => now(),
                'last_reminder_at' => null,
            ])->save();

            $conversation->participants()
                ->where('users.id', '!=', $sender->id)
                ->pluck('users.id')
                ->each(fn (int $participantId) => $conversation->participants()->updateExistingPivot($participantId, [
                    'read_at' => null,
                ]));

            $conversation->participants()->updateExistingPivot($sender->id, [
                'read_at' => now(),
            ]);

            return $message->load(['sender', 'recipients']);
        });
    }

    public function sendReminder(
        Conversation $conversation,
        User $sender,
        string $type = self::REMINDER_TYPE_AUTO_OVERDUE,
        ?string $body = null,
    ): ConversationReminder {
        return DB::transaction(function () use ($conversation, $sender, $type, $body) {
            abort_unless(
                $conversation->participants()->where('users.id', $sender->id)->exists(),
                403,
                'You are not allowed to send reminders in this conversation.',
            );

            $now = now();
            $messageBody = $body ?? 'Recordatorio automático: esta conversación lleva más de 24 horas abierta sin resolverse.';

            $message = $conversation->messages()->create([
                'sender_id' => $sender->id,
                'body' => $messageBody,
            ]);

            $recipientIds = $conversation->participants()
                ->where('users.id', '!=', $sender->id)
                ->pluck('users.id')
                ->all();

            if (count($recipientIds) > 0) {
                $message->recipients()->syncWithPivotValues($recipientIds, [
                    'delivered_at' => $now,
                    'read_at' => null,
                ]);
            }

            $conversation->forceFill([
                'last_message_at' => $now,
                'last_reminder_at' => $now,
            ])->save();

            $conversation->participants()
                ->where('users.id', '!=', $sender->id)
                ->pluck('users.id')
                ->each(fn (int $participantId) => $conversation->participants()->updateExistingPivot($participantId, [
                    'read_at' => null,
                ]));

            $conversation->participants()->updateExistingPivot($sender->id, [
                'read_at' => $now,
            ]);

            return $conversation->reminders()->create([
                'message_id' => $message->id,
                'sent_by' => $sender->id,
                'type' => $type,
                'sent_at' => $now,
            ])->load('sender');
        });
    }

    public function markAsRead(Conversation $conversation, User $user): void
    {
        $now = now();

        $conversation->participants()->updateExistingPivot($user->id, [
            'read_at' => $now,
        ]);

        $conversation->messages()
            ->where('sender_id', '!=', $user->id)
            ->pluck('id')
            ->each(function (int $messageId) use ($user, $now) {
                DB::table('message_user')
                    ->where('message_id', $messageId)
                    ->where('user_id', $user->id)
                    ->whereNull('read_at')
                    ->update(['read_at' => $now, 'updated_at' => $now]);
            });

        if ($conversation->status === self::STATUS_RECEIVED && $conversation->status_reviewed_at === null) {
            $conversation->forceFill([
                'status' => self::STATUS_REVIEWED,
                'status_reviewed_at' => $now,
            ])->save();
        }
    }
}
