import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Download,
  Upload,
  Wallet,
  Landmark,
  Smartphone,
  AlertCircle,
  Trash2,
  ShieldCheck,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Category, Transaction, InitialBalances } from '../types';
import { formatRupiah, parseRupiahInput, formatDateIndo, getTimeFromTimestamp } from '../utils/formatters';
import {
  loadAutoBackupSnapshot,
  getLastBackupTime,
  BackupSnapshot,
} from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBalances: InitialBalances;
  onSaveInitialBalances: (balances: InitialBalances) => void;
  categories: Category[];
  onSaveCategories: (cats: Category[]) => void;
  onResetData: () => void;
  transactions: Transaction[];
  onImportTransactions: (txs: Transaction[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialBalances,
  onSaveInitialBalances,
  categories,
  onSaveCategories,
  onResetData,
  transactions,
  onImportTransactions,
}) => {
  const [onlineInput, setOnlineInput] = useState<string>(String(initialBalances.online));
  const [ewalletInput, setEwalletInput] = useState<string>(String(initialBalances.ewallet ?? 0));
  const [dompetInput, setDompetInput] = useState<string>(String(initialBalances.dompet));
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isConfirmingReset, setIsConfirmingReset] = useState<boolean>(false);
  const [backupSnapshot, setBackupSnapshot] = useState<BackupSnapshot | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens or initialBalances changes
  useEffect(() => {
    if (isOpen) {
      setOnlineInput(String(initialBalances.online));
      setEwalletInput(String(initialBalances.ewallet ?? 0));
      setDompetInput(String(initialBalances.dompet));
      setSaveSuccessMsg(null);
      setImportStatus(null);
      setIsConfirmingReset(false);
      setBackupSnapshot(loadAutoBackupSnapshot());
      setLastBackupTime(getLastBackupTime());
    }
  }, [isOpen, initialBalances]);

  if (!isOpen) return null;

  const handleSaveBalances = (e: React.FormEvent) => {
    e.preventDefault();
    const online = parseRupiahInput(onlineInput);
    const ewallet = parseRupiahInput(ewalletInput);
    const dompet = parseRupiahInput(dompetInput);

    onSaveInitialBalances({ online, ewallet, dompet });
    setSaveSuccessMsg('Saldo awal Rekening Bank, E-Wallet, dan Dompet Tunai berhasil disimpan!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 3000);
  };

  const handleExportJSON = () => {
    const data = {
      version: 3,
      exportDate: new Date().toISOString(),
      initialBalances: {
        online: parseRupiahInput(onlineInput),
        ewallet: parseRupiahInput(ewalletInput),
        dompet: parseRupiahInput(dompetInput),
      },
      categories,
      transactions,
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_KasKeuangan_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setImportStatus({
      type: 'success',
      message: 'File cadangan JSON berhasil diunduh ke perangkat Anda.',
    });
    setTimeout(() => setImportStatus(null), 3500);
  };

  const handleTriggerManualBackup = () => {
    const currentInitial: InitialBalances = {
      online: parseRupiahInput(onlineInput),
      ewallet: parseRupiahInput(ewalletInput),
      dompet: parseRupiahInput(dompetInput),
    };

    // Force backup now
    const now = Date.now();
    const snapshot: BackupSnapshot = {
      timestamp: now,
      dateStr: new Date(now).toISOString(),
      transactionsCount: transactions.length,
      initialBalances: currentInitial,
      transactions,
      categories,
    };

    localStorage.setItem('catatankeuangan_auto_backup_weekly_v1', JSON.stringify(snapshot));
    localStorage.setItem('catatankeuangan_last_backup_timestamp_v1', String(now));
    setBackupSnapshot(snapshot);
    setLastBackupTime(now);

    setImportStatus({
      type: 'success',
      message: 'Pencadangan otomatis sistem berhasil dibuat dan tersimpan aman di memori lokal.',
    });
    setTimeout(() => setImportStatus(null), 3500);
  };

  const handleRestoreFromAutoBackup = () => {
    if (!backupSnapshot) return;
    onImportTransactions(backupSnapshot.transactions);
    onSaveInitialBalances(backupSnapshot.initialBalances);
    onSaveCategories(backupSnapshot.categories);

    setOnlineInput(String(backupSnapshot.initialBalances.online));
    setEwalletInput(String(backupSnapshot.initialBalances.ewallet ?? 0));
    setDompetInput(String(backupSnapshot.initialBalances.dompet));

    setImportStatus({
      type: 'success',
      message: `Berhasil memulihkan ${backupSnapshot.transactions.length} transaksi dari cadangan sistem otomatis (${formatDateIndo(backupSnapshot.dateStr.split('T')[0], 'short')})!`,
    });
    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed.transactions)) {
          // Normalize transactions to ensure valid wallet & type fields
          const formattedTransactions: Transaction[] = parsed.transactions.map((t: any, idx: number) => ({
            id: t.id || `imported-${Date.now()}-${idx}`,
            date: t.date || new Date().toISOString().split('T')[0],
            time: t.time || '12:00',
            category: t.category || 'Lainnya',
            amount: Number(t.amount) || 0,
            type: t.type === 'TRANSFER' ? 'TRANSFER' : t.type === 'MASUK' ? 'MASUK' : 'KELUAR',
            wallet: t.wallet === 'DOMPET' ? 'DOMPET' : t.wallet === 'EWALLET' ? 'EWALLET' : 'ONLINE',
            sourceWallet: t.sourceWallet,
            targetWallet: t.targetWallet,
            notes: t.notes || '',
            createdAt: t.createdAt || Date.now(),
          }));

          onImportTransactions(formattedTransactions);

          // Restore initial balances
          if (parsed.initialBalances) {
            const restoredBalances: InitialBalances = {
              online: Number(parsed.initialBalances.online) || 0,
              ewallet: Number(parsed.initialBalances.ewallet) || 0,
              dompet: Number(parsed.initialBalances.dompet) || 0,
            };
            onSaveInitialBalances(restoredBalances);
            setOnlineInput(String(restoredBalances.online));
            setEwalletInput(String(restoredBalances.ewallet));
            setDompetInput(String(restoredBalances.dompet));
          }

          // Restore categories if present
          if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
            onSaveCategories(parsed.categories);
          }

          setImportStatus({
            type: 'success',
            message: `Berhasil memulihkan ${formattedTransactions.length} transaksi dan pengaturan saldo kas!`,
          });
        } else {
          setImportStatus({
            type: 'error',
            message: 'Format file JSON tidak valid. Properti "transactions" tidak ditemukan.',
          });
        }
      } catch (err) {
        setImportStatus({
          type: 'error',
          message: 'Gagal membaca atau memproses file JSON cadangan.',
        });
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.onerror = () => {
      setImportStatus({
        type: 'error',
        message: 'Gagal membaca file dari penyimpanan lokal.',
      });
    };

    reader.readAsText(file);
  };

  const handleExecuteReset = () => {
    onResetData();
    setOnlineInput('0');
    setEwalletInput('0');
    setDompetInput('0');
    setIsConfirmingReset(false);
    setImportStatus({
      type: 'success',
      message: 'Semua catatan transaksi dan saldo kas berhasil dihapus (dikosongkan).',
    });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Pengaturan & Manajemen Kas</h3>
            <p className="text-[11px] text-slate-500">Konfigurasi saldo awal, auto-backup & proteksi data</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Status / Alert Messages */}
          {saveSuccessMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-semibold text-xs animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {importStatus && (
            <div
              className={`p-2.5 border rounded-xl flex items-center gap-2 font-semibold text-xs animate-in fade-in ${
                importStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {importStatus.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* 1. Saldo Awal Master: Bank Online, E-Wallet, dan Dompet Tunai */}
          <form onSubmit={handleSaveBalances} className="space-y-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Saldo Awal Kas Master (3 Akun)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Baseline saldo awal kas saat pertama kali mulai pencatatan.
              </p>
            </div>

            {/* Saldo Awal Rekening Bank (Online) */}
            <div>
              <label className="block text-[11px] font-bold text-sky-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-sky-700" />
                <span>Saldo Awal Rekening Bank (M-Banking / ATM)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs font-mono">
                  Rp
                </span>
                <input
                  id="input-settings-online"
                  type="text"
                  value={formatRupiah(parseRupiahInput(onlineInput), false)}
                  onChange={(e) => setOnlineInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-600"
                />
              </div>
            </div>

            {/* Saldo Awal E-Wallet */}
            <div>
              <label className="block text-[11px] font-bold text-indigo-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-indigo-700" />
                <span>Saldo Awal E-Wallet (GoPay, OVO, Dana, ShopeePay)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs font-mono">
                  Rp
                </span>
                <input
                  id="input-settings-ewallet"
                  type="text"
                  value={formatRupiah(parseRupiahInput(ewalletInput), false)}
                  onChange={(e) => setEwalletInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>

            {/* Saldo Awal Dompet (Tunai) */}
            <div>
              <label className="block text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-700" />
                <span>Saldo Awal Dompet (Tunai / Cash)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs font-mono">
                  Rp
                </span>
                <input
                  id="input-settings-dompet"
                  type="text"
                  value={formatRupiah(parseRupiahInput(dompetInput), false)}
                  onChange={(e) => setDompetInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>
            </div>

            {/* Total Preview */}
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 text-slate-600 font-mono">
              <span>Total Saldo Baseline:</span>
              <span className="font-bold text-slate-900">
                {formatRupiah(parseRupiahInput(onlineInput) + parseRupiahInput(ewalletInput) + parseRupiahInput(dompetInput))}
              </span>
            </div>

            <button
              id="btn-save-initial-balances"
              type="submit"
              className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Simpan Saldo Awal</span>
            </button>
          </form>

          {/* 2. Sistem Backup Otomatis Mingguan (1x Seminggu Terproteksi) */}
          <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                  Backup Otomatis Sistem (1x Seminggu)
                </h4>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-200/80 text-emerald-900 font-mono">
                AKTIF
              </span>
            </div>

            <p className="text-[11px] text-emerald-900/80 leading-relaxed">
              Sistem secara otomatis mengecek dan membuat snapshot cadangan data Anda setiap 7 hari sekali. Data terlindungi aman sehingga saldo dan transaksi tidak akan pernah hilang tiba-tiba.
            </p>

            <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Cadangan Terakhir:</span>
                  <strong className="text-slate-800">
                    {lastBackupTime ? formatDateIndo(new Date(lastBackupTime).toISOString().split('T')[0], 'short') + ' ' + getTimeFromTimestamp(lastBackupTime) : 'Baru saja diinisialisasi'}
                  </strong>
                </div>
                {backupSnapshot && (
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Isi: {backupSnapshot.transactionsCount} Transaksi tersimpan
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleTriggerManualBackup}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
                  title="Cek dan Buat Backup Baru Sekarang"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Backup Sekarang</span>
                </button>
                {backupSnapshot && (
                  <button
                    type="button"
                    onClick={handleRestoreFromAutoBackup}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold border border-slate-300 transition cursor-pointer"
                    title="Pulihkan data dari snapshot sistem otomatis"
                  >
                    Pulihkan
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Cadangan File (Ekspor JSON ke HP / Komputer) */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2.5">
            <div>
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Unduh / Unggah File Cadangan (JSON)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Simpan file cadangan transaksi ke komputer atau pulihkan dari file JSON sebelumnya.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-export-json"
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-800 transition border border-slate-200 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Unduh File Backup</span>
              </button>

              <label
                id="label-import-json"
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-800 transition border border-slate-200 shadow-2xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Unggah File JSON</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* 4. Reset Data */}
          <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200/80 space-y-2">
            <div>
              <h4 className="font-bold text-rose-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Reset Data</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Hapus semua catatan transaksi dan kosongkan seluruh saldo kas menjadi Rp 0.
              </p>
            </div>

            {!isConfirmingReset ? (
              <button
                type="button"
                id="btn-reset-data"
                onClick={() => setIsConfirmingReset(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Data</span>
              </button>
            ) : (
              <div className="p-2.5 bg-rose-100 rounded-lg border border-rose-300 space-y-2 animate-in fade-in">
                <p className="text-[11px] font-bold text-rose-900">
                  Yakin ingin menghapus semua catatan transaksi dan mengosongkan saldo kas?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="btn-confirm-reset-yes"
                    onClick={handleExecuteReset}
                    className="flex-1 py-1.5 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold transition cursor-pointer shadow-2xs"
                  >
                    Ya, Hapus Semua Data
                  </button>
                  <button
                    type="button"
                    id="btn-confirm-reset-cancel"
                    onClick={() => setIsConfirmingReset(false)}
                    className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold border border-slate-200 transition cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};



