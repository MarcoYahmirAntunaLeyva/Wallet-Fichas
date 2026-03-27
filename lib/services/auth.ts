import { API_CONFIG, handleResponse } from '../api-config';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  register: async (data: {
    name: string;
    last_name: string;
    nickname: string;
    born_date: string;
    email: string;
    password: string;
    confirm_password?: string;
  }) => {
    const payload = {
      Name: data.name,
      Last_name: data.last_name,
      Nickname: data.nickname,
      Born_Date: data.born_date ? new Date(data.born_date).toISOString() : undefined,
      Email: data.email,
      Password: data.password,
    };

    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },
};
