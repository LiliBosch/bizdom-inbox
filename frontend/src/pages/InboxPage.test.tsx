import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { InboxPage } from './InboxPage';
import { conversationsApiMock } from '../test/apiMocks';
import { makeConversation, paginatedConversations } from '../test/factories';
import { renderWithProviders } from '../test/render';

test('actualiza busqueda y filtro de no leidos', async () => {
  conversationsApiMock.getConversations.mockResolvedValue(
    paginatedConversations([
      makeConversation({ id: 10, subject: 'Revision de acceso' }),
    ]),
  );
  conversationsApiMock.getUnreadCount.mockResolvedValue({ unread_count: 3 });

  renderWithProviders(<InboxPage theme="light" onToggleTheme={vi.fn()} />);

  expect(await screen.findByText('Revision de acceso')).toBeInTheDocument();

  fireEvent.change(screen.getByPlaceholderText('Search conversations'), {
    target: { value: 'sat' },
  });

  await waitFor(() => {
    expect(conversationsApiMock.getConversations).toHaveBeenLastCalledWith(
      'test-token',
      expect.objectContaining({ search: 'sat' }),
    );
  });

  fireEvent.click(screen.getByRole('checkbox'));

  await waitFor(() => {
    expect(conversationsApiMock.getConversations).toHaveBeenLastCalledWith(
      'test-token',
      expect.objectContaining({ search: 'sat', unread: true }),
    );
  });
});
