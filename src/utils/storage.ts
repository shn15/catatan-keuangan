import { Transaction, Category, WalletType, TransactionType, InitialBalances } from '../types';

const STORAGE_KEY_TRANSACTIONS = 'catatankeuangan_transactions_v1';
const STORAGE_KEY_CATEGORIES = 'catatankeuangan_categories_v1';
const STORAGE_KEY_INITIAL_ONLINE = 'catatankeuangan_initial_online_v1';
const STORAGE_KEY_INITIAL_EWALLET = 'catatankeuangan_initial_ewallet_v1';
const STORAGE_KEY_INITIAL_DOMPET = 'catatankeuangan_initial_dompet_v1';
const STORAGE_KEY_INITIAL_BALANCE = 'catatankeuangan_initial_balance_v1';

// Auto-backup keys (internal snapshot safety)
export const STORAGE_KEY_AUTO_BACKUP = 'catatankeuangan_auto_backup_weekly_v1';
export const STORAGE_KEY_LAST_BACKUP_TIME = 'catatankeuangan_last_backup_timestamp_v1';

export const DEFAULT_CATEGORIES: Category[] = [
  // Pengeluaran (Expense)
  { id: 'cat-makanan', name: 'Makanan & Minuman', type: 'KELUAR', iconName: 'Utensils', color: '#f97316' },
  { id: 'cat-belanja', name: 'Belanja & Kebutuhan', type: 'KELUAR', iconName: 'ShoppingBag', color: '#3b82f6' },
  { id: 'cat-transport', name: 'Transportasi & Bensin', type: 'KELUAR', iconName: 'Car', color: '#8b5cf6' },
  { id: 'cat-tagihan', name: 'Tagihan, Listrik & Air', type: 'KELUAR', iconName: 'Receipt', color: '#ef4444' },
  { id: 'cat-hiburan', name: 'Hiburan & Liburan', type: 'KELUAR', iconName: 'Film', color: '#ec4899' },
  { id: 'cat-kesehatan', name: 'Kesehatan & Obat', type: 'KELUAR', iconName: 'HeartPulse', color: '#14b8a6' },
  { id: 'cat-pendidikan', name: 'Pendidikan & Buku', type: 'KELUAR', iconName: 'GraduationCap', color: '#06b6d4' },
  { id: 'cat-keluarga', name: 'Keluarga & Sedekah', type: 'KELUAR', iconName: 'Gift', color: '#a855f7' },
  { id: 'cat-lainnya-out', name: 'Pengeluaran Lainnya', type: 'KELUAR', iconName: 'HelpCircle', color: '#64748b' },

  // Pemasukan (Income)
  { id: 'cat-kiriman-ortu', name: 'Kiriman Ortu', type: 'MASUK', iconName: 'HeartHandshake', color: '#f59e0b' },
  { id: 'cat-gaji', name: 'Gaji Bulanan', type: 'MASUK', iconName: 'Briefcase', color: '#10b981' },
  { id: 'cat-usaha', name: 'Pendapatan Usaha / Freelance', type: 'MASUK', iconName: 'TrendingUp', color: '#0ea5e9' },
  { id: 'cat-lainnya-in', name: 'Pemasukan Lainnya', type: 'MASUK', iconName: 'PlusCircle', color: '#059669' },
];

