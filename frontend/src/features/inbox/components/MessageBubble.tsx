import type { Message, User } from '../types';

export function MessageBubble({ message, currentUser }: { message: Message; currentUser: User }) {
  const isOwn = message.sender.id === currentUser.id;

  return (
    <article className={`message ${isOwn ? 'message-own' : ''}`}>
      <div className="message-meta">
        <strong>{isOwn ? 'Tu' : message.sender.name}</strong>
        <time dateTime={message.created_at}>
          {new Intl.DateTimeFormat('es-MX', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(new Date(message.created_at))}
        </time>
      </div>
      <p>{message.body}</p>
    </article>
  );
}
