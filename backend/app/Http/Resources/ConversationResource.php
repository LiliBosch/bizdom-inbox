<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject' => $this->subject,
            'status' => $this->status,
            'status_received_at' => $this->status_received_at?->toISOString(),
            'status_reviewed_at' => $this->status_reviewed_at?->toISOString(),
            'status_in_progress_at' => $this->status_in_progress_at?->toISOString(),
            'status_resolved_at' => $this->status_resolved_at?->toISOString(),
            'last_message_at' => $this->last_message_at?->toISOString(),
            'last_reminder_at' => $this->last_reminder_at?->toISOString(),
            'latest_reminder' => $this->whenLoaded('latestReminder', function () {
                return [
                    'id' => $this->latestReminder->id,
                    'type' => $this->latestReminder->type,
                    'sent_at' => $this->latestReminder->sent_at?->toISOString(),
                    'sent_by' => $this->latestReminder->sender?->only(['id', 'name', 'email']),
                ];
            }),
            'is_unread' => $this->pivot ? $this->pivot->read_at === null : false,
            'participants' => UserResource::collection($this->whenLoaded('participants')),
            'messages' => MessageResource::collection($this->whenLoaded('messages')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
