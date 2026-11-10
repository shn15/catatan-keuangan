/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  Category,
  MonthlySummary,
  TransactionType,
  WalletType,
  InitialBalances,
} from './types';
import {
  loadTransactions,
  saveTransactions,
  loadCategories,
  saveCategories,
  loadInitialBalances,
  saveInitialBalances,
  checkAndRunWeeklyAutoBackup,
  STORAGE_KEY_AUTO_BACKUP,
  DEFAULT_CATEGORIES,
} from './utils/storage';
import { INDONESIAN_MONTHS } from './utils/formatters';
import { exportMonthlyReportToExcel } from './utils/exportExcel';

import { MobileHeader } from './components/MobileHeader';
import { BalanceCard } from './components/BalanceCard';
import { TransactionList } from './components/TransactionList';
import { MonthlyReportView } from './components/MonthlyReportView';
import { AnalyticsView } from './components/AnalyticsView';
import { BottomNav, TabType } from './components/BottomNav';
import { TransactionModal } from './components/TransactionModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [initialBalances, setInitialBalances] = useState<InitialBalances>(() =>
    loadInitialBalances()
  );

  // Active Month & Year
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth()); // 0-11

  // Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [defaultTxType, setDefaultTxType] = useState<TransactionType>('KELUAR');
  const [defaultWallet, setDefaultWallet] = useState<WalletType>('ONLINE');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Weekly Auto-Backup Check on App load and data changes
  useEffect(() => {
    checkAndRunWeeklyAutoBackup(transactions, categories, initialBalances);
  }, [transactions, categories, initialBalances]);

  // Sync state to LocalStorage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveInitialBalances(initialBalances);
  }, [initialBalances]);

  // Filter transactions for currently selected month
  const monthlyTransactions = useMemo(() => {
    const prefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    return transactions.filter((t) => t.date.startsWith(prefix));
  }, [transactions, selectedYear, selectedMonth]);

  // Helper to compute wallet impact including:
  // - Pure Real Income (MASUK): Only actual external income (Gaji, Kiriman Ortu, Usaha, dll)
  // - Pure Real Expense (KELUAR): Only actual external purchases/payments
  // - Transfer Antar Akun (TRANSFER): Shift between accounts (Bank, E-Wallet, Dompet) without creating fake income/expense!
  const computeWalletImpact = (txList: Transaction[]) => {
    let onlineIncome = 0;
    let onlineExpense = 0;
    let ewalletIncome = 0;
    let ewalletExpense = 0;
    let dompetIncome = 0;
    let dompetExpense = 0;

    let realExternalIncome = 0;
    let realExternalExpense = 0;

    txList.forEach((t) => {
      // Handle Transfer / Perpindahan Saldo (Not External Income / Expense)
      if (t.type === 'TRANSFER') {
        const source = t.sourceWallet || 'ONLINE';
        const target = t.targetWallet || t.wallet || 'DOMPET';

        // Deduct from source wallet
        if (source === 'ONLINE') onlineExpense += t.amount;
        else if (source === 'EWALLET') ewalletExpense += t.amount;
        else if (source === 'DOMPET') dompetExpense += t.amount;

        // Add to target wallet
        if (target === 'ONLINE') onlineIncome += t.amount;
        else if (target === 'EWALLET') ewalletIncome += t.amount;
        else if (target === 'DOMPET') dompetIncome += t.amount;

        // Note: Transfer DOES NOT increase realExternalIncome or realExternalExpense!
        return;
      }

      // Legacy fallback: Old transfers saved as MASUK with "Dari Rekening" or "Dari Dompet"
      if (t.type === 'MASUK' && (t.category === 'Dari Rekening' || t.category === 'Dari Dompet')) {
        const source: WalletType = t.category === 'Dari Rekening' ? 'ONLINE' : 'DOMPET';
        const target: WalletType = t.category === 'Dari Rekening' ? 'DOMPET' : 'ONLINE';

        if (source === 'ONLINE') onlineExpense += t.amount;
        else dompetExpense += t.amount;

        if (target === 'DOMPET') dompetIncome += t.amount;
        else onlineIncome += t.amount;
        return;
      }

      // Real External Income (Gaji, Kiriman, Usaha, dll)
      if (t.type === 'MASUK') {
        realExternalIncome += t.amount;
        if (t.wallet === 'EWALLET') {
          ewalletIncome += t.amount;
        } else if (t.wallet === 'DOMPET') {
          dompetIncome += t.amount;
        } else {
          onlineIncome += t.amount;
        }
      } else {
        // Real External Expense (Belanja, Makanan, Tagihan, dll)
        realExternalExpense += t.amount;
        if (t.wallet === 'EWALLET') {
          ewalletExpense += t.amount;
        } else if (t.wallet === 'DOMPET') {
          dompetExpense += t.amount;
        } else {
          onlineExpense += t.amount;
        }
      }
    });

    return {
      onlineIncome,
      onlineExpense,
      ewalletIncome,
      ewalletExpense,
      dompetIncome,
      dompetExpense,
      realExternalIncome,
      realExternalExpense,
    };
  };

  // Calculate Starting Balance for selected Month (Online, E-Wallet, Dompet, Total):
  const startingBalances = useMemo(() => {
    const firstDaySelectedMonth = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
    const priorTransactions = transactions.filter((t) => t.date < firstDaySelectedMonth);

    const {
      onlineIncome,
      onlineExpense,
      ewalletIncome,
      ewalletExpense,
      dompetIncome,
      dompetExpense,
    } = computeWalletImpact(priorTransactions);

    const startingOnline = (initialBalances.online || 0) + onlineIncome - onlineExpense;
    const startingEwallet = (initialBalances.ewallet || 0) + ewalletIncome - ewalletExpense;
    const startingDompet = (initialBalances.dompet || 0) + dompetIncome - dompetExpense;

    return {
      online: startingOnline,
      ewallet: startingEwallet,
      dompet: startingDompet,
      total: startingOnline + startingEwallet + startingDompet,
    };
  }, [transactions, selectedYear, selectedMonth, initialBalances]);

  // Monthly summary metrics (Accurate Real Income & Expense, NO double counting from transfers)
  const monthlySummary: MonthlySummary = useMemo(() => {
    const {
      onlineIncome,
      onlineExpense,
      ewalletIncome,
      ewalletExpense,
      dompetIncome,
      dompetExpense,
      realExternalIncome,
      realExternalExpense,
    } = computeWalletImpact(monthlyTransactions);

    const onlineEnding = startingBalances.online + onlineIncome - onlineExpense;
    const ewalletEnding = startingBalances.ewallet + ewalletIncome - ewalletExpense;
    const dompetEnding = startingBalances.dompet + dompetIncome - dompetExpense;

    const net = realExternalIncome - realExternalExpense;
    const ending = startingBalances.total + net;

    return {
      year: selectedYear,
      month: selectedMonth,
      startingBalance: startingBalances.total,
      totalIncome: realExternalIncome,
      totalExpense: realExternalExpense,
      netCashflow: net,
      endingBalance: ending,
      transactionCount: monthlyTransactions.length,
      walletBreakdown: {
        online: {
          startingBalance: startingBalances.online,
          totalIncome: onlineIncome,
          totalExpense: onlineExpense,
          endingBalance: onlineEnding,
        },
        ewallet: {
          startingBalance: startingBalances.ewallet,
          totalIncome: ewalletIncome,
          totalExpense: ewalletExpense,
          endingBalance: ewalletEnding,
        },
        dompet: {
          startingBalance: startingBalances.dompet,
          totalIncome: dompetIncome,
          totalExpense: dompetExpense,
          endingBalance: dompetEnding,
        },
      },
    };
  }, [monthlyTransactions, selectedYear, selectedMonth, startingBalances]);

  // Overall Cumulative Balance (Total, Bank Online, E-Wallet, Dompet Tunai)
  const { totalOverallBalance, onlineOverallBalance, ewalletOverallBalance, dompetOverallBalance } = useMemo(() => {
    const {
      onlineIncome,
      onlineExpense,
      ewalletIncome,
      ewalletExpense,
      dompetIncome,
      dompetExpense,
    } = computeWalletImpact(transactions);

    const onlineOverall = (initialBalances.online || 0) + onlineIncome - onlineExpense;
    const ewalletOverall = (initialBalances.ewallet || 0) + ewalletIncome - ewalletExpense;
    const dompetOverall = (initialBalances.dompet || 0) + dompetIncome - dompetExpense;

    return {
      onlineOverallBalance: onlineOverall,
      ewalletOverallBalance: ewalletOverall,
      dompetOverallBalance: dompetOverall,
      totalOverallBalance: onlineOverall + ewalletOverall + dompetOverall,
    };
  }, [transactions, initialBalances]);

  // Transaction CRUD handlers
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    const cleanData = { ...data };

    if (editingId) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingId ? { ...t, ...cleanData } : t
        )
      );
    } else {
      const newTx: Transaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: Date.now(),
        ...cleanData,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenAddModal = (type: TransactionType = 'KELUAR', wallet: WalletType = 'ONLINE') => {
    setEditingTx(null);
    setDefaultTxType(type);
    setDefaultWallet(wallet);
    setIsTxModalOpen(true);
  };

  const handleSelectTransactionToEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setDefaultTxType(tx.type);
    setDefaultWallet(tx.wallet || 'ONLINE');
    setIsTxModalOpen(true);
  };

  const handleAddCategory = (newCat: Category) => {
    setCategories((prev) => [...prev, newCat]);
  };

  const handleResetData = () => {
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setInitialBalances({ online: 0, ewallet: 0, dompet: 0 });
    try {
      localStorage.removeItem(STORAGE_KEY_AUTO_BACKUP);
    } catch {
      // ignore
    }
  };

  const handleQuickExcelExport = () => {
    exportMonthlyReportToExcel(monthlyTransactions, monthlySummary);
  };

  const monthName = INDONESIAN_MONTHS[selectedMonth];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-28">
      {/* Mobile Header Bar */}
      <MobileHeader
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onMonthChange={(y, m) => {
          setSelectedYear(y);
          setSelectedMonth(m);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onQuickExport={handleQuickExcelExport}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        transactionCount={monthlyTransactions.length}
      />

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-3.5 space-y-4">
        {/* Tab 1: Dashboard / Kas Utama */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <BalanceCard
              summary={monthlySummary}
              totalOverallBalance={totalOverallBalance}
              onlineOverallBalance={onlineOverallBalance}
              ewalletOverallBalance={ewalletOverallBalance}
              dompetOverallBalance={dompetOverallBalance}
              onOpenAddModal={handleOpenAddModal}
              monthName={monthName}
            />

            {/* Quick Preview of Recent Transactions in Selected Month */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-sm">
                  Transaksi {monthName}
                </h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Lihat Semua ➔
                </button>
              </div>

              <TransactionList
                transactions={monthlyTransactions}
                categories={categories}
                onSelectTransaction={handleSelectTransactionToEdit}
                monthName={monthName}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Transaksi Lengkap */}
        {activeTab === 'transactions' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-800 text-lg">Daftar Transaksi</h2>
                <p className="text-xs text-slate-500">
                  Semua uang masuk & keluar periode {monthName} {selectedYear}
                </p>
              </div>
              <button
                onClick={() => handleOpenAddModal('KELUAR')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition cursor-pointer"
              >
                + Transaksi
              </button>
            </div>

            <TransactionList
              transactions={monthlyTransactions}
              categories={categories}
              onSelectTransaction={handleSelectTransactionToEdit}
              monthName={monthName}
            />
          </div>
        )}

        {/* Tab 3: Laporan Bulanan (Excel Format & Export) */}
        {activeTab === 'report' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <MonthlyReportView
              transactions={monthlyTransactions}
              summary={monthlySummary}
              onSelectTransaction={handleSelectTransactionToEdit}
            />
          </div>
        )}

        {/* Tab 4: Statistik & Analisis */}
        {activeTab === 'analytics' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-1">
              <h2 className="font-extrabold text-slate-800 text-lg">Statistik & Pola Kas</h2>
              <p className="text-xs text-slate-500">
                Visualisasi arus kas untuk periode {monthName} {selectedYear}
              </p>
            </div>

            <AnalyticsView
              transactions={monthlyTransactions}
              summary={monthlySummary}
              categories={categories}
            />
          </div>
        )}
      </main>

      {/* Transaction Add/Edit Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        editingTransaction={editingTx}
        defaultType={defaultTxType}
        defaultWallet={defaultWallet}
        categories={categories}
        onAddCategory={handleAddCategory}
      />

      {/* Settings & Master Balance Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialBalances={initialBalances}
        onSaveInitialBalances={setInitialBalances}
        categories={categories}
        onSaveCategories={setCategories}
        onResetData={handleResetData}
        transactions={transactions}
        onImportTransactions={setTransactions}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAddModal={() => handleOpenAddModal('KELUAR')}
        transactionCount={monthlyTransactions.length}
      />
    </div>
  );
}

