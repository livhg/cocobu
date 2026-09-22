'use client';

import React from 'react';
import { PieChart, Utensils, Laptop, Home, Car, Sparkles, Gift, MoreHorizontal, ShoppingCart } from 'lucide-react';
import { CategoryStat } from '@/types/ledger';

interface CategoryBreakdownProps {
  categories: CategoryStat[];
  totalExpense: number;
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  categories,
  totalExpense,
  selectedCategory,
  onSelectCategory,
}) => {
  const formatMoney = (n: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    }).format(n);
  };

  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'food':
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'tech':
        return <Laptop className="w-4 h-4 text-sky-400" />;
      case 'living':
        return <Home className="w-4 h-4 text-emerald-400" />;
      case 'transport':
        return <Car className="w-4 h-4 text-indigo-400" />;
      case 'beauty':
        return <Sparkles className="w-4 h-4 text-pink-400" />;
      case 'giving':
        return <Gift className="w-4 h-4 text-rose-400" />;
      case 'shopping':
        return <ShoppingCart className="w-4 h-4 text-violet-400" />;
      default:
        return <MoreHorizontal className="w-4 h-4 text-slate-400" />;
    }
  };

  const getCategoryZh = (name: string) => {
    const map: Record<string, string> = {
      food: '飲食美味',
      tech: '科技數位',
      living: '生活居家',
      transport: '交通通勤',
      beauty: '外貌保養',
      giving: '人情送禮',
      shopping: '購物採買',
      other: '其他支出',
    };
    return map[name.toLowerCase()] || name;
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg shadow-black/20 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">支出類別分佈</h3>
            <p className="text-xs text-slate-400">
              總支出 {formatMoney(totalExpense)} · 點擊項目可過濾
            </p>
          </div>
        </div>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            清除篩選
          </button>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8 text-sm text-slate-500">
          目前期間尚無支出資料
        </div>
      ) : (
        <div className="space-y-3.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.category;
            return (
              <div
                key={cat.category}
                onClick={() => onSelectCategory(isSelected ? null : cat.category)}
                className={`group cursor-pointer rounded-xl p-2.5 transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 ring-1 ring-emerald-500/50'
                    : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      {getCategoryIcon(cat.category)}
                    </div>
                    <span className="font-medium text-slate-200">
                      {getCategoryZh(cat.category)}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({cat.count} 筆)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-white">
                      {formatMoney(cat.amount)}
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* 進度條 */}
                <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(3, cat.percentage))}%`,
                      backgroundColor: cat.color || '#10b981',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
