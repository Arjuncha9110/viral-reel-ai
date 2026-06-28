/**
 * ToolIllustrations.tsx
 * Original SVG illustration components for Service Cards.
 * All artwork is original — no third-party assets.
 */
import React from "react";

// ─── Scroll / Bhrigu ──────────────────────────────────────────────────────────
export const ScrollIllustration: React.FC = () => (
  <svg width="110" height="115" viewBox="0 0 110 115" fill="none">
    {/* Main scroll body */}
    <rect x="22" y="24" width="66" height="72" rx="6" fill="#F5E6C8" stroke="#D4A843" strokeWidth="1.2" />
    {/* Scroll top roller */}
    <rect x="18" y="18" width="74" height="12" rx="6" fill="#D4A843" opacity="0.75" />
    {/* Scroll bottom roller */}
    <rect x="18" y="84" width="74" height="12" rx="6" fill="#D4A843" opacity="0.75" />
    {/* Text lines on scroll */}
    <rect x="32" y="38" width="46" height="3" rx="1.5" fill="#A0845C" opacity="0.5" />
    <rect x="32" y="46" width="38" height="3" rx="1.5" fill="#A0845C" opacity="0.4" />
    <rect x="32" y="54" width="42" height="3" rx="1.5" fill="#A0845C" opacity="0.4" />
    <rect x="32" y="62" width="30" height="3" rx="1.5" fill="#A0845C" opacity="0.35" />
    {/* Om symbol area */}
    <circle cx="55" cy="78" r="8" fill="#D4A843" opacity="0.2" />
    <text x="55" y="82" textAnchor="middle" fontSize="11" fill="#A0845C" opacity="0.7" fontFamily="serif">ॐ</text>
    {/* Star sparkle */}
    <circle cx="84" cy="22" r="3" fill="#F59E0B" opacity="0.6" />
    <circle cx="26" cy="108" r="2" fill="#F59E0B" opacity="0.4" />
  </svg>
);

// ─── Palm Scan ────────────────────────────────────────────────────────────────
export const PalmScanIllustration: React.FC = () => (
  <svg width="108" height="115" viewBox="0 0 108 115" fill="none">
    {/* Glow base */}
    <ellipse cx="54" cy="95" rx="30" ry="8" fill="#34D399" opacity="0.15" />
    {/* Palm shape */}
    <path
      d="M30 92L30 52Q30 44 38 44Q46 44 46 52L46 36Q46 28 54 28Q62 28 62 36L62 40Q62 32 70 32Q78 32 78 40L78 52Q78 44 86 46Q92 48 90 58L86 78Q82 92 68 96L46 96Z"
      fill="#6EE7B7"
      opacity="0.75"
    />
    {/* Scan line */}
    <rect x="26" y="68" width="58" height="2.5" rx="1.25" fill="#059669" opacity="0.6" />
    {/* Scan glow */}
    <rect x="26" y="65" width="58" height="8" rx="4" fill="#34D399" opacity="0.15" />
    {/* Finger highlights */}
    <path d="M38 48Q38 44 42 44" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    <path d="M54 32Q54 28 58 28" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    {/* Palm lines */}
    <path d="M34 84Q42 76 50 78Q58 80 64 72" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.45" />
    <path d="M36 72Q46 66 56 68" stroke="white" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.35" />
    {/* Corner dots */}
    <circle cx="92" cy="28" r="3" fill="#10B981" opacity="0.5" />
    <circle cx="22" cy="104" r="2" fill="#6EE7B7" opacity="0.4" />
  </svg>
);

