import Link from 'next/link';
import { BookOpen, Users, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header - Mobile First */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
          <div className="text-lg font-bold md:text-xl">CocoBu 叩叩簿</div>
          <Button asChild variant="outline" size="default">
            <Link href="/auth/login">登入</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section - Mobile First Spacing */}
      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
            輕鬆管理支出
            <br />
            <span className="text-blue-600">分帳結算不再混亂</span>
          </h1>
          <p className="mb-6 text-base leading-relaxed text-gray-600 md:mb-8 md:text-lg">
            CocoBu 叩叩簿是一個簡單易用的記帳與分帳工具。
            <br className="hidden sm:inline" />
            支援個人記帳、多人分帳、智慧結算，讓財務管理變得輕而易舉。
          </p>
          {/* Mobile: Stack buttons vertically, Desktop: Horizontal */}
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/auth/login">開始使用</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <a href="#features">了解更多</a>
            </Button>
          </div>
        </div>

        {/* Features Section - Mobile First Spacing */}
        <div id="features" className="mx-auto mt-12 max-w-5xl md:mt-24">
          <h2 className="mb-6 text-center text-2xl font-bold md:mb-12 md:text-3xl">
            主要功能
          </h2>
          <div className="grid gap-4 md:gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>個人帳本</CardTitle>
                <CardDescription>
                  輕鬆記錄每日支出，分類管理，清楚掌握財務狀況
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>多人分帳</CardTitle>
                <CardDescription>
                  與朋友、家人共享帳本，即時記錄共同支出
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <Calculator className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>智慧結算</CardTitle>
                <CardDescription>
                  自動計算分帳金額，優化轉帳次數，結算更簡單
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* CTA Section - Mobile First Spacing */}
        <div className="mx-auto mt-12 max-w-3xl text-center md:mt-24">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-white md:text-3xl">
                準備好開始記帳了嗎？
              </CardTitle>
              <CardDescription className="text-base text-blue-100">
                註冊只需一個電子郵件地址，無需密碼
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <Link href="/auth/login">立即開始</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer - Mobile First */}
      <footer className="mt-12 border-t bg-gray-50 py-6 md:mt-24 md:py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; 2024 CocoBu 叩叩簿. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
