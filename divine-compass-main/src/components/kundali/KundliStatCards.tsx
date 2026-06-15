import { Sparkles, ShieldAlert, Heart, Briefcase } from "lucide-react";
import type { LiveKundliData } from "@/lib/astrologyApi";

export const KundliStatCards = ({
  kundliData,
  mangalDosha = null,
}: {
  kundliData: LiveKundliData | null;
  mangalDosha?: boolean | null;
}) => {
  const yogasCount = kundliData?.yogaHighlights?.length || 0;
  // Prefer live API dosha if present; otherwise use the locally computed
  // (deterministic) Mangal Dosha from the chart.
  const hasMangalDosha =
    kundliData?.hasMangalDosha !== null && kundliData?.hasMangalDosha !== undefined
      ? kundliData.hasMangalDosha
      : mangalDosha;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Yogas Card */}
      <div className="rounded-2xl border border-[#e4cfa0]/60 bg-gradient-to-br from-[#fffdf8] to-[#fcf7ec] p-5 shadow-[0_4px_16px_rgba(181,148,73,0.06)] relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#d4651a]/10 transition-transform group-hover:scale-150" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#d4651a] to-[#a84810] text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#a84810]/70">Yogas</span>
        </div>
        <div className="relative z-10 mt-4 space-y-1">
          {yogasCount > 0 ? (
            <>
              <h4 className="text-xl font-display font-bold text-[#1c1408]">{yogasCount} Key Yogas</h4>
              <p className="text-xs text-[#5a4025]/70">Identified in your birth chart</p>
            </>
          ) : (
            <>
              <h4 className="text-xl font-display font-bold text-[#1c1408]">Preview</h4>
              <p className="text-xs text-[#5a4025]/70">Available in full report</p>
            </>
          )}
        </div>
      </div>

      {/* Doshas Card */}
      <div className="rounded-2xl border border-[#e4cfa0]/60 bg-gradient-to-br from-[#fffdf8] to-[#fcf7ec] p-5 shadow-[0_4px_16px_rgba(181,148,73,0.06)] relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-red-500/10 transition-transform group-hover:scale-150" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-red-700/70">Doshas</span>
        </div>
        <div className="relative z-10 mt-4 space-y-1">
          {hasMangalDosha !== null && hasMangalDosha !== undefined ? (
            <>
              <h4 className="text-xl font-display font-bold text-[#1c1408]">{hasMangalDosha ? "Mangal Dosha" : "No Dosha"}</h4>
              <p className="text-xs text-[#5a4025]/70">{hasMangalDosha ? "Present in your chart" : "Clear from Mangal Dosha"}</p>
            </>
          ) : (
            <>
              <h4 className="text-xl font-display font-bold text-[#1c1408]">Preview</h4>
              <p className="text-xs text-[#5a4025]/70">Available in full report</p>
            </>
          )}
        </div>
      </div>

      {/* Marriage Card */}
      <div className="rounded-2xl border border-[#e4cfa0]/60 bg-gradient-to-br from-[#fffdf8] to-[#fcf7ec] p-5 shadow-[0_4px_16px_rgba(181,148,73,0.06)] relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-pink-500/10 transition-transform group-hover:scale-150" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-700 text-white">
            <Heart className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-pink-700/70">Marriage</span>
        </div>
        <div className="relative z-10 mt-4 space-y-1">
          <h4 className="text-xl font-display font-bold text-[#1c1408]">Preview</h4>
          <p className="text-xs text-[#5a4025]/70">Available in full report</p>
        </div>
      </div>

      {/* Career Card */}
      <div className="rounded-2xl border border-[#e4cfa0]/60 bg-gradient-to-br from-[#fffdf8] to-[#fcf7ec] p-5 shadow-[0_4px_16px_rgba(181,148,73,0.06)] relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-blue-500/10 transition-transform group-hover:scale-150" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-700/70">Career</span>
        </div>
        <div className="relative z-10 mt-4 space-y-1">
          <h4 className="text-xl font-display font-bold text-[#1c1408]">Preview</h4>
          <p className="text-xs text-[#5a4025]/70">Available in full report</p>
        </div>
      </div>
    </div>
  );
};