// ─── Chinese Zodiac / Yin-Yang ────────────────────────────────────────────────
export const ChineseZodiacIllustration: React.FC = () => (
  <svg width="108" height="112" viewBox="0 0 108 112" fill="none">
    {/* Outer ring */}
    <circle cx="54" cy="58" r="38" stroke="#93C5FD" strokeWidth="1.5" fill="#DBEAFE" opacity="0.4" />
    {/* 12 animal position dots */}
    {Array.from({ length: 12 }).map((_, i) => {
      const rad = (i * 30 - 90) * Math.PI / 180;
      return (
        <circle
          key={i}
          cx={54 + 34 * Math.cos(rad)}
          cy={58 + 34 * Math.sin(rad)}
          r="3"
          fill="#3B82F6"
          opacity={0.35 + (i % 3) * 0.1}
        />
      );
    })}
    {/* Yin-yang */}
    <circle cx="54" cy="58" r="18" fill="#1E3A5F" opacity="0.7" />
    <path d="M54 40 A18 18 0 0 1 54 76 A9 9 0 0 1 54 58 A9 9 0 0 0 54 40Z" fill="white" opacity="0.85" />
    <circle cx="54" cy="49" r="4" fill="#1E3A5F" opacity="0.7" />
    <circle cx="54" cy="67" r="4" fill="white" opacity="0.85" />
    {/* Dragon scales decorative */}
    <path d="M20 30 Q26 24 32 30" stroke="#60A5FA" strokeWidth="1.2" fill="none" opacity="0.5" />
    <path d="M76 86 Q82 80 88 86" stroke="#60A5FA" strokeWidth="1.2" fill="none" opacity="0.4" />
    <circle cx="90" cy="24" r="4" fill="#FBBF24" opacity="0.55" />
  </svg>
);

// ─── Divine AI Guru ───────────────────────────────────────────────────────────
export const DivineAIIllustration: React.FC = () => (
  <svg width="108" height="112" viewBox="0 0 108 112" fill="none">
    {/* Body */}
    <rect x="28" y="42" width="52" height="48" rx="14" fill="#F59E0B" opacity="0.85" />
    {/* Head */}
    <circle cx="54" cy="38" r="20" fill="#F59E0B" opacity="0.9" />
    {/* Eyes */}
    <circle cx="46" cy="35" r="5" fill="white" />
    <circle cx="62" cy="35" r="5" fill="white" />
    <circle cx="47" cy="36" r="2.5" fill="#1C0F02" />
    <circle cx="63" cy="36" r="2.5" fill="#1C0F02" />
    <circle cx="48" cy="35" r="1" fill="white" />
    <circle cx="64" cy="35" r="1" fill="white" />
    {/* Antenna */}
    <line x1="54" y1="18" x2="54" y2="10" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="54" cy="8" r="4" fill="#FBBF24" />
    {/* Smile */}
    <path d="M44 44 Q54 50 64 44" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
    {/* Sparkles around */}
    <circle cx="22" cy="30" r="3" fill="#FBBF24" opacity="0.6" />
    <circle cx="88" cy="48" r="2.5" fill="#FCD34D" opacity="0.5" />
    <circle cx="82" cy="28" r="2" fill="#FEF3C7" opacity="0.6" />
    {/* Stars */}
    <path d="M92 20 L93.5 25 L98 26 L93.5 27 L92 32 L90.5 27 L86 26 L90.5 25Z" fill="#FBBF24" opacity="0.5" />
  </svg>
);

// ─── Kundali Chart ────────────────────────────────────────────────────────────
export const KundliIllustration: React.FC = () => (
  <svg width="112" height="112" viewBox="0 0 112 112" fill="none">
    {/* Outer square */}
    <rect x="16" y="16" width="80" height="80" rx="4" fill="#FED7AA" opacity="0.35" stroke="#F97316" strokeWidth="1" />
    {/* Inner diamond */}
    <path d="M56 22 L90 56 L56 90 L22 56Z" fill="none" stroke="#F97316" strokeWidth="1" opacity="0.4" />
    {/* Cross dividers */}
    <line x1="16" y1="16" x2="56" y2="56" stroke="#F97316" strokeWidth="0.8" opacity="0.3" />
    <line x1="96" y1="16" x2="56" y2="56" stroke="#F97316" strokeWidth="0.8" opacity="0.3" />
    <line x1="16" y1="96" x2="56" y2="56" stroke="#F97316" strokeWidth="0.8" opacity="0.3" />
    <line x1="96" y1="96" x2="56" y2="56" stroke="#F97316" strokeWidth="0.8" opacity="0.3" />
    {/* Center circle */}
    <circle cx="56" cy="56" r="12" fill="#F97316" opacity="0.2" stroke="#F97316" strokeWidth="1" />
    <circle cx="56" cy="56" r="5" fill="#EA580C" opacity="0.6" />
    {/* Planet symbols */}
    <text x="24" y="38" fontSize="10" fill="#C2410C" opacity="0.65" fontFamily="serif">☉</text>
    <text x="76" y="38" fontSize="10" fill="#C2410C" opacity="0.6" fontFamily="serif">☽</text>
    <text x="76" y="80" fontSize="10" fill="#C2410C" opacity="0.6" fontFamily="serif">♄</text>
    <text x="24" y="80" fontSize="10" fill="#C2410C" opacity="0.55" fontFamily="serif">♃</text>
    <circle cx="94" cy="16" r="4" fill="#FB923C" opacity="0.5" />
  </svg>
);

