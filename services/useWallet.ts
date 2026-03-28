'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  createWallet,
  getBalance,
  getHistory,
  getPackages,
  depositMoney,
  depositPackage,
  withdrawChips,
  type BalanceResponse,
  type Transaction,
  type PackagesResponse,
  type Wallet,
} from './walletApi';

function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
}

export function useBalance(userId?: string) {
  const [data, setData] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBalance(userId);
      setData(res);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

export function useHistory(userId?: string, filters?: { action?: string; currencyType?: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHistory(userId, filters);
      setTransactions(res.transactions);
      setTotal(res.total);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  useEffect(() => { refetch(); }, [refetch]);

  return { transactions, total, loading, error, refetch };
}

export function usePackages() {
  const [data, setData] = useState<PackagesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getPackages()
      .then(setData)
      .catch((error: unknown) => setError(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useDeposit(userId?: string, onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const reset = () => {
    setError(null);
  };

  const depositFree = async (moneyAmount: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await depositMoney(userId, moneyAmount);
      setWallet(res.wallet);
      onSuccess?.();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const depositPkg = async (packageIndex: number, fallbackMoneyAmount?: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await depositPackage(userId, packageIndex);
      setWallet(res.wallet);
      onSuccess?.();
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Error al procesar el depósito por paquete');
      const shouldFallback =
        Number.isFinite(fallbackMoneyAmount) &&
        (fallbackMoneyAmount ?? 0) > 0 &&
        /moneyAmount|packageIndex/i.test(message);

      if (shouldFallback) {
        try {
          const res = await depositMoney(userId, fallbackMoneyAmount as number);
          setWallet(res.wallet);
          onSuccess?.();
        } catch (fallbackError: unknown) {
          setError(getErrorMessage(fallbackError, 'Error al procesar el depósito por paquete'));
        }
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return { depositFree, depositPkg, loading, error, wallet, reset };
}

export function useWithdraw(userId?: string, onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const withdraw = async (chipsAmount: number) => {
    if (!Number.isFinite(chipsAmount) || chipsAmount <= 0) {
      setError('Cantidad de fichas inválida');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await withdrawChips(userId, chipsAmount);
      setWallet(res.wallet);
      onSuccess?.();
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return { withdraw, loading, error, wallet };
}

export function useCreateWallet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const create = async (userId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createWallet(userId);
      setWallet(res.wallet);
    } catch (error: unknown) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error, wallet };
}
