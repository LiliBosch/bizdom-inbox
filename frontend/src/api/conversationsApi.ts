import { http } from './http';
import type { Conversation, Message, PaginatedResponse, TicketStatus } from '../features/inbox/types';

export function getConversations(
  token: string,
  params: { search?: string; unread?: boolean; page?: number; per_page?: number },
) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set('search', params.search);
  if (params.unread) searchParams.set('unread', 'true');
  if (params.page) searchParams.set('page', String(params.page));
  if (params.per_page) searchParams.set('per_page', String(params.per_page));

  const query = searchParams.toString();
  return http<PaginatedResponse<Conversation>>(`/conversations${query ? `?${query}` : ''}`, { token });
}

export function getConversation(token: string, id: number) {
  return http<{ data: Conversation }>(`/conversations/${id}`, { token });
}

export function createConversation(token: string, payload: {
  subject: string;
  body: string;
  participant_ids: number[];
}) {
  return http<{ data: Conversation }>('/conversations', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export function replyToConversation(token: string, conversationId: number, body: string) {
  return http<{ data: Message }>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    token,
    body: JSON.stringify({ body }),
  });
}

export function getUnreadCount(token: string) {
  return http<{ unread_count: number }>('/notifications/unread-count', { token });
}

export function updateConversationStatus(token: string, conversationId: number, status: TicketStatus) {
  return http<{ data: Conversation }>(`/conversations/${conversationId}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  });
}
