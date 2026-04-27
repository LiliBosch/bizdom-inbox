import { useState } from 'react';
import type { Message, User } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import { Paperclip } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { downloadAttachment } from '../../../api/conversationsApi';

export function MessageBubble({ message, currentUser }: { message: Message; currentUser: User }) {
  const { language } = useLanguage();
  const { token } = useAuth();
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const isOwn = message.sender.id === currentUser.id;

  async function handleDownload(url: string, fileName: string) {
    if (!token) return;

    setDownloadError(null);

    try {
      const blob = await downloadAttachment(token, url);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Unable to download attachment.');
    }
  }

  return (
    <article className={`message ${isOwn ? 'message-own' : ''}`}>
      <div className="message-meta">
        <strong>{isOwn ? (language === 'es' ? 'Tu' : 'You') : message.sender.name}</strong>
        <time dateTime={message.created_at}>
          {new Intl.DateTimeFormat(language === 'es' ? 'es-MX' : 'en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(message.created_at))}
        </time>
      </div>
      {message.body && <p>{message.body}</p>}
      {message.attachments && message.attachments.length > 0 && (
        <ul className="message-attachments" aria-label={language === 'es' ? 'Archivos adjuntos' : 'Attachments'}>
          {message.attachments.map((attachment) => (
            <li key={attachment.id}>
              <button type="button" onClick={() => void handleDownload(attachment.url, attachment.original_name)}>
                <Paperclip size={14} aria-hidden="true" />
                {attachment.original_name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {downloadError && <p className="message-download-error">{downloadError}</p>}
    </article>
  );
}
