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
import { FloatingActionButton } from '@/components/navigation/FloatingActionButton';

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
      <div className="flex items-center justify-center py-8 md:py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 md:p-4">
        載入帳本時發生錯誤:{' '}
        {error instanceof Error ? error.message : '未知錯誤'}
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header - Mobile First: Stack on mobile, horizontal on desktop */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">我的帳本</h1>
          <p className="text-sm text-gray-600 md:text-base">
            管理您的個人帳本與分帳帳本
          </p>
        </div>
        {/* Desktop only button */}
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="hidden sm:inline-flex"
        >
          <Plus className="mr-2 h-4 w-4" />
          新增帳本
        </Button>
      </div>

      {/* Books List */}
      {!books || books.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
            <BookOpen className="mb-3 h-12 w-12 text-gray-400 md:mb-4 md:h-16 md:w-16" />
            <h3 className="mb-2 text-base font-semibold md:text-lg">
              還沒有帳本
            </h3>
            <p className="mb-3 text-center text-sm text-gray-600 md:mb-4">
              建立您的第一個帳本來開始記錄支出
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto"
            >
              新增第一個帳本
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Link key={book.id} href={`/dashboard/books/${book.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate">{book.name}</CardTitle>
                      <CardDescription className="truncate">
                        {book.type === 'PERSONAL' ? '個人帳本' : '分帳帳本'} •{' '}
                        {book.currency}
                      </CardDescription>
                    </div>
                    <div
                      className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
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

      {/* Floating Action Button - Mobile Only */}
      <FloatingActionButton
        onClick={() => setIsCreateModalOpen(true)}
        aria-label="新增帳本"
        icon={<Plus className="h-6 w-6" />}
        className="sm:hidden"
      />

      {/* Create Book Modal Placeholder */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <Card
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
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
