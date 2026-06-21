import React, { useState, useEffect } from "react";
import AppShell from "./AppShell";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Hash, Sparkles } from "lucide-react";
import { Switch } from "../../components/ui/switch";
import {
  calculateNameNumberDetails,
  NumberBreakdown
} from "../../lib/calculators/numerology/name";
import { nameInterpretations, NameInterpretation } from "../../lib/data/nameNumerology";

export const AppNameNumerology: React.FC = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState("");
  const [useChaldean, setUseChaldean] = useState(false);
  const [results, setResults] = useState<{
    expression: NumberBreakdown & { meaning: NameInterpretation };
    soul: NumberBreakdown & { meaning: NameInterpretation };
    personality: NumberBreakdown & { meaning: NameInterpretation };
  } | null>(null);

  useEffect(() => {
    if (currentUser) {
      userService.getUserProfile(currentUser.uid).then(profile => {
        if (profile?.profile?.displayName) {
          setName(profile.profile.displayName);
        }
      });
    }
  }, [currentUser]);

  const handleCalculate = () => {
    if (!name.trim()) return;

    const expression = calculateNameNumberDetails(name, 'expression', useChaldean);
    const soul = calculateNameNumberDetails(name, 'soul', useChaldean);
    const personality = calculateNameNumberDetails(name, 'personality', useChaldean);

    const getInterpretation = (num: number) => {
      const n = num % 9 || 9;
      return nameInterpretations[num] || nameInterpretations[n];
    };

    setResults({
      expression: { ...expression, meaning: getInterpretation(expression.reduced) },
      soul: { ...soul, meaning: getInterpretation(soul.reduced) },
      personality: { ...personality, meaning: getInterpretation(personality.reduced) },
    });
  };

  return (
    <AppShell title="Name Numerology" eyebrow="Sacred Vedic Tools" showBack>
      <div className="space-y-6">

        {/* ── Premium Hero ──────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden rounded-3xl p-5"
          style={{ background: "linear-gradient(145deg, #022c22, #064e3b, #022c22)" }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 20px rgba(16,185,129,0.4)" }}>
              <Hash className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-emerald-300/60 font-bold mb-0.5">Chaldean · Pythagorean</p>
              <h2 className="font-display text-lg font-bold text-white leading-tight">Name Vibration</h2>
            </div>
          </div>
          <p className="relative z-10 text-xs text-white/50 mt-3 leading-relaxed">
            Every name carries a vibrational frequency. Discover your Expression, Soul Urge, and Personality numbers.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-stone-900 mb-2">
              Enter Your Full Name
            </label>
            <Input
              type="text"
              placeholder="First Middle Last"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-stone-50 border-stone-200"
              onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
            />
            <p className="text-[10px] text-stone-400 mt-1 mt-1">Includes middle names and initials</p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100">
            <div>
              <p className="text-sm font-semibold text-stone-900">Chaldean System</p>
              <p className="text-[10px] text-stone-500">Use ancient mapping</p>
            </div>
            <Switch checked={useChaldean} onCheckedChange={setUseChaldean} />
          </div>

          <Button
            onClick={handleCalculate}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl py-3"
            disabled={!name.trim()}
          >
            <Sparkles className="w-4 h-4 mr-2" /> Analyze Name
          </Button>
        </div>

        {results && (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-stone-900 text-center">Your Name Vibrations</h3>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center text-xl font-bold font-display">
                  {results.expression.reduced}
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">Destiny (Expression) Number</h4>
                  <p className="text-xs text-stone-500">Sum: {results.expression.sum}</p>
                </div>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                {results.expression.meaning.expression}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center text-xl font-bold font-display">
                  {results.soul.reduced}
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">Soul Urge Number</h4>
                  <p className="text-xs text-stone-500">Sum: {results.soul.sum}</p>
                </div>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                {results.soul.meaning.soul}
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center text-xl font-bold font-display">
                  {results.personality.reduced}
                </div>
                <div>
                  <h4 className="font-bold text-stone-900">Personality Number</h4>
                  <p className="text-xs text-stone-500">Sum: {results.personality.sum}</p>
                </div>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">
                {results.personality.meaning.personality}
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AppNameNumerology;
