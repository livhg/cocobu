'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, RefreshCw, Filter, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { supabaseService, SupabaseAuthUser } from '@/lib/supabase';
import { Transaction, TransactionSummary, CategoryStat, PlaceStat, TagStat, MonthlyTrend } from '@/types/ledger';
import { StatCards } from '@/components/dashboard/StatCards';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { MonthlyTrendChart } from '@/components/dashboard/MonthlyTrendChart';
import { TopPlacesAndTags } from '@/components/dashboard/TopPlacesAndTags';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { AddTransactionModal } from '@/components/dashboard/AddTransactionModal';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<SupabaseAuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // 篩選狀態 (預設看 2026 年，所有月份或當前月)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = 全年
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);

  // 載入使用者專屬交易
  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await supabaseService.fetchAllTransactions();
      setAllTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions from Supabase', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const callbackUser = supabaseService.handleAuthCallback();
    const user = callbackUser || supabaseService.getCurrentUser();
    setCurrentUser(user);
    setAuthChecked(true);

    if (user) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [loadData]);

  // 可選年份清單 (自動從資料提取)
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    allTransactions.forEach((t) => {
      if (t.year) years.add(t.year);
    });
    years.add(2026);
    years.add(2025);
    return Array.from(years).sort((a, b) => b - a);
  }, [allTransactions]);

  // 依據年份與月份篩選出的基準交易 (用於計算統計)
  const periodTransactions = useMemo(() => {
    return allTransactions.filter((t) => {
      if (t.year !== selectedYear) return false;
      if (selectedMonth !== 0 && t.month !== selectedMonth) return false;
      return true;
    });
  }, [allTransactions, selectedYear, selectedMonth]);

  // 上個月支出 (用於計算成長率)
  const prevMonthExpense = useMemo(() => {
    if (selectedMonth === 0) return 0;
    const prevM = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevY = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

    return allTransactions
      .filter((t) => t.year === prevY && t.month === prevM && !t.is_income)
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [allTransactions, selectedYear, selectedMonth]);

  // 計算本期財務總結指標
  const summary: TransactionSummary = useMemo(() => {
    let totalExpense = 0;
    let totalIncome = 0;

    periodTransactions.forEach((t) => {
      if (t.is_income) {
        totalIncome += t.amount || 0;
      } else {
        totalExpense += t.amount || 0;
      }
    });

    const netSavings = totalIncome - totalExpense;
    let expenseDiffPercent = 0;
    if (prevMonthExpense > 0) {
      expenseDiffPercent = ((totalExpense - prevMonthExpense) / prevMonthExpense) * 100;
    }

    return {
      totalExpense,
      totalIncome,
      netSavings,
      count: periodTransactions.length,
      prevMonthExpense,
      expenseDiffPercent,
    };
  }, [periodTransactions, prevMonthExpense]);

  // 分類支出統計
  const categoryStats: CategoryStat[] = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    let totalExp = 0;

    periodTransactions.forEach((t) => {
      if (t.is_income) return;
      const cat = t.category || 'Other';
      if (!map[cat]) map[cat] = { amount: 0, count: 0 };
      map[cat].amount += t.amount || 0;
      map[cat].count += 1;
      totalExp += t.amount || 0;
    });

    const colorPalette: Record<string, string> = {
      Food: '#f59e0b',
      Living: '#10b981',
      Transport: '#6366f1',
      Tech: '#0ea5e9',
      Beauty: '#ec4899',
      Giving: '#f43f5e',
      Shopping: '#8b5cf6',
      Other: '#64748b',
    };

    return Object.entries(map)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
        percentage: totalExp > 0 ? (data.amount / totalExp) * 100 : 0,
        color: colorPalette[category] || '#10b981',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [periodTransactions]);

  // 年度各月份趨勢
  const monthlyTrends: MonthlyTrend[] = useMemo(() => {
    const trends: MonthlyTrend[] = [];
    for (let m = 1; m <= 12; m++) {
      let exp = 0;
      let inc = 0;
      allTransactions.forEach((t) => {
        if (t.year === selectedYear && t.month === m) {
          if (t.is_income) inc += t.amount || 0;
          else exp += t.amount || 0;
        }
      });
      trends.push({
        month: m,
        year: selectedYear,
        expense: exp,
        income: inc,
        label: `${m}月`,
      });
    }
    return trends;
  }, [allTransactions, selectedYear]);

  // 熱門地點排行 Top 5
  const topPlaces: PlaceStat[] = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    periodTransactions.forEach((t) => {
      if (!t.place || t.is_income) return;
      if (!map[t.place]) map[t.place] = { amount: 0, count: 0 };
      map[t.place].amount += t.amount || 0;
      map[t.place].count += 1;
    });

    return Object.entries(map)
      .map(([place, data]) => ({
        place,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [periodTransactions]);

  // 專案標籤統計 Top 8
  const topTags: TagStat[] = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    periodTransactions.forEach((t) => {
      if (!t.hashtag || t.is_income) return;
      const tag = t.hashtag.trim();
      if (!map[tag]) map[tag] = { amount: 0, count: 0 };
      map[tag].amount += t.amount || 0;
      map[tag].count += 1;
    });

    return Object.entries(map)
      .map(([tag, data]) => ({
        tag,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);
  }, [periodTransactions]);

  // 最終傳入 TransactionList 的資料（含分類、標籤、地點的二次交叉篩選）
  const displayedTransactions = useMemo(() => {
    return periodTransactions.filter((t) => {
      if (selectedCategory && t.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (selectedTag && (!t.hashtag || !t.hashtag.toLowerCase().includes(selectedTag.toLowerCase()))) {
        return false;
      }
      if (selectedPlace && (!t.place || t.place.toLowerCase() !== selectedPlace.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [periodTransactions, selectedCategory, selectedTag, selectedPlace]);

  // 新增交易
  const handleAddTransaction = async (newTx: Omit<Transaction, 'id' | 'created_at'>) => {
    const created = await supabaseService.createTransaction(newTx);
    setAllTransactions((prev) => [created, ...prev]);
    showNotice(`成功記帳：${newTx.item} NT$ ${newTx.amount}`);
  };

  // 刪除交易
  const handleDeleteTransaction = async (id: string) => {
    await supabaseService.deleteTransaction(id);
    setAllTransactions((prev) => prev.filter((t) => t.id !== id));
    showNotice('已成功刪除記帳');
  };

  // 提示訊息小膠囊
  const showNotice = (msg: string) => {
    setSyncNotice(msg);
    setTimeout(() => setSyncNotice(null), 3500);
  };

  const periodTitle = selectedMonth === 0 ? `${selectedYear} 全年` : `${selectedYear} 年 ${selectedMonth} 月`;

  if (authChecked && !currentUser) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-black/40">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">請先登入 Google 帳號</h2>
          <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
            為保護您的財務數據隱私，CoCoBu 雲端記帳本僅對已通過 Google 驗證的本人開放查閱與記帳。
          </p>
        </div>
        <button
          onClick={() => supabaseService.signInWithGoogle()}
          className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all shadow-lg shadow-white/10 active:scale-[0.98] cursor-pointer"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
          <span>使用 Google / Gmail 帳號登入</span>
        </button>
        <div className="pt-4 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>受 Row Level Security 保護，僅限您本人的 Google 帳號可存取</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 提示小膠囊 */}
      {syncNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-semibold text-xs shadow-xl shadow-emerald-500/20 animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-4 h-4" />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* 控制工具列：年份、月份、重新同步與記帳按鈕 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
        {/* 標題與資料庫狀態 */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">Supabase 雲端資料庫</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-mono font-medium">
              共 {allTransactions.length} 筆歷史紀錄
            </span>
          </div>
        </div>

        {/* 期間切換器與記帳按鈕 */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* 年份選擇 */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y} 年
              </option>
            ))}
          </select>

          {/* 月份快捷按鈕列 */}
          <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto max-w-[280px] sm:max-w-none">
            <button
              onClick={() => setSelectedMonth(0)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                selectedMonth === 0
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              全年
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(m)}
                className={`px-2 py-1 text-xs font-medium rounded-lg transition-all ${
                  selectedMonth === m
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}月
              </button>
            ))}
          </div>

          {/* 重新整理 */}
          <button
            onClick={loadData}
            disabled={isRefreshing}
            title="從 Supabase 重新整理"
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* + 記一筆 按鈕 */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-1 stroke-[3]" />
            記一筆
          </button>
        </div>
      </div>

      {/* 關鍵財務統計卡 */}
      <StatCards summary={summary} selectedMonthName={periodTitle} />

      {/* 視覺圖表區塊：年度走勢圖與分類佔比 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <MonthlyTrendChart
            trends={monthlyTrends}
            selectedMonth={selectedMonth}
            onSelectMonth={(m) => setSelectedMonth(m === selectedMonth ? 0 : m)}
          />
        </div>
        <div className="lg:col-span-5">
          <CategoryBreakdown
            categories={categoryStats}
            totalExpense={summary.totalExpense}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </div>

      {/* 地點排行與標籤統計 */}
      <TopPlacesAndTags
        topPlaces={topPlaces}
        topTags={topTags}
        selectedPlace={selectedPlace}
        selectedTag={selectedTag}
        onSelectPlace={setSelectedPlace}
        onSelectTag={setSelectedTag}
      />

      {/* 篩選標籤提示列 (若有啟動過濾) */}
      {(selectedCategory || selectedTag || selectedPlace) && (
        <div className="flex items-center flex-wrap gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          <Filter className="w-3.5 h-3.5 mr-1" />
          <span>正在進行交叉過濾：</span>
          {selectedCategory && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
              類別: {selectedCategory}
            </span>
          )}
          {selectedPlace && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
              地點: {selectedPlace}
            </span>
          )}
          {selectedTag && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300">
              標籤: {selectedTag}
            </span>
          )}
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedPlace(null);
              setSelectedTag(null);
            }}
            className="ml-auto underline hover:text-white transition-colors"
          >
            重設所有交叉篩選
          </button>
        </div>
      )}

      {/* 完整歷史流水帳清單 */}
      <TransactionList
        transactions={displayedTransactions}
        onDeleteTransaction={handleDeleteTransaction}
        isLoading={isLoading}
      />

      {/* 快速新增記帳 Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTransaction}
      />
    </div>
  );
}
