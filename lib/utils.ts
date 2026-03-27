import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TOKEN_STORAGE_KEYS = ['access_token', 'token', 'jwt', 'auth_token', 'jwt_token'];
const MANUAL_DEV_TOKEN_KEY = 'manual_dev_auth_token';

function normalizeToken(rawToken: string | null | undefined) {
  if (!rawToken) return null;
  const trimmed = rawToken.trim();
  if (!trimmed) return null;
  const withoutBearer = trimmed.replace(/^Bearer\s+/i, '');
  if (withoutBearer.startsWith('{') && withoutBearer.endsWith('}')) {
    try {
      const parsed = JSON.parse(withoutBearer) as Record<string, unknown>;
      for (const key of TOKEN_STORAGE_KEYS) {
        const value = parsed[key];
        if (typeof value === 'string' && value.trim()) {
          return value.trim().replace(/^Bearer\s+/i, '');
        }
      }
    } catch {
      return withoutBearer;
    }
  }
  return withoutBearer;
}

function getTokenFromCookies() {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie ? document.cookie.split(';') : [];
  for (const part of cookies) {
    const [name, ...rest] = part.trim().split('=');
    if (!name || !TOKEN_STORAGE_KEYS.includes(name)) continue;
    const value = rest.join('=');
    const decoded = decodeURIComponent(value);
    const token = normalizeToken(decoded);
    if (token) return token;
  }
  return null;
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  for (const key of TOKEN_STORAGE_KEYS) {
    const token = normalizeToken(window.localStorage.getItem(key));
    if (token) return token;
  }
  for (const key of TOKEN_STORAGE_KEYS) {
    const token = normalizeToken(window.sessionStorage.getItem(key));
    if (token) return token;
  }
  const cookieToken = getTokenFromCookies();
  if (cookieToken) return cookieToken;
  const manualDevToken = normalizeToken(window.localStorage.getItem(MANUAL_DEV_TOKEN_KEY));
  if (manualDevToken) return manualDevToken;
  return normalizeToken(process.env.NEXT_PUBLIC_AUTH_TOKEN ?? null);
}

export function getStoredManualAuthToken() {
  if (typeof window === 'undefined') return '';
  return normalizeToken(window.localStorage.getItem(MANUAL_DEV_TOKEN_KEY)) ?? '';
}

export function setManualAuthToken(token: string) {
  if (typeof window === 'undefined') return;
  const normalized = normalizeToken(token);
  if (!normalized) {
    window.localStorage.removeItem(MANUAL_DEV_TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(MANUAL_DEV_TOKEN_KEY, normalized);
}

export function clearManualAuthToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MANUAL_DEV_TOKEN_KEY);
}

export function getAuthHeaders(extraHeaders: HeadersInit = {}) {
  const token = getAuthToken();
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