export function getSampleTransactions(): Transaction[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  return [
    {
      id: 'tx-1',
      date: `${year}-${month}-01`,
      time: '08:30',
      category: 'Gaji Bulanan',
      amount: 7500000,
      type: 'MASUK',
      wallet: 'ONLINE',
      notes: 'Gaji pokok bulanan masuk Rekening Bank (M-Banking)',
      createdAt: Date.now() - 25 * 86400000,
    },
    {
      id: 'tx-2',
      date: `${year}-${month}-02`,
      time: '09:15',
      category: 'Tagihan, Listrik & Air',
      amount: 450000,
      type: 'KELUAR',
      wallet: 'ONLINE',
      notes: 'Bayar token PLN 300rb dan PDAM 150rb via M-Banking',
      createdAt: Date.now() - 24 * 86400000,
    },
    {
      id: 'tx-3',
      date: `${year}-${month}-03`,
      time: '11:00',
      category: 'Pindah Kas / Antar Akun',
      amount: 500000,
      type: 'TRANSFER',
      wallet: 'EWALLET',
      sourceWallet: 'ONLINE',
      targetWallet: 'EWALLET',
      notes: 'Top up E-Wallet (GoPay/OVO/ShopeePay) dari Rekening Bank',
      createdAt: Date.now() - 23 * 86400000,
    },
    {
      id: 'tx-4',
      date: `${year}-${month}-04`,
      time: '13:20',
      category: 'Makanan & Minuman',
      amount: 65000,
      type: 'KELUAR',
      wallet: 'EWALLET',
      notes: 'Pesan makan siang via E-Wallet (QRIS)',
      createdAt: Date.now() - 22 * 86400000,
    },
    {
      id: 'tx-5',
      date: `${year}-${month}-06`,
      time: '14:20',
      category: 'Belanja & Kebutuhan',
      amount: 450000,
      type: 'KELUAR',
      wallet: 'ONLINE',
      notes: 'Belanja bulanan sembako supermarket (Debit Rekening)',
      createdAt: Date.now() - 20 * 86400000,
    },
    {
      id: 'tx-6',
      date: `${year}-${month}-08`,
      time: '10:00',
      category: 'Kiriman Ortu',
      amount: 1500000,
      type: 'MASUK',
      wallet: 'ONLINE',
      notes: 'Transfer kiriman uang bulanan dari orang tua',
      createdAt: Date.now() - 18 * 86400000,
    },
    {
      id: 'tx-7',
      date: `${year}-${month}-10`,
      time: '11:10',
      category: 'Pindah Kas / Antar Akun',
      amount: 500000,
      type: 'TRANSFER',
      wallet: 'DOMPET',
      sourceWallet: 'ONLINE',
      targetWallet: 'DOMPET',
      notes: 'Tarik tunai ATM dari rekening dimasukkan ke dompet fisik',
      createdAt: Date.now() - 15 * 86400000,
    },
    {
      id: 'tx-8',
      date: `${year}-${month}-12`,
      time: '12:45',
      category: 'Makanan & Minuman',
      amount: 85000,
      type: 'KELUAR',
      wallet: 'DOMPET',
      notes: 'Makan siang ayam geprek dan kopi (Tunai Dompet)',
      createdAt: Date.now() - 12 * 86400000,
    },
    {
      id: 'tx-9',
      date: `${year}-${month}-15`,
      time: '07:30',
      category: 'Transportasi & Bensin',
      amount: 150000,
      type: 'KELUAR',
      wallet: 'DOMPET',
      notes: 'Isi bensin motor SPBU (Tunai Dompet)',
      createdAt: Date.now() - 9 * 86400000,
    },
    {
      id: 'tx-10',
      date: `${year}-${month}-18`,
      time: '16:00',
      category: 'Kesehatan & Obat',
      amount: 120000,
      type: 'KELUAR',
      wallet: 'DOMPET',
      notes: 'Beli vitamin C dan obat apotek (Tunai Dompet)',
      createdAt: Date.now() - 6 * 86400000,
    },
  ];
}

export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (!raw) {
      // Check if we have an auto-backup snapshot to recover before loading samples
      const backupRaw = localStorage.getItem(STORAGE_KEY_AUTO_BACKUP);
      if (backupRaw) {
        try {
          const backupData = JSON.parse(backupRaw);
          if (Array.isArray(backupData.transactions) && backupData.transactions.length > 0) {
            saveTransactions(backupData.transactions);
            return normalizeTransactions(backupData.transactions);
          }
        } catch {
          // ignore backup parse error
        }
      }

      const initial = getSampleTransactions();
      saveTransactions(initial);
      return initial;
    }
    const parsed: any[] = JSON.parse(raw);
    return normalizeTransactions(parsed);
  } catch (err) {
    console.error('Failed to load transactions from localStorage', err);
    return getSampleTransactions();
  }
}

function normalizeTransactions(parsed: any[]): Transaction[] {
  return parsed.map((t) => {
    let time = t.time;
    if (!time && t.createdAt) {
      const d = new Date(t.createdAt);
      if (!isNaN(d.getTime())) {
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        time = `${h}:${m}`;
      }
    }

    let wallet: WalletType = 'ONLINE';
    if (t.wallet === 'DOMPET') wallet = 'DOMPET';
    else if (t.wallet === 'EWALLET') wallet = 'EWALLET';
    else wallet = 'ONLINE';

    // Migrate old transfer transactions:
    // e.g. "Dari Rekening" (type MASUK to DOMPET) -> TRANSFER source ONLINE -> target DOMPET
    let type: TransactionType = t.type || 'KELUAR';
    let sourceWallet: WalletType | undefined = t.sourceWallet;
    let targetWallet: WalletType | undefined = t.targetWallet;

    if (t.type === 'MASUK') {
      if (t.category === 'Dari Rekening') {
        type = 'TRANSFER';
        sourceWallet = 'ONLINE';
        targetWallet = 'DOMPET';
        wallet = 'DOMPET';
      } else if (t.category === 'Dari Dompet') {
        type = 'TRANSFER';
        sourceWallet = 'DOMPET';
        targetWallet = 'ONLINE';
        wallet = 'ONLINE';
      }
    }

    return {
      ...t,
      time: time || '12:00',
      type,
      wallet,
      sourceWallet,
      targetWallet,
    };
  });
}

