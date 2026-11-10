export type TransactionType = 'MASUK' | 'KELUAR' | 'TRANSFER';
export type WalletType = 'ONLINE' | 'EWALLET' | 'DOMPET';

export interface InitialBalances {
  online: number;   // Rekening Bank / M-Banking / ATM
  ewallet: number;  // E-Wallet (GoPay, OVO, Dana, ShopeePay, dll)
  dompet: number;   // Tunai / Uang Fisik Kas
}

export interface Category {
  id: string;
  name: string;
  type: 'MASUK' | 'KELUAR';
  iconName: string;
  color: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm (e.g. "14:30")
  category: string; // "Jenis" (e.g. Makanan, Transport, Gaji, Pindah Kas, dll)
  amount: number; // "Harga Barang" / Nominal
  type: TransactionType; // MASUK (Pemasukan) | KELUAR (Pengeluaran) | TRANSFER (Pindah Kas / Antar Akun)
  wallet: WalletType; // Akun tujuan / akun utama
  targetWallet?: WalletType; // Akun tujuan jika type === 'TRANSFER' (Pindah Kas)
  sourceWallet?: WalletType; // Akun asal jika type === 'TRANSFER' (Pindah Kas)
  notes: string; // "Keterangan"
  createdAt: number;
}

export interface WalletBreakdownItem {
  startingBalance: number;
  totalIncome: number;
  totalExpense: number;
  endingBalance: number;
}

export interface MonthlySummary {
  year: number;
  month: number; // 0-11
  startingBalance: number;
  totalIncome: number;
  totalExpense: number;
  netCashflow: number; // Income - Expense (excluding internal transfers)
  endingBalance: number; // startingBalance + netCashflow
  transactionCount: number;
  walletBreakdown?: {
    online: WalletBreakdownItem;
    ewallet: WalletBreakdownItem;
    dompet: WalletBreakdownItem;
  };
}

