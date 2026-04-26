import type { Conversation } from '../types';
import { useLanguage } from '../../../context/LanguageContext';
import type { Language } from '../../../i18n/translations';

type SlaLevel = 'normal' | 'warning' | 'overdue';

function formatRelativeTime(date: Date, language: Language) {
  const diffInSeconds = (date.getTime() - Date.now()) / 1000;
  const formatter = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });

  const divisions: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: 'second' },
    { amount: 60, unit: 'minute' },
    { amount: 24, unit: 'hour' },
    { amount: 7, unit: 'day' },
    { amount: 4.34524, unit: 'week' },
    { amount: 12, unit: 'month' },
    { amount: Number.POSITIVE_INFINITY, unit: 'year' },
  ];

  let duration = diffInSeconds;

  for (const division of divisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
    }

    duration /= division.amount;
  }

  return formatter.format(Math.round(duration), 'year');
}

function getSlaLevel(date: Date): SlaLevel {
  const diffMinutes = (Date.now() - date.getTime()) / 60000;
  if (diffMinutes <= 30) return 'normal';
  if (diffMinutes <= 120) return 'warning';
  return 'overdue';
}

type Props = {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
};

export function ConversationItem({ conversation, isActive, onSelect }: Props) {
  const { t, language } = useLanguage();
  const lastMessage = conversation.messages?.[0]?.body ?? t('conversation.noMessagesYet');
  const isUnread = Boolean(conversation.is_unread);

  let slaLevel: SlaLevel = 'normal';
  let slaLabel = t('conversation.lastMessageUnknown');
  let reminderLabel: string | null = null;

  if (conversation.last_message_at) {
    const lastMessageDate = new Date(conversation.last_message_at);
    if (!Number.isNaN(lastMessageDate.getTime())) {
      slaLevel = getSlaLevel(lastMessageDate);
      const relative = formatRelativeTime(lastMessageDate, language);
      slaLabel = t('conversation.lastMessage', { time: relative });
    }
  }

  if (conversation.latest_reminder?.sent_at) {
    const reminderDate = new Date(conversation.latest_reminder.sent_at);
    if (!Number.isNaN(reminderDate.getTime())) {
      reminderLabel = `${t('conversation.reminderBadge')}: ${t('conversation.reminderSent', { time: formatRelativeTime(reminderDate, language) })}`;
    }
  }

  return (
    <button
      className={`conversation-item ${isActive ? 'is-active' : ''} ${isUnread ? 'is-unread' : ''}`}
      onClick={onSelect}
      type="button"
      aria-pressed={isActive}
    >
      <span className="conversation-row">
        <strong>{conversation.subject}</strong>
        {conversation.is_unread && (
          <span className="unread-dot" role="status" title={t('conversation.unreadAria')}>
            <span className="sr-only">{t('conversation.unreadAria')}</span>
          </span>
        )}
      </span>
      <span className="conversation-meta">
        <span className={`sla-indicator sla-${slaLevel}`} aria-hidden="true" />
        <span className="sla-text">{slaLabel}</span>
      </span>
      {reminderLabel && <span className="conversation-reminder-meta">{reminderLabel}</span>}
      <span className="conversation-preview">{lastMessage}</span>
    </button>
  );
}
