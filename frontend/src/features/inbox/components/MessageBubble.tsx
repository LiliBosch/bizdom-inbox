import type { Message, User } from '../types';
import { useLanguage } from '../../../context/LanguageContext';

export function MessageBubble({ message, currentUser }: { message: Message; currentUser: User }) {
  const { language } = useLanguage();
  const isOwn = message.sender.id === currentUser.id;

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
      <p>{message.body}</p>
    </article>
  );
}
