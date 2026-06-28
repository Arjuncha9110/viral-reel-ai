import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getChineseZodiacByBirthDate, getChineseZodiacByYear, LUNAR_NEW_YEARS } from "../../lib/chineseZodiac";
import { ChineseZodiacSign } from "../../data/chineseZodiacData";
import { ChineseAnimalIllustration } from "./ChineseAnimalIllustration";
import { Calendar, Search, HelpCircle, ArrowRight } from "lucide-react";

export const ChineseZodiacFinder: React.FC = () => {
  const [birthDate, setBirthDate] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [result, setResult] = useState<ChineseZodiacSign | null>(null);
  const [isApproximate, setIsApproximate] = useState(false);
  const [warning, setWarning] = useState("");

  const handleFindSign = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setWarning("");
    setIsApproximate(false);

    if (birthDate) {
      // Calculate using full birth date (Lunar New Year cutoff)
      const computedSign = getChineseZodiacByBirthDate(birthDate);
      const birthYearNum = new Date(birthDate).getFullYear();
      
      // Check if year is in LUNAR_NEW_YEARS lookup range
      if (!LUNAR_NEW_YEARS[birthYearNum]) {
        setIsApproximate(true);
        setWarning("Your birth year is outside our Lunar New Year lookup range. Calculation is approximate.");
      } else {
        const month = new Date(birthDate).getMonth(); // 0-indexed: Jan=0, Feb=1
        if (month === 0 || month === 1) {
          const lnyDateStr = LUNAR_NEW_YEARS[birthYearNum];
          setWarning(`Note: Since you were born in January/February, your sign has been carefully adjusted using the Lunar New Year date for ${birthYearNum} (${lnyDateStr}).`);
        }
      }

      setResult(computedSign);
      localStorage.setItem("divine_chinese_zodiac_sign", computedSign.slug);
    } else if (birthYear) {
      // Fallback calculation using birth year only
      const yearNum = parseInt(birthYear, 10);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
        alert("Please enter a valid year between 1900 and 2100.");
        return;
      }
      const computedSign = getChineseZodiacByYear(yearNum);
      setIsApproximate(true);
      setWarning("Calculated by year only. If you were born in January or February, your Chinese zodiac sign may depend on the Lunar New Year date for that year.");
      
      setResult(computedSign);
      localStorage.setItem("divine_chinese_zodiac_sign", computedSign.slug);
    } else {
      alert("Please enter either your Birth Date or Birth Year.");
    }
  };

  return (
    <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
          <Search size={20} />
        </div>
        <div>
          <h3 className="text-[17px] font-bold text-stone-900 leading-snug">Find Your Chinese Zodiac Sign</h3>
          <p className="text-[11px] text-stone-400 mt-0.5">Determine your sign and discover your 2026 forecast</p>
        </div>
      </div>

      <form onSubmit={handleFindSign} className="space-y-4">
        {/* Full birth date selection */}
        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Calendar size={12} className="text-stone-400" /> Enter Birth Date
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => {
              setBirthDate(e.target.value);
              if (e.target.value) setBirthYear(""); // clear year fallback
            }}
            className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-850 text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Separator line */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-stone-100" />
          <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-stone-100" />
        </div>

        {/* Birth year fallback input */}
        <div>
          <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <HelpCircle size={12} className="text-stone-400" /> Birth Year Fallback
          </label>
          <input
            type="number"
            placeholder="e.g. 1992"
            value={birthYear}
            onChange={(e) => {
              setBirthYear(e.target.value);
              if (e.target.value) setBirthDate(""); // clear full date
            }}
            className="w-full h-11 px-3.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-850 text-sm focus:outline-none focus:border-amber-400"
            min="1900"
            max="2100"
          />
        </div>

        <button
          type="submit"
          className="w-full h-11 rounded-xl bg-gradient-to-r from-stone-900 to-amber-950 text-white font-bold text-sm shadow-md active:scale-[0.99] transition-transform"
        >
          Find My Sign
        </button>
      </form>

      {/* Results panel */}
      {result && (
        <div className="mt-4 border-t border-amber-100 pt-5 space-y-4">
          <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-amber-50/60 to-rose-50/40 p-4 border border-amber-100/50">
            <ChineseAnimalIllustration sign={result.slug} size="small" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[16px] font-bold text-stone-900">{result.name}</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                  {result.chineseCharacter}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium mt-1 truncate">
                Years: {result.years.slice(0, 5).join(", ")}...
              </p>
              <p className="text-xs text-stone-600 mt-1 line-clamp-2 italic">
                {result.shortDescription}
              </p>
            </div>
          </div>

          {warning && (
            <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-xl text-[11px] text-amber-800 leading-relaxed">
              {warning}
            </div>
          )}

          <Link
            to={`/chinese-horoscope/${result.slug}`}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm transition-colors"
          >
            View 2026 Guidance <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
};

export default ChineseZodiacFinder;
