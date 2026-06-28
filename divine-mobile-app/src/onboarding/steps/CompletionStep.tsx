import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "✨ Creating your Cosmic Profile...",
  "🪐 Mapping planetary positions...",
  "🌙 Finding your Moon Sign...",
  "⭐ Calculating Nakshatra...",
  "☀️ Determining Ascendant...",
  "📿 Preparing Divine Dashboard...",
];

interface CompletionStepProps {
  onComplete: () => void;
}

export const CompletionStep: React.FC<CompletionStepProps> = ({ onComplete }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Total wait time = 6 messages * 2s = 12s, plus a bit extra at the end
    // But maybe 1.5s per message is better
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        if (prev < messages.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1500);

    // After all messages finish (6 * 1500 = 9000ms), call onComplete
    const timeout = setTimeout(() => {
      onComplete();
    }, messages.length * 1500 + 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] text-center space-y-8 py-8">
      <div className="relative w-24 h-24">
        {/* Decorative spinning ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-t-amber-500 border-r-orange-400 border-b-transparent border-l-transparent"
        />
        {/* Inner static icon */}
        <div className="absolute inset-0 flex items-center justify-center text-4xl">
          🕉️
        </div>
      </div>

      <div className="h-12 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-medium text-slate-700 font-display"
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompletionStep;