// ─── Match Making / Compatibility ─────────────────────────────────────────────
export const MatchMakingIllustration: React.FC = () => (
  <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
    {/* Left heart */}
    <path
      d="M38 50C38 38 20 36 20 50C20 62 38 74 38 74C38 74 56 62 56 50C56 36 38 38 38 50Z"
      fill="#FB7185"
      opacity="0.8"
    />
    {/* Right heart */}
    <path
      d="M70 50C70 38 52 36 52 50C52 62 70 74 70 74C70 74 88 62 88 50C88 36 70 38 70 50Z"
      fill="#FB7185"
      opacity="0.45"
    />
    {/* Highlight on left heart */}
    <circle cx="28" cy="43" r="5" fill="white" opacity="0.3" />
    {/* Stars */}
    <circle cx="92" cy="30" r="3" fill="#FCA5A5" opacity="0.6" />
    <circle cx="18" cy="26" r="2.5" fill="#FECDD3" opacity="0.5" />
    <path d="M96 86 L97.5 91 L102 92 L97.5 93 L96 98 L94.5 93 L90 92 L94.5 91Z" fill="#FB7185" opacity="0.4" />
  </svg>
);

// ─── Transit Chart / Planetary Orbits ─────────────────────────────────────────
export const TransitIllustration: React.FC = () => (
  <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
    {/* Sun center */}
    <circle cx="54" cy="54" r="10" fill="#FBBF24" opacity="0.85" />
    {/* Sun rays */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
      const r = a * Math.PI / 180;
      return (
        <line
          key={a}
          x1={54 + 12 * Math.cos(r)}
          y1={54 + 12 * Math.sin(r)}
          x2={54 + 18 * Math.cos(r)}
          y2={54 + 18 * Math.sin(r)}
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.65"
        />
      );
    })}
    {/* Orbit rings */}
    <circle cx="54" cy="54" r="26" stroke="#93C5FD" strokeWidth="1" fill="none" opacity="0.4" />
    <circle cx="54" cy="54" r="40" stroke="#C4B5FD" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="4 4" />
    {/* Inner planet */}
    <circle cx="54" cy="28" r="5" fill="#60A5FA" opacity="0.8" />
    {/* Outer planet */}
    <circle cx="90" cy="60" r="6" fill="#A78BFA" opacity="0.7" />
    {/* Outer planet ring */}
    <ellipse cx="90" cy="60" rx="11" ry="3.5" stroke="#A78BFA" strokeWidth="1.2" fill="none" opacity="0.5" transform="rotate(-15 90 60)" />
    <circle cx="18" cy="84" r="3" fill="#93C5FD" opacity="0.5" />
  </svg>
);

// ─── Crown / Rajyoga ──────────────────────────────────────────────────────────
export const CrownIllustration: React.FC = () => (
  <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
    {/* Crown base */}
    <path
      d="M18 80 L18 52 L36 68 L54 36 L72 68 L90 52 L90 80Z"
      fill="#FBBF24"
      opacity="0.8"
    />
    {/* Crown base bar */}
    <rect x="18" y="78" width="72" height="10" rx="5" fill="#D97706" opacity="0.75" />
    {/* Gems on crown tips */}
    <circle cx="18" cy="52" r="6" fill="#F472B6" opacity="0.8" />
    <circle cx="54" cy="36" r="7" fill="#60A5FA" opacity="0.85" />
    <circle cx="90" cy="52" r="6" fill="#34D399" opacity="0.8" />
    <circle cx="36" cy="68" r="4" fill="#FCD34D" opacity="0.7" />
    <circle cx="72" cy="68" r="4" fill="#FCD34D" opacity="0.7" />
    {/* Highlight */}
    <path d="M30 60 Q42 52 54 60" stroke="white" strokeWidth="1.5" fill="none" opacity="0.35" />
    <circle cx="88" cy="24" r="3" fill="#FBBF24" opacity="0.55" />
  </svg>
);

