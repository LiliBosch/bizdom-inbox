import { useCallback, useEffect, useState } from 'react';
import * as conversationsApi from '../../../api/conversationsApi';
import type { Conversation } from '../types';

export function useConversations(token: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [search, setSearch] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadRequestId, setLoadRequestId] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const perPage = 10;

  const loadConversations = useCallback(async (nextPage: number, mode: 'replace' | 'append') => {
    if (!token) return;
    const requestId = loadRequestId + 1;
    setLoadRequestId(requestId);
    setIsLoading(true);
    setError(null);

    try {
      const response = await conversationsApi.getConversations(token, {
        search,
        unread: unreadOnly,
        page: nextPage,
        per_page: perPage,
      });

      setConversations((current) => {
        if (requestId !== loadRequestId + 1) return current;
        const incoming = response.data;
        return mode === 'append' ? [...current, ...incoming] : incoming;
      });

      setPage(nextPage);
      setLastPage(response.meta?.last_page ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar conversaciones.');
    } finally {
      setIsLoading(false);
    }
  }, [loadRequestId, search, token, unreadOnly]);

  const loadMoreConversations = useCallback(async () => {
    if (isLoading) return;
    if (page >= lastPage) return;
    await loadConversations(page + 1, 'append');
  }, [isLoading, lastPage, loadConversations, page]);

  const loadUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const response = await conversationsApi.getUnreadCount(token);
      const count = Number(response.unread_count);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error al cargar contador de no leídos:', err);
    }
  }, [token]);

  async function openConversation(conversationId: number) {
    if (!token) return;
    try {
      const response = await conversationsApi.getConversation(token, conversationId);
      setSelectedConversation(response.data);
      setConversations((items) =>
        items.map((item) => (item.id === conversationId ? { ...item, is_unread: false } : item)),
      );
      await loadUnreadCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al abrir conversación.');
    }
  }

  async function sendReply(body: string) {
    if (!token || !selectedConversation) return;
    const response = await conversationsApi.replyToConversation(token, selectedConversation.id, body);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...(selectedConversation.messages ?? []), response.data],
      last_message_at: response.data.created_at,
    });
    await loadConversations(1, 'replace');
    await loadUnreadCount();
  }

  async function createConversation(payload: { subject: string; body: string; participant_ids: number[] }) {
    if (!token) return;
    const response = await conversationsApi.createConversation(token, payload);
    setSelectedConversation(response.data);
    await loadConversations(1, 'replace');
    await loadUnreadCount();
  }

  useEffect(() => {
    setPage(1);
    setLastPage(1);
    void loadConversations(1, 'replace');
    void loadUnreadCount();
  }, [loadConversations, search, unreadOnly]);

  return {
    conversations,
    selectedConversation,
    search,
    unreadOnly,
    isLoading,
    error,
    unreadCount,
    hasMoreConversations: page < lastPage,
    loadMoreConversations,
    setSearch,
    setUnreadOnly,
    openConversation,
    sendReply,
    createConversation,
  };
}
