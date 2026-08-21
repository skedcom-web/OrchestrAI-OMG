/**
 * OMG Release 4 — shared fetch client for the Api repositories.
 *
 * Mirrors the base-URL convention already used by services/api.ts. The
 * caller's role is read from the same localStorage key AuthContext persists
 * to (`omg_auth_user`), since repositories are plain modules outside the
 * React tree and can't call useAuth() directly.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://orchestrai-omg.onrender.com/api';

/**
 * Mirrors AuthContext's own default: it falls back to INITIAL_USERS[0]
 * (Super Admin) in memory whenever `omg_auth_user` hasn't been written yet,
 * which happens until the first persona switch. Repositories run outside
 * the React tree and can only see localStorage, so they need the same
 * fallback or every request made before a persona switch is unauthenticated.
 */
function currentUserRole(): string {
  try {
    const raw = localStorage.getItem('omg_auth_user');
    if (raw) return JSON.parse(raw)?.role || 'SUPER_ADMIN';
  } catch {
    // fall through to default
  }
  return 'SUPER_ADMIN';
}

export class ApiError extends Error {
  status: number;
  statusText: string;
  body: string;

  constructor(status: number, statusText: string, body: string) {
    super(`API ${status} ${statusText}: ${body}`);
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const role = currentUserRole();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': role,
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new ApiError(res.status, res.statusText, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export { API_BASE_URL };