// ─── Dasha Timeline ───────────────────────────────────────────────────────────
export const DashaIllustration: React.FC = () => (
  <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
    {/* Clock face */}
    <circle cx="54" cy="54" r="36" fill="#FEF9C3" opacity="0.4" stroke="#FBBF24" strokeWidth="1.5" />
    <circle cx="54" cy="54" r="28" fill="none" stroke="#FDE68A" strokeWidth="1" opacity="0.5" />
    {/* Hour marks */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
      const rad = (a - 90) * Math.PI / 180;
      const isMain = a % 90 === 0;
      return (
        <line
          key={a}
          x1={54 + (isMain ? 22 : 24) * Math.cos(rad)}
          y1={54 + (isMain ? 22 : 24) * Math.sin(rad)}
          x2={54 + 28 * Math.cos(rad)}
          y2={54 + 28 * Math.sin(rad)}
          stroke="#F59E0B"
          strokeWidth={isMain ? 2 : 1}
          strokeLinecap="round"
          opacity={isMain ? 0.7 : 0.35}
        />
      );
    })}
    {/* Hour hand */}
    <line x1="54" y1="54" x2="54" y2="30" stroke="#D97706" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
    {/* Minute hand */}
    <line x1="54" y1="54" x2="74" y2="58" stroke="#D97706" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <circle cx="54" cy="54" r="4" fill="#F59E0B" opacity="0.9" />
    <circle cx="54" cy="54" r="2" fill="white" />
    {/* Planet dot on rim */}
    <circle cx="54" cy="20" r="5" fill="#F97316" opacity="0.7" />
    <circle cx="86" cy="62" r="4" fill="#FBBF24" opacity="0.55" />
  </svg>
);

// ─── Hora / Sun Dial ──────────────────────────────────────────────────────────
export const HoraIllustration: React.FC = () => (
  <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
    {/* Outer ring */}
    <circle cx="54" cy="54" r="38" fill="#FFF7ED" opacity="0.5" stroke="#FBBF24" strokeWidth="1.5" />
    {/* Inner ring */}
    <circle cx="54" cy="54" r="24" fill="#FEF3C7" opacity="0.4" stroke="#F59E0B" strokeWidth="1" />
    {/* Sun */}
    <circle cx="54" cy="54" r="10" fill="#FBBF24" opacity="0.9" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
      const r = a * Math.PI / 180;
      return <line key={a} x1={54 + 11 * Math.cos(r)} y1={54 + 11 * Math.sin(r)} x2={54 + 16 * Math.cos(r)} y2={54 + 16 * Math.sin(r)} stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.65" />;
    })}
    {/* 8 hora segment labels */}
    {["ब्र", "सू", "चं", "मं", "बु", "गु", "शु", "श"].map((_, i) => {
      const r = (i * 45 - 67) * Math.PI / 180;
      return <circle key={i} cx={54 + 31 * Math.cos(r)} cy={54 + 31 * Math.sin(r)} r="3" fill="#D97706" opacity="0.45" />;
    })}
    <circle cx="90" cy="22" r="3.5" fill="#FBBF24" opacity="0.55" />
  </svg>
);

