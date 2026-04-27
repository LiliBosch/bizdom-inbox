<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\MessageAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MessageAttachmentController extends Controller
{
    public function show(Request $request, Message $message, MessageAttachment $attachment): StreamedResponse
    {
        abort_unless($attachment->message_id === $message->id, 404);

        abort_unless(
            $message->conversation->participants()->where('users.id', $request->user()->id)->exists(),
            403,
            'You are not allowed to download this attachment.'
        );

        abort_unless(Storage::disk('local')->exists($attachment->path), 404);

        return Storage::disk('local')->download($attachment->path, $attachment->original_name);
    }
}
