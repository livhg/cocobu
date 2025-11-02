'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';
import { AUTH_CONSTANTS } from '@/lib/constants';
import {
  executeLogin,
  createLoginExecutor,
  createDevLoginExecutor,
} from './logic';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDevelopment = process.env.NODE_ENV !== 'production';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await executeLogin({
        executor: createLoginExecutor(api),
        userId,
        setUser,
        redirect: (path) => router.push(path),
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('登入失敗，請稍後再試');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await executeLogin({
        executor: createDevLoginExecutor(api),
        userId,
        setUser,
        redirect: (path) => router.push(path),
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('開發登入失敗');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">登入 CocoBu</CardTitle>
          <CardDescription className="text-base">
            輸入自訂的使用者 ID 即可開始使用。若使用者 ID 已被他人登入，
            你們會共享相同的內容。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <FloatingLabelInput
              id="userId"
              label="使用者 ID"
              type="text"
              inputMode="text"
              placeholder="例如 bujiro"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              disabled={isLoading}
              autoFocus
              autoComplete="username"
              error={error || undefined}
            />

            <p className="text-xs text-gray-500">
              使用小寫英文、數字或 - 號，長度需在
              {AUTH_CONSTANTS.USER_ID_MIN_LENGTH}~
              {AUTH_CONSTANTS.USER_ID_MAX_LENGTH} 字元之間。
            </p>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '登入中...' : '立即登入'}
            </Button>

            {isDevelopment && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">
                      開發模式
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleDevLogin}
                  disabled={isLoading}
                >
                  {isLoading ? '登入中...' : '快速登入 (開發)'}
                </Button>
              </>
            )}

            <div className="text-center text-sm text-gray-600">
              <Link href="/" className="hover:underline">
                返回首頁
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
