import React, { useState } from 'react';

interface RegisterFormProps {
  onRegister: (e: React.FormEvent) => void;
  loading: boolean;
  registerData: {
    name: string;
    last_name: string;
    nickname: string;
    born_date: string;
    email: string;
    password: string;
    confirm_password: string;
  };
  handleRegisterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, loading, registerData, handleRegisterChange }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!registerData.nickname || registerData.nickname.length < 3)
      newErrors.nickname = 'El usuario debe tener al menos 3 caracteres';

    if (!registerData.name) newErrors.name = 'El nombre es obligatorio';
    if (!registerData.last_name) newErrors.last_name = 'El apellido es obligatorio';

    if (!registerData.email || !/\S+@\S+\.\S+/.test(registerData.email))
      newErrors.email = 'Correo electrónico inválido';

    if (!registerData.born_date) {
      newErrors.born_date = 'La fecha de nacimiento es obligatoria';
    } else {
      const birthDate = new Date(registerData.born_date);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 18) newErrors.born_date = 'Debes ser mayor de 18 años';
    }

    if (!registerData.password || registerData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)/.test(registerData.password)) {
      newErrors.password = 'Debe incluir letras y números';
    }

    if (registerData.confirm_password !== registerData.password)
      newErrors.confirm_password = 'Las contraseñas no coinciden';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onRegister(e);
    }
  };

  return (
    <form className="auth-form" onSubmit={validate} noValidate>
      <div className="form-group">
        <label className="form-label">Nombre de usuario</label>
        <input
          type="text"
          name="nickname"
          className={`form-input ${errors.nickname ? 'invalid' : ''}`}
          placeholder="Elige tu nombre de jugador"
          value={registerData.nickname}
          onChange={handleRegisterChange}
          required
        />
        {errors.nickname && <span className="input-error">{errors.nickname}</span>}
      </div>

      <div className="form-row">
        <div className="form-group flex-1">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            name="name"
            className={`form-input ${errors.name ? 'invalid' : ''}`}
            placeholder="Tu nombre"
            value={registerData.name}
            onChange={handleRegisterChange}
            required
          />
          {errors.name && <span className="input-error">{errors.name}</span>}
        </div>
        <div className="form-group flex-1">
          <label className="form-label">Apellido</label>
          <input
            type="text"
            name="last_name"
            className={`form-input ${errors.last_name ? 'invalid' : ''}`}
            placeholder="Tu apellido"
            value={registerData.last_name}
            onChange={handleRegisterChange}
            required
          />
          {errors.last_name && <span className="input-error">{errors.last_name}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Correo electrónico</label>
        <input
          type="email"
          name="email"
          className={`form-input ${errors.email ? 'invalid' : ''}`}
          placeholder="ejemplo@correo.com"
          value={registerData.email}
          onChange={handleRegisterChange}
          required
        />
        {errors.email && <span className="input-error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Fecha de nacimiento</label>
        <input
          type="date"
          name="born_date"
          className={`form-input ${errors.born_date ? 'invalid' : ''}`}
          value={registerData.born_date}
          onChange={handleRegisterChange}
          required
        />
        {errors.born_date && <span className="input-error">{errors.born_date}</span>}
      </div>

      <div className="form-row">
        <div className="form-group flex-1">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            name="password"
            className={`form-input ${errors.password ? 'invalid' : ''}`}
            placeholder="Mínimo 8 caracteres"
            value={registerData.password}
            onChange={handleRegisterChange}
            required
          />
          {errors.password && <span className="input-error">{errors.password}</span>}
        </div>
        <div className="form-group flex-1">
          <label className="form-label">Confirmar</label>
          <input
            type="password"
            name="confirm_password"
            className={`form-input ${errors.confirm_password ? 'invalid' : ''}`}
            placeholder="Repite tu contraseña"
            value={registerData.confirm_password}
            onChange={handleRegisterChange}
            required
          />
          {errors.confirm_password && <span className="input-error">{errors.confirm_password}</span>}
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? <span className="spinner"></span> : 'Crear cuenta gratis'}
      </button>
    </form>
  );
};
