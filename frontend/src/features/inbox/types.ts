export type User = {
  id: number;
  name: string;
  email: string;
};

export type Message = {
  id: number;
  body: string;
  sender: User;
  created_at: string;
};

export type Conversation = {
  id: number;
  subject: string;
  last_message_at: string | null;
  is_unread: boolean;
  participants: User[];
  messages?: Message[];
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
