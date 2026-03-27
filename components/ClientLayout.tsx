'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AppNavbar from '@/components/AppNavbar';

const PUBLIC_ROUTES = ['/', '/terms', '/privacy'];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuth = () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('access_token');
    return !!token;
  };

  useEffect(() => {
    const auth = checkAuth();
    setIsAuthenticated(auth);

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isAuthPage = pathname === '/';

    if (!auth && !isPublicRoute) {
      // Not logged in trying to access protected route
      router.replace('/');
    } else if (auth && isAuthPage) {
      // Logged in trying to access auth page
      router.replace('/games');
    }
  }, [pathname, router]);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Show loading while checking auth
  if (isAuthenticated === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D1F18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#00F580', fontSize: '1.5rem' }}>Cargando...</div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && !isPublicRoute && <AppNavbar />}
      {children}
    </>
  );
}
