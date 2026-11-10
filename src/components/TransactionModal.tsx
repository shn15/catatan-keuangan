import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Trash2,
  Tag,
  Calendar,
  Clock,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  Wallet,
  Smartphone,
  ArrowLeftRight,
} from 'lucide-react';
import { Transaction, TransactionType, WalletType, Category } from '../types';
import { formatRupiah, getTodayDateString, getNowTimeString, getTimeFromTimestamp, getWalletLabel } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>, editingId?: string) => void;
  onDelete?: (id: string) => void;
  editingTransaction?: Transaction | null;
  defaultType?: TransactionType;
  defaultWallet?: WalletType;
  categories: Category[];
  onAddCategory: (category: Category) => void;
}

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 250000, 500000, 1000000];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingTransaction,
  defaultType = 'KELUAR',
  defaultWallet = 'ONLINE',
  categories,
  onAddCategory,
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [wallet, setWallet] = useState<WalletType>(defaultWallet);
  const [sourceWallet, setSourceWallet] = useState<WalletType>('ONLINE');
  const [targetWallet, setTargetWallet] = useState<WalletType>('DOMPET');
  const [amount, setAmount] = useState<number>(0);
  const [rawAmountInput, setRawAmountInput] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [time, setTime] = useState<string>(getNowTimeString());
  const [notes, setNotes] = useState<string>('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<boolean>(false);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setWallet(editingTransaction.wallet || 'ONLINE');
      setSourceWallet(editingTransaction.sourceWallet || 'ONLINE');
      setTargetWallet(editingTransaction.targetWallet || editingTransaction.wallet || 'DOMPET');
      setAmount(editingTransaction.amount);
      setRawAmountInput(String(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setTime(editingTransaction.time || getTimeFromTimestamp(editingTransaction.createdAt) || getNowTimeString());
      setNotes(editingTransaction.notes || '');
    } else {
      setType(defaultType);
      setWallet(defaultWallet);
      setSourceWallet(defaultWallet);
      setTargetWallet(
        defaultWallet === 'DOMPET' ? 'ONLINE' : defaultWallet === 'EWALLET' ? 'ONLINE' : 'DOMPET'
      );
      setAmount(0);
      setRawAmountInput('');
      setDate(getTodayDateString());
      setTime(getNowTimeString());
      setNotes('');

      if (defaultType === 'TRANSFER') {
        setCategory('Pindah Kas / Antar Akun');
      } else {
        const firstCat = categories.find((c) => c.type === defaultType);
        setCategory(firstCat ? firstCat.name : '');
      }
    }
    setIsAddingNewCategory(false);
    setNewCatName('');
    setErrorMsg(null);
    setIsConfirmingDelete(false);
  }, [editingTransaction, defaultType, defaultWallet, isOpen, categories]);

  // When type changes, ensure valid category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setErrorMsg(null);
    if (newType === 'TRANSFER') {
      setCategory('Pindah Kas / Antar Akun');
    } else {
      const firstCat = categories.find((c) => c.type === newType);
      if (firstCat) {
        setCategory(firstCat.name);
      }
    }
  };

  const handleSelectCategory = (catName: string) => {
    setCategory(catName);
    if (errorMsg) setErrorMsg(null);
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setRawAmountInput(val);
    setAmount(val ? parseInt(val, 10) : 0);
    if (errorMsg) setErrorMsg(null);
  };

  const handleAddQuickAmount = (val: number) => {
    const newAmt = amount + val;
    setAmount(newAmt);
    setRawAmountInput(String(newAmt));
    if (errorMsg) setErrorMsg(null);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `custom-${Date.now()}`,
      name: newCatName.trim(),
      type: type === 'MASUK' ? 'MASUK' : 'KELUAR',
      iconName: type === 'MASUK' ? 'TrendingUp' : 'Tag',
      color: type === 'MASUK' ? '#10b981' : '#f97316',
    };
    onAddCategory(newCat);
    setCategory(newCat.name);
    setNewCatName('');
    setIsAddingNewCategory(false);
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMsg('Mohon masukkan nominal transaksi lebih dari 0.');
      return;
    }
    if (type !== 'TRANSFER' && !category.trim()) {
      setErrorMsg('Mohon pilih kategori transaksi.');
      return;
    }
    if (type === 'TRANSFER' && sourceWallet === targetWallet) {
      setErrorMsg('Akun sumber dan akun tujuan tidak boleh sama pada transfer antar akun.');
      return;
    }
    if (!date) {
      setErrorMsg('Mohon pilih tanggal transaksi.');
      return;
    }

    onSave(
      {
        type,
        wallet: type === 'TRANSFER' ? targetWallet : wallet,
        sourceWallet: type === 'TRANSFER' ? sourceWallet : undefined,
        targetWallet: type === 'TRANSFER' ? targetWallet : undefined,
        amount,
        category: type === 'TRANSFER' ? 'Pindah Kas / Antar Akun' : category,
        date,
        time: time || getNowTimeString(),
        notes: notes.trim(),
      },
      editingTransaction?.id
    );
    onClose();
  };

  const handleDeleteConfirmed = () => {
    if (editingTransaction && onDelete) {
      onDelete(editingTransaction.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  const filteredCategories = categories.filter((c) => c.type === (type === 'MASUK' ? 'MASUK' : 'KELUAR'));

  return (
    <div id="transaction-modal-overlay" className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
      <div
        id="transaction-modal-content"
        className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-xl shadow-xl overflow-hidden max-h-[92vh] flex flex-col border border-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-xl border ${
                type === 'MASUK'
                  ? 'bg-emerald-500/15 text-emerald-700 border-emerald-300'
                  : type === 'TRANSFER'
                  ? 'bg-indigo-500/15 text-indigo-700 border-indigo-300'
                  : 'bg-rose-500/15 text-rose-700 border-rose-300'
              }`}
            >
              {type === 'MASUK' ? (
                <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
              ) : type === 'TRANSFER' ? (
                <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {editingTransaction
                  ? type === 'MASUK'
                    ? 'Edit Uang Masuk'
                    : type === 'TRANSFER'
                    ? 'Edit Pindah Kas (Transfer)'
                    : 'Edit Uang Keluar'
                  : type === 'MASUK'
                  ? 'Catat Uang Masuk (Pemasukan)'
                  : type === 'TRANSFER'
                  ? 'Pindah Kas / Transfer Antar Akun'
                  : 'Catat Uang Keluar (Pengeluaran)'}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {type === 'MASUK' ? (
                  <span className="text-emerald-700 font-semibold">Kas Masuk (+) • {getWalletLabel(wallet)}</span>
                ) : type === 'TRANSFER' ? (
                  <span className="text-indigo-700 font-semibold">
                    {getWalletLabel(sourceWallet)} ➔ {getWalletLabel(targetWallet)} (Bukan Pemasukan/Pengeluaran)
                  </span>
                ) : (
                  <span className="text-rose-700 font-semibold">Kas Keluar (-) • {getWalletLabel(wallet)}</span>
                )}
              </p>
            </div>
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 text-xs">
          {/* 3-Tab Selector: MASUK | KELUAR | PINDAH KAS (TRANSFER) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Jenis Pencatatan
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-center">
              <button
                type="button"
                id="btn-toggle-pemasukan"
                onClick={() => handleTypeChange('MASUK')}
                className={`py-1.5 px-1 rounded-md font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                  type === 'MASUK'
                    ? 'bg-emerald-600 text-white shadow-2xs border border-emerald-500'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Masuk</span>
              </button>

              <button
                type="button"
                id="btn-toggle-pengeluaran"
                onClick={() => handleTypeChange('KELUAR')}
                className={`py-1.5 px-1 rounded-md font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                  type === 'KELUAR'
                    ? 'bg-rose-600 text-white shadow-2xs border border-rose-500'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Keluar</span>
              </button>

              <button
                type="button"
                id="btn-toggle-transfer"
                onClick={() => handleTypeChange('TRANSFER')}
                className={`py-1.5 px-1 rounded-md font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                  type === 'TRANSFER'
                    ? 'bg-indigo-600 text-white shadow-2xs border border-indigo-500'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Pindah Kas</span>
              </button>
            </div>
          </div>

          {/* Wallet Selector: If TRANSFER vs If REGULAR */}
          {type === 'TRANSFER' ? (
            <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-indigo-950 font-bold text-xs">
                <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-700" />
                <span>Pindah Saldo (Tarik Tunai / Setor Tunai / Top Up)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                💡 <strong>Catatan Penting:</strong> Perpindahan saldo antar akun <em>bukan merupakan pemasukan atau pengeluaran</em>, hanya mutasi internal agar saldo masing-masing akun tetap akurat.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {/* Sumber */}
                <div>
                  <label className="block text-[10px] font-bold text-rose-800 uppercase tracking-wider mb-1">
                    Dari Akun Asal (-)
                  </label>
                  <select
                    value={sourceWallet}
                    onChange={(e) => {
                      const newSource = e.target.value as WalletType;
                      setSourceWallet(newSource);
                      if (newSource === targetWallet) {
                        const fallbackTarget: WalletType =
                          newSource === 'DOMPET' ? 'ONLINE' : newSource === 'EWALLET' ? 'ONLINE' : 'DOMPET';
                        setTargetWallet(fallbackTarget);
                      }
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="ONLINE">Bank (Rekening)</option>
                    <option value="EWALLET">E-Wallet (GoPay/OVO/Dana)</option>
                    <option value="DOMPET">Dompet (Tunai Fisik)</option>
                  </select>
                </div>

                {/* Tujuan */}
                <div>
                  <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    Ke Akun Tujuan (+)
                  </label>
                  <select
                    value={targetWallet}
                    onChange={(e) => {
                      const newTarget = e.target.value as WalletType;
                      setTargetWallet(newTarget);
                      if (newTarget === sourceWallet) {
                        const fallbackSource: WalletType =
                          newTarget === 'ONLINE' ? 'DOMPET' : 'ONLINE';
                        setSourceWallet(fallbackSource);
                      }
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="DOMPET">Dompet (Tunai Fisik)</option>
                    <option value="EWALLET">E-Wallet (GoPay/OVO/Dana)</option>
                    <option value="ONLINE">Bank (Rekening)</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                {type === 'MASUK' ? 'Masuk Ke Akun Kas' : 'Dibayar Dari Akun Kas'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  id="btn-wallet-online"
                  onClick={() => setWallet('ONLINE')}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg font-bold text-[11px] transition cursor-pointer text-center ${
                    wallet === 'ONLINE'
                      ? 'bg-sky-600 text-white shadow-2xs border border-sky-500'
                      : 'text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white'
                  }`}
                >
                  <Landmark className="w-4 h-4 mb-0.5" />
                  <span className="truncate">Bank (ATM)</span>
                </button>

                <button
                  type="button"
                  id="btn-wallet-ewallet"
                  onClick={() => setWallet('EWALLET')}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg font-bold text-[11px] transition cursor-pointer text-center ${
                    wallet === 'EWALLET'
                      ? 'bg-indigo-600 text-white shadow-2xs border border-indigo-500'
                      : 'text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mb-0.5" />
                  <span className="truncate">E-Wallet</span>
                </button>

                <button
                  type="button"
                  id="btn-wallet-dompet"
                  onClick={() => setWallet('DOMPET')}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg font-bold text-[11px] transition cursor-pointer text-center ${
                    wallet === 'DOMPET'
                      ? 'bg-amber-600 text-white shadow-2xs border border-amber-500'
                      : 'text-slate-600 hover:text-slate-900 bg-white/50 hover:bg-white'
                  }`}
                >
                  <Wallet className="w-4 h-4 mb-0.5" />
                  <span className="truncate">Dompet Tunai</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Harga Barang / Nominal */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {type === 'MASUK' ? 'Nominal Uang Masuk' : 'Nominal Uang Keluar / Belanja'} (Rp){' '}
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm font-mono">
                Rp
              </span>
              <input
                id="input-transaction-amount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={rawAmountInput ? formatRupiah(amount, false) : ''}
                onChange={handleAmountInputChange}
                required
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl font-mono text-base font-bold focus:outline-none focus:ring-1 focus:bg-white transition ${
                  type === 'MASUK'
                    ? 'text-emerald-700 border-emerald-300 focus:ring-emerald-600'
                    : type === 'TRANSFER'
                    ? 'text-indigo-700 border-indigo-300 focus:ring-indigo-600'
                    : 'text-rose-700 border-rose-300 focus:ring-rose-600'
                }`}
              />
            </div>

            {/* Quick Amount Pills */}
            <div className="flex flex-wrap gap-1 mt-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAddQuickAmount(amt)}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-mono font-semibold text-slate-700 transition border border-slate-200 cursor-pointer"
                >
                  +{formatRupiah(amt, false)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setAmount(0);
                  setRawAmountInput('');
                }}
                className="px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-[10px] font-mono font-semibold text-rose-700 transition border border-rose-200 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* 3. Tanggal & Jam Transaksi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Tanggal <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setDate(getTodayDateString())}
                  className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Hari Ini
                </button>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  id="input-transaction-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Jam / Waktu <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setTime(getNowTimeString())}
                  className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Sekarang
                </button>
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  id="input-transaction-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* 4. Jenis / Kategori Barang (Only for MASUK and KELUAR) */}
          {type !== 'TRANSFER' ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {type === 'MASUK' ? 'Kategori Pemasukan' : 'Kategori Pengeluaran'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                  className={`text-[11px] font-semibold hover:underline cursor-pointer ${
                    type === 'MASUK' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isAddingNewCategory ? 'Batal' : `+ Kategori ${type === 'MASUK' ? 'Pemasukan' : 'Pengeluaran'} Baru`}
                </button>
              </div>

              {/* Form Tambah Kategori Baru */}
              {isAddingNewCategory && (
                <div
                  className={`mb-2 p-2 rounded-lg border ${
                    type === 'MASUK'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <p className="text-[11px] font-semibold mb-1.5">
                    Tambah Kategori {type === 'MASUK' ? 'Pemasukan' : 'Pengeluaran'} Baru:
                  </p>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder={`Nama Kategori ${type === 'MASUK' ? 'Pemasukan' : 'Pengeluaran'}...`}
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className={`px-3 py-1 text-white rounded-md text-xs font-bold transition cursor-pointer ${
                        type === 'MASUK'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              )}

              {/* Category Select / Chip grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-0.5">
                {filteredCategories.map((c) => {
                  const isSelected = category === c.name;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCategory(c.name)}
                      className={`flex items-center gap-1.5 p-1.5 rounded-lg text-left text-xs font-semibold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div
                        className="p-1 rounded text-white shrink-0"
                        style={{ backgroundColor: c.color || '#3b82f6' }}
                      >
                        <CategoryIcon name={c.iconName} className="w-3 h-3" />
                      </div>
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px] flex items-center gap-2">
              <span className="font-semibold text-slate-800">Kategori:</span>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-semibold text-[11px]">
                Pindah Kas / Antar Akun
              </span>
            </div>
          )}

          {/* 5. Keterangan Transaksi */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Keterangan / Rincian Catatan
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <textarea
                id="input-transaction-notes"
                rows={2}
                placeholder={
                  type === 'MASUK'
                    ? 'Contoh: Gaji bulanan, hasil penjualan, dividen investasi...'
                    : 'Contoh: Makan siang, bayar listrik token, beli belanjaan...'
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition resize-none"
              />
            </div>
          </div>

          {/* Error Message Display */}
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 font-semibold text-xs animate-in fade-in">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {editingTransaction && onDelete && (
              <>
                {!isConfirmingDelete ? (
                  <button
                    type="button"
                    id="btn-delete-transaction"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-1.5 border border-rose-200 cursor-pointer"
                    title="Hapus Transaksi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 p-1 bg-rose-100/80 rounded-lg border border-rose-300">
                    <span className="text-[11px] font-bold text-rose-800 px-1">Yakin hapus?</span>
                    <button
                      type="button"
                      id="btn-delete-confirm-yes"
                      onClick={handleDeleteConfirmed}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs cursor-pointer shadow-2xs"
                    >
                      Ya, Hapus
                    </button>
                    <button
                      type="button"
                      id="btn-delete-confirm-cancel"
                      onClick={() => setIsConfirmingDelete(false)}
                      className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded font-semibold text-xs border border-slate-200 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              id="btn-save-transaction"
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow-2xs transition active:scale-[0.99] cursor-pointer border ${
                type === 'MASUK'
                  ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500'
                  : type === 'TRANSFER'
                  ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-500'
                  : 'bg-rose-600 hover:bg-rose-700 border-rose-500'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                {editingTransaction
                  ? type === 'MASUK'
                    ? 'Perbarui Uang Masuk'
                    : type === 'TRANSFER'
                    ? 'Perbarui Pindah Kas'
                    : 'Perbarui Uang Keluar'
                  : type === 'MASUK'
                  ? 'Simpan Uang Masuk'
                  : type === 'TRANSFER'
                  ? 'Simpan Pindah Kas'
                  : 'Simpan Uang Keluar'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

