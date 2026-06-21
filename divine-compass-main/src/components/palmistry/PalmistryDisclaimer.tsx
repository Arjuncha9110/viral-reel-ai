import React from "react";
import { Info } from "lucide-react";

const PalmistryDisclaimer: React.FC = () => {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-start gap-3 mt-8">
      <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        Palmistry on Divine Panchang is offered for spiritual reflection, cultural learning, and self-awareness. It does not replace medical, legal, financial, relationship, or mental health advice. Please use it as guidance, not as a fixed prediction.
      </p>
    </div>
  );
};

export default PalmistryDisclaimer;
