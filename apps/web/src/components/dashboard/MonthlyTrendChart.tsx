'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import { MonthlyTrend } from '@/types/ledger';

interface MonthlyTrendChartProps {
  trends: MonthlyTrend[];
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  trends,
  selectedMonth,
  onSelectMonth,
}) => {
  const maxExpense = Math.max(...trends.map((t) => t.expense), 1);

  const formatShortMoney = (n: number) => {
    if (n >= 10000) {
      return `${(n / 10000).toFixed(1)}萬`;
    }
    if (n >= 1000) {
      return `${(n / 1000).toFixed(0)}k`;
    }
    return `${n}`;
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg shadow-black/20 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">年度月度支出走勢</h3>
            <p className="text-xs text-slate-400">點擊月份切換檢視該月帳目</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 items-end h-44 pt-6 pb-2 border-b border-slate-800">
        {trends.map((item) => {
          const heightPercent = Math.max(6, (item.expense / maxExpense) * 100);
          const isSelected = selectedMonth === item.month;

          return (
            <div
              key={`${item.year}-${item.month}`}
              onClick={() => onSelectMonth(item.month)}
              className="flex flex-col items-center h-full justify-end group cursor-pointer"
            >
              {/* 金額浮動標籤 */}
              <span className="text-[10px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 select-none">
                {formatShortMoney(item.expense)}
              </span>

              {/* 長條 */}
              <div className="w-full max-w-[28px] h-full flex items-end">
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isSelected
                      ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/30'
                      : 'bg-slate-800 group-hover:bg-slate-700'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* 月份標籤 */}
              <span
                className={`text-[11px] font-medium mt-2 select-none ${
                  isSelected ? 'text-emerald-400 font-bold' : 'text-slate-400'
                }`}
              >
                {item.month}月
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
