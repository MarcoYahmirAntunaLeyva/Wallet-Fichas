type JwtPayload = {
  sub?: string | number;
  id?: string | number;
  userId?: string | number;
  username?: string;
  nickname?: string;
  name?: string;
  full_name?: string;
  given_name?: string;
  first_name?: string;
};

const decodeBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
};

export function decodeJwtPayload(token: string): JwtPayload | null {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const decoded = decodeBase64Url(parts[1]);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function getUserIdFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  const rawId = payload?.id ?? payload?.userId ?? payload?.sub;
  return rawId != null ? String(rawId) : null;
}

export function getUserDisplayNameFromToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  const nameCandidates = [
    payload?.name,
    payload?.nickname,
    payload?.username,
    payload?.full_name,
    payload?.given_name,
    payload?.first_name,
  ];

  for (const candidate of nameCandidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('access_token');
}
