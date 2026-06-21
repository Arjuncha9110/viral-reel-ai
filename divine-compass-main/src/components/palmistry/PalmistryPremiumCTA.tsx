import React, { useState, useEffect } from "react";
import { ChevronRight, FileText, CheckCircle2 } from "lucide-react";

const BENEFITS = [
  { icon: "🖐️", text: "Major line analysis" },
  { icon: "💫", text: "Emotional & career tendencies" },
  { icon: "🕉️", text: "Practical spiritual remedies" },
  { icon: "📅", text: "30-day reflection plan" },
  { icon: "📄", text: "Downloadable PDF report" },
  { icon: "🤖", text: "Ask Divine AI follow-ups" },
];

const PalmistryPremiumCTA: React.FC = () => {
  const [hasReflection, setHasReflection] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("divine_palm_reflection");
      if (saved) setHasReflection(true);
    }
  }, []);

  return (
    <div
      id="palmistry-premium-cta"
      className="relative rounded-3xl overflow-hidden text-white shadow-xl"
      style={{ background: "linear-gradient(145deg, #1c1c2e 0%, #2d1f6e 50%, #1c1c2e 100%)" }}
    >
      {/* Background decorative element */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #f59e0b 0%, transparent 70%)" }}
        />
        <FileText className="absolute bottom-4 right-4 w-24 h-24 opacity-5" />
      </div>

      <div className="relative z-10 p-6">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shadow-md">
            <span className="text-base">🔓</span>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400">Premium Report</span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-white/50 line-through">₹499</span>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                Launch Offer ₹199
              </span>
            </div>
          </div>
        </div>

        <h3 className="font-display text-[22px] font-bold mb-2 leading-tight">
          Unlock Your Complete Palmistry Report
        </h3>
        <p className="text-[12px] text-white/60 leading-relaxed mb-5">
          A personalized palmistry reflection with major lines, minor signs, spiritual remedies, mantras, journaling, and a 30-day self-reflection plan.
        </p>

        {/* Benefits grid */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          {BENEFITS.map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-[11px] text-white/70">{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            if (!hasReflection) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              alert("Payment integration coming soon!");
            }
          }}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-[15px] text-stone-900 shadow-lg active:scale-[0.98] transition-transform"
          style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}
        >
          <span>
            {hasReflection ? "Unlock Full Report — ₹199" : "Generate Free Reflection First"}
          </span>
          <ChevronRight className="w-5 h-5" />
        </button>

        {!hasReflection && (
          <p className="text-center text-[10px] text-white/40 mt-2">
            Complete the quiz above to unlock
          </p>
        )}
      </div>
    </div>
  );
};

export default PalmistryPremiumCTA;
