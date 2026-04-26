import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/authApi';
import type { User } from '../features/inbox/types';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(() => localStorage.getItem('bizdom_inbox_token'));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('bizdom_inbox_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      localStorage.removeItem('bizdom_inbox_user');
      localStorage.removeItem('bizdom_inbox_token');
      return null;
    }
  });

  async function signIn(email: string, password: string) {
    const response = await authApi.login(email, password);
    localStorage.setItem('bizdom_inbox_token', response.token);
    localStorage.setItem('bizdom_inbox_user', JSON.stringify(response.user));
    setToken(response.token);
    setUser(response.user);
  }

  async function signOut() {
    if (token) {
      await authApi.logout(token).catch(() => undefined);
    }
    localStorage.removeItem('bizdom_inbox_token');
    localStorage.removeItem('bizdom_inbox_user');
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    function handleUnauthorized() {
      void signOut();
    }

    window.addEventListener('bizdom:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('bizdom:unauthorized', handleUnauthorized);
  }, [token]);

  const value = useMemo(() => ({ user, token, signIn, signOut }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
