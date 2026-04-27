const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

type RequestOptions = RequestInit & {
  token?: string | null;
};

export async function http<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('bizdom_inbox_token');
    localStorage.removeItem('bizdom_inbox_user');
    window.dispatchEvent(new CustomEvent('bizdom:unauthorized'));
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message ?? (response.status === 401 ? 'Session expired. Please sign in again.' : 'Unable to complete the request.'));
  }

  return response.json() as Promise<T>;
}
