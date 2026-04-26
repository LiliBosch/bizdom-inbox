import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { usersApiMock } from '../../../test/apiMocks';
import { bobUser, carlaUser } from '../../../test/factories';
import { renderWithProviders } from '../../../test/render';
import { NewConversationModal } from './NewConversationModal';

test('selecciona destinatarios, valida campos y envia la conversacion', async () => {
  const onClose = vi.fn();
  const onCreate = vi.fn().mockResolvedValue(undefined);
  usersApiMock.getUsers.mockResolvedValue({ data: [bobUser, carlaUser] });

  renderWithProviders(<NewConversationModal onClose={onClose} onCreate={onCreate} />);

  const submitButton = screen.getByRole('button', { name: 'Send message' });
  expect(screen.getByLabelText('Subject')).toHaveFocus();
  expect(submitButton).toBeDisabled();

  fireEvent.change(screen.getByLabelText('Subject'), {
    target: { value: '  Seguimiento SAT  ' },
  });
  fireEvent.change(screen.getByLabelText('Message'), {
    target: { value: '  Necesito revisar el caso.  ' },
  });

  expect(submitButton).toBeDisabled();

  const bobCheckbox = await screen.findByLabelText(/Bob Lopez/);
  fireEvent.click(bobCheckbox);

  expect(bobCheckbox).toBeChecked();
  expect(screen.getByText('1 recipient selected')).toBeInTheDocument();
  expect(submitButton).toBeEnabled();

  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(onCreate).toHaveBeenCalledWith({
      subject: 'Seguimiento SAT',
      body: 'Necesito revisar el caso.',
      participant_ids: [bobUser.id],
    });
  });
  expect(onClose).toHaveBeenCalled();
});

test('cierra el modal con Escape', async () => {
  const onClose = vi.fn();
  usersApiMock.getUsers.mockResolvedValue({ data: [bobUser] });

  renderWithProviders(<NewConversationModal onClose={onClose} onCreate={vi.fn()} />);

  expect(await screen.findByLabelText(/Bob Lopez/)).toBeInTheDocument();

  fireEvent.keyDown(window, { key: 'Escape' });

  expect(onClose).toHaveBeenCalled();
});
