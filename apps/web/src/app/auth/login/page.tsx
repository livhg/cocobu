'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api, ApiError } from '@/lib/api';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.post('/auth/login', { email });
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        // Extract detailed error message from backend
        const message = err.body?.message || err.body?.error || err.statusText;
        setError(message || '登入失敗，請稍後再試');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('登入失敗，請稍後再試');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">查看您的信箱</CardTitle>
            <CardDescription className="text-base">
              我們已經將登入連結寄送到 <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              <p className="text-sm text-gray-600 md:text-base">
                請點擊信件中的連結來完成登入。連結將在 15 分鐘後失效。
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
              >
                使用其他信箱
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">登入 CocoBu</CardTitle>
          <CardDescription className="text-base">
            輸入您的電子郵件地址，我們會寄送登入連結給您
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <FloatingLabelInput
              id="email"
              label="電子郵件"
              type="email"
              inputMode="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              autoFocus
              autoComplete="email"
              error={error || undefined}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '寄送中...' : '寄送登入連結'}
            </Button>

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
