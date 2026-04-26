import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { resetApiMocks } from './apiMocks';

vi.mock('../api/conversationsApi', async () => {
  const { conversationsApiMock } = await import('./apiMocks');

  return conversationsApiMock;
});

vi.mock('../api/usersApi', async () => {
  const { usersApiMock } = await import('./apiMocks');

  return usersApiMock;
});

const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    clear: () => {
      store = {};
    },
    getItem: (key: string) => store[key] ?? null,
    key: (index: number) => Object.keys(store)[index] ?? null,
    removeItem: (key: string) => {
      delete store[key];
    },
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    get length() {
      return Object.keys(store).length;
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: localStorageMock,
});

Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: localStorageMock,
});

afterEach(() => {
  resetApiMocks();
  localStorage.clear();
});
