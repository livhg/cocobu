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
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="text-xl font-bold">CocoBu 叩叩簿</div>
          <Button asChild variant="outline">
            <Link href="/auth/login">登入</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            輕鬆管理支出
            <br />
            <span className="text-blue-600">分帳結算不再混亂</span>
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            CocoBu 叩叩簿是一個簡單易用的記帳與分帳工具。
            <br />
            支援個人記帳、多人分帳、智慧結算，讓財務管理變得輕而易舉。
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/auth/login">開始使用</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#features">了解更多</a>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mx-auto mt-24 max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold">主要功能</h2>
          <div className="grid gap-6 md:grid-cols-3">
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

        {/* CTA Section */}
        <div className="mx-auto mt-24 max-w-3xl text-center">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="text-3xl text-white">
                準備好開始記帳了嗎？
              </CardTitle>
              <CardDescription className="text-blue-100">
                註冊只需一個電子郵件地址，無需密碼
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" variant="secondary">
                <Link href="/auth/login">立即開始</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>&copy; 2024 CocoBu 叩叩簿. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
