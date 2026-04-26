import type { Conversation, Message, PaginatedResponse, User } from '../features/inbox/types';

export const currentUser: User = {
  id: 1,
  name: 'Ana Ramirez',
  email: 'ana@bizdom.test',
};

export const bobUser: User = {
  id: 2,
  name: 'Bob Lopez',
  email: 'bob@bizdom.test',
};

export const carlaUser: User = {
  id: 3,
  name: 'Carla Soto',
  email: 'carla@bizdom.test',
};

export function makeMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 100,
    body: 'Hola, comparto el contexto inicial.',
    sender: bobUser,
    created_at: '2026-04-26T10:10:00.000Z',
    ...overrides,
  };
}

export function makeConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 10,
    subject: 'Revision de acceso',
    status: 'reviewed',
    status_received_at: '2026-04-26T10:00:00.000Z',
    status_reviewed_at: '2026-04-26T10:05:00.000Z',
    status_in_progress_at: null,
    status_resolved_at: null,
    last_message_at: '2026-04-26T10:10:00.000Z',
    last_reminder_at: null,
    is_unread: false,
    participants: [currentUser, bobUser],
    messages: [makeMessage()],
    latest_reminder: null,
    created_at: '2026-04-26T10:00:00.000Z',
    ...overrides,
  };
}

export function paginatedConversations(conversations: Conversation[]): PaginatedResponse<Conversation> {
  return {
    data: conversations,
    meta: {
      current_page: 1,
      last_page: 1,
      total: conversations.length,
    },
  };
}
