'use client';

import React from 'react';
import { MapPin, Hash } from 'lucide-react';
import { PlaceStat, TagStat } from '@/types/ledger';

interface TopPlacesAndTagsProps {
  topPlaces: PlaceStat[];
  topTags: TagStat[];
  selectedTag: string | null;
  selectedPlace: string | null;
  onSelectTag: (tag: string | null) => void;
  onSelectPlace: (place: string | null) => void;
}

export const TopPlacesAndTags: React.FC<TopPlacesAndTagsProps> = ({
  topPlaces,
  topTags,
  selectedTag,
  selectedPlace,
  onSelectTag,
  onSelectPlace,
}) => {
  const formatMoney = (n: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      maximumFractionDigits: 0,
    }).format(n);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 熱門消費地點 */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg shadow-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">消費地點排行 Top 5</h3>
              <p className="text-xs text-slate-400">點擊地點可快速檢視詳細清單</p>
            </div>
          </div>
          {selectedPlace && (
            <button
              onClick={() => onSelectPlace(null)}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              清除
            </button>
          )}
        </div>

        {topPlaces.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-500">尚無地點記錄</div>
        ) : (
          <div className="space-y-2.5">
            {topPlaces.map((p, idx) => {
              const isSelected = selectedPlace === p.place;
              return (
                <div
                  key={p.place}
                  onClick={() => onSelectPlace(isSelected ? null : p.place)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 ring-1 ring-indigo-500/50'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-5 text-center text-xs font-bold text-slate-500">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-200 text-sm">
                      {p.place || '(未填地點)'}
                    </span>
                    <span className="text-xs text-slate-500">
                      {p.count} 次
                    </span>
                  </div>
                  <span className="font-semibold text-white text-sm">
                    {formatMoney(p.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 專案與主題標籤 */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 shadow-lg shadow-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">專案標籤透視 (#Hashtag)</h3>
              <p className="text-xs text-slate-400">出遊、固定支出等專案總額</p>
            </div>
          </div>
          {selectedTag && (
            <button
              onClick={() => onSelectTag(null)}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              清除
            </button>
          )}
        </div>

        {topTags.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-500">尚無標籤記錄</div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {topTags.map((t) => {
              const isSelected = selectedTag === t.tag;
              return (
                <button
                  key={t.tag}
                  onClick={() => onSelectTag(isSelected ? null : t.tag)}
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/50'
                      : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="font-semibold">{t.tag}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-950/60 text-slate-400">
                    {t.count}
                  </span>
                  <span className="text-emerald-400 font-medium">
                    {formatMoney(t.amount)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
