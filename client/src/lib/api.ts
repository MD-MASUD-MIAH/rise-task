import type { ApiResponse, PosterResult, AuthUser } from '@/types/poster';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://server-delta-six-13.vercel.app';

// ─── Token helpers (localStorage) ────────────────────────────────────────────

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('rise_token');
  localStorage.removeItem('rise_user');
};

export const isTokenValid = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('rise_token');
  if (!token) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      logout();
      return false;
    }
    // Safely decode payload (handling base64url)
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      logout();
      return false;
    }
    return true;
  } catch {
    logout();
    return false;
  }
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  if (!isTokenValid()) return null;
  return localStorage.getItem('rise_token');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('rise_token', token);
};

export const removeToken = (): void => {
  logout();
};

export const saveUser = (user: AuthUser): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('rise_user', JSON.stringify(user));
};

export const getUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  if (!isTokenValid()) {
    return null;
  }
  const raw = localStorage.getItem('rise_user');
  return raw ? (JSON.parse(raw) as AuthUser) : null;
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
    if (res.status === 401 || json.message?.toLowerCase().includes('token')) {
      logout();
      throw new Error('আপনার লগইন সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে পুনরায় লগইন করুন।');
    }
    const serverDetail = (json as unknown as Record<string, unknown>).detail as string | undefined;
    const errMsg = serverDetail ? `${json.message}: ${serverDetail}` : (json.message ?? 'পোস্টার তৈরিতে সমস্যা হয়েছে।');
    throw new Error(errMsg);
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
  if (res.status === 401) {
    logout();
    return [];
  }
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
