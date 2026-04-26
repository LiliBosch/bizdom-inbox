import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { ConversationList } from './ConversationList';
import { LanguageProvider } from '../../../context/LanguageContext';
import { ConversationThread } from './ConversationThread';
import type { Conversation, User } from '../types';
import { makeConversation } from '../../../test/factories';

test('muestra estado vacio cuando no hay conversaciones', () => {
  render(
    <LanguageProvider>
      <ConversationList conversations={[]} isLoading={false} onSelect={() => undefined} />
    </LanguageProvider>,
  );

  expect(screen.getByText('No conversations')).toBeInTheDocument();
});

test('muestra estado de carga', () => {
  render(
    <LanguageProvider>
      <ConversationList conversations={[]} isLoading={true} onSelect={() => undefined} />
    </LanguageProvider>,
  );

  expect(screen.getByText('Loading')).toBeInTheDocument();
  expect(screen.getByText('Fetching your conversations.')).toBeInTheDocument();
});

test('renderiza conversaciones y permite seleccionar una', () => {
  const onSelect = vi.fn();
  const conversations = [
    makeConversation({ id: 10, subject: 'Revision de acceso' }),
    makeConversation({ id: 11, subject: 'Seguimiento de ticket fiscal' }),
  ];

  render(
    <LanguageProvider>
      <ConversationList conversations={conversations} selectedId={11} isLoading={false} onSelect={onSelect} />
    </LanguageProvider>,
  );

  fireEvent.click(screen.getByText('Revision de acceso'));

  expect(screen.getByText('Seguimiento de ticket fiscal')).toBeInTheDocument();
  expect(onSelect).toHaveBeenCalledWith(10);
});

test('muestra alerta de recordatorio cuando la conversacion trae latest_reminder', () => {
  const currentUser: User = {
    id: 1,
    name: 'Ana Ramirez',
    email: 'ana@bizdom.test',
  };

  const conversation: Conversation = {
    id: 10,
    subject: 'Revision de acceso',
    status: 'reviewed',
    status_received_at: '2026-04-26T10:00:00.000Z',
    status_reviewed_at: '2026-04-26T10:05:00.000Z',
    last_message_at: '2026-04-26T10:10:00.000Z',
    last_reminder_at: '2026-04-26T10:15:00.000Z',
    is_unread: false,
    participants: [
      currentUser,
      {
        id: 2,
        name: 'Bob Lopez',
        email: 'bob@bizdom.test',
      },
    ],
    messages: [],
    latest_reminder: {
      id: 5,
      type: 'auto_overdue',
      sent_at: '2026-04-26T10:15:00.000Z',
      sent_by: currentUser,
    },
    created_at: '2026-04-26T10:00:00.000Z',
  };

  render(
    <LanguageProvider>
      <ConversationThread
        conversation={conversation}
        currentUser={currentUser}
        onReply={() => Promise.resolve()}
        onUpdateStatus={() => Promise.resolve()}
      />
    </LanguageProvider>,
  );

  expect(screen.getByRole('status')).toHaveTextContent('Reminder');
  expect(screen.getByRole('status')).toHaveTextContent('Automatic reminder sent by the system');
});
