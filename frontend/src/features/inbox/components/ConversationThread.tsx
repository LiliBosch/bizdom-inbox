import { EmptyState } from '../../../components/EmptyState';
import type { Conversation, TicketStatus, User } from '../types';
import { MessageBubble } from './MessageBubble';
import { ReplyBox } from './ReplyBox';
import { useLanguage } from '../../../context/LanguageContext';
import { TicketStatusBadge } from './TicketStatusBadge';

type Props = {
  conversation: Conversation | null;
  currentUser: User;
  onReply: (body: string, attachments?: File[]) => Promise<void>;
  onUpdateStatus: (conversationId: number, status: TicketStatus) => Promise<void>;
};

export function ConversationThread({ conversation, currentUser, onReply, onUpdateStatus }: Props) {
  const { t } = useLanguage();

  if (!conversation) {
    return <EmptyState title={t('thread.selectTitle')} text="" />;
  }

  const fallbackSender = conversation.participants.find((participant) => participant.id !== currentUser.id) ?? currentUser;
  const sender = conversation.messages?.[0]?.sender ?? fallbackSender;
  const recipientNames = conversation.participants
    .filter((participant) => participant.id !== sender.id)
    .map((participant) => (participant.id === currentUser.id ? t('thread.me') : participant.name))
    .join(', ');
  const avatarName = sender.name;
  const avatarInitials = avatarName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const statusTimestamp =
    conversation.status === 'resolved'
      ? conversation.status_resolved_at
      : conversation.status === 'in_progress'
        ? conversation.status_in_progress_at
        : conversation.status === 'reviewed'
          ? conversation.status_reviewed_at
          : conversation.status_received_at;
  const statusLabel =
    conversation.status === 'resolved'
      ? t('ticketStatus.resolvedAt')
      : conversation.status === 'in_progress'
        ? t('ticketStatus.inProgressAt')
        : conversation.status === 'reviewed'
          ? t('ticketStatus.reviewedAt')
          : t('ticketStatus.receivedAt');

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
            <div className="thread-reminder-alert-header">
              <strong>{t('conversation.reminderBadge')}</strong>
              <span>
                {t('conversation.reminderSent', {
                  time: new Date(conversation.latest_reminder.sent_at).toLocaleString(),
                })}
              </span>
            </div>
            {conversation.latest_reminder.type === 'auto_overdue' && (
              <p>
                {t('conversation.reminderAutomatic')}. {t('conversation.reminderReason')}
              </p>
            )}
          </div>
        )}
        <div className="thread-title-block">
          <div className="thread-subject-line">
            <h1>{conversation.subject}</h1>
          </div>
          <div className="thread-mail-meta">
            <span className="thread-avatar" aria-hidden="true">
              {avatarInitials}
            </span>
            <div className="thread-mail-copy">
              <strong>{sender.name}</strong>
              <span>
                {t('thread.toLabel')}: {recipientNames}
              </span>
            </div>
            {statusTimestamp && (
              <time className="thread-mail-date" dateTime={statusTimestamp}>
                {statusLabel} {new Date(statusTimestamp).toLocaleString()}
              </time>
            )}
          </div>
        </div>
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
