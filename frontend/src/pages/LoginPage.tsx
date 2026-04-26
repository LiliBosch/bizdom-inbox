import { FormEvent, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../context/AuthContext';

type LoginPageProps = {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
};

export function LoginPage({ theme, onToggleTheme }: LoginPageProps) {
  const { signIn } = useAuth();
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
      setError(err instanceof Error ? err.message : 'No fue posible iniciar sesion.');
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
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </Button>
        </div>
      </div>

      <div className="login-shell">
        <form className="login-panel" onSubmit={handleSubmit}>
          <h1>Bienvenido</h1>
          <p className="login-subtitle">Ingresa tus credenciales para continuar.</p>
          <Input
            label="Correo"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            label="Contrasena"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Entrando' : 'Entrar'}
          </Button>
        </form>
      </div>
    </main>
  );
}
