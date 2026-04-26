import { http } from './http';
import type { User } from '../features/inbox/types';

export function getUsers(token: string) {
  return http<{ data: User[] }>('/users', { token });
}
