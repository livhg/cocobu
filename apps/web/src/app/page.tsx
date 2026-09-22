import Link from 'next/link';
import {
  Download,
  Smartphone,
  Sparkles,
  Calculator,
  Cloud,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Tag,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  const latestVersion = "1.0.0";
  const releaseDate = "2026-09-22";
  const apkDownloadUrl = "/download";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-emerald-500 selection:text-slate-950">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-slate-950 text-base shadow-lg shadow-emerald-500/20">
              Co
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">CoCoBu 叩叩簿</span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full">
                Android 原生版
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/api/version"
              target="_blank"
              className="hidden sm:inline-flex items-center text-xs text-slate-400 hover:text-emerald-400 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              OTA Version API
            </Link>
            <Button asChild variant="outline" size="sm" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 hover:text-white">
              <Link href="/dashboard">Web 財務後台</Link>
            </Button>
            <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold shadow-md shadow-emerald-500/20">
              <Link href={apkDownloadUrl}>
                <Download className="w-3.5 h-3.5 mr-1.5" />
                下載 APK
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left: Text & Actions */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>v{latestVersion} 正式版現已開放下載</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{releaseDate}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                專為效率而生。<br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  極速原生記帳與分帳
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                告別繁瑣步驟！CoCoBu 叩叩簿結合原生計算機鍵盤、地點與標籤快捷輸入、離線優先快取與 Supabase 雲端多裝置同步，現在更支援全新 Web 財務 Dashboard，讓您隨時在大螢幕瀏覽 1,399+ 筆歷史收支與統計圖表。
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-6 rounded-2xl text-base shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.02]"
                >
                  <Link href={apkDownloadUrl}>
                    <Download className="w-5 h-5 mr-2" />
                    下載 Android APK (v{latestVersion})
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200 px-7 py-6 rounded-2xl text-base"
                >
                  <Link href="/dashboard">
                    <Sparkles className="w-4 h-4 mr-2 text-emerald-400" />
                    進入 Web 財務後台
                  </Link>
                </Button>
              </div>

              {/* Badges / Meta */}
              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" />
                  <span>支援 Android 7.0 以上</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" />
                  <span>離線優先 + 雲端同步</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" />
                  <span>App 內建在線自動更新</span>
                </div>
              </div>
            </div>

            {/* Hero Right: QR Code & Download Box */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-6 shadow-2xl backdrop-blur-sm relative group">
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[11px] shadow">
                  手機直接掃描
                </div>

                <div className="text-center">
                  <h3 className="text-base font-semibold text-white">手機相機掃碼下載</h3>
                  <p className="text-xs text-slate-400 mt-1 mb-4">使用 Android 手機鏡頭掃描即可下載 APK</p>

                  {/* QR Code Card */}
                  <Link
                    href="/download"
                    className="p-3 bg-white rounded-2xl mx-auto inline-block shadow-lg hover:scale-105 transition-transform"
                    title="點擊前往下載或手機掃描"
                  >
                    <img
                      src="/qr-download.svg"
                      alt="手機掃描下載 CoCoBu APK"
                      width={180}
                      height={180}
                      className="w-44 h-44 block rounded-lg"
                    />
                  </Link>

                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>版本：v{latestVersion}</span>
                    <span className="text-emerald-400 font-medium">cocobu-latest.apk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section className="container mx-auto px-4 py-16 border-t border-slate-800/80">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              為現代記帳而生的原生體驗
            </h2>
            <p className="mt-3 text-slate-400 text-sm sm:text-base">
              告別繁複冗長的下拉選單，CoCoBu 叩叩簿將輸入介面精簡至極致
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-900/60 border-slate-800 hover:border-emerald-500/40 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                  <Calculator className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg text-white">實體計算機快捷輸入</CardTitle>
                <CardDescription className="text-slate-400 text-xs sm:text-sm">
                  內建完整算式解析器，支援「120+35*2」等連續快捷運算，邊算邊記不跳出。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 hover:border-emerald-500/40 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-2">
                  <Tag className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg text-white">地點與標籤快捷鍵</CardTitle>
                <CardDescription className="text-slate-400 text-xs sm:text-sm">
                  自訂「全聯、7-11、大潤發」等常去地點與自訂 #Hashtag，一鍵點擊秒速帶入。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 hover:border-emerald-500/40 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg text-white">固定支出定期排程</CardTitle>
                <CardDescription className="text-slate-400 text-xs sm:text-sm">
                  房租、水電、訂閱服務自動排程預測，每月只需一鍵執行，記帳永不漏勾。
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-slate-900/60 border-slate-800 hover:border-emerald-500/40 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
                  <Cloud className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg text-white">雙軌架構秒開同步</CardTitle>
                <CardDescription className="text-slate-400 text-xs sm:text-sm">
                  本地 Room 資料庫保證 0 延遲秒開；Supabase 雲端無感背景雙向加密同步。
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Changelog Section */}
        <section className="container mx-auto px-4 py-16 border-t border-slate-800/80 max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">版本發布紀錄 (Changelog)</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">追蹤 CoCoBu 叩叩簿的每一次功能演進與最佳化</p>
            </div>
            <Link
              href="/api/version"
              target="_blank"
              className="text-xs text-emerald-400 hover:underline inline-flex items-center"
            >
              檢視 JSON API
              <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold text-sm border border-emerald-500/30">
                    v{latestVersion}
                  </span>
                  <span className="font-semibold text-white">首發正式版上線</span>
                </div>
                <span className="text-xs text-slate-500">{releaseDate}</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span><strong>全新直式原生架構</strong>：專為單手操作打造的極速記帳體驗。</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span><strong>計算機快捷輸入</strong>：支援括號、加減乘除連續輸入與即時結算。</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span><strong>自訂管理系統</strong>：地點釘選快捷鍵、分類自選顏色與圖示。</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span><strong>雲端與歷史資料庫</strong>：支援 Supabase 雙向同步與歷史試算表無縫匯入。</span>
                </li>
                <li className="flex items-start">
                  <span className="text-emerald-400 mr-2">•</span>
                  <span><strong>OTA 自動檢查更新</strong>：App 內建自動比對 cocobu.online 最新版號，升級更簡單。</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Installation Guide & FAQ */}
        <section id="install-guide" className="container mx-auto px-4 py-16 border-t border-slate-800/80 max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Android 安裝教學與注意事項</h2>
            <p className="mt-2 text-slate-400 text-sm">若您是第一次從網頁下載安裝 APK，請參閱以下簡易步驟</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mx-auto mb-3">
                1
              </div>
              <h3 className="font-semibold text-white text-base">下載 APK 安裝檔</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                點擊「下載 Android APK」或手機掃描 QR Code，將安裝檔存至手機。
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mx-auto mb-3">
                2
              </div>
              <h3 className="font-semibold text-white text-base">允許未知應用程式</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                若手機跳出安全性提示，點擊「設定」並開啟「允許來自此來源的安裝」。
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm mx-auto mb-3">
                3
              </div>
              <h3 className="font-semibold text-white text-base">一鍵安裝完成</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                點擊安裝完成後即可開啟！日後發布更新時，App 內會自動提示並可一鍵升級。
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="container mx-auto px-4 py-16">
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                準備好讓記帳變得毫不費力了嗎？
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-3 mb-6">
                立即下載最新版 CoCoBu 叩叩簿，體驗極速直式記帳！
              </p>
              <Button
                asChild
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-6 rounded-2xl text-base shadow-lg shadow-emerald-500/30"
              >
                <Link href={apkDownloadUrl}>
                  <Download className="w-5 h-5 mr-2" />
                  立即下載 APK (v{latestVersion})
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="container mx-auto px-4 space-y-2">
          <p>© {new Date().getFullYear()} CoCoBu 叩叩簿. 打造最純粹高效的記帳體驗.</p>
          <div className="flex justify-center space-x-4 text-slate-400">
            <Link href="/api/version" className="hover:text-emerald-400">Version API</Link>
            <span>•</span>
            <Link href="/download" className="hover:text-emerald-400">直接下載</Link>
            <span>•</span>
            <Link href="/dashboard" className="hover:text-emerald-400">Web 財務後台</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
