import React from 'react';
import { LayoutDashboard, ListFilter, FileSpreadsheet, BarChart3, Plus } from 'lucide-react';

export type TabType = 'dashboard' | 'transactions' | 'report' | 'analytics';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenAddModal: () => void;
  transactionCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddModal,
  transactionCount,
}) => {
  return (
    <div
      id="mobile-bottom-navigation"
      className="no-print fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-1.5 shadow-md md:hidden"
    >
      <div className="max-w-lg mx-auto flex items-center justify-around relative">
        {/* Tab 1: Dashboard / Kas */}
        <button
          id="nav-tab-dashboard"
          onClick={() => onChangeTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-slate-900 font-bold bg-slate-100'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Beranda</span>
        </button>

        {/* Tab 2: Transaksi */}
        <button
          id="nav-tab-transactions"
          onClick={() => onChangeTab('transactions')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer relative ${
            activeTab === 'transactions'
              ? 'text-slate-900 font-bold bg-slate-100'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <ListFilter className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Transaksi</span>
          {transactionCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 px-1 py-0.2 rounded-full bg-slate-900 text-white text-[9px] font-mono font-bold">
              {transactionCount > 99 ? '99+' : transactionCount}
            </span>
          )}
        </button>

        {/* Center Floating Action Button (+) */}
        <div className="relative -top-3 flex flex-col items-center">
          <button
            id="nav-btn-center-add"
            onClick={onOpenAddModal}
            className="w-10 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-md transition-all cursor-pointer border-2 border-white"
            title="Tambah Catatan Transaksi"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 3: Laporan Excel */}
        <button
          id="nav-tab-report"
          onClick={() => onChangeTab('report')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'report'
              ? 'text-slate-900 font-bold bg-slate-100'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Laporan</span>
        </button>

        {/* Tab 4: Statistik */}
        <button
          id="nav-tab-analytics"
          onClick={() => onChangeTab('analytics')}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'analytics'
              ? 'text-slate-900 font-bold bg-slate-100'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <BarChart3 className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] tracking-tight">Statistik</span>
        </button>
      </div>
    </div>
  );
};

