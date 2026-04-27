import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Paperclip, Send, X } from 'lucide-react';
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
    return;
  }
}

function removeLocalStorageItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    return;
  }
}

export function ReplyBox({
  conversationId,
  onSubmit,
}: {
  conversationId: number;
  onSubmit: (body: string, attachments?: File[]) => Promise<void>;
}) {
  const { t } = useLanguage();
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const draftKey = useMemo(() => `replyDraft:${conversationId}`, [conversationId]);
  const canSubmit = body.trim() !== '' || attachments.length > 0;

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
    setAttachments([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    removeLocalStorageItem(draftKey);
  }

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setAttachments((current) => [...current, ...files].slice(0, 5));
    event.target.value = '';
  }

  function removeAttachment(index: number) {
    setAttachments((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function sendReply() {
    if (!canSubmit) return;

    setIsSending(true);
    setError(null);

    try {
      await onSubmit(body.trim(), attachments);
      setBody('');
      setAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      <div className="reply-attachments">
        <input
          ref={fileInputRef}
          id={`reply-attachments-${conversationId}`}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.txt,.csv,.doc,.docx,.xls,.xlsx"
          onChange={handleAttachmentChange}
          aria-label={t('composer.attachFiles')}
        />
        <Button
          disabled={isSending || attachments.length >= 5}
          type="button"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip size={18} aria-hidden="true" />
          {t('composer.attach')}
        </Button>
        {attachments.length > 0 && (
          <ul className="attachment-list" aria-label={t('composer.selectedAttachments')}>
            {attachments.map((attachment, index) => (
              <li key={`${attachment.name}-${attachment.size}-${index}`}>
                <span>{attachment.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  aria-label={t('composer.removeAttachment', { name: attachment.name })}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="reply-box-actions">
        <Button
          disabled={isSending || !canSubmit}
          type="button"
          variant="ghost"
          onClick={clearDraft}
        >
          {t('composer.clearDraft')}
        </Button>
        <Button disabled={isSending || !canSubmit} type="submit">
          <Send size={18} aria-hidden="true" />
          {isSending ? t('composer.sending') : t('composer.send')}
        </Button>
      </div>
    </form>
  );
}
