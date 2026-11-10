import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Copy,
  Check,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Scale,
  Calendar,
  Clock,
} from 'lucide-react';
import { Transaction, MonthlySummary } from '../types';
import { formatRupiah, formatDateIndo, INDONESIAN_MONTHS, getTimeFromTimestamp, getWalletLabel } from '../utils/formatters';
import { exportMonthlyReportToExcel, exportMonthlyReportToCSV } from '../utils/exportExcel';

interface MonthlyReportViewProps {
  transactions: Transaction[];
  summary: MonthlySummary;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  transactions,
  summary,
  onSelectTransaction,
}) => {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const monthName = INDONESIAN_MONTHS[summary.month];
  const year = summary.year;
  const title = `Laporan Keuangan Bulanan - ${monthName} ${year}`;

  // Sort ascending by date and time for formal accounting ledger
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dtA = `${a.date} ${a.time || '00:00'}`;
    const dtB = `${b.date} ${b.time || '00:00'}`;
    return dtA.localeCompare(dtB);
  });

  // Accurate totals: Transfers are NOT counted as external Income or Expense!
  const totalPemasukan = summary.totalIncome;
  const totalPengeluaran = summary.totalExpense;
  const sisaBersih = summary.netCashflow;

  const handleDownloadExcel = () => {
    setExporting(true);
    try {
      exportMonthlyReportToExcel(transactions, summary);
    } catch (err) {
      console.error('Export Excel failed', err);
      alert('Gagal mengunduh Excel.');
    } finally {
      setTimeout(() => setExporting(false), 500);
    }
  };

  const handleDownloadCSV = () => {
    try {
      exportMonthlyReportToCSV(transactions, summary);
    } catch (err) {
      console.error('Export CSV failed', err);
      alert('Gagal mengunduh CSV.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTable = () => {
    let tsv = `${title}\n`;
    tsv += `Saldo Awal: ${formatRupiah(summary.startingBalance)}\n`;
    tsv += `Total Uang Masuk: ${formatRupiah(totalPemasukan)}\n`;
    tsv += `Total Uang Keluar: ${formatRupiah(totalPengeluaran)}\n`;
    tsv += `Sisa Saldo: ${formatRupiah(summary.endingBalance)}\n\n`;
    tsv += `No\tTanggal & Jam\tAkun/Dompet\tJenis\tHarga Barang\tJenis Transaksi\tKeterangan\n`;

    sortedTransactions.forEach((t, idx) => {
      let jenisTransaksi = t.type === 'MASUK' ? 'Pemasukan' : t.type === 'TRANSFER' ? 'Pindah Kas' : 'Pengeluaran';
      let akunKas = getWalletLabel(t.wallet);
      if (t.type === 'TRANSFER') {
        akunKas = `${getWalletLabel(t.sourceWallet || 'ONLINE')} ➔ ${getWalletLabel(t.targetWallet || t.wallet)}`;
      }
      const timeStr = t.time || (t.createdAt ? getTimeFromTimestamp(t.createdAt) : '');
      const tglJam = timeStr ? `${t.date} ${timeStr}` : t.date;
      tsv += `${idx + 1}\t${tglJam}\t${akunKas}\t${t.category}\t${t.amount}\t${jenisTransaksi}\t${t.notes || '-'}\n`;
    });

    tsv += `\nTOTAL PEMASUKAN\t\t\t${totalPemasukan}\n`;
    tsv += `TOTAL PENGELUARAN\t\t\t${totalPengeluaran}\n`;
    tsv += `SISA BERSIH\t\t\t${sisaBersih}\n`;

    navigator.clipboard.writeText(tsv).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div id="monthly-report-view" className="space-y-3">
      {/* Export Action Bar (Hidden during print) */}
      <div className="no-print bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                Rekap Laporan Bulanan (Format Excel)
              </h3>
              <p className="text-[11px] text-slate-500">
                Laporan rapi siap cetak dan ekspor .xlsx / .csv dengan rumus otomatis
              </p>
            </div>
          </div>

          {/* Download & Utility Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              id="btn-export-excel"
              onClick={handleDownloadExcel}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs active:scale-95 transition cursor-pointer border border-emerald-500"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{exporting ? 'Memproses...' : 'Unduh Excel (.xlsx)'}</span>
            </button>

            <button
              id="btn-export-csv"
              onClick={handleDownloadCSV}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 active:scale-95 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              id="btn-copy-table"
              onClick={handleCopyTable}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 active:scale-95 transition cursor-pointer"
              title="Salin Data ke Clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-700 font-bold" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin'}</span>
            </button>

            <button
              id="btn-print-report"
              onClick={handlePrint}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 active:scale-95 transition cursor-pointer"
              title="Cetak Laporan / Simpan PDF"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Official Monthly Report Sheet Preview */}
      <div
        id="excel-report-paper"
        className="bg-white rounded-xl border border-slate-200 shadow-2xs p-3.5 sm:p-5 overflow-hidden space-y-4"
      >
        {/* Title Header matching user's exact specification */}
        <div className="border-b border-slate-300 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div>
              <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                DOKUMEN KAS & KEUANGAN
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-tight mt-0.5">
                {title}
              </h2>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                Periode: {monthName} {year} • Dihitung otomatis oleh sistem
              </p>
            </div>
            <div className="text-left sm:text-right text-[11px] text-slate-500 font-mono">
              Status: <span className="text-emerald-700 font-bold">Terverifikasi</span>
            </div>
          </div>
        </div>

        {/* Ringkasan Saldo Bulanan Block (Judul jumlah saldo dalam perbulan, jumlah uang keluar dan sisa) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          <div className="p-2 bg-white rounded-md border border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              Saldo Awal Bulan
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-900 font-mono mt-0.5 truncate">
              {formatRupiah(summary.startingBalance)}
            </p>
            {summary.walletBreakdown && (
              <div className="text-[10px] text-slate-500 font-mono pt-1 space-y-0.5 border-t border-slate-100 mt-1">
                <p className="truncate text-sky-700">Bank: {formatRupiah(summary.walletBreakdown.online.startingBalance)}</p>
                <p className="truncate text-indigo-700">E-Wallet: {formatRupiah(summary.walletBreakdown.ewallet?.startingBalance ?? 0)}</p>
                <p className="truncate text-amber-800">Dompet: {formatRupiah(summary.walletBreakdown.dompet.startingBalance)}</p>
              </div>
            )}
          </div>

          <div className="p-2 bg-white rounded-md border border-emerald-200/80">
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
              <TrendingUp className="w-3 h-3" />
              <span className="truncate">Total Masuk</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-emerald-700 font-mono mt-0.5 truncate">
              +{formatRupiah(totalPemasukan)}
            </p>
            {summary.walletBreakdown && (
              <div className="text-[10px] text-emerald-700 font-mono pt-1 space-y-0.5 border-t border-emerald-100 mt-1">
                <p className="truncate">Bank: +{formatRupiah(summary.walletBreakdown.online.totalIncome)}</p>
                <p className="truncate">E-Wallet: +{formatRupiah(summary.walletBreakdown.ewallet?.totalIncome ?? 0)}</p>
                <p className="truncate">Dompet: +{formatRupiah(summary.walletBreakdown.dompet.totalIncome)}</p>
              </div>
            )}
          </div>

          <div className="p-2 bg-white rounded-md border border-rose-200/80">
            <div className="flex items-center gap-1 text-[10px] font-bold text-rose-700 uppercase tracking-wider">
              <TrendingDown className="w-3 h-3" />
              <span className="truncate">Total Keluar</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-rose-700 font-mono mt-0.5 truncate">
              -{formatRupiah(totalPengeluaran)}
            </p>
            {summary.walletBreakdown && (
              <div className="text-[10px] text-rose-700 font-mono pt-1 space-y-0.5 border-t border-rose-100 mt-1">
                <p className="truncate">Bank: -{formatRupiah(summary.walletBreakdown.online.totalExpense)}</p>
                <p className="truncate">E-Wallet: -{formatRupiah(summary.walletBreakdown.ewallet?.totalExpense ?? 0)}</p>
                <p className="truncate">Dompet: -{formatRupiah(summary.walletBreakdown.dompet.totalExpense)}</p>
              </div>
            )}
          </div>

          <div className="p-2 bg-white rounded-md border border-sky-200/80">
            <div className="flex items-center gap-1 text-[10px] font-bold text-sky-700 uppercase tracking-wider">
              <Scale className="w-3 h-3" />
              <span className="truncate">Sisa / Saldo Akhir</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 font-mono mt-0.5 truncate">
              {formatRupiah(summary.endingBalance)}
            </p>
            {summary.walletBreakdown && (
              <div className="text-[10px] text-slate-700 font-mono pt-1 space-y-0.5 border-t border-sky-100 mt-1 font-semibold">
                <p className="truncate text-sky-700">Bank: {formatRupiah(summary.walletBreakdown.online.endingBalance)}</p>
                <p className="truncate text-indigo-700">E-Wallet: {formatRupiah(summary.walletBreakdown.ewallet?.endingBalance ?? 0)}</p>
                <p className="truncate text-amber-800">Dompet: {formatRupiah(summary.walletBreakdown.dompet.endingBalance)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Table with exact requested columns:
            1. No
            2. Tanggal
            3. Akun/Dompet
            4. Jenis
            5. Harga Barang
            6. Jenis Transaksi
            7. Keterangan
            and Footer Total calculated automatically */}
        <div className="overflow-x-auto rounded-lg border border-slate-300">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold tracking-wide text-[11px]">
                <th className="py-2 px-2 w-10 text-center border-r border-slate-700">No</th>
                <th className="py-2 px-2.5 whitespace-nowrap border-r border-slate-700">Tanggal & Jam</th>
                <th className="py-2 px-2.5 border-r border-slate-700 whitespace-nowrap">Akun / Dompet</th>
                <th className="py-2 px-2.5 border-r border-slate-700">Jenis</th>
                <th className="py-2 px-2.5 text-right border-r border-slate-700 whitespace-nowrap">
                  Harga Barang / Nominal
                </th>
                <th className="py-2 px-2.5 text-center border-r border-slate-700 whitespace-nowrap">
                  Jenis Transaksi
                </th>
                <th className="py-2 px-2.5 min-w-[140px]">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 text-[11px]">
              {sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    Tidak ada catatan transaksi pada bulan {monthName} {year}.
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((tx, idx) => {
                  const isMasuk = tx.type === 'MASUK';
                  const isTransfer = tx.type === 'TRANSFER';
                  const txTime = tx.time || (tx.createdAt ? getTimeFromTimestamp(tx.createdAt) : '');

                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTransaction && onSelectTransaction(tx)}
                      className={`hover:bg-slate-100/80 transition cursor-pointer ${
                        idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                      }`}
                    >
                      <td className="py-1.5 px-2 text-center font-mono text-slate-500 font-bold border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-1.5 px-2.5 font-medium whitespace-nowrap border-r border-slate-200 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span>{formatDateIndo(tx.date, 'short')}</span>
                          {txTime && (
                            <span className="text-[10px] text-slate-600 font-mono bg-slate-100 px-1 py-0.2 rounded border border-slate-200/80 font-bold">
                              {txTime}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-slate-200 whitespace-nowrap">
                        {isTransfer ? (
                          <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-800 border border-indigo-200">
                            {getWalletLabel(tx.sourceWallet || 'ONLINE')} ➔ {getWalletLabel(tx.targetWallet || tx.wallet)}
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                              tx.wallet === 'EWALLET'
                                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200/80'
                                : tx.wallet === 'DOMPET'
                                ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                                : 'bg-sky-50 text-sky-800 border border-sky-200/80'
                            }`}
                          >
                            {getWalletLabel(tx.wallet)}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 px-2.5 font-semibold text-slate-900 border-r border-slate-200">
                        {tx.category}
                      </td>
                      <td
                        className={`py-1.5 px-2.5 text-right font-mono font-bold border-r border-slate-200 ${
                          isTransfer ? 'text-indigo-700' : isMasuk ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatRupiah(tx.amount)}
                      </td>
                      <td className="py-1.5 px-2.5 text-center border-r border-slate-200">
                        <span
                          className={`inline-flex px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                            isTransfer
                              ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                              : isMasuk
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isTransfer ? 'Pindah Kas' : isMasuk ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </td>
                      <td className="py-1.5 px-2.5 text-slate-600 truncate max-w-xs">
                        {tx.notes ? tx.notes : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Footer Summary Automatically Calculated by the System */}
            <tfoot className="text-[11px]">
              {/* Row 1: Total Pemasukan */}
              <tr className="bg-emerald-50/90 font-semibold text-slate-900 border-t-2 border-slate-300">
                <td colSpan={4} className="py-2 px-2.5 text-right font-bold text-emerald-900 border-r border-emerald-200">
                  TOTAL PEMASUKAN:
                </td>
                <td className="py-2 px-2.5 text-right font-mono font-bold text-emerald-800 border-r border-emerald-200">
                  +{formatRupiah(totalPemasukan)}
                </td>
                <td colSpan={2} className="py-2 px-2.5 text-[10px] text-emerald-800">
                  {sortedTransactions.filter((t) => t.type === 'MASUK').length} Transaksi Pemasukan
                </td>
              </tr>

              {/* Row 2: Total Pengeluaran */}
              <tr className="bg-rose-50/90 font-semibold text-slate-900 border-t border-rose-200">
                <td colSpan={4} className="py-2 px-2.5 text-right font-bold text-rose-900 border-r border-rose-200">
                  TOTAL PENGELUARAN:
                </td>
                <td className="py-2 px-2.5 text-right font-mono font-bold text-rose-800 border-r border-rose-200">
                  -{formatRupiah(totalPengeluaran)}
                </td>
                <td colSpan={2} className="py-2 px-2.5 text-[10px] text-rose-800">
                  {sortedTransactions.filter((t) => t.type === 'KELUAR').length} Transaksi Pengeluaran
                </td>
              </tr>

              {/* Row 3: Sisa Bersih / Cashflow */}
              <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-900">
                <td colSpan={4} className="py-2 px-2.5 text-right font-bold uppercase tracking-wider border-r border-slate-700">
                  SISA BERSIH (NET CASHFLOW):
                </td>
                <td
                  className={`py-2 px-2.5 text-right font-mono font-bold text-xs border-r border-slate-700 ${
                    sisaBersih >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {sisaBersih >= 0 ? '+' : ''}
                  {formatRupiah(sisaBersih)}
                </td>
                <td colSpan={2} className="py-2 px-2.5 text-[10px] text-slate-300">
                  Dihitung otomatis oleh sistem (Pemasukan - Pengeluaran)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Note info box */}
        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2 text-[11px] text-slate-500">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p>
            Tabel di atas disesuaikan dengan format file Excel (.xlsx) yang diekspor. Anda dapat langsung mengklik baris mana saja untuk mengedit rincian catatan transaksi.
          </p>
        </div>
      </div>
    </div>
  );
};

