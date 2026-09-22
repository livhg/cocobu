'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogIn, LogOut, Smartphone } from 'lucide-react';
import { supabaseService, SupabaseAuthUser } from '@/lib/supabase';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<SupabaseAuthUser | null>(null);

  useEffect(() => {
    // 檢查是否有 OAuth 回傳的 Hash Token
    const callbackUser = supabaseService.handleAuthCallback();
    if (callbackUser) {
      setUser(callbackUser);
    } else {
      setUser(supabaseService.getCurrentUser());
    }
  }, []);

  const handleLogout = () => {
    supabaseService.logout();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-emerald-500 selection:text-slate-950">
      {/* 背景環境微光 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* 頂部導覽列 */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-3.5">
          {/* Logo 與標題 */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                Co
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    CoCoBu 叩叩簿
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">
                    Web 雲端財務中心
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* 右側功能按鈕 */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              href="/"
              className="hidden md:inline-flex items-center text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-slate-900 transition-colors"
            >
              官網首頁
            </Link>
            <Link
              href="/download"
              className="hidden sm:inline-flex items-center text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              下載 Android App
            </Link>

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
                <span className="text-xs text-slate-300 hidden sm:inline-block max-w-[150px] truncate">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  title="登出帳號"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => supabaseService.signInWithGoogle()}
                className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Google 登入
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 主頁面內容 */}
      <main className="relative z-10 container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
