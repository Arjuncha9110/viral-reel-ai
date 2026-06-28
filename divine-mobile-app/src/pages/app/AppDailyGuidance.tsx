import React, { useState, useEffect } from "react";
import AppShell from "./AppShell";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { format } from "date-fns";
import { Sun, Sparkles, Star, Target, Compass, BookOpen } from "lucide-react";
import { cn } from "../../lib/utils";

// Deterministic fallback data based on day of week and date
const DAILY_INSIGHTS = [
  "Embrace patience today. The seeds you planted are growing beneath the surface, unseen but vital.",
  "Focus on clarity of communication. Mercury's energy supports resolving old misunderstandings.",
  "A good day for physical grounding. Walk barefoot on grass or spend time in nature to balance your root chakra.",
  "Your intuitive feelings are heightened. Trust your first instinct when making decisions today.",
  "Discipline will bring rewards. Tackle the hardest task first thing in the morning.",
  "A day of spiritual nourishment. Read a sacred text or practice 15 minutes of silent meditation.",
  "Let go of a grudge. Forgiveness today will lighten your karmic load significantly."
];

const MANTRAS = [
  "Om Namo Narayanaya",
  "Om Namah Shivaya",
  "Om Sri Maha Lakshmyai Namah",
  "Om Dum Durgayei Namaha",
  "Om Gam Ganapataye Namaha",
  "Om Hanumate Namah",
  "Om Shanti Shanti Shanti"
];

const COLORS = ["Saffron", "Deep Blue", "Emerald Green", "Ruby Red", "Golden Yellow", "Pure White", "Lotus Pink"];
const NUMBERS = [1, 3, 5, 7, 9, 11, 21];

export const AppDailyGuidance: React.FC = () => {
  const { currentUser } = useAuth();
  const [profileName, setProfileName] = useState<string>("");
  const [rashi, setRashi] = useState<string>("");
  const [nakshatra, setNakshatra] = useState<string>("");

  useEffect(() => {
    if (currentUser) {
      userService.getUserProfile(currentUser.uid).then(profile => {
        if (profile) setProfileName(profile.displayName || "");
      });
      userService.getKundaliBasic(currentUser.uid).then(kundali => {
        if (kundali) {
          if (kundali.rashi) setRashi(kundali.rashi);
          if (kundali.nakshatra) setNakshatra(kundali.nakshatra);
        }
      });
    }
  }, [currentUser]);

  // Deterministic daily values
  const today = new Date();
  const dayIndex = today.getDay(); // 0-6
  const dateNum = today.getDate(); // 1-31
  const seed = dayIndex + dateNum;

  const insight = DAILY_INSIGHTS[seed % DAILY_INSIGHTS.length];
  const mantra = MANTRAS[dayIndex];
  const color = COLORS[seed % COLORS.length];
  const number = NUMBERS[seed % NUMBERS.length];

  return (
    <AppShell title="Daily Guidance" eyebrow="Sacred Vedic Tools" showBack>
      <div className="space-y-5">
        
        <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/4"></div>
          
          <p className="text-xs font-bold uppercase tracking-widest text-amber-200 mb-2 flex items-center gap-1.5">
            <Sun className="h-3.5 w-3.5" /> {format(today, "EEEE, MMMM d")}
          </p>
          <h2 className="font-display text-2xl font-bold mb-4">
            Namaste{profileName ? `, ${profileName.split(' ')[0]}` : ''}.
          </h2>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-200 mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Spiritual Insight
            </h3>
            <p className="text-sm font-medium leading-relaxed">"{insight}"</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center mb-2">
              <Star className="h-5 w-5 text-rose-500" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Lucky Color</p>
            <p className="font-bold text-stone-800">{color}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center mb-2">
              <Target className="h-5 w-5 text-indigo-500" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Lucky Number</p>
            <p className="font-bold text-stone-800">{number}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <h3 className="flex items-center gap-2 text-sm font-bold text-stone-800 mb-3 pb-3 border-b border-stone-100">
            <Compass className="h-4 w-4 text-emerald-500" /> Suggested Practice
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Mantra of the Day</p>
          <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-center mb-4">
            <p className="font-display text-lg font-bold text-stone-800">{mantra}</p>
          </div>
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-stone-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-stone-600 leading-relaxed">
              Chant this mantra 108 times using a Japa mala, or simply recite it silently for 5 minutes during your morning routine to align with today's cosmic energy.
            </p>
          </div>
        </div>

        {/* TODO: Add real personalized logic from panchang/kundali when ready */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 border-dashed text-center">
           <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-1">Personalized Details</p>
           {rashi || nakshatra ? (
             <p className="text-xs text-stone-600 font-medium">
               Your Rashi is <span className="font-bold text-stone-800">{rashi || "Unknown"}</span> and Nakshatra is <span className="font-bold text-stone-800">{nakshatra || "Unknown"}</span>.
               <br/><span className="text-stone-400 mt-1 block">Full daily transit predictions coming soon.</span>
             </p>
           ) : (
             <p className="text-xs text-stone-600 font-medium">
               Complete your birth profile to unlock deep personalized daily transit predictions based on your Rashi and Nakshatra.
             </p>
           )}
        </div>

      </div>
    </AppShell>
  );
};

export default AppDailyGuidance;
