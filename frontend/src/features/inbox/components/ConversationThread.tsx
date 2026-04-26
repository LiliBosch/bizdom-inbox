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
              value={conversation.status === 'in_progress' || conversation.status === 'resolved' ? conversation.status : ''}
              onChange={(event) => onUpdateStatus(conversation.id, event.target.value as TicketStatus)}
            >
              <option value="" disabled>
                {t('ticketStatus.setStatus')}
              </option>
              <option value="in_progress">{t('ticketStatus.inProgress')}</option>
              <option value="resolved">{t('ticketStatus.resolved')}</option>
            </select>
          </label>
        </div>
        {conversation.latest_reminder?.sent_at && (
          <div className="thread-reminder-alert" role="status">
            <strong>{t('conversation.reminderBadge')}</strong>
            <span>
              {t('conversation.reminderSent', {
                time: new Date(conversation.latest_reminder.sent_at).toLocaleString(),
              })}
              {conversation.latest_reminder.type === 'auto_overdue' && ` - ${t('conversation.reminderAutomatic')}`}
            </span>
          </div>
        )}
        <div className="thread-status-timestamps">
          {(() => {
            const timestamp =
              conversation.status === 'resolved'
                ? conversation.status_resolved_at
                : conversation.status === 'in_progress'
                  ? conversation.status_in_progress_at
                  : conversation.status === 'reviewed'
                    ? conversation.status_reviewed_at
                    : conversation.status_received_at;

            if (!timestamp) return null;

            const label =
              conversation.status === 'resolved'
                ? t('ticketStatus.resolvedAt')
                : conversation.status === 'in_progress'
                  ? t('ticketStatus.inProgressAt')
                  : conversation.status === 'reviewed'
                    ? t('ticketStatus.reviewedAt')
                    : t('ticketStatus.receivedAt');

            return (
              <span>
                {label} {new Date(timestamp).toLocaleString()}
              </span>
            );
          })()}
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

      <ReplyBox conversationId={conversation.id} onSubmit={onReply} />
    </section>
  );
}
