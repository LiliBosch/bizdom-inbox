<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject',
        'status',
        'status_received_at',
        'status_reviewed_at',
        'status_in_progress_at',
        'status_resolved_at',
        'created_by',
        'last_message_at',
        'last_reminder_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'status_received_at' => 'datetime',
        'status_reviewed_at' => 'datetime',
        'status_in_progress_at' => 'datetime',
        'status_resolved_at' => 'datetime',
        'last_reminder_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('read_at')
            ->withTimestamps();
    }

    public function reminders(): HasMany
    {
        return $this->hasMany(ConversationReminder::class);
    }

    public function latestReminder(): HasOne
    {
        return $this->hasOne(ConversationReminder::class)->latestOfMany('sent_at');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->oldest();
    }
}
