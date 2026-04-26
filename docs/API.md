# API Documentation

## POST /api/auth/login

Authenticates the user and returns a Bearer token.

Request:

```json
{
  "email": "ana@bizdom.test",
  "password": "password"
}
```

Response:

```json
{
  "token": "1|token",
  "user": {
    "id": 1,
    "name": "Ana Ramirez",
    "email": "ana@bizdom.test"
  }
}
```

## GET /api/conversations

Lists conversations for the authenticated user.

Query params:

```txt
search=text
unread=true
per_page=10
```

Each conversation includes status fields, unread state, participants, the latest message preview, and `latest_reminder` when a reminder exists.

Example reminder shape:

```json
{
  "latest_reminder": {
    "id": 1,
    "type": "auto_overdue",
    "sent_at": "2026-04-26T12:00:00.000000Z",
    "sent_by": {
      "id": 1,
      "name": "Ana Ramirez",
      "email": "ana@bizdom.test"
    }
  }
}
```

## GET /api/users

Lists users available as recipients. Excludes the authenticated user.

## POST /api/conversations

Creates a thread with its first message.

```json
{
  "subject": "Tax ticket follow up",
  "body": "Hello, I need help with this case.",
  "participant_ids": [2]
}
```

## GET /api/conversations/{conversation}

Returns thread details and messages. Also marks the conversation as read for the current user.

If the conversation has a reminder, the response includes `latest_reminder`. Messages include delivery/read receipts when loaded.

## PATCH /api/conversations/{conversation}/status

Updates the ticket status. Only participants can update a conversation.

Allowed values:

```txt
in_progress
resolved
```

Request:

```json
{
  "status": "in_progress"
}
```

Response includes the updated status and status timestamp fields:

```json
{
  "data": {
    "id": 1,
    "status": "in_progress",
    "status_received_at": "2026-04-26T10:00:00.000000Z",
    "status_reviewed_at": "2026-04-26T10:05:00.000000Z",
    "status_in_progress_at": "2026-04-26T10:15:00.000000Z",
    "status_resolved_at": null
  }
}
```

## POST /api/conversations/{conversation}/messages

Adds a reply to the thread.

```json
{
  "body": "I confirm receipt of the message."
}
```

Only participants can reply. A message body is required.

## GET /api/notifications/unread-count

Returns the unread conversations counter.

```json
{
  "unread_count": 3
}
```
