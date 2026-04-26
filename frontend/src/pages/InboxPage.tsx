import { useState } from 'react';
import { LogOut, MailPlus, Moon, Search, Sun } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { ConversationList } from '../features/inbox/components/ConversationList';
import { ConversationThread } from '../features/inbox/components/ConversationThread';
import { NewConversationModal } from '../features/inbox/components/NewConversationModal';
import { useConversations } from '../features/inbox/hooks/useConversations';

type InboxPageProps = {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
};

export function InboxPage({ theme, onToggleTheme }: InboxPageProps) {
  const { user, token, signOut } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inbox = useConversations(token);

  if (!user) return null;

  return (
    <main className="inbox-page">
      <header className="topbar">
        <div className="brand">
          <span className="logo-mark">B</span>
          <span>BIZDOM Inbox</span>
        </div>

        <label className="search-box" htmlFor="search">
          <Search size={18} aria-hidden="true" />
          <input
            id="search"
            value={inbox.search}
            onChange={(event) => inbox.setSearch(event.target.value)}
            placeholder="Buscar conversaciones"
          />
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={inbox.unreadOnly}
            onChange={(event) => inbox.setUnreadOnly(event.target.checked)}
          />
          <span className="toggle-text">
            No leídos
            {inbox.unreadCount > 0 && (
              <span className="unread-count-badge">{inbox.unreadCount}</span>
            )}
          </span>
        </label>

        <Button
          type="button"
          variant="ghost"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
        >
          {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
        </Button>

        <Button
          type="button"
          variant="primary"
          className="new-message-button"
          onClick={() => setIsModalOpen(true)}
        >
          <MailPlus size={18} aria-hidden="true" />
          Nuevo mensaje
        </Button>

        <div className="topbar-right">
          <Button
            type="button"
            variant="ghost"
            className="logout-button"
            onClick={signOut}
            aria-label="Cerrar sesion"
          >
            <LogOut size={18} aria-hidden="true" />
          </Button>
        </div>
      </header>

      {inbox.error && <p className="page-error">{inbox.error}</p>}

      <div className="inbox-shell">
        <aside className="sidebar" aria-label="Conversaciones">
          <ConversationList
            conversations={inbox.conversations}
            selectedId={inbox.selectedConversation?.id}
            isLoading={inbox.isLoading}
            onSelect={inbox.openConversation}
            hasMore={inbox.hasMoreConversations}
            onLoadMore={inbox.loadMoreConversations}
          />
        </aside>
        <ConversationThread conversation={inbox.selectedConversation} currentUser={user} onReply={inbox.sendReply} />
      </div>

      {isModalOpen && (
        <NewConversationModal
          onClose={() => setIsModalOpen(false)}
          onCreate={inbox.createConversation}
        />
      )}
    </main>
  );
}
