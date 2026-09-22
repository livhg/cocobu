import { Transaction } from '@/types/ledger';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fiwqdossipfehrwedfsu.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpd3Fkb3NzaXBmZWhyd2VkZnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4MzI0NzYsImV4cCI6MjEwNTQwODQ3Nn0.AdzA5S0gOmnpgMaJ2rkAikMYLOPp8VjfwoR2bq0dD8s';

const AUTH_STORAGE_KEY = 'cocobu_supabase_token';
const USER_STORAGE_KEY = 'cocobu_supabase_user';

export interface SupabaseAuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}

class SupabaseService {
  private getHeaders(extraHeaders: Record<string, string> = {}): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_STORAGE_KEY) : null;
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token || SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...extraHeaders,
    };
  }

  // 取得目前登入使用者 (若有)
  getCurrentUser(): SupabaseAuthUser | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  // 設定使用者資訊
  setCurrentUser(user: SupabaseAuthUser | null, token?: string | null) {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      if (token) localStorage.setItem(AUTH_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  // 登出
  logout() {
    this.setCurrentUser(null, null);
  }

  // 透過 Google 進行 OAuth 登入
  signInWithGoogle() {
    if (typeof window === 'undefined') return;
    const redirectUrl = `${window.location.origin}/dashboard`;
    const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
    window.location.href = authUrl;
  }

  // 解析網址 Hash 中的 Access Token (OAuth 回傳)
  handleAuthCallback(): SupabaseAuthUser | null {
    if (typeof window === 'undefined') return null;
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token=')) return null;

    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get('access_token');
    if (!accessToken) return null;

    try {
      // 解析 JWT payload
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);

      const user: SupabaseAuthUser = {
        id: payload.sub,
        email: payload.email,
        user_metadata: payload.user_metadata || {},
      };

      this.setCurrentUser(user, accessToken);
      // 清理網址中的 hash
      window.history.replaceState(null, '', window.location.pathname);
      return user;
    } catch (err) {
      console.error('Failed to parse access token', err);
      return null;
    }
  }

  // 取得完整所有交易清單 (分批拉取以支援 1,000+ 筆)
  async fetchAllTransactions(): Promise<Transaction[]> {
    const all: Transaction[] = [];
    const limit = 1000;
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const url = `${SUPABASE_URL}/rest/v1/transactions?select=*&order=date.desc,id.desc&offset=${offset}&limit=${limit}`;
      const res = await fetch(url, {
        headers: this.getHeaders({ 'Prefer': 'count=exact' }),
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch transactions: ${res.statusText}`);
      }

      const rows: Transaction[] = await res.json();
      all.push(...rows);

      if (rows.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    return all;
  }

  // 建立新交易
  async createTransaction(tx: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    const url = `${SUPABASE_URL}/rest/v1/transactions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(tx),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`建立記帳失敗: ${errText || res.statusText}`);
    }

    const created: Transaction[] = await res.json();
    return created[0];
  }

  // 刪除交易
  async deleteTransaction(id: string): Promise<boolean> {
    const url = `${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`刪除記帳失敗: ${res.statusText}`);
    }

    return true;
  }

  // 更新交易
  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const url = `${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders({ 'Prefer': 'return=representation' }),
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      throw new Error(`更新記帳失敗: ${res.statusText}`);
    }

    const updated: Transaction[] = await res.json();
    return updated[0];
  }
}

export const supabaseService = new SupabaseService();
