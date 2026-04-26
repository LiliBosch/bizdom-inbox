import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ConversationList } from './ConversationList';
import { LanguageProvider } from '../../../context/LanguageContext';

test('muestra estado vacio cuando no hay conversaciones', () => {
  render(
    <LanguageProvider>
      <ConversationList conversations={[]} isLoading={false} onSelect={() => undefined} />
    </LanguageProvider>,
  );

  expect(screen.getByText('No conversations')).toBeInTheDocument();
});
