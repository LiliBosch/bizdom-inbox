<?php

namespace App\Repositories;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ConversationRepository
{
    public function paginatedForUser(User $user, array $filters = []): LengthAwarePaginator
    {
        $unreadOnly = in_array($filters['unread'] ?? null, [true, 'true', 1, '1'], true);

        return $user->conversations()
            ->with(['participants', 'messages' => fn ($query) => $query->latest()->limit(1)])
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('subject', 'like', "%{$search}%")
                        ->orWhereHas('participants', fn ($participants) => $participants
                            ->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%"))
                        ->orWhereHas('messages', fn ($messages) => $messages
                            ->where('body', 'like', "%{$search}%"));
                });
            })
            ->when($unreadOnly, fn ($query) => $query->whereNull('conversation_user.read_at'))
            ->orderByDesc('last_message_at')
            ->paginate($filters['per_page'] ?? 10);
    }

    public function findForUser(User $user, Conversation $conversation): Conversation
    {
        return $user->conversations()
            ->where('conversations.id', $conversation->id)
            ->with(['participants', 'messages.sender'])
            ->firstOrFail();
    }

    public function unreadCountForUser(User $user): int
    {
        return $user->conversations()->whereNull('conversation_user.read_at')->count();
    }
}
