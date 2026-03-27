import React from 'react';

interface TabsProps {
  activeTab: 'login' | 'register';
  onTabChange: (tab: 'login' | 'register') => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="tabs-container">
      <button
        className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
        onClick={() => onTabChange('login')}
      >
        Iniciar sesión
      </button>
      <button
        className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
        onClick={() => onTabChange('register')}
      >
        Registrarse
      </button>
    </div>
  );
};
