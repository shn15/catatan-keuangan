import * as XLSX from 'xlsx';
import { Transaction, MonthlySummary } from '../types';
import { formatRupiah, formatDateIndo, INDONESIAN_MONTHS, getTimeFromTimestamp, getWalletLabel } from './formatters';

export function exportMonthlyReportToExcel(
  transactions: Transaction[],
  summary: MonthlySummary,
  fileNamePrefix = 'Laporan_Keuangan'
) {
  const monthName = INDONESIAN_MONTHS[summary.month];
  const year = summary.year;
  const title = `LAPORAN KEUANGAN BULANAN - ${monthName.toUpperCase()} ${year}`;

  // Sort transactions by date and time ascending
  const sorted = [...transactions].sort((a, b) => {
    const dtA = `${a.date} ${a.time || '00:00'}`;
    const dtB = `${b.date} ${b.time || '00:00'}`;
    return dtA.localeCompare(dtB);
  });

  // Build the Sheet rows
  const rows: any[][] = [];

  // 1. Header Information Block
  rows.push([title]);
  rows.push([`Periode: ${monthName} ${year}`]);
  rows.push([`Tanggal Cetak: ${formatDateIndo(new Date().toISOString().split('T')[0], 'long')}`]);
  rows.push([]); // blank row

  // 2. Financial Summary Block (with Bank, E-Wallet, and Dompet split)
  rows.push(['RINGKASAN KAS BULANAN', '']);
  rows.push(['Saldo Awal Bulan', summary.startingBalance]);
  rows.push(['  - Saldo Awal Rekening Bank (M-Banking)', summary.walletBreakdown?.online.startingBalance ?? 0]);
  rows.push(['  - Saldo Awal E-Wallet (GoPay/OVO/Dana)', summary.walletBreakdown?.ewallet?.startingBalance ?? 0]);
  rows.push(['  - Saldo Awal Dompet (Tunai Fisik)', summary.walletBreakdown?.dompet.startingBalance ?? 0]);
  rows.push(['Total Uang Masuk (Nyata)', summary.totalIncome]);
  rows.push(['Total Uang Keluar (Nyata)', summary.totalExpense]);
  rows.push(['Sisa Saldo / Saldo Akhir', summary.endingBalance]);
  rows.push(['  - Sisa Saldo Rekening Bank', summary.walletBreakdown?.online.endingBalance ?? 0]);
  rows.push(['  - Sisa Saldo E-Wallet', summary.walletBreakdown?.ewallet?.endingBalance ?? 0]);
  rows.push(['  - Sisa Saldo Dompet (Tunai)', summary.walletBreakdown?.dompet.endingBalance ?? 0]);
  rows.push([]); // blank row

  // 3. Table Header
  const headers = ['No', 'Tanggal & Jam', 'Akun / Dompet', 'Jenis', 'Harga Barang', 'Jenis Transaksi', 'Keterangan'];
  rows.push(headers);

  // 4. Data Rows
  let totalNominal = 0;
  let totalMasuk = summary.totalIncome;
  let totalKeluar = summary.totalExpense;

  sorted.forEach((t, idx) => {
    let jenisTransaksi = t.type === 'MASUK' ? 'Pemasukan' : t.type === 'TRANSFER' ? 'Pindah Kas' : 'Pengeluaran';
    let akunKas = getWalletLabel(t.wallet);
    if (t.type === 'TRANSFER') {
      akunKas = `${getWalletLabel(t.sourceWallet || 'ONLINE')} ➔ ${getWalletLabel(t.targetWallet || t.wallet)}`;
    }
    totalNominal += t.amount;

    const timeStr = t.time || (t.createdAt ? getTimeFromTimestamp(t.createdAt) : '');
    const tanggalDanJam = timeStr
      ? `${formatDateIndo(t.date, 'short')} ${timeStr}`
      : formatDateIndo(t.date, 'short');

    rows.push([
      idx + 1,
      tanggalDanJam,
      akunKas,
      t.category,
      t.amount, // Raw number for Excel calculation/formatting
      jenisTransaksi,
      t.notes || '-'
    ]);
  });

  // 5. Automatic System Totals Row
  rows.push([]);
  rows.push(['', '', '', 'TOTAL PEMASUKAN NYATA', totalMasuk, 'Pemasukan', 'Total uang yang masuk bulan ini (tanpa transfer internal)']);
  rows.push(['', '', '', 'TOTAL PENGELUARAN NYATA', totalKeluar, 'Pengeluaran', 'Total uang yang keluar bulan ini (tanpa transfer internal)']);
  rows.push(['', '', '', 'SISA / CASHFLOW BERSIH', totalMasuk - totalKeluar, '-', 'Selisih Pemasukan - Pengeluaran']);
  rows.push(['', '', '', 'TOTAL AKUMULASI MUTASI', totalNominal, '-', `${sorted.length} Mutasi/Transaksi tercatat`]);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Set column widths
  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 22 }, // Tanggal & Jam
    { wch: 24 }, // Akun / Dompet
    { wch: 22 }, // Jenis (Kategori)
    { wch: 18 }, // Harga Barang
    { wch: 20 }, // Jenis Transaksi
    { wch: 35 }, // Keterangan
  ];

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${monthName} ${year}`);

  // Generate file name & save
  const fileName = `${fileNamePrefix}_${monthName}_${year}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

