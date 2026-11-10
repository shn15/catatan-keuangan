import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { INDONESIAN_MONTHS } from '../utils/formatters';

interface MonthSelectorProps {
  selectedYear: number;
  selectedMonth: number; // 0-11
  onChange: (year: number, month: number) => void;
  availableYears?: number[];
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedYear,
  selectedMonth,
  onChange,
  availableYears = [2024, 2025, 2026, 2027, 2028],
}) => {
  const handlePrev = () => {
    if (selectedMonth === 0) {
      onChange(selectedYear - 1, 11);
    } else {
      onChange(selectedYear, selectedMonth - 1);
    }
  };

  const handleNext = () => {
    if (selectedMonth === 11) {
      onChange(selectedYear + 1, 0);
    } else {
      onChange(selectedYear, selectedMonth + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    onChange(now.getFullYear(), now.getMonth());
  };

  return (
    <div id="month-selector-container" className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded-lg shadow-2xs border border-slate-200">
      <button
        id="btn-prev-month"
        onClick={handlePrev}
        className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 active:scale-95 transition cursor-pointer"
        title="Bulan Sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1.5 px-1">
        <Calendar className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
        
        {/* Month Dropdown */}
        <select
          id="select-month"
          value={selectedMonth}
          onChange={(e) => onChange(selectedYear, parseInt(e.target.value, 10))}
          className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none cursor-pointer hover:text-emerald-700 py-0.5"
        >
          {INDONESIAN_MONTHS.map((m, idx) => (
            <option key={m} value={idx}>
              {m}
            </option>
          ))}
        </select>

        {/* Year Dropdown */}
        <select
          id="select-year"
          value={selectedYear}
          onChange={(e) => onChange(parseInt(e.target.value, 10), selectedMonth)}
          className="bg-transparent text-xs font-mono font-bold text-slate-900 focus:outline-none cursor-pointer hover:text-emerald-700 py-0.5"
        >
          {availableYears.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>

        <button
          id="btn-current-month"
          onClick={handleToday}
          className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 font-semibold transition cursor-pointer"
        >
          Hari Ini
        </button>
      </div>

      <button
        id="btn-next-month"
        onClick={handleNext}
        className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 active:scale-95 transition cursor-pointer"
        title="Bulan Berikutnya"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

