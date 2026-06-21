import React from "react";
import { CheckCircle2, AlertTriangle, Sparkles, BookOpen, Sun, BookMarked, Mic2, Zap } from "lucide-react";

interface PalmistryDetailSectionProps {
  data: {
    indicates: string[];
    positiveSigns: string[];
    cautionSigns: string[];
    spiritualReflection: string;
    doToday: string;
    avoidToday: string;
    journalPrompt: string;
    mantra: string;
  };
  lineColor?: string;
}

const PalmistryDetailSection: React.FC<PalmistryDetailSectionProps> = ({ data, lineColor = "#d97706" }) => {
  return (
    <div className="space-y-5">

      {/* Indicates — chips */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-stone-800 text-[14px]">Traditionally Indicates</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.indicates.map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-amber-50 text-amber-800 border border-amber-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Positive & Caution */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <h3 className="font-bold text-emerald-900 text-[13px] uppercase tracking-wider">Positive Signs</h3>
          </div>
          <div className="space-y-2">
            {data.positiveSigns.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="text-emerald-500 text-sm leading-snug mt-0.5 flex-shrink-0">✓</span>
                <p className="text-[13px] text-emerald-800 leading-snug">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <h3 className="font-bold text-amber-900 text-[13px] uppercase tracking-wider">Caution Signs</h3>
          </div>
          <div className="space-y-2">
            {data.cautionSigns.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <span className="text-amber-500 text-sm leading-snug mt-0.5 flex-shrink-0">△</span>
                <p className="text-[13px] text-amber-800 leading-snug">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spiritual Reflection */}
      <div className="rounded-2xl p-5 text-white shadow-lg relative overflow-hidden" style={{ background: "linear-gradient(135deg, #92400e 0%, #d97706 60%, #f59e0b 100%)" }}>
        <svg className="absolute top-0 right-0 pointer-events-none opacity-10" width="120" height="120" viewBox="0 0 120 120">
          <circle cx="100" cy="20" r="60" fill="white" />
        </svg>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <h3 className="font-bold text-[13px] uppercase tracking-widest text-amber-100">Spiritual Reflection</h3>
          </div>
          <p className="text-[13px] leading-relaxed text-white/90">{data.spiritualReflection}</p>
        </div>
      </div>

      {/* Today's Palm Reflection */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-stone-900 text-[14px]">Today's Palm Reflection</h3>
        </div>

        <div className="px-4 py-4 border-b border-stone-50 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-0.5">Do Today</p>
            <p className="text-[13px] text-stone-700 leading-snug">{data.doToday}</p>
          </div>
        </div>

        <div className="px-4 py-4 border-b border-stone-50 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-0.5">Avoid Today</p>
            <p className="text-[13px] text-stone-700 leading-snug">{data.avoidToday}</p>
          </div>
        </div>

        <div className="px-4 py-4 border-b border-stone-50 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <BookMarked className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-0.5">Journal Prompt</p>
            <p className="text-[13px] italic text-stone-700 leading-snug">"{data.journalPrompt}"</p>
          </div>
        </div>

        <div className="px-4 py-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Mic2 className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-0.5">Sacred Mantra</p>
            <p className="text-[14px] font-bold text-amber-700 leading-snug">{data.mantra}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalmistryDetailSection;
