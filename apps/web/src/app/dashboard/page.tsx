'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api, type Book } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    data: books,
    isLoading,
    error,
  } = useQuery<Book[]>({
    queryKey: ['books'],
    queryFn: async () => {
      const response = await api.get<Book[]>('/books');
      return response;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
        載入帳本時發生錯誤:{' '}
        {error instanceof Error ? error.message : '未知錯誤'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">我的帳本</h1>
          <p className="text-gray-600">管理您的個人帳本與分帳帳本</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新增帳本
        </Button>
      </div>

      {/* Books List */}
      {!books || books.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold">還沒有帳本</h3>
            <p className="mb-4 text-center text-gray-600">
              建立您的第一個帳本來開始記錄支出
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              新增第一個帳本
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Link key={book.id} href={`/dashboard/books/${book.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{book.name}</CardTitle>
                      <CardDescription>
                        {book.type === 'PERSONAL' ? '個人帳本' : '分帳帳本'} •{' '}
                        {book.currency}
                      </CardDescription>
                    </div>
                    <div
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        book.type === 'PERSONAL'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {book.type === 'PERSONAL' ? '個人' : '分帳'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    建立於{' '}
                    {new Date(book.created_at).toLocaleDateString('zh-TW')}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Create Book Modal Placeholder */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>新增帳本</CardTitle>
              <CardDescription>建立新的個人或分帳帳本</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                此功能將在後續版本中實作。目前僅展示 UI 介面。
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsCreateModalOpen(false)}
              >
                關閉
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
