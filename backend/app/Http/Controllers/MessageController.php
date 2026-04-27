<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Services\ConversationService;

class MessageController extends Controller
{
    public function __construct(private readonly ConversationService $service) {}

    public function store(StoreMessageRequest $request, Conversation $conversation): MessageResource
    {
        $message = $this->service->addReply(
            $conversation,
            $request->user(),
            $request->validated('body'),
            $request->file('attachments', []),
        );

        return new MessageResource($message);
    }
}
