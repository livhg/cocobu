'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Download, ArrowLeft, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DownloadPage() {
  const apkUrl = '/releases/cocobu-latest.apk';

  useEffect(() => {
    // Automatically trigger APK download after 800ms
    const timer = setTimeout(() => {
      const link = document.createElement('a');
      link.href = apkUrl;
      link.download = 'cocobu-latest.apk';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 800);

    return () => clearTimeout(timer);
  }, [apkUrl]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-sm text-slate-400 hover:text-emerald-400 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            返回首頁
          </Link>
          <div className="font-bold tracking-tight text-emerald-400">CoCoBu 叩叩簿</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10 md:py-16 max-w-2xl flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4 animate-bounce">
            <Download className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            正在為您下載 CoCoBu Android APK
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            下載應該會自動開始。如果沒有，請點擊下方按鈕手動下載。
          </p>

          <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <a
              href={apkUrl}
              download="cocobu-latest.apk"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Download className="w-4 h-4 mr-2" />
              重新手動下載 APK
            </a>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/80 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              回首頁查看功能介紹
            </Link>
          </div>
        </div>

        {/* Installation Steps Guide */}
        <Card className="bg-slate-900/90 border-slate-800 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-800/80 bg-slate-900/50 pb-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <CardTitle className="text-base sm:text-lg text-white">
                Android APK 安裝步驟教學
              </CardTitle>
            </div>
            <CardDescription className="text-slate-400 text-xs sm:text-sm">
              由於 CoCoBu 採官方網站直供分發（未上架 Google Play），請依下列步驟完成安裝：
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4 text-sm">
            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <div>
                <p className="font-semibold text-slate-200">下載完成後點擊安裝</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  在手機通知列或「下載」資料夾中找到 <code className="text-emerald-300 bg-slate-800 px-1 py-0.5 rounded">cocobu-latest.apk</code> 並點擊。
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <div>
                <p className="font-semibold text-slate-200">允許「安裝未知應用程式」</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  若系統跳出提示「出於安全考量，您的手機目前不允許安裝此來源的未知應用程式」，請點擊「設定」並開啟「允許來自此來源的應用程式」。
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <div>
                <p className="font-semibold text-slate-200">確認並開啟應用程式</p>
                <p className="text-slate-400 text-xs mt-0.5">
                  點擊「安裝」，等待安裝完成後即可點擊「開啟」立即體驗 CoCoBu 叩叩簿！未來有新版本時，App 內會自動提示並可一鍵升級。
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3.5 mt-2 flex items-start space-x-2.5 text-xs text-slate-400">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                CoCoBu 完全尊重您的隱私，所有資料支援本地離線運算與 Supabase 安全雲端加密備份，無任何第三方追蹤或廣告。
              </span>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} CoCoBu 叩叩簿. All rights reserved.
      </footer>
    </div>
  );
}