// ─── Sade Sati / Saturn ───────────────────────────────────────────────────────
export const SadeSatiIllustration: React.FC = () => (
  <svg width="112" height="108" viewBox="0 0 112 108" fill="none">
    {/* Saturn body */}
    <circle cx="56" cy="54" r="22" fill="#C4B5FD" opacity="0.7" />
    <circle cx="56" cy="54" r="14" fill="#A78BFA" opacity="0.6" />
    {/* Ring system */}
    <ellipse cx="56" cy="54" rx="44" ry="13" stroke="#7C3AED" strokeWidth="2.5" fill="none" opacity="0.4" transform="rotate(-20 56 54)" />
    <ellipse cx="56" cy="54" rx="36" ry="10" stroke="#A78BFA" strokeWidth="1.5" fill="none" opacity="0.3" transform="rotate(-20 56 54)" />
    {/* Inner glow */}
    <circle cx="48" cy="46" r="6" fill="white" opacity="0.25" />
    {/* Moon */}
    <circle cx="92" cy="28" r="7" fill="#E0E7FF" opacity="0.7" />
    <circle cx="96" cy="26" r="5" fill="#EAE0FF" />
    <circle cx="20" cy="82" r="4" fill="#DDD6FE" opacity="0.5" />
  </svg>
);

// ─── Weekly Zodiac ────────────────────────────────────────────────────────────
export const ZodiacIllustration: React.FC = () => (
  <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
    {/* Outer wheel */}
    <circle cx="54" cy="54" r="38" fill="#DCFCE7" opacity="0.3" stroke="#86EFAC" strokeWidth="1.5" />
    {/* 12 segments */}
    {Array.from({ length: 12 }).map((_, i) => {
      const a1 = (i * 30 - 90) * Math.PI / 180;
      const a2 = ((i + 1) * 30 - 90) * Math.PI / 180;
      const x1 = 54 + 38 * Math.cos(a1);
      const y1 = 54 + 38 * Math.sin(a1);
      const x2 = 54 + 38 * Math.cos(a2);
      const y2 = 54 + 38 * Math.sin(a2);
      return <path key={i} d={`M54 54 L${x1} ${y1} A38 38 0 0 1 ${x2} ${y2}Z`} fill={i % 2 === 0 ? "#86EFAC" : "#4ADE80"} opacity="0.15" />;
    })}
    {/* Symbol dots */}
    {Array.from({ length: 12 }).map((_, i) => {
      const rad = (i * 30 - 90) * Math.PI / 180;
      return <circle key={i} cx={54 + 30 * Math.cos(rad)} cy={54 + 30 * Math.sin(rad)} r="3" fill="#22C55E" opacity={0.4 + (i % 4) * 0.1} />;
    })}
    {/* Inner ring */}
    <circle cx="54" cy="54" r="16" fill="#BBF7D0" opacity="0.4" stroke="#4ADE80" strokeWidth="1" />
    <circle cx="54" cy="54" r="6" fill="#22C55E" opacity="0.65" />
    <circle cx="54" cy="54" r="3" fill="white" opacity="0.7" />
    <circle cx="88" cy="22" r="3.5" fill="#86EFAC" opacity="0.55" />
  </svg>
);

// ─── Breathing / Pranayama ────────────────────────────────────────────────────
export const BreathingIllustration: React.FC = () => (
  <svg width="112" height="108" viewBox="0 0 112 108" fill="none">
    {/* Breath wave layers */}
    <path d="M10 64 Q28 40 46 64 Q64 88 82 64 Q100 40 110 52" stroke="#6EE7B7" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
    <path d="M10 74 Q28 52 46 74 Q64 96 82 74 Q100 52 110 62" stroke="#34D399" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.45" />
    <path d="M10 54 Q28 30 46 54 Q64 78 82 54 Q100 30 110 42" stroke="#A7F3D0" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35" />
    {/* Center focus circle */}
    <circle cx="56" cy="52" r="18" fill="#D1FAE5" opacity="0.35" />
    <circle cx="56" cy="52" r="10" fill="#6EE7B7" opacity="0.4" />
    <circle cx="56" cy="52" r="5" fill="#059669" opacity="0.55" />
    {/* Corner dots */}
    <circle cx="96" cy="24" r="3.5" fill="#34D399" opacity="0.55" />
    <circle cx="14" cy="96" r="2.5" fill="#6EE7B7" opacity="0.4" />
  </svg>
);

