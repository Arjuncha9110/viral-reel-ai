import React from "react";

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="text-center space-y-8 py-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 font-display leading-tight">
          <span className="text-amber-500 mr-2">🙏</span>
          Divine Panchang
        </h1>
        <p className="text-lg text-amber-600 font-medium uppercase tracking-widest font-display">
          Your Personal Spiritual Companion
        </p>
      </div>

      <p className="text-slate-600 text-base leading-relaxed px-4">
        Receive personalized Panchang, Kundli insights, daily guidance, and spiritual recommendations based on your birth details.
      </p>

      <div className="pt-8">
        <button
          onClick={onNext}
          className="w-full sm:w-auto min-w-[200px] py-4 px-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-lg shadow-elevated hover:shadow-glow-saffron hover:-translate-y-1 transition-all duration-300"
        >
          Begin
        </button>
      </div>
    </div>
  );
};

export default WelcomeStep;
