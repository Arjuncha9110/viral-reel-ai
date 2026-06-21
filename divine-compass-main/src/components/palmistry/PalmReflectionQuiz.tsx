import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, ChevronRight } from "lucide-react";
import { generatePalmistryReflection, PalmistryReflection, PalmistryQuizAnswers } from "../../lib/palmistry/generatePalmistryReflection";

// Step pill option button
const PillOption: React.FC<{
  label: string;
  selected?: boolean;
  onClick: () => void;
  emoji?: string;
}> = ({ label, selected, onClick, emoji }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[13px] font-semibold border transition-all duration-150 active:scale-[0.97] text-left w-full
      ${selected
        ? "bg-amber-500 border-amber-500 text-white shadow-md"
        : "bg-white border-stone-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50"
      }`}
  >
    {emoji && <span className="text-base">{emoji}</span>}
    {label}
  </button>
);

// Step indicator dots
const StepDots: React.FC<{ total: number; current: number }> = ({ total, current }) => (
  <div className="flex items-center gap-1.5 justify-center">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`rounded-full transition-all ${
          i + 1 === current
            ? "w-5 h-2 bg-amber-500"
            : i + 1 < current
            ? "w-2 h-2 bg-amber-300"
            : "w-2 h-2 bg-stone-200"
        }`}
      />
    ))}
  </div>
);

const PalmReflectionQuiz: React.FC = () => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<PalmistryQuizAnswers>({ hand: "", strongestLine: "", focusArea: "" });
  const [reflection, setReflection] = useState<PalmistryReflection | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("divine_palm_reflection");
      if (saved) {
        try {
          setReflection(JSON.parse(saved));
          setStep(4);
        } catch (_) { /* ignore */ }
      }
    }
  }, []);

  const handleSelect = (key: keyof PalmistryQuizAnswers, value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const generateReflection = async () => {
    setIsGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    const result = await generatePalmistryReflection(answers);
    setReflection(result);
    if (typeof window !== "undefined") {
      localStorage.setItem("divine_palm_reflection", JSON.stringify(result));
    }
    setIsGenerating(false);
    setStep(4);
  };

  const resetQuiz = () => {
    setStep(1);
    setAnswers({ hand: "", strongestLine: "", focusArea: "" });
    setReflection(null);
  };

  return (
    <div
      className="rounded-3xl overflow-hidden border border-amber-100 shadow-sm"
      style={{ background: "linear-gradient(160deg, #fffdf7 0%, #fef6e4 100%)" }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-amber-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-display text-[16px] font-bold text-stone-900 leading-tight">
                Palm Reflection Guide
              </h3>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest">3 steps · Instant result</p>
            </div>
          </div>
          {step === 4 && (
            <button
              onClick={resetQuiz}
              className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-stone-700 font-semibold"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          )}
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">

        {/* ── Steps 1-3 ── */}
        {step < 4 && (
          <>
            <StepDots total={3} current={step} />

            {step === 1 && (
              <div className="space-y-3">
                <p className="text-[13px] font-bold text-stone-700">Which hand do you want to reflect on?</p>
                <div className="space-y-2">
                  {[
                    { label: "Left hand", emoji: "🤚" },
                    { label: "Right hand", emoji: "✋" },
                    { label: "Both hands", emoji: "👐" },
                  ].map(opt => (
                    <PillOption
                      key={opt.label}
                      label={opt.label}
                      emoji={opt.emoji}
                      selected={answers.hand === opt.label.toLowerCase()}
                      onClick={() => { handleSelect("hand", opt.label.toLowerCase()); setStep(2); }}
                    />
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <p className="text-[13px] font-bold text-stone-700">Which line looks strongest to you?</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Heart Line", val: "heart-line", emoji: "❤️" },
                    { label: "Life Line", val: "life-line", emoji: "🌿" },
                    { label: "Head Line", val: "head-line", emoji: "💡" },
                    { label: "Fate Line", val: "fate-line", emoji: "⭐" },
                    { label: "Health Line", val: "health-line", emoji: "🌿" },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      onClick={() => { handleSelect("strongestLine", opt.val); setStep(3); }}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all active:scale-[0.97]
                        ${answers.strongestLine === opt.val
                          ? "bg-amber-500 border-amber-500 text-white shadow-md"
                          : "bg-white border-stone-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50"
                        }`}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="text-[11px] font-bold leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <p className="text-[13px] font-bold text-stone-700">What area do you want guidance on?</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Career", emoji: "💼" },
                    { label: "Love", emoji: "💛" },
                    { label: "Health habits", emoji: "🌿" },
                    { label: "Peace", emoji: "🕊️" },
                    { label: "Discipline", emoji: "🎯" },
                    { label: "Family", emoji: "🏠" },
                  ].map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => handleSelect("focusArea", opt.label)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-2xl border text-center transition-all active:scale-[0.97]
                        ${answers.focusArea === opt.label
                          ? "bg-amber-500 border-amber-500 text-white shadow-md"
                          : "bg-white border-stone-200 text-stone-700 hover:border-amber-400 hover:bg-amber-50"
                        }`}
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="text-[10px] font-bold leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  disabled={!answers.focusArea || isGenerating}
                  onClick={generateReflection}
                  className="w-full mt-2 py-3.5 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)", color: "white" }}
                >
                  {isGenerating ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /> Reading the signs...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generate Palm Reflection</>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Result Card ── */}
        {step === 4 && reflection && (
          <div className="space-y-4">
            {/* Summary */}
            <div
              className="rounded-2xl p-4 text-white shadow-md"
              style={{ background: "linear-gradient(135deg, #92400e 0%, #d97706 100%)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-200" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-amber-200">Your Palm Reflection</p>
              </div>
              <p className="text-[13px] leading-relaxed text-white/90">{reflection.summary}</p>
            </div>

            {/* Practical Guidance */}
            <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Practical Guidance</p>
              <p className="text-[13px] text-stone-700 leading-relaxed">{reflection.practicalGuidance}</p>
            </div>

            {/* Journal Prompt */}
            <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1.5">Journal Prompt</p>
              <p className="text-[13px] italic text-indigo-800 leading-relaxed">"{reflection.journalPrompt}"</p>
            </div>

            {/* CTA */}
            <button
              className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border-2 border-stone-900 text-stone-900 font-bold text-[13px] active:scale-[0.98] transition-transform"
              onClick={() => {
                const el = document.getElementById("palmistry-premium-cta");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <span>Unlock Full Palmistry Report</span>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PalmReflectionQuiz;
