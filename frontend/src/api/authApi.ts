import { http } from './http';
import type { User } from '../features/inbox/types';

type LoginResponse = {
  token: string;
  user: User;
};

export function login(email: string, password: string) {
  return http<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout(token: string) {
  return http<{ message: string }>('/auth/logout', {
    method: 'POST',
    token,
  });
}
