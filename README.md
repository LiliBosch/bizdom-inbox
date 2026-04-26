# BIZDOM Inbox

Inbox style messaging module (similar to a support ticket inbox) built with Laravel, React, and TypeScript. Includes authentication, a conversation list with search and filters, thread reading, new thread creation, and replies.

## Features

- Authentication with Bearer token.
- Conversations:
  - Paginated list
  - Search
  - Unread filter
  - Unread counter
- Messages:
  - Create a conversation with the first message
  - Reply in an existing thread
- Ticket workflow:
  - Conversation status: Received / Reviewed / In progress / Resolved
  - Automatic overdue reminders for reviewed conversations that remain unresolved.
- UI:
  - Responsive layout
  - Light/dark theme toggle with saved preference (localStorage: `bizdom_inbox_theme`)
  - Language toggle (EN/ES) for UI labels
  - Visual indicator for pending conversations (unread)
  - Accessible labels and visible keyboard focus for primary controls
  - Reply draft autosave per conversation (localStorage)
  - Keyboard shortcuts:
    - Cmd/Ctrl + K: focus search
    - Esc: clear search / close modal
    - ReplyBox: Enter to send, Shift+Enter for newline
  - SLA indicator in conversation list using `last_message_at`
  - Reminder alert in the conversation thread when an overdue reminder exists.

## Stack

- Backend: Laravel 11, PHP 8.4, MySQL/MariaDB
- Auth: Sanctum (tokens Bearer)
- Frontend: React 18, TypeScript, Vite
- Tests: PHPUnit (backend), Vitest + React Testing Library (frontend)

## Business rules

- Only authenticated users can access conversations.
- A conversation requires a subject, an initial body, and at least one participant.
- A message cannot be empty.
- Only thread participants can reply.
- On reply, `last_message_at` is updated.
- Automatic reminders update `last_message_at` and `last_reminder_at`.
- When opening a conversation, it is marked as read for the current user.
- The unread counter is calculated per user.

## Installation and running with Docker

Requirement:

```txt
Docker Desktop
```

Start everything with a single command (includes migrations and demo seed data):

```bash
docker compose up --build
```

### Demo in 60 seconds

1) Reset demo data (optional, but recommended if you ran it before):

```bash
docker compose down --volumes --remove-orphans
```

2) Start the stack:

```bash
docker compose up --build -d
```

3) Open the app:

```txt
Frontend: http://localhost:5173
Backend: http://localhost:8000
```

4) Login with demo user:

```txt
email: ana@bizdom.test
password: password
```

Notes:

- This project is intended for local demo. When Docker starts, it runs migrations and seeders so the app has sample data right away.
- If the session expires (401), the frontend automatically signs out and clears state to avoid inconsistencies.

Services:

```txt
Frontend: http://localhost:5173
Backend: http://localhost:8000
MySQL: localhost:3307
```

Demo user:

```txt
email: ana@bizdom.test
password: password
```

## Local installation

You can also run it without Docker if you have PHP 8.4, Composer, Node, and MySQL installed.

Backend:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Environment variables

### Backend (`backend/.env`)

```txt
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_DATABASE=bizdom_inbox
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```txt
VITE_API_URL=http://localhost:8000/api
```

## Tests

### Backend

```bash
docker compose exec backend php artisan test
```

Backend tests cover authentication, conversation creation, replies, unread state, status changes, read receipts, and overdue reminders.

### Frontend

```bash
docker compose exec frontend npm run test -- --run
```

Frontend tests cover the inbox list, loading and empty states, search and unread filters, new conversation creation, recipient selection, reminder alerts, and replies from the thread view.

## Seeders vs tests (why both exist)

- Seeders create demo data for local testing and manual QA.
- Tests verify the main behaviors without depending on the demo data.

## Technical notes

- Laravel backend:
  - Layered separation with Controller + Repository + Service.
  - Pagination in the conversations list.
  - Per-user read tracking using the `conversation_user.read_at` pivot.
- React/TypeScript frontend:
  - `AuthContext` for session management and persistence in localStorage.
  - `useConversations` hook for state, data fetching, and pagination.
  - Global handling of `401 Unauthorized` to automatically sign out.
  - UI language toggle (EN/ES) implemented via `LanguageContext` + `src/i18n/translations.ts`.
    - Only UI labels, placeholders, and buttons are translated.
    - Message content, subjects, and user names are not translated.
  - ReplyBox draft autosave:
    - Stored in `localStorage` per conversation using key `replyDraft:{conversationId}`.
    - Draft is restored when returning to the conversation.
    - Clear draft action removes the stored value.
  - Conversation SLA indicator:
    - Frontend-only calculation based on `last_message_at`.
    - Thresholds: ≤30 min (normal), ≤120 min (warning), >120 min (overdue).
  - Reminder alert:
    - Rendered when the API includes `latest_reminder`.
    - Demo seed data includes one reviewed conversation with an overdue reminder.
  - Accessibility/keyboard polish:
    - Search has an explicit accessible label.
    - Primary controls use visible `:focus-visible` states.
    - The unread indicator includes screen-reader text.
    - The new-message modal focuses the subject field on open and closes with Esc.
  - Keyboard shortcuts:
    - Cmd or Ctrl + K focuses the search input.
    - Esc clears the search input (or closes the new conversation modal when open).
    - ReplyBox uses Enter to send and Shift+Enter for newline.

## Quick checklist (what you can test)

- Login with the demo user.
- List conversations.
- Search by subject or participant.
- Filter unread and see the counter.
- Open a conversation (should be marked as read).
- Confirm that a conversation with an overdue reminder shows a reminder alert.
- Create a new conversation with multiple recipients.
- Reply in a thread.

## API (main endpoints)

All protected routes use:

```txt
Authorization: Bearer <token>
```

```txt
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout

