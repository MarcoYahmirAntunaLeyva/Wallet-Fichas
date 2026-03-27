import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="page auth-page">
      <div className="bg-layer"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="card" style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '440px',
        margin: '0 16px',
        background: 'linear-gradient(160deg, rgba(18, 38, 25, 0.98) 0%, rgba(13, 31, 24, 1) 100%)',
        border: '1px solid rgba(0, 245, 128, 0.15)',
        borderRadius: '24px',
        padding: '40px 32px',
        boxShadow: '0 0 0 1px rgba(0, 245, 128, 0.05), 0 32px 80px rgba(0, 0, 0, 0.8)',
        animation: 'rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}>
        {children}
      </div>
    </div>
  );
};