export function exportMonthlyReportToCSV(
  transactions: Transaction[],
  summary: MonthlySummary,
  fileNamePrefix = 'Laporan_Keuangan'
) {
  const monthName = INDONESIAN_MONTHS[summary.month];
  const year = summary.year;
  const title = `LAPORAN KEUANGAN BULANAN - ${monthName.toUpperCase()} ${year}`;

  const sorted = [...transactions].sort((a, b) => {
    const dtA = `${a.date} ${a.time || '00:00'}`;
    const dtB = `${b.date} ${b.time || '00:00'}`;
    return dtA.localeCompare(dtB);
  });

  // CSV content with UTF-8 BOM for Microsoft Excel compatibility
  let csvContent = '\uFEFF';

  // Title and Summary Block
  csvContent += `"${title}"\n`;
  csvContent += `"Periode","${monthName} ${year}"\n`;
  csvContent += `"Tanggal Unduh","${formatDateIndo(new Date().toISOString().split('T')[0], 'long')}"\n\n`;

  csvContent += `"RINGKASAN KEUANGAN BULANAN"\n`;
  csvContent += `"Saldo Awal Bulan","${summary.startingBalance}"\n`;
  csvContent += `"Saldo Awal Rekening Bank","${summary.walletBreakdown?.online.startingBalance ?? 0}"\n`;
  csvContent += `"Saldo Awal E-Wallet","${summary.walletBreakdown?.ewallet?.startingBalance ?? 0}"\n`;
  csvContent += `"Saldo Awal Dompet (Tunai)","${summary.walletBreakdown?.dompet.startingBalance ?? 0}"\n`;
  csvContent += `"Total Uang Masuk","${summary.totalIncome}"\n`;
  csvContent += `"Total Uang Keluar","${summary.totalExpense}"\n`;
  csvContent += `"Sisa Saldo / Saldo Akhir","${summary.endingBalance}"\n`;
  csvContent += `"Sisa Saldo Rekening Bank","${summary.walletBreakdown?.online.endingBalance ?? 0}"\n`;
  csvContent += `"Sisa Saldo E-Wallet","${summary.walletBreakdown?.ewallet?.endingBalance ?? 0}"\n`;
  csvContent += `"Sisa Saldo Dompet (Tunai)","${summary.walletBreakdown?.dompet.endingBalance ?? 0}"\n\n`;

  // Headers
  csvContent += `"No","Tanggal & Jam","Akun/Dompet","Jenis","Harga Barang","Jenis Transaksi","Keterangan"\n`;

  // Data rows
  let totalNominal = 0;
  let totalMasuk = summary.totalIncome;
  let totalKeluar = summary.totalExpense;

  sorted.forEach((t, idx) => {
    let jenisTransaksi = t.type === 'MASUK' ? 'Pemasukan' : t.type === 'TRANSFER' ? 'Pindah Kas' : 'Pengeluaran';
    let akunKas = getWalletLabel(t.wallet);
    if (t.type === 'TRANSFER') {
      akunKas = `${getWalletLabel(t.sourceWallet || 'ONLINE')} ➔ ${getWalletLabel(t.targetWallet || t.wallet)}`;
    }
    totalNominal += t.amount;

    const timeStr = t.time || (t.createdAt ? getTimeFromTimestamp(t.createdAt) : '');
    const tanggalDanJam = timeStr ? `${t.date} ${timeStr}` : t.date;
    const safeNotes = (t.notes || '-').replace(/"/g, '""');
    const safeCat = t.category.replace(/"/g, '""');

    csvContent += `${idx + 1},"${tanggalDanJam}","${akunKas}","${safeCat}",${t.amount},"${jenisTransaksi}","${safeNotes}"\n`;
  });

  // Footer totals
  csvContent += `\n`;
  csvContent += `"","","","TOTAL PEMASUKAN",${totalMasuk},"Pemasukan","Total uang masuk nyata bulan ini"\n`;
  csvContent += `"","","","TOTAL PENGELUARAN",${totalKeluar},"Pengeluaran","Total uang keluar nyata bulan ini"\n`;
  csvContent += `"","","","SISA BERSIH",${totalMasuk - totalKeluar},"-","Pemasukan dikurangi Pengeluaran"\n`;
  csvContent += `"","","","TOTAL AKUMULASI MUTASI",${totalNominal},"-","Total ${sorted.length} transaksi"\n`;

  // Trigger browser download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileNamePrefix}_${monthName}_${year}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

