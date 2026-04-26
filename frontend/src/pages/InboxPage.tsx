import { useEffect, useRef, useState } from 'react';
import { LogOut, MailPlus, Moon, Search, Sun } from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { language, toggleLanguage, t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inbox = useConversations(token);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isEditableTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target ? target.isContentEditable : false);

      const isMac = navigator.platform.toLowerCase().includes('mac');
      const isModKey = isMac ? event.metaKey : event.ctrlKey;
      const key = event.key.toLowerCase();
      const isCommandK = isModKey && key === 'k';

      if (isCommandK && !isEditableTarget) {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (event.key === 'Escape') {
        if (isModalOpen) {
          setIsModalOpen(false);
          return;
        }

        if (inbox.search.trim()) {
          inbox.setSearch('');
        }
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [inbox, inbox.search, isModalOpen]);

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
            ref={searchInputRef}
            value={inbox.search}
            onChange={(event) => inbox.setSearch(event.target.value)}
            placeholder={t('inbox.searchPlaceholder')}
          />
        </label>

        <label className="toggle">
          <input
            type="checkbox"
            checked={inbox.unreadOnly}
            onChange={(event) => inbox.setUnreadOnly(event.target.checked)}
          />
          <span className="toggle-text">
            {t('inbox.unreadOnly')}
            {inbox.unreadCount > 0 && (
              <span className="unread-count-badge">{inbox.unreadCount}</span>
            )}
          </span>
        </label>

        <Button
          type="button"
          variant="ghost"
          className="theme-toggle language-toggle"
          onClick={toggleLanguage}
          aria-label={t('common.language')}
        >
          {language.toUpperCase()}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="theme-toggle"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
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
          {t('inbox.newMessage')}
        </Button>

        <div className="topbar-right">
          <Button
            type="button"
            variant="ghost"
            className="logout-button"
            onClick={signOut}
            aria-label={t('inbox.signOut')}
          >
            <LogOut size={18} aria-hidden="true" />
          </Button>
        </div>
      </header>

      {inbox.error && <p className="page-error">{inbox.error}</p>}

      <div className="inbox-shell">
        <aside className="sidebar" aria-label={t('inbox.conversationsAria')}>
          <ConversationList
            conversations={inbox.conversations}
            selectedId={inbox.selectedConversation?.id}
            isLoading={inbox.isLoading}
            onSelect={inbox.openConversation}
            hasMore={inbox.hasMoreConversations}
            onLoadMore={inbox.loadMoreConversations}
          />
        </aside>
        <ConversationThread
          conversation={inbox.selectedConversation}
          currentUser={user}
          onReply={inbox.sendReply}
          onUpdateStatus={inbox.updateConversationStatus}
        />
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
