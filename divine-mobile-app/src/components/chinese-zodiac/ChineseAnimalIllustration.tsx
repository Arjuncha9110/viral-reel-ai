import React from "react";

type Props = {
  sign: string;
  size?: "small" | "large";
};

// Chinese characters map for fallback/visual layering
const CHARACTER_MAP: Record<string, string> = {
  rat: "鼠",
  ox: "牛",
  tiger: "虎",
  rabbit: "兔",
  dragon: "龙",
  snake: "蛇",
  horse: "马",
  goat: "羊",
  monkey: "猴",
  rooster: "鸡",
  dog: "狗",
  pig: "猪",
};

// Accent colors per sign to create premium personalized card feel
const COLOR_MAP: Record<string, { bg: string; border: string; accent: string; text: string }> = {
  rat: { bg: "from-blue-950 to-slate-900", border: "border-blue-500/30", accent: "#3B82F6", text: "text-blue-200" },
  ox: { bg: "from-stone-900 to-amber-950", border: "border-amber-500/30", accent: "#F59E0B", text: "text-amber-200" },
  tiger: { bg: "from-orange-950 to-stone-950", border: "border-orange-500/30", accent: "#F97316", text: "text-orange-200" },
  rabbit: { bg: "from-rose-950 to-slate-900", border: "border-rose-500/30", accent: "#EC4899", text: "text-rose-200" },
  dragon: { bg: "from-amber-950 to-stone-900", border: "border-amber-500/40", accent: "#D97706", text: "text-amber-100" },
  snake: { bg: "from-emerald-950 to-stone-950", border: "border-emerald-500/30", accent: "#10B981", text: "text-emerald-200" },
  horse: { bg: "from-red-950 to-stone-950", border: "border-red-500/40", accent: "#EF4444", text: "text-red-200" },
  goat: { bg: "from-violet-950 to-stone-900", border: "border-violet-500/30", accent: "#8B5CF6", text: "text-violet-200" },
  monkey: { bg: "from-indigo-950 to-slate-900", border: "border-indigo-500/40", accent: "#6366F1", text: "text-indigo-200" },
  rooster: { bg: "from-amber-950 to-stone-900", border: "border-amber-500/30", accent: "#F59E0B", text: "text-amber-200" },
  dog: { bg: "from-yellow-950 to-stone-950", border: "border-yellow-500/30", accent: "#EAB308", text: "text-yellow-200" },
  pig: { bg: "from-fuchsia-950 to-slate-900", border: "border-fuchsia-500/30", accent: "#D946EF", text: "text-fuchsia-200" },
};

