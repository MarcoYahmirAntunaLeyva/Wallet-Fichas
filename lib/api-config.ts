export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const handleResponse = async (response: Response) => {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const raw = data?.message;
    const error = Array.isArray(raw)
      ? raw[0]
      : (raw || response.statusText);
    throw new Error(error);
  }

  return data;
};
