import { create } from 'zustand';
import { getAuthHeaders } from '@/lib/utils';
import { getUserIdFromToken } from '@/lib/auth';

interface WalletState {
  balance: number;
  isLoading: boolean;
  error: string | null;
  setBalance: (balance: number) => void;
  fetchBalance: () => Promise<void>;
}

interface BalancePayload {
  balance?: number | { chips?: number };
  chips?: number;
  wallet?: {
    chips?: number;
  };
  data?: {
    balance?: number | { chips?: number };
    chips?: number;
    wallet?: {
      chips?: number;
    };
  };
}

const GAMES_API_URL = process.env.NEXT_PUBLIC_GAMES_API_URL || 'http://localhost:3000/api';
const BALANCE_ENDPOINTS = [
  '/wallet/me',
  '/wallet/balance',
  '/wallet/me/balance',
  '/wallet/balance/me',
];

function toValidNumber(value: unknown): number | null {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

function extractBalanceFromPayload(data: BalancePayload | null): number | null {
  if (!data) return null;

  const candidates: Array<unknown> = [
    data.balance,
    data.chips,
    data.wallet?.chips,
    (data.balance as { chips?: number } | undefined)?.chips,
    data.data?.balance,
    data.data?.chips,
    data.data?.wallet?.chips,
    (data.data?.balance as { chips?: number } | undefined)?.chips,
  ];

  for (const candidate of candidates) {
    const value = toValidNumber(candidate);
    if (value !== null) return value;
  }

  return null;
}

function getBalanceEndpoints() {
  if (typeof window === 'undefined') return BALANCE_ENDPOINTS;

  const token = localStorage.getItem('access_token') ?? localStorage.getItem('jwt_token');
  const userId = token ? getUserIdFromToken(token) : localStorage.getItem('user_id');

  if (!userId) return BALANCE_ENDPOINTS;

  return [
    `/wallet/${userId}`,
    `/wallet/${userId}/balance`,
    ...BALANCE_ENDPOINTS,
  ];
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  isLoading: false,
  error: null,
  setBalance: (balance) => set({ balance }),
  fetchBalance: async () => {
    set({ isLoading: true, error: null });
    try {
      const headers = getAuthHeaders();
      let data: BalancePayload | null = null;
      let lastStatus = 0;
      const endpoints = getBalanceEndpoints();
      let unauthorizedDetected = false;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${GAMES_API_URL}${endpoint}`, {
            headers,
            credentials: 'include',
          });

          lastStatus = response.status;
          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              unauthorizedDetected = true;
            }
            continue;
          }

          const payload = (await response.json()) as BalancePayload;
          const chips = extractBalanceFromPayload(payload);
          if (chips !== null) {
            data = payload;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!data) {
        if (unauthorizedDetected) {
          throw new Error('Failed to fetch (401)');
        }
        throw new Error(`Balance endpoint not found (${lastStatus || 404})`);
      }

      const chips = extractBalanceFromPayload(data) ?? 0;
      set({ balance: chips, error: null });
    } catch (error) {
      console.error('Failed to fetch balance', error);
      const message = error instanceof Error ? error.message : '';
      if (message.includes('401') || message.includes('403')) {
        set({ error: 'Sesión no válida. Inicia sesión nuevamente.' });
      } else {
        set({ error: 'No se pudo obtener el saldo' });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));
