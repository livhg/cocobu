'use client';

import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Receipt, ArrowUpRight, ArrowDownRight, Scale } from 'lucide-react';
import { TransactionSummary } from '@/types/ledger';

interface StatCardsProps {
  summary: TransactionSummary;
  selectedMonthName: string;
}

export const StatCards: React.FC<StatCardsProps> = ({ summary, selectedMonthName }) => {
  const formatMoney = (n: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    }).format(n);
  };

  const isMoreExpense = summary.expenseDiffPercent > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 總支出 */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg shadow-black/20 backdrop-blur-sm transition-all hover:border-slate-700">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">{selectedMonthName} 總支出</span>
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          {formatMoney(summary.totalExpense)}
        </div>
        <div className="flex items-center text-xs">
          {summary.prevMonthExpense > 0 ? (
            <span
              className={`inline-flex items-center font-medium ${
                isMoreExpense ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isMoreExpense ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {Math.abs(summary.expenseDiffPercent).toFixed(1)}%
              <span className="text-slate-500 ml-1">相較上月</span>
            </span>
          ) : (
            <span className="text-slate-500">上月無資料</span>
          )}
        </div>
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-rose-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 總收入 */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg shadow-black/20 backdrop-blur-sm transition-all hover:border-slate-700">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">{selectedMonthName} 總收入</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          {formatMoney(summary.totalIncome)}
        </div>
        <div className="flex items-center text-xs text-slate-400">
          <span className="text-emerald-400 font-medium mr-1.5">雲端同步</span>
          <span className="text-slate-500">薪資與各項進帳</span>
        </div>
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 淨結餘 */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg shadow-black/20 backdrop-blur-sm transition-all hover:border-slate-700">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">{selectedMonthName} 淨結餘</span>
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Scale className="w-4 h-4" />
          </div>
        </div>
        <div
          className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${
            summary.netSavings >= 0 ? 'text-teal-400' : 'text-rose-400'
          }`}
        >
          {formatMoney(summary.netSavings)}
        </div>
        <div className="flex items-center text-xs text-slate-400">
          <Wallet className="w-3.5 h-3.5 mr-1 text-slate-500" />
          <span className="text-slate-500">
            {summary.netSavings >= 0 ? '儲蓄盈餘' : '本月超支'}
          </span>
        </div>
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-teal-500/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 記帳筆數 */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-lg shadow-black/20 backdrop-blur-sm transition-all hover:border-slate-700">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">{selectedMonthName} 記帳筆數</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          {summary.count}{' '}
          <span className="text-sm font-normal text-slate-500">筆</span>
        </div>
        <div className="flex items-center text-xs text-slate-400">
          <span className="text-indigo-400 font-medium mr-1.5">流水帳詳實記錄</span>
          <span className="text-slate-500">日均 {(summary.count / 30).toFixed(1)} 筆</span>
        </div>
        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
      </div>
    </div>
  );
};
