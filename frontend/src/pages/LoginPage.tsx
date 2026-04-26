import { FormEvent, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

type LoginPageProps = {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
};

export function LoginPage({ theme, onToggleTheme }: LoginPageProps) {
  const { signIn } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [email, setEmail] = useState('ana@bizdom.test');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.signInError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-topbar">
        <div className="login-wordmark">
          <span className="brand-name">BIZDOM Inbox</span>
        </div>

        <div className="login-actions">
          <Button
            type="button"
            variant="ghost"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
          >
            {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </Button>
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        className={`theme-toggle login-language-toggle ${language === 'en' ? 'is-english' : ''}`}
        onClick={toggleLanguage}
        aria-label={t('common.language')}
      >
        {language.toUpperCase()}
      </Button>

      <div className="login-shell">
        <form className="login-panel" onSubmit={handleSubmit}>
          <h1>{t('auth.welcomeTitle')}</h1>
          <p className="login-subtitle">{t('auth.welcomeSubtitle')}</p>
          <Input
            label={t('auth.emailLabel')}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            label={t('auth.passwordLabel')}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('auth.signingIn') : t('auth.signIn')}
          </Button>
        </form>
      </div>
    </main>
  );
}
