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

## POST /api/conversations/{conversation}/messages

Adds a reply to the thread.

```json
{
  "body": "I confirm receipt of the message."
}
```

## GET /api/notifications/unread-count

Returns the unread conversations counter.

```json
{
  "unread_count": 3
}
```
