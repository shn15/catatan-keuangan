import React from 'react';
import { Wallet, Settings, FileSpreadsheet, LayoutDashboard, ListFilter, BarChart3 } from 'lucide-react';
import { MonthSelector } from './MonthSelector';
import { TabType } from './BottomNav';

interface MobileHeaderProps {
  selectedYear: number;
  selectedMonth: number;
  onMonthChange: (year: number, month: number) => void;
  onOpenSettings: () => void;
  onQuickExport: () => void;
  activeTab?: TabType;
  onChangeTab?: (tab: TabType) => void;
  transactionCount?: number;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  selectedYear,
  selectedMonth,
  onMonthChange,
  onOpenSettings,
  onQuickExport,
  activeTab,
  onChangeTab,
  transactionCount = 0,
}) => {
  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 py-2.5 shadow-2xs">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        {/* Top bar: Title & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-sm sm:text-base leading-tight tracking-tight">
                  Catatan Kas & Keuangan
                </h1>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                  Excel Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Pencatat Saldo & Laporan Bulanan Terformat Otomatis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:hidden">
            <button
              id="btn-header-quick-excel"
              onClick={onQuickExport}
              className="p-2 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition active:scale-95 cursor-pointer text-xs font-semibold flex items-center gap-1"
              title="Unduh Laporan Excel Bulan Ini"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            <button
              id="btn-header-settings"
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition active:scale-95 cursor-pointer"
              title="Pengaturan & Cadangan"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop Tab Navigation (hidden on mobile) */}
        {onChangeTab && activeTab && (
          <nav className="hidden md:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => onChangeTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>
            <button
              onClick={() => onChangeTab('transactions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Transaksi</span>
              {transactionCount > 0 && (
                <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded-full font-bold">
                  {transactionCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onChangeTab('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Laporan Excel</span>
            </button>
            <button
              onClick={() => onChangeTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistik</span>
            </button>
          </nav>
        )}

        {/* Right side controls: Period selector and quick actions */}
        <div className="flex items-center justify-between md:justify-end gap-2">
          <MonthSelector
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onChange={onMonthChange}
          />

          <div className="hidden md:flex items-center gap-1.5">
            <button
              id="btn-header-quick-excel-desktop"
              onClick={onQuickExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer text-xs font-bold shadow-2xs"
              title="Unduh Laporan Excel Bulan Ini"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Unduh Excel</span>
            </button>

            <button
              id="btn-header-settings-desktop"
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
              title="Pengaturan & Cadangan"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

