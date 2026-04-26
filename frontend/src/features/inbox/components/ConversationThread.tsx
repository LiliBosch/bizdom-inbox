import { EmptyState } from '../../../components/EmptyState';
import type { Conversation, TicketStatus, User } from '../types';
import { MessageBubble } from './MessageBubble';
import { ReplyBox } from './ReplyBox';
import { useLanguage } from '../../../context/LanguageContext';
import { TicketStatusBadge } from './TicketStatusBadge';

type Props = {
  conversation: Conversation | null;
  currentUser: User;
  onReply: (body: string) => Promise<void>;
  onUpdateStatus: (conversationId: number, status: TicketStatus) => Promise<void>;
};

export function ConversationThread({ conversation, currentUser, onReply, onUpdateStatus }: Props) {
  const { t } = useLanguage();

  if (!conversation) {
    return <EmptyState title={t('thread.selectTitle')} text="" />;
  }

  return (
    <section className="thread" aria-label={t('thread.aria')}>
      <header className="thread-header">
        <div className="thread-header-row">
          <TicketStatusBadge status={conversation.status} />
          <label className="thread-status" aria-label={t('ticketStatus.label')}>
            <select
              value={conversation.status}
              onChange={(event) => onUpdateStatus(conversation.id, event.target.value as TicketStatus)}
            >
              <option value="received">{t('ticketStatus.received')}</option>
              <option value="reviewed">{t('ticketStatus.reviewed')}</option>
              <option value="in_progress">{t('ticketStatus.inProgress')}</option>
              <option value="resolved">{t('ticketStatus.resolved')}</option>
            </select>
          </label>
        </div>
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