// Specialized SVG path silhouettes for the 12 Chinese zodiac signs
const PATH_MAP: Record<string, React.ReactNode> = {
  rat: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      {/* Sleek rodent face and long thin tail */}
      <path d="M 35 48 C 30 45, 20 50, 22 62 C 24 70, 32 72, 45 72" />
      <path d="M 45 72 C 55 72, 68 65, 70 50 C 72 35, 60 28, 50 35 C 45 38, 38 42, 35 48 Z" />
      <circle cx="56" cy="42" r="3" fill="currentColor" />
      {/* Whiskers */}
      <path d="M 33 49 L 23 47" />
      <path d="M 34 52 L 21 53" />
      <path d="M 35 55 L 24 59" />
      {/* Ear */}
      <circle cx="58" cy="30" r="8" />
    </g>
  ),
  ox: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      {/* Powerful ox head profile with large horns */}
      <path d="M 30 35 C 32 20, 48 15, 48 30 C 48 35, 52 42, 60 42 C 68 42, 70 30, 70 30" />
      {/* Horns */}
      <path d="M 32 24 C 20 20, 18 35, 28 36" />
      <path d="M 68 24 C 80 20, 82 35, 72 36" />
      {/* Nose ring */}
      <circle cx="50" cy="74" r="7" />
      <path d="M 38 45 L 62 45 C 65 55, 65 65, 50 72 C 35 65, 35 55, 38 45 Z" />
    </g>
  ),
  tiger: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      {/* Tiger head outline with forehead stripe (character Wang 王) */}
      <circle cx="50" cy="50" r="24" />
      {/* Ears */}
      <path d="M 32 32 C 28 22, 40 22, 38 28" />
      <path d="M 68 32 C 72 22, 60 22, 62 28" />
      {/* Wang Character Forehead Stripes */}
      <path d="M 44 36 L 56 36" />
      <path d="M 46 41 L 54 41" />
      <path d="M 50 36 L 50 46" />
      <path d="M 42 46 L 58 46" />
      {/* Tiger Eyes */}
      <circle cx="42" cy="54" r="2" fill="currentColor" />
      <circle cx="58" cy="54" r="2" fill="currentColor" />
      {/* Snout */}
      <path d="M 46 64 C 48 60, 52 60, 54 64" />
    </g>
  ),
  rabbit: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      {/* Long rabbit ears and soft rounded profile */}
      <path d="M 38 48 C 34 52, 34 68, 44 72 C 54 75, 66 70, 68 58 C 70 48, 62 42, 52 46 C 48 48, 42 45, 38 48 Z" />
      {/* Tall Ears */}
      <path d="M 44 45 C 40 20, 48 18, 50 36" />
      <path d="M 52 45 C 50 18, 58 16, 56 38" />
      {/* Eye and fluffy tail */}
      <circle cx="43" cy="54" r="2.5" fill="currentColor" />
      <circle cx="70" cy="62" r="4" />
    </g>
  ),
  dragon: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      {/* Majestic dragon head profile with horns and whiskers */}
      <path d="M 28 55 C 24 55, 20 60, 24 68 C 28 74, 40 76, 50 72 C 65 66, 75 52, 70 38 C 65 24, 52 28, 45 35" />
      <path d="M 45 35 C 38 40, 32 48, 28 55" />
      {/* Antler/Horn */}
      <path d="M 64 32 C 68 18, 58 14, 55 24" />
      {/* Whisker curl */}
      <path d="M 22 66 C 14 74, 16 80, 22 80" />
      {/* Fiery eye */}
      <circle cx="56" cy="44" r="3.5" fill="currentColor" />
    </g>
  ),
  snake: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      {/* S-curve serpentine coil with diamond markings */}
      <path d="M 50 24 C 62 24, 68 34, 60 42 C 52 50, 30 46, 32 60 C 34 74, 62 76, 68 64" />
      {/* Snake Head details */}
      <path d="M 50 24 C 44 24, 40 28, 44 32 C 48 36, 54 32, 50 24 Z" strokeWidth="2" />
      <circle cx="48" cy="28" r="1.5" fill="currentColor" />
    </g>
  ),
  horse: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      {/* Horse profile: neck, proud snout, and flowing mane */}
      <path d="M 28 66 C 30 50, 34 42, 42 42 C 50 42, 56 46, 64 38 L 68 50 L 52 54 C 48 58, 44 72, 44 78" />
      {/* Snout */}
      <path d="M 64 38 C 68 38, 74 44, 70 48 C 66 52, 60 50, 56 50" />
      {/* Flowing Mane */}
      <path d="M 32 48 C 22 42, 24 30, 34 38" />
      <path d="M 36 38 C 26 30, 28 20, 38 28" />
      <circle cx="58" cy="45" r="2.5" fill="currentColor" />
    </g>
  ),
  goat: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      {/* Gentle goat head with spiral curved horns */}
      <path d="M 38 52 L 62 52 C 64 62, 58 74, 50 78 C 42 74, 36 62, 38 52 Z" />
      {/* Spiral Horns */}
      <path d="M 40 50 C 35 34, 25 36, 32 46" />
      <path d="M 60 50 C 65 34, 75 36, 68 46" />
      {/* Ears */}
      <path d="M 36 54 C 24 55, 26 65, 34 60" />
      <path d="M 64 54 C 76 55, 74 65, 66 60" />
      {/* Beard */}
      <path d="M 48 78 L 50 86 L 52 78" />
    </g>
  ),
  monkey: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      {/* Playful monkey head with round ears and peach outline */}
      <circle cx="50" cy="52" r="20" />
      {/* Large ears */}
      <circle cx="27" cy="48" r="8" />
      <circle cx="73" cy="48" r="8" />
      {/* Heart-shaped peach face boundary */}
      <path d="M 50 42 C 44 34, 36 38, 38 50 C 40 62, 48 68, 50 68 C 52 68, 60 62, 62 50 C 64 38, 56 34, 50 42 Z" strokeWidth="1.5" />
      {/* Eyes */}
      <circle cx="44" cy="48" r="2.5" fill="currentColor" />
      <circle cx="56" cy="48" r="2.5" fill="currentColor" />
      {/* Smile */}
      <path d="M 45 58 C 47 62, 53 62, 55 58" />
    </g>
  ),
  rooster: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      {/* Proud rooster profile with comb and wattle */}
      <path d="M 32 74 C 36 60, 42 46, 50 46 C 58 46, 68 50, 72 40" />
      {/* Beak */}
      <path d="M 72 40 L 78 45 L 70 48" fill="currentColor" />
      {/* Comb (top) */}
      <path d="M 46 42 C 44 26, 60 22, 58 38 C 58 28, 68 28, 66 44" fill="currentColor" />
      {/* Wattle (throat) */}
      <path d="M 68 50 C 70 58, 62 60, 62 52" fill="currentColor" />
      <circle cx="56" cy="42" r="2" fill="currentColor" />
    </g>
  ),
  dog: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      {/* Faithful dog profile with floppy ear */}
      <path d="M 32 74 C 34 60, 38 48, 46 48 C 52 48, 62 46, 68 52 C 72 56, 70 65, 64 68 C 58 70, 52 74, 52 80" />
      {/* Floppy Ear */}
      <path d="M 42 46 C 36 44, 30 52, 34 62 C 38 72, 46 70, 44 56" fill="currentColor" />
      <circle cx="60" cy="56" r="2.5" fill="currentColor" />
      {/* Nose */}
      <circle cx="68" cy="54" r="3" fill="currentColor" />
    </g>
  ),
  pig: (
    <g stroke="currentColor" strokeWidth="2.5" fill="none">
      {/* Cute pig head with circular snout and pointed ears */}
      <circle cx="50" cy="54" r="22" />
      {/* Snout */}
      <rect x="42" y="52" width="16" height="12" rx="6" />
      <circle cx="47" cy="58" r="1.5" fill="currentColor" />
      <circle cx="53" cy="58" r="1.5" fill="currentColor" />
      {/* Ears */}
      <path d="M 32 38 C 26 28, 38 28, 38 34" />
      <path d="M 68 38 C 74 28, 62 28, 62 34" />
      {/* Eyes */}
      <circle cx="42" cy="44" r="2" fill="currentColor" />
      <circle cx="58" cy="44" r="2" fill="currentColor" />
    </g>
  ),
};

