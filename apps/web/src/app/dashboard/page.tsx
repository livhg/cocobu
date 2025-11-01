'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { FloatingActionButton } from '@/components/navigation/FloatingActionButton';
import { BookCard } from '@/components/dashboard/BookCard';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/components/ui/PullToRefreshIndicator';
import { BottomSheet } from '@/components/ui/BottomSheet';

export default function DashboardPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

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

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      await api.delete(`/books/${bookId}`);
    },
    onSuccess: () => {
      // Invalidate and refetch books list
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error) => {
      alert(`刪除失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
    },
  });

  const handleDeleteBook = (bookId: string) => {
    deleteBookMutation.mutate(bookId);
  };

  // Pull-to-refresh functionality
  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      await queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    threshold: 80,
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
    <>
      {/* Pull-to-refresh indicator */}
      <PullToRefreshIndicator
        pullDistance={pullToRefresh.pullDistance}
        isRefreshing={pullToRefresh.isRefreshing}
        willRefresh={pullToRefresh.willRefresh}
        threshold={80}
      />

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
              <BookCard key={book.id} book={book} onDelete={handleDeleteBook} />
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

        {/* Create Book Bottom Sheet */}
        <BottomSheet
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="新增帳本"
          height="auto"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">建立新的個人或分帳帳本</p>
            <p className="text-sm text-gray-600">
              此功能將在後續版本中實作。目前僅展示 UI 介面。
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsCreateModalOpen(false)}
            >
              關閉
            </Button>
          </div>
        </BottomSheet>
      </div>
    </>
  );
}