GET    /api/users
GET    /api/conversations
POST   /api/conversations
GET    /api/conversations/{conversation}
PATCH  /api/conversations/{conversation}/status
POST   /api/conversations/{conversation}/messages

GET    /api/notifications/unread-count
```

## Ticket Status Workflow

The ticket status workflow feature allows users to manage a conversation like a ticket.

Statuses:

- `received` (Received)
- `reviewed` (Opened)
- `in_progress` (In progress)
- `resolved` (Resolved)

Only `in_progress` and `resolved` are manually selectable in the UI.

### API Endpoint

To update the status of a conversation, use the following API endpoint:

```txt
PATCH  /api/conversations/{conversation}/status
```

This endpoint expects a JSON payload with the new status:

```json
{
  "status": "in_progress"
}
```

### Automatic transitions and timestamps

The following transitions are automatic:

- When a conversation is created:
  - `status` is set to `received`
  - `status_received_at` is set

- When a participant opens the conversation thread (GET `/api/conversations/{conversation}`):
  - the conversation is marked as read for that participant (`conversation_user.read_at`)
  - if the conversation was `received`, it transitions to `reviewed` (Opened) and sets `status_reviewed_at`

Manual transitions:

- Setting `in_progress` sets `status_in_progress_at` (first time only)
- Setting `resolved` sets `status_resolved_at` (first time only)

Timestamps stored on `conversations`:

- `status_received_at`
- `status_reviewed_at`
- `status_in_progress_at`
- `status_resolved_at`

The UI shows the timestamp for the current and latest status only.

## Overdue reminders

The backend includes a scheduled command that creates automatic reminders for reviewed conversations that have stayed open for more than 24 hours without being resolved.

```bash
php artisan conversations:send-overdue-reminders
```

The scheduler runs this command hourly. When a reminder is sent:

- A message is added to the conversation.
- A row is stored in `conversation_reminders`.
- `last_message_at` and `last_reminder_at` are updated.
- The API exposes the latest reminder as `latest_reminder`.
- The frontend shows a reminder alert in the conversation thread.

## Message delivery + read receipts

In addition to the ticket workflow, the system tracks delivery and read receipts for each message so the sender can see when a recipient received or opened a message.

Receipts are stored in the `message_user` pivot table:

- `delivered_at`: set when a message is created for each recipient
- `read_at`: set when a recipient opens the conversation thread

In API responses, messages include a `receipts` array with per-recipient timestamps.

## Demo data

- The project includes seeders to populate the database with conversations and messages.
- It includes unread conversations so the pending indicator is visible.
- It includes a reviewed conversation with an overdue reminder so the reminder alert can be tested during the demo.

## Notes and tradeoffs

- Authentication uses Laravel Sanctum Bearer tokens for a simple local API flow.
- Read state is tracked per user through the `conversation_user.read_at` pivot.
- Message delivery/read receipts are tracked separately through `message_user`.
- Reminder alerts use a `conversation_reminders` table instead of only a timestamp, so the UI can show the latest reminder details.
- Frontend tests mock the API layer to keep UI behavior tests fast and independent from backend state.

## AI collaboration

- AI assistance was used while drafting parts of the demo seed data and test scaffolding.
- Tests and review notes were checked before being committed.
- The README was also cleaned up so the project setup, demo flow, and feature notes are easier to follow.
