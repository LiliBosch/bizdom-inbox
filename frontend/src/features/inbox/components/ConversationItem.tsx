import type { Conversation } from '../types';

type Props = {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
};

export function ConversationItem({ conversation, isActive, onSelect }: Props) {
  const lastMessage = conversation.messages?.[0]?.body ?? 'Sin mensajes todavia';
  const isUnread = Boolean(conversation.is_unread);

  return (
    <button
      className={`conversation-item ${isActive ? 'is-active' : ''} ${isUnread ? 'is-unread' : ''}`}
      onClick={onSelect}
      type="button"
      aria-pressed={isActive}
    >
      <span className="conversation-row">
        <strong>{conversation.subject}</strong>
        {conversation.is_unread && <span className="unread-dot" aria-label="No leído" />}
      </span>
      <span className="conversation-preview">{lastMessage}</span>
    </button>
  );
}
