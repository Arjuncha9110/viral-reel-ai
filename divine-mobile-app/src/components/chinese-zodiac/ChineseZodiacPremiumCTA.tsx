import React from "react";
import { CheckCircle2, Flame, Sparkles } from "lucide-react";

export const ChineseZodiacPremiumCTA: React.FC = () => {
  const handleUnlock = () => {
    alert("Launch Offer details:\n\nPayment integration is ready for Razorpay. The complete downloadable PDF report is coming soon!");
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-red-950 to-stone-950 p-6 text-white shadow-xl border border-amber-500/20">
      {/* Decorative patterns */}
      <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full border border-amber-500/5 pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full border border-red-500/5 pointer-events-none" />

      {/* Header Row */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Flame size={12} className="animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Premium Offering</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-stone-400 line-through">₹499</span>
          <span className="text-[13px] font-bold text-amber-400 ml-1.5 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/25">
            Launch Offer ₹199
          </span>
        </div>
      </div>

      {/* Headline */}
      <div className="relative z-10 space-y-2 mb-5">
        <h4 className="text-lg font-display font-bold leading-snug">
          Unlock Your Complete Chinese Horoscope 2026 Report
        </h4>
        <p className="text-xs text-stone-300 leading-relaxed font-body">
          Get a detailed, personalized yearly reflection containing deep analysis of your career, wealth, love, wellness, monthly energy maps, and custom remedies.
        </p>
      </div>

      {/* Benefits List */}
      <div className="relative z-10 grid grid-cols-1 gap-2.5 mb-6">
        {[
          "Personalized zodiac animal report",
          "Fire Horse yearly relationship & career timing",
          "Auspicious days, numbers, and color guides",
          "Monthly energetic flow and opportunity charts",
          "Personalized Divine AI reflection follow-ups",
          "Downloadable elegant PDF forecast",
        ].map((benefit, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs text-[#EAE3DB]">
            <CheckCircle2 size={15} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <span className="font-body">{benefit}</span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        type="button"
        onClick={handleUnlock}
        className="relative z-10 w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-bold text-sm shadow-lg shadow-red-950/50 hover:from-amber-600 hover:to-red-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
      >
        <Sparkles size={16} /> Unlock 2026 Report
      </button>
    </div>
  );
};

export default ChineseZodiacPremiumCTA;
