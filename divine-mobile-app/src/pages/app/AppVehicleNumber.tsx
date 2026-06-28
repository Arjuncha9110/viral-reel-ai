import React, { useState } from "react";
import AppShell from "./AppShell";
import { Car, Sparkles } from "lucide-react";

interface NumeroInfo {
  planet: string;
  symbol: string;
  color: string;
  traits: string;
  vehicle: string;
  lucky: boolean;
}

const NUMERO: Record<number, NumeroInfo> = {
  1: { planet: "Sun",     symbol: "☉", color: "bg-amber-100 text-amber-800",  traits: "Leadership, authority, success, confidence.",       vehicle: "Excellent for personal vehicles and leadership roles.", lucky: true  },
  2: { planet: "Moon",    symbol: "☽", color: "bg-sky-100 text-sky-800",      traits: "Emotions, intuition, adaptability, travel.",         vehicle: "Good for family vehicles and regular commuting.",       lucky: true  },
  3: { planet: "Jupiter", symbol: "♃", color: "bg-yellow-100 text-yellow-800", traits: "Wisdom, expansion, prosperity, protection.",        vehicle: "Most auspicious number — brings blessings and safety.",  lucky: true  },
  4: { planet: "Rahu",    symbol: "☊", color: "bg-indigo-100 text-indigo-800", traits: "Unpredictability, illusion, sudden events.",         vehicle: "Use with caution — prone to unexpected issues.",         lucky: false },
  5: { planet: "Mercury", symbol: "☿", color: "bg-emerald-100 text-emerald-800", traits: "Speed, communication, intellect, adaptability.", vehicle: "Good for business vehicles and long-distance travel.",  lucky: true  },
  6: { planet: "Venus",   symbol: "♀", color: "bg-pink-100 text-pink-800",    traits: "Beauty, luxury, comfort, aesthetics.",               vehicle: "Ideal for premium and luxury vehicles.",                 lucky: true  },
  7: { planet: "Ketu",    symbol: "☋", color: "bg-stone-100 text-stone-700",  traits: "Spirituality, mystery, isolation, transformation.",  vehicle: "Neutral — depends on personal chart.",                  lucky: false },
  8: { planet: "Saturn",  symbol: "♄", color: "bg-slate-100 text-slate-800",  traits: "Karma, discipline, delays, hard work.",              vehicle: "Generally inauspicious. Extra precautions recommended.", lucky: false },
  9: { planet: "Mars",    symbol: "♂", color: "bg-red-100 text-red-800",      traits: "Energy, courage, aggression, accidents.",            vehicle: "High energy — driver must stay calm and focused.",       lucky: false },
};

function extractDigits(reg: string): number[] {
  return reg.replace(/[^0-9]/g, "").split("").map(Number);
}

function sumToSingle(n: number): number {
  while (n > 9) {
    n = String(n).split("").reduce((a, b) => a + parseInt(b), 0);
  }
  return n;
}

const AppVehicleNumber: React.FC = () => {
  const [regInput, setRegInput] = useState("");
  const [result, setResult] = useState<{ digits: number[]; root: number; info: NumeroInfo } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    const digits = extractDigits(regInput);
    if (digits.length === 0) { setError("Please enter a valid vehicle registration number."); return; }
    const sum = digits.reduce((a, b) => a + b, 0);
    const root = sumToSingle(sum);
    setResult({ digits, root, info: NUMERO[root] });
  };

  return (
    <AppShell title="Vehicle Number" eyebrow="Numerology" showBack>
      {/* Input */}
      <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Vehicle Registration Number</label>
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
            <input
              type="text"
              value={regInput}
              onChange={(e) => setRegInput(e.target.value.toUpperCase())}
              placeholder="e.g. MH 01 AB 1234"
              className="w-full h-11 pl-9 pr-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-900 font-mono tracking-wider focus:outline-none focus:border-emerald-400 uppercase"
            />
          </div>
          <p className="text-[11px] text-stone-400">Letters are ignored — only digits are summed.</p>
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        <button
          onClick={handleCalculate}
          disabled={!regInput.trim()}
          className="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Sparkles className="w-4 h-4" /> Calculate Number
        </button>
      </div>

      {result && (
        <>
          {/* Digit breakdown */}
          <div className="bg-white rounded-2xl border border-emerald-100 p-5 space-y-4">
            <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Digit Calculation</p>
            <div className="flex flex-wrap items-center gap-2">
              {result.digits.map((d, i) => (
                <React.Fragment key={i}>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-sm font-bold text-emerald-700">
                    {d}
                  </div>
                  {i < result.digits.length - 1 && <span className="text-stone-300 text-sm">+</span>}
                </React.Fragment>
              ))}
              <span className="text-stone-400 text-sm ml-1">=</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-lg font-bold">
                {result.root}
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              Sum of all digits → reduced to a single digit (1–9) = <strong className="text-stone-700">Numerology Number {result.root}</strong>
            </p>
          </div>

          {/* Planet card */}
          <div className="bg-[#0b1f0e] rounded-2xl border border-emerald-700/30 p-5 text-white space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ${result.info.color}`}>
                {result.info.symbol}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-emerald-400/70">Ruling Planet</p>
                <p className="font-display text-2xl font-bold text-white">{result.info.planet}</p>
                <div className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${result.info.lucky ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                  {result.info.lucky ? "✦ Lucky Number" : "⚠ Caution Advised"}
                </div>
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-white/10">
              <p className="text-xs text-white/50 font-semibold uppercase tracking-wide">Planetary Traits</p>
              <p className="text-sm text-white/80 leading-relaxed">{result.info.traits}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-white/50 font-semibold uppercase tracking-wide">Vehicle Significance</p>
              <p className="text-sm text-white/80 leading-relaxed">{result.info.vehicle}</p>
            </div>
          </div>

          {/* Remedies if unlucky */}
          {!result.info.lucky && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
              <p className="text-xs font-bold text-amber-800">Remedies for {result.info.planet}</p>
              {result.root === 4 && (
                <p className="text-xs text-amber-700 leading-relaxed">Chant "Om Rahave Namah" 108 times weekly. Keep a small Durga image in the vehicle.</p>
              )}
              {result.root === 7 && (
                <p className="text-xs text-amber-700 leading-relaxed">Place a small Ganesha idol on the dashboard. Drive mindfully and avoid night driving alone.</p>
              )}
              {result.root === 8 && (
                <p className="text-xs text-amber-700 leading-relaxed">Chant "Om Shani Shantaya Namah" on Saturdays. Keep black sesame seeds in a small pouch in your vehicle.</p>
              )}
              {result.root === 9 && (
                <p className="text-xs text-amber-700 leading-relaxed">Chant "Om Angarakaya Namah" on Tuesdays. Keep Hanuman Chalisa in the vehicle for protection.</p>
              )}
            </div>
          )}

          {/* Reference */}
          <div className="bg-white rounded-2xl border border-stone-100 p-4 space-y-2">
            <p className="text-xs font-bold text-stone-700">All Numbers Reference</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(NUMERO).map(([num, info]) => (
                <div
                  key={num}
                  className={`rounded-xl p-2.5 text-center ${info.lucky ? "bg-emerald-50 border border-emerald-100" : "bg-stone-50 border border-stone-100"} ${result.root === Number(num) ? "ring-2 ring-emerald-400" : ""}`}
                >
                  <p className="text-lg font-bold text-stone-900">{num}</p>
                  <p className="text-[10px] text-stone-500">{info.planet}</p>
                  <p className="text-[10px] font-bold mt-0.5">{info.lucky ? "✦" : "⚠"}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
};

export default AppVehicleNumber;
