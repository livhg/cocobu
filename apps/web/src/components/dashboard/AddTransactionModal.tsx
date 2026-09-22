'use client';

import React, { useState } from 'react';
import { X, Plus, Check, AlertCircle } from 'lucide-react';
import { Transaction } from '@/types/ledger';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tx: Omit<Transaction, 'id' | 'created_at'>) => Promise<void>;
}

const CATEGORIES = [
  { id: 'Food', name: '飲食美味' },
  { id: 'Living', name: '生活居家' },
  { id: 'Transport', name: '交通通勤' },
  { id: 'Tech', name: '科技數位' },
  { id: 'Beauty', name: '外貌保養' },
  { id: 'Giving', name: '人情送禮' },
  { id: 'Shopping', name: '購物採買' },
  { id: 'Other', name: '其他支出' },
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const getTodayString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  };

  const [date, setDate] = useState(getTodayString());
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [place, setPlace] = useState('');
  const [hashtag, setHashtag] = useState('');
  const [isIncome, setIsIncome] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!item.trim()) {
      setError('請輸入品項名稱');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('請輸入大於 0 的有效金額');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 解析年月
      const parts = date.replace(/-/g, '/').split('/');
      const year = parseInt(parts[0], 10) || new Date().getFullYear();
      const month = parseInt(parts[1], 10) || (new Date().getMonth() + 1);

      await onSubmit({
        date: date.replace(/-/g, '/'),
        item: item.trim(),
        amount: numAmount,
        category,
        place: place.trim(),
        hashtag: hashtag.trim() ? (hashtag.startsWith('#') ? hashtag.trim() : `#${hashtag.trim()}`) : '',
        year,
        month,
        is_income: isIncome,
      });

      // 重設並關閉
      setItem('');
      setAmount('');
      setPlace('');
      setHashtag('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '記帳失敗，請稍後重試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl shadow-black/60 text-slate-100">
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 標題 */}
        <div className="flex items-center space-x-2.5 mb-5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">快速新增流水帳</h2>
            <p className="text-xs text-slate-400">直接同步至 Supabase 雲端資料庫</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 收支型態切換 */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setIsIncome(false)}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                !isIncome
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              支出 Expense
            </button>
            <button
              type="button"
              onClick={() => setIsIncome(true)}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                isIncome
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              收入 Income
            </button>
          </div>

          {/* 金額與日期 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                金額 (NT$) *
              </label>
              <input
                type="number"
                step="any"
                required
                placeholder="例如 150"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-lg font-bold font-mono text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                日期 (YYYY/MM/DD) *
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 品項與地點 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                品項名稱 *
              </label>
              <input
                type="text"
                required
                placeholder="例如 午餐、拿鐵、高鐵票"
                value={item}
                onChange={(e) => setItem(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                消費地點 (選填)
              </label>
              <input
                type="text"
                placeholder="例如 7-11、蝦皮、星巴克"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 分類選擇器 */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              支出類別
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium transition-all ${
                    category === cat.id
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* 專案標籤 */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              專案標籤 (選填，如 #Fix Expense、#滑雪初體驗)
            </label>
            <input
              type="text"
              placeholder="#Fix Expense"
              value={hashtag}
              onChange={(e) => setHashtag(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* 底部按鈕 */}
          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>同步儲存中...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  儲存並同步
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
