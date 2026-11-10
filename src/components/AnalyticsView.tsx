import React from 'react';
import { PieChart, TrendingUp, TrendingDown } from 'lucide-react';
import { Transaction, MonthlySummary, Category } from '../types';
import { formatRupiah, INDONESIAN_MONTHS } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface AnalyticsViewProps {
  transactions: Transaction[];
  summary: MonthlySummary;
  categories: Category[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  summary,
  categories,
}) => {
  const monthName = INDONESIAN_MONTHS[summary.month];

  // Category map
  const categoryMap = new Map<string, Category>();
  categories.forEach((c) => categoryMap.set(c.name, c));

  // Expense by category
  const expenseByCategory: { [cat: string]: number } = {};
  const incomeByCategory: { [cat: string]: number } = {};

  transactions.forEach((t) => {
    if (t.type === 'KELUAR') {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    } else if (t.type === 'MASUK') {
      incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
    }
  });

  const sortedExpenses = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);
  const sortedIncomes = Object.entries(incomeByCategory).sort((a, b) => b[1] - a[1]);

  const totalExpense = summary.totalExpense || 1;
  const totalIncome = summary.totalIncome || 1;

  // Days in month
  const daysInMonth = new Date(summary.year, summary.month + 1, 0).getDate();
  const avgDailyExpense = Math.round(summary.totalExpense / daysInMonth);

  return (
    <div id="analytics-view" className="space-y-3">
      {/* Cashflow Ratio Card */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Rasio Keuangan {monthName}</h3>
              <p className="text-[11px] text-slate-500">Perbandingan arus kas masuk & keluar</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {summary.transactionCount} Transaksi
          </span>
        </div>

        {/* Dual Progress Bar */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] font-bold font-mono">
            <span className="text-emerald-700">Masuk: +{formatRupiah(summary.totalIncome)}</span>
            <span className="text-rose-700">Keluar: -{formatRupiah(summary.totalExpense)}</span>
          </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-md overflow-hidden flex border border-slate-200">
            {summary.totalIncome + summary.totalExpense > 0 ? (
              <>
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${
                      (summary.totalIncome / (summary.totalIncome + summary.totalExpense)) * 100
                    }%`,
                  }}
                />
                <div
                  className="bg-rose-500 transition-all duration-500"
                  style={{
                    width: `${
                      (summary.totalExpense / (summary.totalIncome + summary.totalExpense)) * 100
                    }%`,
                  }}
                />
              </>
            ) : (
              <div className="w-full bg-slate-200" />
            )}
          </div>
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-medium text-slate-500 block">Rata-rata Keluar / Hari:</span>
            <span className="font-bold font-mono text-slate-900 text-xs sm:text-sm mt-0.5 block">
              {formatRupiah(avgDailyExpense)}
            </span>
          </div>

          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] font-medium text-slate-500 block">Status Arus Kas:</span>
            <span
              className={`font-bold text-xs sm:text-sm mt-0.5 block ${
                summary.netCashflow >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {summary.netCashflow >= 0 ? 'Surplus (Aman)' : 'Defisit (Perlu Hemat)'}
            </span>
          </div>
        </div>
      </div>

      {/* Expense by Category Breakdown */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-800 border border-rose-200">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Rincian Kategori Pengeluaran</h4>
            <p className="text-[11px] text-slate-500">Komposisi pos pengeluaran</p>
          </div>
        </div>

        {sortedExpenses.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">Belum ada pengeluaran pada bulan ini.</p>
        ) : (
          <div className="space-y-2">
            {sortedExpenses.map(([catName, amount]) => {
              const catObj = categoryMap.get(catName);
              const percentage = Math.round((amount / totalExpense) * 100);

              return (
                <div key={catName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="p-1 rounded text-white"
                        style={{ backgroundColor: catObj?.color || '#f97316' }}
                      >
                        <CategoryIcon name={catObj?.iconName || 'Tag'} className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-slate-900 text-xs">{catName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-bold text-slate-900 text-xs">{formatRupiah(amount)}</span>
                      <span className="text-slate-500 text-[10px] w-8 text-right font-semibold">({percentage}%)</span>
                    </div>
                  </div>

                  {/* Percentage bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: catObj?.color || '#f97316',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Income by Category Breakdown */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Sumber Pemasukan</h4>
            <p className="text-[11px] text-slate-500">Asal pendapatan dan uang masuk</p>
          </div>
        </div>

        {sortedIncomes.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">Belum ada pemasukan pada bulan ini.</p>
        ) : (
          <div className="space-y-2">
            {sortedIncomes.map(([catName, amount]) => {
              const catObj = categoryMap.get(catName);
              const percentage = Math.round((amount / totalIncome) * 100);

              return (
                <div key={catName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="p-1 rounded text-white"
                        style={{ backgroundColor: catObj?.color || '#10b981' }}
                      >
                        <CategoryIcon name={catObj?.iconName || 'Briefcase'} className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-slate-900 text-xs">{catName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-bold text-emerald-700 text-xs">+{formatRupiah(amount)}</span>
                      <span className="text-slate-500 text-[10px] w-8 text-right font-semibold">({percentage}%)</span>
                    </div>
                  </div>

                  {/* Percentage bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: catObj?.color || '#10b981',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

