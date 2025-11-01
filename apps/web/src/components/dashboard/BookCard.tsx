'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Edit } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useSwipeActions } from '@/hooks/useSwipeActions';
import { useLongPress } from '@/hooks/useLongPress';
import { type Book } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface BookCardProps {
  book: Book;
  onDelete?: (bookId: string) => void;
  onEdit?: (bookId: string) => void;
}

export function BookCard({ book, onDelete, onEdit }: BookCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const swipeHandlers = useSwipeActions({
    onSwipeLeft: () => {
      if (onDelete) {
        setIsDeleting(true);
        // Show delete confirmation
        if (window.confirm(`確定要刪除「${book.name}」嗎？`)) {
          onDelete(book.id);
        } else {
          setIsDeleting(false);
        }
      }
    },
    threshold: 100,
  });

  const longPressHandlers = useLongPress({
    onLongPress: (e) => {
      e.preventDefault();
      setShowContextMenu(true);
      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    },
    delay: 500,
  });

  const handleEdit = () => {
    setShowContextMenu(false);
    if (onEdit) {
      onEdit(book.id);
    }
  };

  const handleDelete = () => {
    setShowContextMenu(false);
    if (onDelete) {
      if (window.confirm(`確定要刪除「${book.name}」嗎？`)) {
        onDelete(book.id);
      }
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Delete background - shown when swiping */}
      <div className="absolute inset-0 flex items-center justify-end bg-red-500 px-6">
        <Trash2 className="h-6 w-6 text-white" />
      </div>

      {/* Book card */}
      <div
        {...swipeHandlers}
        {...longPressHandlers}
        className={cn(
          'relative bg-white transition-transform',
          isDeleting && 'translate-x-full opacity-0'
        )}
      >
        <Link href={`/dashboard/books/${book.id}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
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
                建立於 {new Date(book.created_at).toLocaleDateString('zh-TW')}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Context Menu - shown on long press */}
      {showContextMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setShowContextMenu(false)}
          />

          {/* Menu */}
          <div className="fixed left-1/2 top-1/2 z-50 w-64 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-2 shadow-2xl">
            <div className="mb-2 border-b px-3 py-2">
              <p className="truncate font-semibold">{book.name}</p>
            </div>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleEdit}
              >
                <Edit className="mr-2 h-4 w-4" />
                編輯帳本
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                刪除帳本
              </Button>
            </div>
            <div className="mt-2 border-t pt-2">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setShowContextMenu(false)}
              >
                取消
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
