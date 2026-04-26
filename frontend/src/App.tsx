import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';
import { InboxPage } from './pages/InboxPage';
import { LoginPage } from './pages/LoginPage';

type Theme = 'light' | 'dark';

export function App() {
  const { user } = useAuth();

  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('bizdom_inbox_theme');
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('theme-dark', theme === 'dark');
    localStorage.setItem('bizdom_inbox_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current: Theme) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return user ? (
    <InboxPage theme={theme} onToggleTheme={toggleTheme} />
  ) : (
    <LoginPage theme={theme} onToggleTheme={toggleTheme} />
  );
}
