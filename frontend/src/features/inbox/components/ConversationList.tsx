import { EmptyState } from '../../../components/EmptyState';
import { Button } from '../../../components/Button';
import type { Conversation } from '../types';
import { ConversationItem } from './ConversationItem';
import { useLanguage } from '../../../context/LanguageContext';

type Props = {
  conversations: Conversation[];
  selectedId?: number;
  isLoading: boolean;
  onSelect: (id: number) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
};

export function ConversationList({ conversations, selectedId, isLoading, onSelect, hasMore, onLoadMore }: Props) {
  const { t } = useLanguage();

  if (isLoading) {
    return <EmptyState title={t('list.loadingTitle')} text={t('list.loadingText')} />;
  }

  if (conversations.length === 0) {
    return <EmptyState title={t('list.emptyTitle')} text={t('list.emptyText')} />;
  }

  return (
    <div className="conversation-list" aria-label={t('list.aria')}>
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === selectedId}
          onSelect={() => onSelect(conversation.id)}
        />
      ))}

      {hasMore && onLoadMore && (
        <div style={{ padding: '12px' }}>
          <Button type="button" variant="ghost" onClick={onLoadMore} style={{ width: '100%' }}>
            {t('list.loadMore')}
          </Button>
        </div>
      )}
    </div>
  );
}
