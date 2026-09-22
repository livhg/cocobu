'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabaseService } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    supabaseService.signInWithGoogle();
  };

  const handleDirectEnter = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景環境微光 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo 與標題卡片 */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-8 shadow-2xl shadow-black/80 backdrop-blur-xl text-center">
          {/* Brand Icon */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-slate-950 text-2xl shadow-xl shadow-emerald-500/30 mb-6">
            Co
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            登入 CoCoBu 叩叩簿
          </h1>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            透過 Google 帳號連線 Supabase 雲端資料庫，與 Android 原生 App 雙向同步記帳資料。
          </p>

          <div className="space-y-4">
            {/* Google / Gmail 登入主按鈕 */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all shadow-lg shadow-white/10 active:scale-[0.98] disabled:opacity-50"
            >
              {/* Google Official G Logo */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? '正在導向 Google 登入...' : '使用 Google / Gmail 帳號登入'}</span>
            </button>

            {/* 分隔線 */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-3 text-slate-500 font-medium">或</span>
              </div>
            </div>

            {/* 快速預覽 / 訪客模式 */}
            <button
              onClick={handleDirectEnter}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-medium text-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>以檢視模式直接進入 Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* 安全說明 */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center space-x-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500/80" />
            <span>透過 Supabase 官方安全驗證與 RLS 隱私隔離</span>
          </div>

          {/* 返回首頁 */}
          <div className="mt-6">
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
            >
              ← 返回 CoCoBu 官方首頁
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
