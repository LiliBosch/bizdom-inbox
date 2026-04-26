export type User = {
  id: number;
  name: string;
  email: string;
};

export type TicketStatus = 'received' | 'reviewed' | 'in_progress' | 'resolved';

export type MessageReceipt = {
  user: User;
  delivered_at: string | null;
  read_at: string | null;
};

export type Message = {
  id: number;
  body: string;
  sender: User;
  receipts?: MessageReceipt[];
  created_at: string;
};

export type ConversationReminder = {
  id: number;
  type: string;
  sent_at: string | null;
  sent_by?: User | null;
};

export type Conversation = {
  id: number;
  subject: string;
  status: TicketStatus;
  status_received_at?: string | null;
  status_reviewed_at?: string | null;
  status_in_progress_at?: string | null;
  status_resolved_at?: string | null;
  last_message_at: string | null;
  last_reminder_at?: string | null;
  is_unread: boolean;
  participants: User[];
  messages?: Message[];
  latest_reminder?: ConversationReminder | null;
  created_at: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
};