// ─── Vastu Compass ────────────────────────────────────────────────────────────
export const VastuCompassIllustration: React.FC = () => (
  <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
    <circle cx="54" cy="54" r="38" fill="#FFF7ED" opacity="0.35" stroke="#FBBF24" strokeWidth="1.5" />
    <circle cx="54" cy="54" r="24" stroke="#F59E0B" strokeWidth="1" fill="none" opacity="0.4" />
    {/* Cardinal lines */}
    <line x1="54" y1="16" x2="54" y2="92" stroke="#D97706" strokeWidth="0.8" opacity="0.3" />
    <line x1="16" y1="54" x2="92" y2="54" stroke="#D97706" strokeWidth="0.8" opacity="0.3" />
    <line x1="27" y1="27" x2="81" y2="81" stroke="#D97706" strokeWidth="0.5" opacity="0.2" />
    <line x1="81" y1="27" x2="27" y2="81" stroke="#D97706" strokeWidth="0.5" opacity="0.2" />
    {/* North pointer */}
    <polygon points="54,18 58,48 54,42 50,48" fill="#EF4444" opacity="0.75" />
    {/* South pointer */}
    <polygon points="54,90 58,60 54,66 50,60" fill="#6B7280" opacity="0.5" />
    {/* East/West nubs */}
    <polygon points="90,54 60,58 66,54 60,50" fill="#D97706" opacity="0.5" />
    <polygon points="18,54 48,58 42,54 48,50" fill="#D97706" opacity="0.5" />
    {/* Center */}
    <circle cx="54" cy="54" r="6" fill="#F59E0B" opacity="0.85" />
    <circle cx="54" cy="54" r="2.5" fill="white" />
    {/* Direction label dots */}
    <circle cx="54" cy="20" r="3" fill="#EF4444" opacity="0.5" />
    <circle cx="88" cy="54" r="2.5" fill="#D97706" opacity="0.45" />
    <circle cx="88" cy="22" r="3" fill="#FBBF24" opacity="0.5" />
  </svg>
);

// ─── Numerology / Numbers ─────────────────────────────────────────────────────
export const NumerologyIllustration: React.FC = () => (
  <svg width="108" height="112" viewBox="0 0 108 112" fill="none">
    {/* Background glow */}
    <circle cx="54" cy="60" r="36" fill="#ECFDF5" opacity="0.3" />
    {/* Large number */}
    <text x="54" y="76" textAnchor="middle" fontSize="46" fontWeight="bold" fill="#059669" opacity="0.55" fontFamily="Georgia, serif">7</text>
    {/* Stars */}
    <circle cx="84" cy="24" r="5" fill="#34D399" opacity="0.6" />
    <circle cx="84" cy="24" r="2.5" fill="white" opacity="0.7" />
    <circle cx="20" cy="88" r="4" fill="#6EE7B7" opacity="0.4" />
    <circle cx="88" cy="80" r="2.5" fill="#A7F3D0" opacity="0.5" />
    {/* Small number echoes */}
    <text x="28" y="50" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#059669" opacity="0.2" fontFamily="Georgia, serif">1</text>
    <text x="82" y="92" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#059669" opacity="0.18" fontFamily="Georgia, serif">9</text>
  </svg>
);

// ─── Name / Letters ───────────────────────────────────────────────────────────
export const NameNumberIllustration: React.FC = () => (
  <svg width="108" height="112" viewBox="0 0 108 112" fill="none">
    <rect x="20" y="30" width="68" height="56" rx="12" fill="#FFEDD5" opacity="0.45" stroke="#FB923C" strokeWidth="1" />
    {/* A = 1 */}
    <text x="38" y="58" fontSize="20" fontWeight="bold" fill="#EA580C" opacity="0.75" fontFamily="monospace">A=1</text>
    {/* B = 2 */}
    <text x="38" y="74" fontSize="14" fill="#FB923C" opacity="0.5" fontFamily="monospace">B=2</text>
    {/* Stars */}
    <circle cx="86" cy="22" r="5" fill="#FED7AA" opacity="0.7" />
    <circle cx="86" cy="22" r="2.5" fill="#F97316" opacity="0.6" />
    <circle cx="18" cy="92" r="3" fill="#FDBA74" opacity="0.45" />
    <circle cx="90" cy="88" r="2" fill="#FED7AA" opacity="0.5" />
  </svg>
);

