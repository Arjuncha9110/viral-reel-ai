import React from "react";
import { AlertTriangle } from "lucide-react";

interface BreathingDisclaimerProps {
  isAdvanced?: boolean;
}

const BreathingDisclaimer: React.FC<BreathingDisclaimerProps> = ({ isAdvanced }) => {
  return (
    <div className={`rounded-xl p-4 flex items-start gap-3 mt-6 ${
      isAdvanced 
        ? "bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30"
        : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
    }`}>
      <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${isAdvanced ? "text-rose-500" : "text-amber-500"}`} />
      <p className={`text-xs leading-relaxed ${isAdvanced ? "text-rose-700 dark:text-rose-300" : "text-slate-500 dark:text-slate-400"}`}>
        {isAdvanced ? (
          "Advanced pranayama should be learned carefully and preferably with guidance. Please do not force the breath."
        ) : (
          "Breathing practices on Divine Panchang are for wellness, spiritual reflection, and relaxation. Stop if you feel dizzy, uncomfortable, or short of breath. This does not replace medical advice. If you have breathing, heart, blood pressure, pregnancy-related, or mental health concerns, consult a qualified professional before practicing."
        )}
      </p>
    </div>
  );
};

export default BreathingDisclaimer;
