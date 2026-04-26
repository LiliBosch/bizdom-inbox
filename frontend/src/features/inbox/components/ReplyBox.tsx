import { FormEvent, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../../../components/Button';

export function ReplyBox({ onSubmit }: { onSubmit: (body: string) => Promise<void> }) {
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      await onSubmit(body.trim());
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible enviar la respuesta.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form className="reply-box" onSubmit={handleSubmit}>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Escribe tu respuesta..."
        rows={4}
      />
      {error && <p className="form-error">{error}</p>}
      <Button disabled={isSending || !body.trim()} type="submit">
        <Send size={18} aria-hidden="true" />
        {isSending ? 'Enviando' : 'Enviar'}
      </Button>
    </form>
  );
}
