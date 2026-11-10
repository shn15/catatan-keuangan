import React from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Minus,
  Wallet,
  Scale,
  Landmark,
  Layers,
  Smartphone,
  ArrowLeftRight,
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { MonthlySummary, WalletType, TransactionType } from '../types';

interface BalanceCardProps {
  summary: MonthlySummary;
  totalOverallBalance: number;
  onlineOverallBalance: number;
  ewalletOverallBalance: number;
  dompetOverallBalance: number;
  onOpenAddModal: (type: TransactionType, defaultWallet?: WalletType) => void;
  monthName: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  summary,
  totalOverallBalance,
  onlineOverallBalance,
  ewalletOverallBalance,
  dompetOverallBalance,
  onOpenAddModal,
  monthName,
}) => {
  const onlineStarting = summary.walletBreakdown?.online?.startingBalance ?? 0;
  const onlineEnding = summary.walletBreakdown?.online?.endingBalance ?? 0;
  const ewalletStarting = summary.walletBreakdown?.ewallet?.startingBalance ?? 0;
  const ewalletEnding = summary.walletBreakdown?.ewallet?.endingBalance ?? 0;
  const dompetStarting = summary.walletBreakdown?.dompet?.startingBalance ?? 0;
  const dompetEnding = summary.walletBreakdown?.dompet?.endingBalance ?? 0;

  return (
    <div id="balance-dashboard-card" className="space-y-2.5">
      {/* Container for 3 Distinct Wallet Cards: Bank, E-Wallet, Dompet */}
      <div className="space-y-2.5">
        {/* 1. Saldo Rekening Bank (M-Banking / ATM) */}
        <div className="bg-slate-900 text-white rounded-xl border border-slate-800 shadow-xs p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Rekening Bank (M-Banking)
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold border border-sky-500/30">
                    ATM / BANK
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight mt-0.5">
                  {formatRupiah(onlineOverallBalance)}
                </h2>
              </div>
            </div>

            <div className="text-right bg-slate-800/90 px-2.5 py-1.5 rounded-lg border border-slate-700/60 shrink-0">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">
                Awal {monthName}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-200 font-mono">
                {formatRupiah(onlineStarting)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 text-[10px] text-slate-400 font-mono">
            <span className="truncate">BCA • Mandiri • BRI • BNI • Tabungan</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-300 font-bold">
                Akhir: {formatRupiah(onlineEnding)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="btn-quick-online-masuk"
                  onClick={() => onOpenAddModal('MASUK', 'ONLINE')}
                  className="px-2 py-0.5 rounded bg-sky-600/30 hover:bg-sky-600 text-sky-200 hover:text-white text-[10px] font-bold border border-sky-500/40 transition cursor-pointer"
                  title="Catat Pemasukan Bank"
                >
                  + Masuk
                </button>
                <button
                  type="button"
                  id="btn-quick-online-keluar"
                  onClick={() => onOpenAddModal('KELUAR', 'ONLINE')}
                  className="px-2 py-0.5 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white text-[10px] font-bold border border-rose-500/40 transition cursor-pointer"
                  title="Catat Pengeluaran Bank"
                >
                  - Keluar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Saldo E-Wallet (GoPay, OVO, Dana, ShopeePay) */}
        <div className="bg-indigo-950 text-white rounded-xl border border-indigo-900 shadow-xs p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-indigo-900/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-200">
                    Saldo E-Wallet
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    DIGITAL WALLET
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-indigo-300 font-mono tracking-tight mt-0.5">
                  {formatRupiah(ewalletOverallBalance)}
                </h2>
              </div>
            </div>

            <div className="text-right bg-indigo-900/80 px-2.5 py-1.5 rounded-lg border border-indigo-700/60 shrink-0">
              <span className="text-[9px] text-indigo-300 uppercase font-semibold block">
                Awal {monthName}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-200 font-mono">
                {formatRupiah(ewalletStarting)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 text-[10px] text-indigo-300/80 font-mono">
            <span className="truncate">GoPay • OVO • DANA • ShopeePay • LinkAja</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-indigo-200 font-bold">
                Akhir: {formatRupiah(ewalletEnding)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="btn-quick-ewallet-masuk"
                  onClick={() => onOpenAddModal('MASUK', 'EWALLET')}
                  className="px-2 py-0.5 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-[10px] font-bold border border-indigo-500/40 transition cursor-pointer"
                  title="Catat Pemasukan E-Wallet"
                >
                  + Masuk
                </button>
                <button
                  type="button"
                  id="btn-quick-ewallet-keluar"
                  onClick={() => onOpenAddModal('KELUAR', 'EWALLET')}
                  className="px-2 py-0.5 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white text-[10px] font-bold border border-rose-500/40 transition cursor-pointer"
                  title="Catat Pengeluaran E-Wallet"
                >
                  - Keluar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Saldo Dompet (Tunai / Uang Fisik) */}
        <div className="bg-slate-800 text-white rounded-xl border border-slate-700 shadow-xs p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-700/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                    Saldo Dompet (Tunai)
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    CASH FISIK
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-amber-300 font-mono tracking-tight mt-0.5">
                  {formatRupiah(dompetOverallBalance)}
                </h2>
              </div>
            </div>

            <div className="text-right bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 shrink-0">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">
                Awal {monthName}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-slate-200 font-mono">
                {formatRupiah(dompetStarting)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 text-[10px] text-slate-400 font-mono">
            <span className="truncate">Uang Kertas • Koin • Kas Pegangan</span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-slate-300 font-bold">
                Akhir: {formatRupiah(dompetEnding)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="btn-quick-dompet-masuk"
                  onClick={() => onOpenAddModal('MASUK', 'DOMPET')}
                  className="px-2 py-0.5 rounded bg-amber-600/30 hover:bg-amber-600 text-amber-200 hover:text-white text-[10px] font-bold border border-amber-500/40 transition cursor-pointer"
                  title="Catat Pemasukan Tunai"
                >
                  + Masuk
                </button>
                <button
                  type="button"
                  id="btn-quick-dompet-keluar"
                  onClick={() => onOpenAddModal('KELUAR', 'DOMPET')}
                  className="px-2 py-0.5 rounded bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white text-[10px] font-bold border border-rose-500/40 transition cursor-pointer"
                  title="Catat Pengeluaran Tunai"
                >
                  - Keluar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Combined Total Saldo Strip */}
        <div className="bg-slate-950 text-white rounded-lg border border-slate-800 px-3.5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Total Semua Saldo (Bank + E-Wallet + Dompet):</span>
          </div>
          <span className="text-sm sm:text-base font-extrabold text-emerald-400 font-mono">
            {formatRupiah(totalOverallBalance)}
          </span>
        </div>
      </div>

      {/* High Density Metric 3-Grid for the Selected Month (Only True Income & Expense) */}
      <div className="grid grid-cols-3 gap-2">
        {/* Real Uang Masuk */}
        <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wide mb-0.5">
            <ArrowDownLeft className="w-3 h-3 shrink-0" />
            <span className="truncate">Pemasukan Nyata</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-emerald-700 font-mono truncate">
            +{formatRupiah(summary.totalIncome)}
          </p>
        </div>

        {/* Real Uang Keluar */}
        <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-700 uppercase tracking-wide mb-0.5">
            <ArrowUpRight className="w-3 h-3 shrink-0" />
            <span className="truncate">Pengeluaran Nyata</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-rose-700 font-mono truncate">
            -{formatRupiah(summary.totalExpense)}
          </p>
        </div>

        {/* Sisa / Cash Flow */}
        <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-1 text-[10px] font-bold text-sky-700 uppercase tracking-wide mb-0.5">
            <Scale className="w-3 h-3 shrink-0" />
            <span className="truncate">Sisa / Arus Kas</span>
          </div>
          <p
            className={`text-xs sm:text-sm font-bold font-mono truncate ${
              summary.netCashflow >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {summary.netCashflow >= 0 ? '+' : ''}
            {formatRupiah(summary.netCashflow)}
          </p>
        </div>
      </div>

      {/* Quick Action Buttons: Masuk, Keluar, dan Pindah Kas (Transfer) */}
      <div className="grid grid-cols-3 gap-2">
        <button
          id="btn-quick-pemasukan"
          onClick={() => onOpenAddModal('MASUK')}
          className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs shadow-2xs transition cursor-pointer border border-emerald-500/80 truncate"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3] shrink-0" />
          <span className="truncate">Uang Masuk</span>
        </button>

        <button
          id="btn-quick-pengeluaran"
          onClick={() => onOpenAddModal('KELUAR')}
          className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-bold text-xs shadow-2xs transition cursor-pointer border border-rose-500/80 truncate"
        >
          <Minus className="w-3.5 h-3.5 stroke-[3] shrink-0" />
          <span className="truncate">Uang Keluar</span>
        </button>

        <button
          id="btn-quick-transfer"
          onClick={() => onOpenAddModal('TRANSFER')}
          className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-xs shadow-2xs transition cursor-pointer border border-indigo-500/80 truncate"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
          <span className="truncate">Pindah Kas</span>
        </button>
      </div>
    </div>
  );
};


