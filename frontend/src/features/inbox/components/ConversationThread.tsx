import { EmptyState } from '../../../components/EmptyState';
import type { Conversation, User } from '../types';
import { MessageBubble } from './MessageBubble';
import { ReplyBox } from './ReplyBox';
import { useLanguage } from '../../../context/LanguageContext';

type Props = {
  conversation: Conversation | null;
  currentUser: User;
  onReply: (body: string) => Promise<void>;
};

export function ConversationThread({ conversation, currentUser, onReply }: Props) {
  const { t } = useLanguage();

  if (!conversation) {
    return <EmptyState title={t('thread.selectTitle')} text="" />;
  }

  return (
    <section className="thread" aria-label={t('thread.aria')}>
      <header className="thread-header">
        <span>{t('thread.subjectLabel')}</span>
        <h1>{conversation.subject}</h1>
        <p>
          {t('thread.recipientsLabel')}: 
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
