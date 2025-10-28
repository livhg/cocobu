'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api, ApiError, type User } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import Link from 'next/link';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const setUser = useAuthStore((state) => state.setUser);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('缺少驗證令牌');
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const verifyToken = async () => {
      try {
        const response = await api.get<{ user: User }>(
          `/auth/verify?token=${token}`
        );
        setUser(response.user);
        setStatus('success');

        // Redirect to dashboard after a brief delay
        timeoutId = setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } catch (err) {
        setStatus('error');
        if (err instanceof ApiError) {
          // Extract detailed error message from backend
          const message =
            err.body?.message || err.body?.error || err.statusText;
          setError(message || '驗證失敗，請重新登入');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('驗證失敗，請重新登入');
        }
      }
    };

    verifyToken();

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [token, router, setUser]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>驗證中...</CardTitle>
            <CardDescription>正在驗證您的登入連結</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>登入成功！</CardTitle>
            <CardDescription>正在導向控制台...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>驗證失敗</CardTitle>
          <CardDescription>無法驗證您的登入連結</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            <p className="text-sm text-gray-600">
              此連結可能已過期或已被使用。請重新請求登入連結。
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href="/auth/login">重新登入</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">返回首頁</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>載入中...</CardTitle>
              <CardDescription>正在準備驗證頁面</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
