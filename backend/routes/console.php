<?php

use App\Models\Conversation;
use App\Services\ConversationService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment('BIZDOM Inbox listo para enviar mensajes claros.');
})->purpose('Muestra un mensaje de inspiracion.');

Artisan::command('conversations:send-overdue-reminders', function (ConversationService $service) {
    $threshold = now()->subHours(24);
    $count = 0;

    Conversation::query()
        ->where('status', '!=', ConversationService::STATUS_RESOLVED)
        ->whereNotNull('status_reviewed_at')
        ->where('status_reviewed_at', '<=', $threshold)
        ->where(function ($query) use ($threshold) {
            $query->whereNull('status_in_progress_at')
                ->orWhere('status_in_progress_at', '<=', $threshold);
        })
        ->where(function ($query) use ($threshold) {
            $query->whereNull('last_reminder_at')
                ->orWhere('last_reminder_at', '<=', $threshold);
        })
        ->with(['participants', 'creator'])
        ->chunkById(100, function ($conversations) use ($service, &$count) {
            foreach ($conversations as $conversation) {
                $sender = $conversation->creator ?? $conversation->participants->first();

                if (! $sender) {
                    continue;
                }

                $service->sendReminder($conversation, $sender);
                $count++;
            }
        });

    $this->info("Sent {$count} overdue reminders.");
})->purpose('Send automatic reminders for conversations open for more than 24 hours without resolution.');

Schedule::command('conversations:send-overdue-reminders')->hourly();
