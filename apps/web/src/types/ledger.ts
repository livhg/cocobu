export interface Transaction {
  id: string;
  user_id?: string;
  date: string; // YYYY/MM/DD or YYYY-MM-DD
  place: string;
  category: string;
  item: string;
  amount: number;
  hashtag: string;
  month: number;
  year: number;
  is_income?: boolean;
  created_at?: string;
}

export interface TransactionSummary {
  totalExpense: number;
  totalIncome: number;
  netSavings: number;
  count: number;
  prevMonthExpense: number;
  expenseDiffPercent: number;
}

export interface CategoryStat {
  category: string;
  amount: number;
  count: number;
  percentage: number;
  color: string;
}

export interface PlaceStat {
  place: string;
  amount: number;
  count: number;
}

export interface TagStat {
  tag: string;
  amount: number;
  count: number;
}

export interface MonthlyTrend {
  month: number;
  year: number;
  expense: number;
  income: number;
  label: string;
}
