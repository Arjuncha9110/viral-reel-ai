import React from "react";
import { Lock, FileText, ChevronRight } from "lucide-react";

const BreathingPremiumCTA: React.FC = () => {
  return (
    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden my-6">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <FileText className="w-32 h-32" />
      </div>
      
      <div className="relative z-10">
        <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <Lock className="w-5 h-5 text-slate-900" />
        </div>
        
        <h3 className="text-xl font-display font-bold mb-2">Unlock Guided Breathwork Journey</h3>
        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Build a daily pranayama habit with advanced guided routines, streak tracking, voice guidance, and personalized spiritual reflection.
        </p>

        <ul className="space-y-2 mb-6">
          {["Advanced breathing routines", "Voice-guided sessions", "30-day pranayama plan", "Progress insights & reflections"].map((item, idx) => (
            <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              {item}
            </li>
          ))}
        </ul>

        <button 
          onClick={() => {
            alert("Payment integration coming soon!");
          }}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl font-bold flex items-center justify-between px-4 transition-all"
        >
          Unlock 30-Day Plan for ₹199
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default BreathingPremiumCTA;
