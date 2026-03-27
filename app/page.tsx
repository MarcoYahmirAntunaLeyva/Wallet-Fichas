'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Logo } from '@/components/ui/Logo';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { authService } from '@/lib/services/auth';
import { getUserIdFromToken, getUserDisplayNameFromToken } from '@/lib/auth';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [registerData, setRegisterData] = useState({
    name: '',
    last_name: '',
    nickname: '',
    born_date: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const getDisplayNameFromLoginResponse = (result: unknown): string | null => {
    if (!result || typeof result !== 'object') return null;

    const data = result as {
      name?: string;
      nickname?: string;
      username?: string;
      user?: {
        name?: string;
        nickname?: string;
        username?: string;
      };
    };

    const candidates = [
      data.user?.name,
      data.user?.nickname,
      data.user?.username,
      data.name,
      data.nickname,
      data.username,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }

    return null;
  };

  const onRegister = async (e: React.FormEvent) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await authService.register(registerData);
      setSuccessMsg('¡Bienvenido! Tu cuenta ha sido creada. Ahora inicia sesión.');
      setActiveTab('login');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (e: React.FormEvent) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const result = await authService.login(loginData.email, loginData.password);
      console.log('[login] response:', JSON.stringify(result));

      const accessToken = result?.access_token;
      const userId = accessToken ? getUserIdFromToken(accessToken) : null;
      const displayNameFromResponse = getDisplayNameFromLoginResponse(result);
      const displayNameFromToken = accessToken ? getUserDisplayNameFromToken(accessToken) : null;
      // Fallback: use the part before @ in the email
      const emailFallback = loginData.email.split('@')[0];
      const displayName = displayNameFromResponse ?? displayNameFromToken ?? emailFallback;

      if (accessToken) {
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('jwt_token', accessToken);
      }

      if (userId) {
        localStorage.setItem('user_id', userId);
      }

      localStorage.setItem('user_name', displayName);

      router.replace('/games');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMsg(error.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Logo />
      <Badge count="3,842" label="jugadores en línea" />
      <Tabs activeTab={activeTab} onTabChange={handleTabChange} />

      {errorMsg && (
        <div style={{ padding: '12px', background: 'rgba(255, 77, 77, 0.1)', border: '1px solid rgba(255, 77, 77, 0.2)', borderRadius: '10px', color: '#ff4d4d', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '12px', background: 'rgba(0, 245, 128, 0.1)', border: '1px solid rgba(0, 245, 128, 0.2)', borderRadius: '10px', color: '#00F580', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>
          {successMsg}
        </div>
      )}

      {activeTab === 'register' ? (
        <RegisterForm
          onRegister={onRegister}
          loading={loading}
          registerData={registerData}
          handleRegisterChange={handleRegisterChange}
        />
      ) : (
        <LoginForm
          onLogin={onLogin}
          loading={loading}
          loginData={loginData}
          handleLoginChange={handleLoginChange}
        />
      )}

      <p className="footer-text">
        Al registrarte aceptas los{' '}
        <Link href="/terms" className="link">Términos de Servicio</Link>{' '}
        y la{' '}
        <Link href="/privacy" className="link">Política de Privacidad</Link>.<br />
        +18 | Juego responsable
      </p>
    </AuthLayout>
  );
}
