import { EmptyState } from '../../../components/EmptyState';
import type { Conversation, User } from '../types';
import { MessageBubble } from './MessageBubble';
import { ReplyBox } from './ReplyBox';

type Props = {
  conversation: Conversation | null;
  currentUser: User;
  onReply: (body: string) => Promise<void>;
};

export function ConversationThread({ conversation, currentUser, onReply }: Props) {
  if (!conversation) {
    return <EmptyState title="Selecciona una conversacion" text="" />;
  }

  return (
    <section className="thread" aria-label="Area de lectura y redaccion">
      <header className="thread-header">
        <span>Asunto del mensaje</span>
        <h1>{conversation.subject}</h1>
        <p>
          Destinatarios:{' '}
          {conversation.participants
            .filter((participant) => participant.id !== currentUser.id)
            .map((participant) => participant.name)
            .join(', ')}
        </p>
      </header>

      <div className="messages">
        {(conversation.messages ?? []).map((message) => (
          <MessageBubble key={message.id} message={message} currentUser={currentUser} />
        ))}
      </div>

      <ReplyBox onSubmit={onReply} />
    </section>
  );
}