// ─── Vehicle / Car ────────────────────────────────────────────────────────────
export const VehicleIllustration: React.FC = () => (
  <svg width="112" height="96" viewBox="0 0 112 96" fill="none">
    {/* Car body */}
    <rect x="12" y="52" width="88" height="26" rx="8" fill="#BAE6FD" opacity="0.65" />
    {/* Car roof */}
    <path d="M28 52 L36 28 L76 28 L84 52Z" fill="#7DD3FC" opacity="0.7" />
    {/* Windows */}
    <rect x="38" y="30" width="14" height="18" rx="4" fill="white" opacity="0.55" />
    <rect x="56" y="30" width="14" height="18" rx="4" fill="white" opacity="0.55" />
    {/* Wheels */}
    <circle cx="32" cy="78" r="10" fill="#1E40AF" opacity="0.6" />
    <circle cx="32" cy="78" r="5" fill="white" opacity="0.5" />
    <circle cx="80" cy="78" r="10" fill="#1E40AF" opacity="0.6" />
    <circle cx="80" cy="78" r="5" fill="white" opacity="0.5" />
    {/* Headlights */}
    <rect x="12" y="58" width="8" height="6" rx="3" fill="#FEF08A" opacity="0.8" />
    <rect x="92" y="58" width="8" height="6" rx="3" fill="#FEF08A" opacity="0.8" />
    {/* Plate */}
    <rect x="40" y="64" width="32" height="8" rx="3" fill="white" opacity="0.6" />
    <circle cx="96" cy="18" r="3.5" fill="#7DD3FC" opacity="0.55" />
  </svg>
);

// ─── Daily Guidance / Lotus ───────────────────────────────────────────────────
export const DailyGuidanceIllustration: React.FC = () => (
  <svg width="120" height="108" viewBox="0 0 120 108" fill="none">
    {/* Petals */}
    {[0, 60, 120, 180, 240, 300].map(a => {
      const r = a * Math.PI / 180;
      return (
        <ellipse
          key={a}
          cx={60 + 20 * Math.cos(r)}
          cy={60 + 20 * Math.sin(r)}
          rx="10"
          ry="22"
          fill="#C4B5FD"
          opacity="0.5"
          transform={`rotate(${a} ${60 + 20 * Math.cos(r)} ${60 + 20 * Math.sin(r)})`}
        />
      );
    })}
    {/* Center */}
    <circle cx="60" cy="60" r="14" fill="#A78BFA" opacity="0.7" />
    <circle cx="60" cy="60" r="8" fill="#7C3AED" opacity="0.55" />
    <circle cx="60" cy="60" r="4" fill="white" opacity="0.6" />
    {/* Sparkles */}
    <circle cx="96" cy="22" r="4" fill="#DDD6FE" opacity="0.65" />
    <circle cx="22" cy="90" r="3" fill="#C4B5FD" opacity="0.45" />
    <path d="M100 76 L101.5 81 L106 82 L101.5 83 L100 88 L98.5 83 L94 82 L98.5 81Z" fill="#A78BFA" opacity="0.4" />
  </svg>
);

// ─── Moon Cycle ───────────────────────────────────────────────────────────────
export const MoonCycleIllustration: React.FC = () => (
  <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
    {/* Full moon glow */}
    <circle cx="54" cy="54" r="30" fill="#DBEAFE" opacity="0.3" />
    {/* Moon */}
    <circle cx="54" cy="54" r="22" fill="#BFDBFE" opacity="0.7" />
    {/* Crescent shadow */}
    <circle cx="64" cy="48" r="18" fill="#EFF6FF" opacity="0.85" />
    {/* Moon craters */}
    <circle cx="42" cy="50" r="4" fill="white" opacity="0.3" />
    <circle cx="50" cy="64" r="3" fill="white" opacity="0.25" />
    {/* Stars around */}
    <circle cx="88" cy="22" r="3.5" fill="#93C5FD" opacity="0.6" />
    <circle cx="18" cy="36" r="2.5" fill="#BFDBFE" opacity="0.5" />
    <circle cx="22" cy="82" r="2" fill="#93C5FD" opacity="0.4" />
    <circle cx="90" cy="84" r="3" fill="#60A5FA" opacity="0.45" />
    {/* Star */}
    <path d="M84 42 L85.5 47 L90 48 L85.5 49 L84 54 L82.5 49 L78 48 L82.5 47Z" fill="#93C5FD" opacity="0.5" />
  </svg>
);

