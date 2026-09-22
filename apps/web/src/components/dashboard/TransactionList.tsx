'use client';

import React, { useState, useMemo } from 'react';
import { Search, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, Hash, MapPin, Download } from 'lucide-react';
import { Transaction } from '@/types/ledger';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDeleteTransaction,
  isLoading,
}) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(false);
  const pageSize = 20;

  const formatMoney = (n: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    }).format(n);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'food':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'tech':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'living':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'transport':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'beauty':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      case 'giving':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'shopping':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          (t.item && t.item.toLowerCase().includes(q)) ||
          (t.place && t.place.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (t.hashtag && t.hashtag.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return sortAsc ? -diff : diff;
    });

    return list;
  }, [transactions, search, sortAsc]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pageTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const header = '日期,地點,分類,品項,金額,標籤\n';
    const rows = filtered
      .map((t) => `"${t.date}","${t.place || ''}","${t.category}","${t.item}",${t.amount},"${t.hashtag || ''}"`)
      .join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cocobu_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg shadow-black/20 backdrop-blur-sm">
      {/* 頂部列：搜尋、排序與匯出 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h3 className="font-semibold text-white text-base">流水帳明細清單</h3>
          <p className="text-xs text-slate-400">
            共找到 {filtered.length} 筆記帳資料
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 搜尋框 */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋品項、地點、標籤..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          {/* 排序按鈕 */}
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
            {sortAsc ? '日期舊到新' : '日期新到舊'}
          </button>

          {/* 匯出 CSV */}
          <button
            onClick={handleExportCSV}
            title="匯出篩選結果為 CSV"
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            匯出
          </button>
        </div>
      </div>

      {/* 列表內容 */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <p className="text-xs text-slate-400">正在從 Supabase 載入歷史記帳...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500">
          無符合篩選條件的記帳明細
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400">
                <th className="pb-3 pl-2 font-medium">日期</th>
                <th className="pb-3 font-medium">類別</th>
                <th className="pb-3 font-medium">品項與地點</th>
                <th className="pb-3 font-medium">專案標籤</th>
                <th className="pb-3 pr-2 text-right font-medium">金額</th>
                <th className="pb-3 text-center font-medium w-12">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {pageTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="group hover:bg-slate-800/40 transition-colors"
                >
                  {/* 日期 */}
                  <td className="py-3 pl-2 font-mono text-xs text-slate-300 whitespace-nowrap">
                    {tx.date}
                  </td>

                  {/* 類別 */}
                  <td className="py-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${getCategoryColor(
                        tx.category
                      )}`}
                    >
                      {tx.category}
                    </span>
                  </td>

                  {/* 品項與地點 */}
                  <td className="py-3">
                    <div className="font-medium text-slate-100">{tx.item}</div>
                    {tx.place && (
                      <div className="flex items-center text-xs text-slate-400 mt-0.5">
                        <MapPin className="w-3 h-3 mr-1 text-slate-500 shrink-0" />
                        <span>{tx.place}</span>
                      </div>
                    )}
                  </td>

                  {/* 標籤 */}
                  <td className="py-3 whitespace-nowrap">
                    {tx.hashtag ? (
                      <span className="inline-flex items-center text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        <Hash className="w-3 h-3 mr-0.5" />
                        {tx.hashtag.replace(/^#/, '')}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs">-</span>
                    )}
                  </td>

                  {/* 金額 */}
                  <td className="py-3 pr-2 text-right whitespace-nowrap">
                    <span
                      className={`font-semibold font-mono ${
                        tx.is_income ? 'text-emerald-400' : 'text-slate-100'
                      }`}
                    >
                      {tx.is_income ? '+' : ''}
                      {formatMoney(tx.amount)}
                    </span>
                  </td>

                  {/* 操作 */}
                  <td className="py-3 text-center">
                    <button
                      onClick={async () => {
                        if (confirm(`確定要刪除「${tx.item}」這筆記帳嗎？`)) {
                          await onDeleteTransaction(tx.id);
                        }
                      }}
                      title="刪除記帳"
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-60 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 分頁控制器 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-400">
          <span>
            第 {currentPage} 頁，共 {totalPages} 頁
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono font-medium text-slate-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
