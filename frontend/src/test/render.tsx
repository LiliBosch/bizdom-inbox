import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import type { User } from '../features/inbox/types';
import { currentUser } from './factories';

type Options = Omit<RenderOptions, 'wrapper'> & {
  token?: string;
  user?: User | null;
};

export function renderWithProviders(
  ui: ReactElement,
  { token = 'test-token', user = currentUser, ...options }: Options = {},
) {
  localStorage.clear();

  if (user) {
    localStorage.setItem('bizdom_inbox_token', token);
    localStorage.setItem('bizdom_inbox_user', JSON.stringify(user));
  }

  return render(ui, {
    wrapper: ({ children }) => (
      <LanguageProvider>
        <AuthProvider>{children}</AuthProvider>
      </LanguageProvider>
    ),
    ...options,
  });
}
