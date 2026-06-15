import { useState, useEffect, useMemo } from "react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

interface BirthDatePickerProps {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (v: string) => void;
  maxYear?: number;
  minYear?: number;
  className?: string;
}

export const BirthDatePicker = ({
  value,
  onChange,
  maxYear = new Date().getFullYear(),
  minYear = 1900,
  className = "",
}: BirthDatePickerProps) => {
  // Local state so partial selections are preserved
  const [day, setDay]     = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear]   = useState("");

  // Sync from external value (e.g. on reset)
  useEffect(() => {
    if (value && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [y, m, d] = value.split("-");
      setYear(String(parseInt(y)));
      setMonth(String(parseInt(m)));
      setDay(String(parseInt(d)));
    } else if (!value) {
      setYear(""); setMonth(""); setDay("");
    }
  }, [value]);

  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = maxYear; y >= minYear; y--) arr.push(y);
    return arr;
  }, [maxYear, minYear]);

  const days = useMemo(() => {
    if (!year || !month) return Array.from({ length: 31 }, (_, i) => i + 1);
    const max = daysInMonth(parseInt(month), parseInt(year));
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [year, month]);

  const emit = (y: string, m: string, d: string) => {
    if (y && m && d) {
      const mm = m.padStart(2, "0");
      const dd = d.padStart(2, "0");
      onChange(`${y}-${mm}-${dd}`);
    }
    // Don't call onChange("") on partial — preserve local state
  };

  const handleDay = (v: string) => {
    setDay(v);
    emit(year, month, v);
  };
  const handleMonth = (v: string) => {
    // Reset day if it exceeds the new month's max days
    let d = day;
    if (v && year && day) {
      const max = daysInMonth(parseInt(v), parseInt(year));
      if (parseInt(day) > max) { d = ""; setDay(""); }
    }
    setMonth(v);
    emit(year, v, d);
  };
  const handleYear = (v: string) => {
    let d = day;
    if (v && month && day) {
      const max = daysInMonth(parseInt(month), parseInt(v));
      if (parseInt(day) > max) { d = ""; setDay(""); }
    }
    setYear(v);
    emit(v, month, d);
  };

  const base =
    "h-11 rounded-xl border border-[#d8c090]/50 bg-white px-2 text-[14px] text-[#1c1408] " +
    "outline-none focus:border-[#d4651a]/60 focus:ring-2 focus:ring-[#d4651a]/15 " +
    "cursor-pointer transition-all shadow-sm";

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Day */}
      <select value={day} onChange={(e) => handleDay(e.target.value)}
        className={`${base} w-[72px] shrink-0`}>
        <option value="">DD</option>
        {days.map((d) => (
          <option key={d} value={String(d)}>{String(d).padStart(2, "0")}</option>
        ))}
      </select>

      {/* Month */}
      <select value={month} onChange={(e) => handleMonth(e.target.value)}
        className={`${base} flex-1`}>
        <option value="">Month</option>
        {MONTHS.map((m, i) => (
          <option key={m} value={String(i + 1)}>{m}</option>
        ))}
      </select>

      {/* Year */}
      <select value={year} onChange={(e) => handleYear(e.target.value)}
        className={`${base} w-[90px] shrink-0`}>
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={String(y)}>{y}</option>
        ))}
      </select>
    </div>
  );
};