export function saveTransactions(transactions: Transaction[]) {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions', err);
  }
}

export function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!raw) {
      saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    }
    const parsed: Category[] = JSON.parse(raw);
    const expenseCategories = parsed.filter((c) => c.type === 'KELUAR');
    const newIncomeCategories = DEFAULT_CATEGORIES.filter((c) => c.type === 'MASUK');

    const customIncome = parsed.filter(
      (c) =>
        c.type === 'MASUK' &&
        !newIncomeCategories.some((nic) => nic.name.toLowerCase() === c.name.toLowerCase())
    );

    const merged = [...expenseCategories, ...newIncomeCategories, ...customIncome];
    saveCategories(merged);
    return merged;
  } catch (err) {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories', err);
  }
}

export function loadInitialBalances(): InitialBalances {
  try {
    const rawOnline = localStorage.getItem(STORAGE_KEY_INITIAL_ONLINE);
    const rawEwallet = localStorage.getItem(STORAGE_KEY_INITIAL_EWALLET);
    const rawDompet = localStorage.getItem(STORAGE_KEY_INITIAL_DOMPET);

    if (rawOnline !== null || rawDompet !== null || rawEwallet !== null) {
      return {
        online: Number(rawOnline) || 0,
        ewallet: Number(rawEwallet) || 0,
        dompet: Number(rawDompet) || 0,
      };
    }

    // Fallback if legacy single balance existed
    const legacy = localStorage.getItem(STORAGE_KEY_INITIAL_BALANCE);
    if (legacy) {
      const total = Number(legacy) || 2500000;
      const online = Math.round(total * 0.6);
      const ewallet = Math.round(total * 0.2);
      const dompet = total - online - ewallet;
      saveInitialBalances({ online, ewallet, dompet });
      return { online, ewallet, dompet };
    }

    // Default baseline: Online 2.000.000, E-Wallet 300.000, Dompet 500.000 (Total 2.800.000)
    const defaults: InitialBalances = { online: 2000000, ewallet: 300000, dompet: 500000 };
    saveInitialBalances(defaults);
    return defaults;
  } catch {
    return { online: 2000000, ewallet: 300000, dompet: 500000 };
  }
}

export function saveInitialBalances(balances: InitialBalances) {
  try {
    localStorage.setItem(STORAGE_KEY_INITIAL_ONLINE, String(balances.online));
    localStorage.setItem(STORAGE_KEY_INITIAL_EWALLET, String(balances.ewallet ?? 0));
    localStorage.setItem(STORAGE_KEY_INITIAL_DOMPET, String(balances.dompet));
  } catch (err) {
    console.error('Failed to save initial balances', err);
  }
}

// -------------------------------------------------------------
// Weekly Auto-Backup System
// Automatically creates a backup snapshot every 7 days (604,800,000 ms)
// -------------------------------------------------------------
export interface BackupSnapshot {
  timestamp: number;
  dateStr: string;
  transactionsCount: number;
  initialBalances: InitialBalances;
  transactions: Transaction[];
  categories: Category[];
}

export function checkAndRunWeeklyAutoBackup(
  transactions: Transaction[],
  categories: Category[],
  initialBalances: InitialBalances
): { backupCreated: boolean; lastBackupTime: number } {
  try {
    const lastBackupStr = localStorage.getItem(STORAGE_KEY_LAST_BACKUP_TIME);
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 1 minggu
    const lastBackupTime = lastBackupStr ? Number(lastBackupStr) : 0;

    if (now - lastBackupTime >= SEVEN_DAYS_MS || !lastBackupStr) {
      // Create auto-backup snapshot
      const snapshot: BackupSnapshot = {
        timestamp: now,
        dateStr: new Date(now).toISOString(),
        transactionsCount: transactions.length,
        initialBalances,
        transactions,
        categories,
      };

      localStorage.setItem(STORAGE_KEY_AUTO_BACKUP, JSON.stringify(snapshot));
      localStorage.setItem(STORAGE_KEY_LAST_BACKUP_TIME, String(now));
      return { backupCreated: true, lastBackupTime: now };
    }

    return { backupCreated: false, lastBackupTime };
  } catch (err) {
    console.error('Error running weekly auto-backup:', err);
    return { backupCreated: false, lastBackupTime: Date.now() };
  }
}

export function loadAutoBackupSnapshot(): BackupSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTO_BACKUP);
    if (!raw) return null;
    return JSON.parse(raw) as BackupSnapshot;
  } catch {
    return null;
  }
}

export function getLastBackupTime(): number {
  const str = localStorage.getItem(STORAGE_KEY_LAST_BACKUP_TIME);
  return str ? Number(str) : 0;
}
