import { EmptyState } from '../../../components/EmptyState';
import { Button } from '../../../components/Button';
import type { Conversation } from '../types';
import { ConversationItem } from './ConversationItem';

type Props = {
  conversations: Conversation[];
  selectedId?: number;
  isLoading: boolean;
  onSelect: (id: number) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
};

export function ConversationList({ conversations, selectedId, isLoading, onSelect, hasMore, onLoadMore }: Props) {
  if (isLoading) {
    return <EmptyState title="Cargando" text="Estamos buscando tus conversaciones." />;
  }

  if (conversations.length === 0) {
    return <EmptyState title="Sin conversaciones" text="Crea un nuevo mensaje para iniciar un hilo." />;
  }

  return (
    <div className="conversation-list" aria-label="Lista de conversaciones">
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
            Cargar más
          </Button>
        </div>
      )}
    </div>
  );
}
