import { FormEvent, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../../components/Button';
import { Input } from '../../../components/Input';
import { useAuth } from '../../../context/AuthContext';
import * as usersApi from '../../../api/usersApi';
import type { User } from '../types';

type Props = {
  onClose: () => void;
  onCreate: (payload: { subject: string; body: string; participant_ids: number[] }) => Promise<void>;
};

export function NewConversationModal({ onClose, onCreate }: Props) {
  const { token } = useAuth();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    usersApi
      .getUsers(token)
      .then((response) => {
        if (!isMounted) return;
        setUsers(response.data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'No fue posible cargar destinatarios.');
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (selectedUserIds.length === 0) return;
    setIsSaving(true);
    setError(null);

    try {
      await onCreate({
        subject,
        body,
        participant_ids: selectedUserIds,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible crear el hilo.');
    } finally {
      setIsSaving(false);
    }
  }

  function toggleUserSelection(userId: number) {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-message-title">
        <header className="modal-header">
          <h2 id="new-message-title">Nuevo mensaje</h2>
          <Button variant="ghost" type="button" onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </Button>
        </header>
        <form className="modal-form" onSubmit={handleSubmit}>
          <Input label="Asunto" value={subject} onChange={(event) => setSubject(event.target.value)} required />
          <div className="field">
            <span>Para</span>
            <div className="recipients-list">
              {users.length === 0 ? (
                <p className="loading-text">Cargando contactos...</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="recipient-checkbox">
                    <input
                      id={`recipient-${user.id}`}
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                    <label htmlFor={`recipient-${user.id}`}> 
                      <span className="recipient-name">{user.name}</span>
                      <span className="recipient-id">- ID {user.id}</span>
                    </label>
                  </div>
                ))
              )}
            </div>
            {selectedUserIds.length > 0 && (
              <p className="selected-count">
                {selectedUserIds.length}{' '}
                {selectedUserIds.length === 1 ? 'destinatario seleccionado' : 'destinatarios seleccionados'}
              </p>
            )}
          </div>
          <label className="field" htmlFor="message-body">
            <span>Mensaje</span>
            <textarea
              id="message-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={6}
              required
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Enviando' : 'Enviar mensaje'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
