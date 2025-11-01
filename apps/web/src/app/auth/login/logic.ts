import type { LoginResponse } from '../../../lib/api';
import { ApiError } from '../../../lib/api';
import { AUTH_CONSTANTS } from '../../../lib/constants';

export const USER_ID_PATTERN = /^[a-z0-9-]+$/;

export function normalizeUserId(userId: string): string {
  return userId.trim();
}

export function validateUserId(userId: string): string | null {
  const trimmed = normalizeUserId(userId);

  if (trimmed.length < AUTH_CONSTANTS.USER_ID_MIN_LENGTH) {
    return `使用者 ID 至少需要 ${AUTH_CONSTANTS.USER_ID_MIN_LENGTH} 個字元`;
  }

  if (trimmed.length > AUTH_CONSTANTS.USER_ID_MAX_LENGTH) {
    return `使用者 ID 最多僅能 ${AUTH_CONSTANTS.USER_ID_MAX_LENGTH} 個字元`;
  }

  if (!USER_ID_PATTERN.test(trimmed)) {
    return '僅能使用小寫英文、數字或 - 號';
  }

  return null;
}

export type LoginExecutor = (userId: string) => Promise<LoginResponse>;

interface ExecuteLoginOptions {
  executor: LoginExecutor;
  userId: string;
  setUser: (user: LoginResponse['user']) => void;
  redirect: (path: string) => void;
  redirectPath?: string;
}

export async function executeLogin({
  executor,
  userId,
  setUser,
  redirect,
  redirectPath = '/dashboard',
}: ExecuteLoginOptions) {
  const trimmed = normalizeUserId(userId);
  const validation = validateUserId(trimmed);

  if (validation) {
    throw new Error(validation);
  }

  try {
    const result = await executor(trimmed);
    setUser(result.user);
    redirect(redirectPath);
  } catch (error) {
    if (error instanceof ApiError) {
      const message = error.body?.message || error.body?.error || error.statusText;
      throw new Error(message || '登入失敗，請稍後再試');
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('登入失敗，請稍後再試');
  }
}

type ApiClient = {
  post: <T>(endpoint: string, data?: unknown) => Promise<T>;
  get: <T>(endpoint: string) => Promise<T>;
};

export function createLoginExecutor(apiClient: ApiClient): LoginExecutor {
  return (userId: string) =>
    apiClient.post<LoginResponse>('/auth/login', { userId });
}

export function createDevLoginExecutor(apiClient: ApiClient): LoginExecutor {
  return (userId: string) =>
    apiClient.get<LoginResponse>(
      `/auth/dev-login?userId=${encodeURIComponent(userId)}`
    );
}
