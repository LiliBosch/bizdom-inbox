import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { InboxPage } from './InboxPage';
import { conversationsApiMock } from '../test/apiMocks';
import { currentUser, makeConversation, makeMessage, paginatedConversations } from '../test/factories';
import { renderWithProviders } from '../test/render';

test('envia una respuesta y actualiza el hilo visible', async () => {
  const conversation = makeConversation({
    id: 10,
    subject: 'Revision de acceso',
    messages: [
      makeMessage({
        id: 100,
        body: 'Mensaje inicial',
      }),
    ],
  });
  const reply = makeMessage({
    id: 101,
    body: 'Nueva respuesta',
    sender: currentUser,
    attachments: [
      {
        id: 1,
        original_name: 'evidencia.pdf',
        mime_type: 'application/pdf',
        size: 1200,
        url: 'http://localhost:8000/api/messages/101/attachments/1',
      },
    ],
    created_at: '2026-04-26T10:20:00.000Z',
  });
  const attachment = new File(['contenido'], 'evidencia.pdf', { type: 'application/pdf' });

  conversationsApiMock.getConversations.mockResolvedValue(paginatedConversations([conversation]));
  conversationsApiMock.getUnreadCount.mockResolvedValue({ unread_count: 0 });
  conversationsApiMock.getConversation.mockResolvedValue({ data: conversation });
  conversationsApiMock.replyToConversation.mockResolvedValue({ data: reply });

  renderWithProviders(<InboxPage theme="light" onToggleTheme={vi.fn()} />);

  fireEvent.click(await screen.findByText('Revision de acceso'));

  expect(await screen.findByText('Mensaje inicial')).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText('Write your reply'), {
    target: { value: ' Nueva respuesta ' },
  });
  fireEvent.change(screen.getByLabelText('Attach files'), {
    target: { files: [attachment] },
  });

  expect(screen.getByText('evidencia.pdf')).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /Send$/ }));

  await waitFor(() => {
    expect(conversationsApiMock.replyToConversation).toHaveBeenCalledWith(
      'test-token',
      10,
      'Nueva respuesta',
      [attachment],
    );
  });

  expect(await screen.findByText('Nueva respuesta')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /evidencia.pdf/ })).toBeInTheDocument();
});
