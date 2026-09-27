import type { ApiResponse, PosterResult, AuthUser } from '@/types/poster';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

// ─── Token helpers (localStorage) ────────────────────────────────────────────

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('rise_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('rise_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('rise_token');
};

export const saveUser = (user: AuthUser): void => {
  localStorage.setItem('rise_user', JSON.stringify(user));
};

export const getUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('rise_user');
  return raw ? (JSON.parse(raw) as AuthUser) : null;
};

export const logout = (): void => {
  removeToken();
  localStorage.removeItem('rise_user');
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

interface RegisterPayload { name: string; email?: string; phone?: string; password: string; }
interface LoginPayload    { email?: string; phone?: string; password: string; }
interface AuthData        { token: string; user: AuthUser; }

const authPost = async (path: string, body: unknown): Promise<AuthData> => {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (_err) {
    throw new Error('সার্ভারের সাথে সংযোগ করা যাচ্ছে না। ব্যাকএন্ড সার্ভার (port 5000) চালু আছে কিনা নিশ্চিত করুন।');
  }

  let json: ApiResponse<AuthData>;
  try {
    json = await res.json() as ApiResponse<AuthData>;
  } catch {
    throw new Error(`সার্ভার প্রতিক্রিয়া বুঝতে ব্যর্থ হয়েছে (${res.status})`);
  }

  if (!res.ok || !json.success || !json.data) {
    let msg = json.message ?? 'অনুরোধটি ব্যর্থ হয়েছে।';
    if (msg.includes('Password must be at least 8 characters')) {
      msg = 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।';
    } else if (msg.includes('already exists')) {
      msg = 'এই ইমেইল বা ফোন নম্বর দিয়ে ইতিমধ্যে অ্যাকাউন্ট রয়েছে।';
    } else if (msg.includes('Invalid credentials')) {
      msg = 'ইমেইল/ফোন নম্বর অথবা পাসওয়ার্ড সঠিক নয়।';
    } else if (msg.includes('Email or phone number is required')) {
      msg = 'ইমেইল বা ফোন নম্বর প্রদান করুন।';
    } else if (msg.includes('Name is required')) {
      msg = 'নাম প্রদান করুন।';
    }
    throw new Error(msg);
  }
  return json.data;
};

export const register = (payload: RegisterPayload): Promise<AuthData> =>
  authPost('/api/auth/register', payload);

export const login = (payload: LoginPayload): Promise<AuthData> =>
  authPost('/api/auth/login', payload);

// ─── Poster generation ────────────────────────────────────────────────────────

export const createPoster = async (formData: FormData): Promise<PosterResult> => {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/posters`, {
    method: 'POST',
    // DO NOT set Content-Type — browser adds multipart boundary automatically
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const json = await res.json() as ApiResponse<PosterResult>;
  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.message ?? 'Poster generation failed');
  }
  return json.data;
};

// ─── My Posters ───────────────────────────────────────────────────────────────

export const getMyPosters = async (): Promise<PosterResult[]> => {
  const token = getToken();
  if (!token) return [];
  const res = await fetch(`${API_BASE}/api/posters`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json() as ApiResponse<{ posters: PosterResult[] }>;
  return json.data?.posters ?? [];
};

// ─── Download helper ──────────────────────────────────────────────────────────

export const downloadImageAs = async (imageUrl: string, filename = 'rise-poster.png'): Promise<void> => {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
