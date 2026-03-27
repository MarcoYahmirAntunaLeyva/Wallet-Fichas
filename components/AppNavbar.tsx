'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet.store';
import { getUserDisplayNameFromToken } from '@/lib/auth';
import { getAuthHeaders } from '@/lib/utils';
import {
  Coins,
  Wallet,
  CircleDot,
  LogOut,
  Home,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const USER_NAME_ENDPOINTS = ['/auth/me', '/auth/profile', '/users/me', '/user/me', '/wallet/me'];

function isUsableDisplayName(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (/^\d+$/.test(trimmed)) return false;
  return true;
}

function extractDisplayNameFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const data = payload as {
    name?: unknown;
    nickname?: unknown;
    username?: unknown;
    full_name?: unknown;
    first_name?: unknown;
    last_name?: unknown;
    user?: {
      name?: unknown;
      nickname?: unknown;
      username?: unknown;
      full_name?: unknown;
      first_name?: unknown;
      last_name?: unknown;
    };
  };

  const firstName = data.user?.first_name ?? data.first_name;
  const lastName = data.user?.last_name ?? data.last_name;
  if (isUsableDisplayName(firstName) && isUsableDisplayName(lastName)) {
    return `${firstName} ${lastName}`;
  }

  const candidates = [
    data.user?.name,
    data.user?.nickname,
    data.user?.username,
    data.user?.full_name,
    data.name,
    data.nickname,
    data.username,
    data.full_name,
    firstName,
  ];

  for (const candidate of candidates) {
    if (isUsableDisplayName(candidate)) {
      return candidate.trim();
    }
  }

  return null;
}

async function fetchDisplayNameFromApi(): Promise<string | null> {
  for (const endpoint of USER_NAME_ENDPOINTS) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        credentials: 'include',
      });

      if (response.status === 404) continue;
      if (!response.ok) continue;

      const data: unknown = await response.json();
      const name = extractDisplayNameFromPayload(data);
      if (name) return name;
    } catch {
      continue;
    }
  }

  return null;
}

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { balance, fetchBalance } = useWalletStore();
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hydrateDisplayName = async () => {
      const storedName = localStorage.getItem('user_name');
      if (isUsableDisplayName(storedName)) {
        setDisplayName(storedName.trim());
        return;
      }

      const token = localStorage.getItem('access_token') ?? localStorage.getItem('jwt_token');
      const tokenName = token ? getUserDisplayNameFromToken(token) : null;

      if (isUsableDisplayName(tokenName)) {
        const normalizedName = tokenName.trim();
        localStorage.setItem('user_name', normalizedName);
        setDisplayName(normalizedName);
        return;
      }

      const apiName = await fetchDisplayNameFromApi();
      if (isUsableDisplayName(apiName)) {
        localStorage.setItem('user_name', apiName.trim());
        setDisplayName(apiName.trim());
        return;
      }

      setDisplayName('Jugador');
    };

    void hydrateDisplayName();
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_name');
    }
    router.replace('/');
  };

  const navLinks = [
    { href: '/games', label: 'Juegos', icon: <Home className="w-4 h-4" /> },
    { href: '/wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" /> },
    { href: '/games/roulette', label: 'Ruleta', icon: <CircleDot className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5 px-6 py-3 flex justify-between items-center">
      {/* Logo */}
      <Link href="/games" className="flex items-center gap-3 no-underline">
        <div className="w-9 h-9 bg-gradient-to-br from-[#3A7D5E] to-[#1C3D30] rounded-xl flex items-center justify-center shadow-lg border border-[rgba(0,245,128,0.3)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4 7L12 12L20 7L12 2Z" fill="#00F580" />
            <path d="M4 12L12 17L20 12" stroke="#00F580" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 17L12 22L20 17" stroke="#00F580" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ fontFamily: "'EB Garamond', serif", fontSize: '18px', fontWeight: 700, color: '#E8F0EB', letterSpacing: '0.05em' }}>
          Regnum <span style={{ color: '#C9962F' }}>Casino</span>
        </span>
      </Link>

      {/* Nav links */}
      <div className="flex items-center gap-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all no-underline ${
              pathname === link.href
                ? 'bg-[rgba(0,245,128,0.15)] text-[#00F580] border border-[rgba(0,245,128,0.3)]'
                : 'text-[#7A9B8A] hover:text-[#E8F0EB] hover:bg-white/5'
            }`}
          >
            {link.icon}
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right side: balance + user + logout */}
      <div className="flex items-center gap-4">
        {/* Balance */}
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <Coins className="w-4 h-4 text-[#C9962F]" />
          <span className="text-white font-medium text-sm">{balance.toLocaleString()} fichas</span>
        </div>

        {/* user name */}
        {displayName && (
          <span className="text-[#7A9B8A] text-sm hidden md:block">
            Hola, <span className="text-[#00F580] font-semibold">{displayName}</span>
          </span>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#7A9B8A] hover:text-[#ff4d4d] hover:bg-[rgba(255,77,77,0.1)] transition-all border border-transparent hover:border-[rgba(255,77,77,0.2)]"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:block">Salir</span>
        </button>
      </div>
    </nav>
  );
}
