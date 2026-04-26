import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '../../../components/Button';
import { useLanguage } from '../../../context/LanguageContext';

function getLocalStorageItem(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setLocalStorageItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function removeLocalStorageItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function ReplyBox({
  conversationId,
  onSubmit,
}: {
  conversationId: number;
  onSubmit: (body: string) => Promise<void>;
}) {
  const { t } = useLanguage();
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftKey = useMemo(() => `replyDraft:${conversationId}`, [conversationId]);

  useEffect(() => {
    const draft = getLocalStorageItem(draftKey);
    setBody(draft ?? '');
  }, [draftKey]);

  useEffect(() => {
    const trimmed = body.trim();
    const timeout = window.setTimeout(() => {
      if (!trimmed) {
        removeLocalStorageItem(draftKey);
        return;
      }

      setLocalStorageItem(draftKey, body);
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [body, draftKey]);

  function clearDraft() {
    setBody('');
    removeLocalStorageItem(draftKey);
  }

  async function sendReply() {
    if (!body.trim()) return;

    setIsSending(true);
    setError(null);

    try {
      await onSubmit(body.trim());
      setBody('');
      removeLocalStorageItem(draftKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('composer.sendError'));
    } finally {
      setIsSending(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await sendReply();
  }

  return (
    <form className="reply-box" onSubmit={handleSubmit}>
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return;
          if (isSending) return;

          const isMac = navigator.platform.toLowerCase().includes('mac');
          const isModKey = isMac ? event.metaKey : event.ctrlKey;

          const isEnter = event.key === 'Enter';
          const isShiftEnter = isEnter && event.shiftKey;
          const isModEnter = isEnter && isModKey;

          if (isShiftEnter) return;

          if (isModEnter || isEnter) {
            event.preventDefault();
            void sendReply();
            return;
          }
        }}
        placeholder={t('composer.placeholder')}
        rows={4}
      />
      {error && <p className="form-error">{error}</p>}
      <div className="reply-box-actions">
        <Button
          disabled={isSending || !body.trim()}
          type="button"
          variant="ghost"
          onClick={clearDraft}
        >
          {t('composer.clearDraft')}
        </Button>
        <Button disabled={isSending || !body.trim()} type="submit">
          <Send size={18} aria-hidden="true" />
          {isSending ? t('composer.sending') : t('composer.send')}
        </Button>
      </div>
    </form>
  );
}
