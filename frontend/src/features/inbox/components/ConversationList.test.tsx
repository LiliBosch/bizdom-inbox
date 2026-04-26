import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ConversationList } from './ConversationList';

test('muestra estado vacio cuando no hay conversaciones', () => {
  render(<ConversationList conversations={[]} isLoading={false} onSelect={() => undefined} />);

  expect(screen.getByText('Sin conversaciones')).toBeInTheDocument();
});
