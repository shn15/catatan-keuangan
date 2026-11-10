import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  Landmark,
  Wallet,
  Clock,
  Smartphone,
  ArrowLeftRight,
} from 'lucide-react';
import { Transaction, TransactionType, WalletType, Category } from '../types';
import { formatRupiah, formatDateIndo, getTimeFromTimestamp, getWalletLabel } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onSelectTransaction: (tx: Transaction) => void;
  monthName: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onSelectTransaction,
  monthName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [walletFilter, setWalletFilter] = useState<'ALL' | WalletType>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Category map lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.name, c));
    return map;
  }, [categories]);

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      // Type match
      if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
      // Wallet match (including transfer impact)
      if (walletFilter !== 'ALL') {
        if (t.type === 'TRANSFER') {
          if (t.sourceWallet !== walletFilter && t.targetWallet !== walletFilter && t.wallet !== walletFilter) {
            return false;
          }
        } else if ((t.wallet || 'ONLINE') !== walletFilter) {
          return false;
        }
      }
      // Category match
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNotes = (t.notes || '').toLowerCase().includes(q);
        const matchCategory = t.category.toLowerCase().includes(q);
        const matchAmount = String(t.amount).includes(q);
        const matchDate = t.date.includes(q);
        const matchTime = (t.time || (t.createdAt ? getTimeFromTimestamp(t.createdAt) : '')).includes(q);
        const matchWallet = (
          t.wallet === 'DOMPET'
            ? 'dompet tunai cash'
            : t.wallet === 'EWALLET'
            ? 'ewallet gopay ovo dana shopeepay digital'
            : 'online banking transfer rekening atm bank'
        ).includes(q);
        if (!matchNotes && !matchCategory && !matchAmount && !matchDate && !matchTime && !matchWallet) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, walletFilter, selectedCategory, searchQuery]);

  // Group transactions by date (descending), within each date sort by time descending
  const groupedTransactions: Record<string, Transaction[]> = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    const sorted = [...filtered].sort((a, b) => {
      const dtA = `${a.date} ${a.time || ''}`;
      const dtB = `${b.date} ${b.time || ''}`;
      const diff = dtB.localeCompare(dtA);
      if (diff !== 0) return diff;
      return b.createdAt - a.createdAt;
    });

    sorted.forEach((t) => {
      if (!groups[t.date]) {
        groups[t.date] = [];
      }
      groups[t.date].push(t);
    });
    return groups;
  }, [filtered]);

  const uniqueCategoriesInList = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => set.add(t.category));
    return Array.from(set);
  }, [transactions]);

  return (
    <div id="transaction-list-section" className="space-y-3">
      {/* High Density Search & Filter Controls */}
      <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            id="input-search-transaction"
            type="text"
            placeholder="Cari transaksi, kategori, nominal, rekening/dompet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Chips: Akun/Dompet & Transaksi */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {/* All */}
          <button
            onClick={() => {
              setTypeFilter('ALL');
              setWalletFilter('ALL');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              typeFilter === 'ALL' && walletFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
            }`}
          >
            Semua ({transactions.length})
          </button>

          {/* Wallet Filter: Online Bank */}
          <button
            onClick={() => setWalletFilter(walletFilter === 'ONLINE' ? 'ALL' : 'ONLINE')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              walletFilter === 'ONLINE'
                ? 'bg-sky-700 text-white shadow-2xs'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200/80'
            }`}
          >
            <Landmark className="w-3 h-3" />
            Bank (ATM)
          </button>

          {/* Wallet Filter: E-Wallet */}
          <button
            onClick={() => setWalletFilter(walletFilter === 'EWALLET' ? 'ALL' : 'EWALLET')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              walletFilter === 'EWALLET'
                ? 'bg-indigo-700 text-white shadow-2xs'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200/80'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            E-Wallet
          </button>

          {/* Wallet Filter: Dompet */}
          <button
            onClick={() => setWalletFilter(walletFilter === 'DOMPET' ? 'ALL' : 'DOMPET')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              walletFilter === 'DOMPET'
                ? 'bg-amber-700 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/80'
            }`}
          >
            <Wallet className="w-3 h-3" />
            Dompet (Tunai)
          </button>

          {/* Type Filter: Masuk */}
          <button
            onClick={() => setTypeFilter(typeFilter === 'MASUK' ? 'ALL' : 'MASUK')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              typeFilter === 'MASUK'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <ArrowDownLeft className="w-3 h-3" />
            Masuk
          </button>

          {/* Type Filter: Keluar */}
          <button
            onClick={() => setTypeFilter(typeFilter === 'KELUAR' ? 'ALL' : 'KELUAR')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              typeFilter === 'KELUAR'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
            }`}
          >
            <ArrowUpRight className="w-3 h-3" />
            Keluar
          </button>

          {/* Type Filter: Transfer */}
          <button
            onClick={() => setTypeFilter(typeFilter === 'TRANSFER' ? 'ALL' : 'TRANSFER')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              typeFilter === 'TRANSFER'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200/60'
            }`}
          >
            <ArrowLeftRight className="w-3 h-3" />
            Pindah Kas
          </button>

          {/* Category Dropdown Filter */}
          {uniqueCategoriesInList.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-1 rounded-lg border border-slate-200 focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              {uniqueCategoriesInList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-center space-y-2 shadow-2xs">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">Belum Ada Transaksi</h4>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {searchQuery || typeFilter !== 'ALL' || walletFilter !== 'ALL' || selectedCategory !== 'ALL'
              ? 'Tidak ada transaksi yang cocok dengan filter pencarian.'
              : `Belum ada catatan keuangan untuk ${monthName}.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(groupedTransactions).map(([date, txs]) => {
            const dailyMasuk = txs
              .filter((t) => t.type === 'MASUK')
              .reduce((sum, t) => sum + t.amount, 0);
            const dailyKeluar = txs
              .filter((t) => t.type === 'KELUAR')
              .reduce((sum, t) => sum + t.amount, 0);

            return (
              <div key={date} className="space-y-1.5">
                {/* Date Header with Daily Subtotal */}
                <div className="flex items-center justify-between px-1 text-xs text-slate-600 font-medium">
                  <span className="font-bold text-slate-800">{formatDateIndo(date, 'with-day')}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
                    {dailyMasuk > 0 && <span className="text-emerald-700">+{formatRupiah(dailyMasuk)}</span>}
                    {dailyKeluar > 0 && <span className="text-rose-700">-{formatRupiah(dailyKeluar)}</span>}
                  </div>
                </div>

                {/* Items in this date */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100 overflow-hidden">
                  {txs.map((tx) => {
                    const catObj = categoryMap.get(tx.category);
                    const isMasuk = tx.type === 'MASUK';
                    const isTransfer = tx.type === 'TRANSFER';
                    const isEwallet = tx.wallet === 'EWALLET';
                    const isDompet = tx.wallet === 'DOMPET';
                    const txTime = tx.time || (tx.createdAt ? getTimeFromTimestamp(tx.createdAt) : '');

                    return (
                      <button
                        key={tx.id}
                        onClick={() => onSelectTransaction(tx)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center text-white shrink-0 shadow-2xs"
                            style={{
                              backgroundColor: isTransfer
                                ? '#4f46e5'
                                : catObj?.color || (isMasuk ? '#10b981' : '#f97316'),
                            }}
                          >
                            {isTransfer ? (
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                            ) : (
                              <CategoryIcon
                                name={catObj?.iconName || (isMasuk ? 'TrendingUp' : 'Tag')}
                                className="w-3.5 h-3.5"
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs truncate">
                                {tx.category}
                              </span>

                              {/* Time Badge */}
                              {txTime && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200/80 flex items-center gap-0.5">
                                  <Clock className="w-2.5 h-2.5 text-slate-400" />
                                  {txTime}
                                </span>
                              )}

                              {/* Wallet Badge: Bank vs E-Wallet vs Dompet */}
                              {isTransfer ? (
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider flex items-center gap-1 bg-indigo-50 text-indigo-800 border border-indigo-200">
                                  <ArrowLeftRight className="w-2.5 h-2.5 text-indigo-600" />
                                  <span>{getWalletLabel(tx.sourceWallet || 'ONLINE')} ➔ {getWalletLabel(tx.targetWallet || tx.wallet)}</span>
                                </span>
                              ) : (
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider flex items-center gap-0.5 ${
                                    isEwallet
                                      ? 'bg-indigo-50 text-indigo-800 border border-indigo-200/70'
                                      : isDompet
                                      ? 'bg-amber-50 text-amber-800 border border-amber-200/70'
                                      : 'bg-sky-50 text-sky-800 border border-sky-200/70'
                                  }`}
                                >
                                  {isEwallet ? (
                                    <Smartphone className="w-2.5 h-2.5" />
                                  ) : isDompet ? (
                                    <Wallet className="w-2.5 h-2.5" />
                                  ) : (
                                    <Landmark className="w-2.5 h-2.5" />
                                  )}
                                  {getWalletLabel(tx.wallet)}
                                </span>
                              )}

                              <span
                                className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                                  isTransfer
                                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                                    : isMasuk
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200/60'
                                }`}
                              >
                                {isTransfer ? 'Pindah Kas' : isMasuk ? 'Masuk' : 'Keluar'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">
                              {tx.notes ? tx.notes : '-'}
                            </p>
                          </div>
                        </div>

                        {/* Amount & Chevron */}
                        <div className="text-right shrink-0 flex items-center gap-1.5">
                          <div>
                            <p
                              className={`font-mono text-xs sm:text-sm font-bold ${
                                isTransfer
                                  ? 'text-indigo-700'
                                  : isMasuk
                                  ? 'text-emerald-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              {isTransfer ? '⇄ ' : isMasuk ? '+' : '-'}
                              {formatRupiah(tx.amount)}
                            </p>
                            <span className="text-[9px] text-slate-400 group-hover:text-slate-600 block">
                              Edit
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 transition" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

