import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export interface AppVersionResponse {
  versionCode: number;
  versionName: string;
  apkUrl: string;
  releaseDate: string;
  changelog: string[];
  forceUpdate: boolean;
  minSupportedVersion: number;
  fileSizeBytes?: string;
  sha256?: string;
}

export async function GET() {
  const versionData: AppVersionResponse = {
    versionCode: 1,
    versionName: "1.0.0",
    apkUrl: "https://cocobu.online/releases/cocobu-latest.apk",
    releaseDate: "2026-09-22",
    forceUpdate: false,
    minSupportedVersion: 1,
    fileSizeBytes: "18.4 MB",
    changelog: [
      "🎉 CoCoBu 叩叩簿 原生 Android 首發版本正式發布！",
      "⚡ 極速日常記帳：支援計算機鍵盤即時運算、即點即記",
      "🏷️ 智慧標籤與常用地點快捷按鈕，輸入更省心",
      "📊 財務總覽與分類統計圓餅圖",
      "🔄 支援 Supabase 雲端多裝置即時同步，資料永不遺失",
      "📅 定期固定收支管理與自動排程預測"
    ]
  };

  return NextResponse.json(versionData, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
