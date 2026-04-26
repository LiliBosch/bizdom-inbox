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
- UI:
  - Responsive layout
  - Light/dark theme toggle with saved preference (localStorage: `bizdom_inbox_theme`)
  - Visual indicator for pending conversations (unread)

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

### Demo in 60 seconds (recommended for evaluation)

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

- This project is intended for local demo. When Docker starts, it runs migrations and seeders so an evaluator can test it immediately.
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

### Frontend

```bash
docker compose exec frontend npm run test -- --run
```

## Seeders vs tests (why both exist)

- Seeders: generate example data for demo and manual QA. In this project they are used so an evaluator can log in and see conversations/messages from the first minute.
- Tests: automatically verify key behaviors (login, conversation creation, replies, etc.). They are objective evidence the system works and does not depend on the UI.

## Technical decisions (summary)

- Laravel backend:
  - Layered separation with Controller + Repository + Service.
  - Pagination in the conversations list.
  - Per-user read tracking using the `conversation_user.read_at` pivot.
- React/TypeScript frontend:
  - `AuthContext` for session management and persistence in localStorage.
  - `useConversations` hook for state, data fetching, and pagination.
  - Global handling of `401 Unauthorized` to automatically sign out.
  - UI language toggle (EN/ES) implemented via `LanguageContext` + `src/i18n/translations.ts`.
    - Only UI labels/placeholders/buttons are translated.
    - Message content, subjects, and user names are not translated.

## Quick checklist (what you can test)

- Login with the demo user.
- List conversations.
- Search by subject/participant.
- Filter unread and see the counter.
- Open a conversation (should be marked as read).
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
POST   /api/conversations/{conversation}/messages

GET    /api/notifications/unread-count
```

## Demo data

- The project includes seeders to populate the database with conversations and messages.
- It includes unread conversations so the pending indicator is visible.