export const ChineseAnimalIllustration: React.FC<Props> = ({ sign, size = "small" }) => {
  const normalizedSign = sign.toLowerCase();
  const character = CHARACTER_MAP[normalizedSign] || "☯";
  const colors = COLOR_MAP[normalizedSign] || {
    bg: "from-amber-950 to-stone-900",
    border: "border-amber-500/30",
    accent: "#D97706",
    text: "text-amber-200",
  };
  const path = PATH_MAP[normalizedSign] || null;

  const sizeClasses =
    size === "large"
      ? "w-36 h-36 border-4 shadow-xl"
      : "w-16 h-16 border-2 shadow-md";

  return (
    <div
      className={`relative rounded-full bg-gradient-to-br ${colors.bg} ${colors.border} flex items-center justify-center overflow-hidden flex-shrink-0 select-none ${sizeClasses}`}
    >
      {/* Subtle background Chinese circle patterns */}
      <div className="absolute inset-1 rounded-full border border-dashed border-white/10 pointer-events-none" />
      
      {/* Background Chinese Character watermark */}
      <span
        className={`absolute font-display font-bold select-none text-white/5 pointer-events-none transition-transform duration-700 ${
          size === "large" ? "text-[88px] -bottom-2 -right-2" : "text-[42px] -bottom-1 -right-1"
        }`}
      >
        {character}
      </span>

      {/* Main vector symbol */}
      {path ? (
        <svg
          viewBox="0 0 100 100"
          className="w-[75%] h-[75%] text-white/95"
          style={{ filter: `drop-shadow(0 2px 8px ${colors.accent}60)` }}
        >
          {path}
        </svg>
      ) : (
        <span className="text-white text-3xl font-display">{character}</span>
      )}
    </div>
  );
};

export default ChineseAnimalIllustration;
