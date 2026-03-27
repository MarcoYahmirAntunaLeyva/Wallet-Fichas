import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (e: React.FormEvent) => void;
  loading: boolean;
  loginData: { email: string; password: string };
  handleLoginChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading, loginData, handleLoginChange }) => {
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!loginData.email) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Formato de correo inválido';
    }

    if (!loginData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onLogin(e);
    }
  };

  return (
    <form className="auth-form" onSubmit={validate} noValidate>
      <div className="form-group">
        <label className="form-label">Correo electrónico</label>
        <input
          type="email"
          name="email"
          className={`form-input ${errors.email ? 'invalid' : ''}`}
          placeholder="ejemplo@correo.com"
          value={loginData.email}
          onChange={handleLoginChange}
          required
        />
        {errors.email && <span className="input-error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Contraseña</label>
        <input
          type="password"
          name="password"
          className={`form-input ${errors.password ? 'invalid' : ''}`}
          placeholder="Ingresa tu contraseña"
          value={loginData.password}
          onChange={handleLoginChange}
          required
        />
        {errors.password && <span className="input-error">{errors.password}</span>}
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? <span className="spinner"></span> : 'Iniciar sesión'}
      </button>
    </form>
  );
};
