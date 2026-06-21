import React, { useState } from "react";

interface NameStepProps {
  initialData: { displayName: string; gender?: string };
  onNext: (data: { displayName: string; gender?: string }) => void;
  onBack: () => void;
}

export const NameStep: React.FC<NameStepProps> = ({ initialData, onNext, onBack }) => {
  const [displayName, setDisplayName] = useState(initialData.displayName || "");
  const [gender, setGender] = useState(initialData.gender || "");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!displayName.trim()) {
      setError("Display Name is required.");
      return;
    }
    setError("");
    onNext({ displayName: displayName.trim(), gender: gender || undefined });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-900 font-display">Who are you?</h2>
        <p className="text-sm text-slate-600">Let's start with the basics.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg text-center">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1">
            Display Name *
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-shadow"
            placeholder="Your Name"
            required
          />
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-slate-700 mb-1">
            Gender (Optional)
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-shadow"
          >
            <option value="">Prefer not to say</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          className="w-1/3 py-3 border border-slate-300 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!displayName.trim()}
          className="w-2/3 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold shadow-soft hover:shadow-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default NameStep;
