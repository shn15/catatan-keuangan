export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const INDONESIAN_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export function formatRupiah(amount: number | null | undefined, withPrefix = true): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(Math.abs(num));

  const sign = num < 0 ? '-' : '';
  return withPrefix ? `${sign}Rp ${formatted}` : `${sign}${formatted}`;
}

export function parseRupiahInput(value: string): number {
  const clean = value.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

export function formatDateIndo(dateStr: string, format: 'short' | 'long' | 'with-day' = 'long'): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const dateObj = new Date(year, monthIdx, day);

  if (format === 'short') {
    const monthShort = INDONESIAN_MONTHS[monthIdx]?.substring(0, 3) || '';
    return `${day} ${monthShort} ${year}`;
  }

  if (format === 'with-day') {
    const dayName = INDONESIAN_DAYS[dateObj.getDay()];
    return `${dayName}, ${day} ${INDONESIAN_MONTHS[monthIdx]} ${year}`;
  }

  return `${day} ${INDONESIAN_MONTHS[monthIdx]} ${year}`;
}

export function getTodayDateString(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getNowTimeString(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function getTimeFromTimestamp(timestamp?: number): string {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function getWalletLabel(wallet?: string): string {
  switch (wallet) {
    case 'EWALLET':
      return 'E-Wallet';
    case 'DOMPET':
      return 'Dompet (Tunai)';
    case 'ONLINE':
    default:
      return 'Bank (Rekening)';
  }
}

