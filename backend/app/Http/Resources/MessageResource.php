<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'sender' => new UserResource($this->whenLoaded('sender')),
            'attachments' => $this->whenLoaded('attachments', function () {
                return $this->attachments->map(fn ($attachment) => [
                    'id' => $attachment->id,
                    'original_name' => $attachment->original_name,
                    'mime_type' => $attachment->mime_type,
                    'size' => $attachment->size,
                    'url' => route('messages.attachments.show', [
                        'message' => $this->id,
                        'attachment' => $attachment->id,
                    ]),
                ])->values();
            }),
            'receipts' => $this->whenLoaded('recipients', function () {
                return $this->recipients->map(fn ($user) => [
                    'user' => new UserResource($user),
                    'delivered_at' => $user->pivot->delivered_at
                        ? Carbon::parse($user->pivot->delivered_at)->toISOString()
                        : null,
                    'read_at' => $user->pivot->read_at
                        ? Carbon::parse($user->pivot->read_at)->toISOString()
                        : null,
                ])->values();
            }),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