// ─── Horoscope / Rashi ────────────────────────────────────────────────────────
export const HoroscopeIllustration: React.FC = () => (
  <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
    {/* Sun burst */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
      const r = a * Math.PI / 180;
      return (
        <line
          key={a}
          x1={54 + 18 * Math.cos(r)}
          y1={54 + 18 * Math.sin(r)}
          x2={54 + 30 * Math.cos(r)}
          y2={54 + 30 * Math.sin(r)}
          stroke="#F9A8D4"
          strokeWidth={a % 60 === 0 ? 2.5 : 1.5}
          strokeLinecap="round"
          opacity={a % 60 === 0 ? 0.7 : 0.4}
        />
      );
    })}
    <circle cx="54" cy="54" r="16" fill="#FCE7F3" opacity="0.6" />
    <circle cx="54" cy="54" r="10" fill="#F472B6" opacity="0.7" />
    <circle cx="54" cy="54" r="5" fill="white" opacity="0.55" />
    {/* Zodiac outer dots */}
    {Array.from({ length: 12 }).map((_, i) => {
      const r = (i * 30 - 90) * Math.PI / 180;
      return <circle key={i} cx={54 + 36 * Math.cos(r)} cy={54 + 36 * Math.sin(r)} r="3" fill="#FBCFE8" opacity="0.55" />;
    })}
    <circle cx="22" cy="24" r="3.5" fill="#F9A8D4" opacity="0.5" />
  </svg>
);

// ─── Live Dashboard ───────────────────────────────────────────────────────────
export const LiveDashboardIllustration: React.FC = () => (
  <svg width="112" height="104" viewBox="0 0 112 104" fill="none">
    <rect x="14" y="20" width="84" height="62" rx="10" fill="#DBEAFE" opacity="0.35" stroke="#93C5FD" strokeWidth="1" />
    {/* Bar chart */}
    {[22, 34, 46, 58, 70, 82].map((x, i) => {
      const h = [22, 36, 18, 42, 28, 20][i];
      return <rect key={x} x={x} y={60 - h} width="8" height={h} rx="3" fill="#3B82F6" opacity={0.3 + i * 0.07} />;
    })}
    {/* Trend line */}
    <polyline points="26,54 38,38 50,50 62,26 74,38 86,32" stroke="#60A5FA" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    {/* Live dot */}
    <circle cx="96" cy="24" r="6" fill="#EF4444" opacity="0.8" />
    <circle cx="96" cy="24" r="3" fill="white" opacity="0.85" />
    {/* Signal rings */}
    <circle cx="96" cy="24" r="10" fill="none" stroke="#EF4444" strokeWidth="1" opacity="0.3" />
    <circle cx="96" cy="24" r="14" fill="none" stroke="#EF4444" strokeWidth="0.6" opacity="0.15" />
  </svg>
);

// ─── Nadi Shodhana ────────────────────────────────────────────────────────────
export const NadiIllustration: React.FC = () => (
  <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
    {/* Left breath path */}
    <path d="M30 20 Q30 54 54 54 Q78 54 78 88" stroke="#6EE7B7" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.65" />
    {/* Right breath path */}
    <path d="M78 20 Q78 54 54 54 Q30 54 30 88" stroke="#A78BFA" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.65" />
    {/* Center nodes */}
    <circle cx="54" cy="54" r="8" fill="#34D399" opacity="0.5" />
    <circle cx="30" cy="20" r="6" fill="#6EE7B7" opacity="0.6" />
    <circle cx="78" cy="20" r="6" fill="#A78BFA" opacity="0.6" />
    <circle cx="30" cy="88" r="5" fill="#6EE7B7" opacity="0.45" />
    <circle cx="78" cy="88" r="5" fill="#A78BFA" opacity="0.45" />
    <circle cx="54" cy="54" r="4" fill="white" opacity="0.6" />
    <circle cx="90" cy="30" r="3" fill="#C4B5FD" opacity="0.5" />
  </svg>
);
