import { vi } from 'vitest';

export const conversationsApiMock = {
  getConversations: vi.fn(),
  getConversation: vi.fn(),
  createConversation: vi.fn(),
  replyToConversation: vi.fn(),
  downloadAttachment: vi.fn(),
  getUnreadCount: vi.fn(),
  updateConversationStatus: vi.fn(),
};

export const usersApiMock = {
  getUsers: vi.fn(),
};

export function resetApiMocks() {
  Object.values(conversationsApiMock).forEach((mock) => mock.mockReset());
  Object.values(usersApiMock).forEach((mock) => mock.mockReset());
}
