import React from "react";
import { Info } from "lucide-react";

export const ChineseZodiacDisclaimer: React.FC = () => {
  return (
    <div className="rounded-2xl bg-stone-100/70 border border-stone-200/40 p-4 flex gap-3 text-stone-500">
      <Info size={16} className="mt-0.5 flex-shrink-0 text-stone-400" />
      <p className="text-[11px] leading-relaxed font-body">
        <strong>Disclaimer:</strong> Chinese Horoscope on Divine Panchang is offered for cultural learning, spiritual reflection, and self-awareness. It does not replace medical, legal, financial, relationship, or mental health advice. Please use it as guidance, not as a fixed prediction.
      </p>
    </div>
  );
};

export default ChineseZodiacDisclaimer;
