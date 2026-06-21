/**
 * AppTools.tsx — Services Page (polished)
 * Premium app-style Services grid. No list rows.
 * Custom saffron header · Pastel illustration cards · Mixed grid layout.
 */
import React, { useEffect } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { BottomNav } from "../../components/dashboard/BottomNav";
import { ServiceCard } from "../../components/app/ServiceCard";
import { SectionHeader } from "../../components/app/SectionHeader";
import {
  ScrollIllustration,
  PalmScanIllustration,
  ChineseZodiacIllustration,
  DivineAIIllustration,
  KundliIllustration,
  MatchMakingIllustration,
  TransitIllustration,
  CrownIllustration,
  DashaIllustration,
  HoraIllustration,
  SadeSatiIllustration,
  ZodiacIllustration,
  NumerologyIllustration,
  NameNumberIllustration,
  VehicleIllustration,
  BreathingIllustration,
  VastuCompassIllustration,
  DailyGuidanceIllustration,
  MoonCycleIllustration,
  NadiIllustration,
} from "../../components/app/ToolIllustrations";

// ─── Services Header ──────────────────────────────────────────────────────────
const ServicesHeader: React.FC = () => {
  const { currentUser } = useAuth();
  const initial = currentUser?.displayName?.[0]?.toUpperCase() ?? "A";

  return (
    <header
      style={{
        background: "linear-gradient(160deg, #FFF6E0 0%, #FFE082 60%, #FFCA28 100%)",
      }}
    >
      {/* Top row: avatar left, menu right */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between">
        <div className="relative">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #3658B5, #1E3A8A)" }}
          >
            {initial}
          </div>
          <span
            className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white"
            style={{ background: "#22C55E" }}
          />
        </div>
        <button
          className="h-10 w-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(14,26,58,0.07)" }}
        >
          <Menu className="w-5 h-5 text-[#0E1A3A]/70" />
        </button>
      </div>

      {/* Title block */}
      <div className="px-5 pb-8 pt-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800/50 mb-1.5">
          Divine Panchang
        </p>
        <h1
          className="font-display font-bold text-[#0E1A3A] leading-none tracking-tight"
          style={{ fontSize: 36 }}
        >
          Services
        </h1>
        <p className="text-[13px] text-amber-900/45 mt-2 font-medium">
          Explore your Vedic tools
        </p>
      </div>
    </header>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export const AppTools: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    <div className="min-h-screen bg-stone-200 font-body">
      <div
        className="w-full max-w-[430px] mx-auto min-h-screen relative"
        style={{
          background: "#FFF8EF",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 8px 60px rgba(0,0,0,0.12)",
        }}
      >
        <ServicesHeader />

        <main className="px-4 pt-8 pb-44 space-y-12">

          {/* 1 · Latest Offerings */}
          <section>
            <SectionHeader title="Latest Offerings" badge="NEW" />
            <div className="grid grid-cols-2 gap-3">
              <ServiceCard title="AI Astro Guides" subtitle="Kundali, Sade Sati & daily guidance" route="/divine-ai" size="wide" theme="dark" illustration={<DivineAIIllustration />} />
              <ServiceCard title="Palm Scan AI" subtitle="Hand line wisdom" route="/palmistry" size="small" theme="mint" illustration={<PalmScanIllustration />} />
              <ServiceCard title="Bhrigu Margdarshan" subtitle="Ancient destiny scroll" route="/divine-ai" size="small" theme="cream" illustration={<ScrollIllustration />} />
              <ServiceCard title="Chinese Horoscope 2026" route="/horoscope" size="wide" theme="blue" badge="NEW" badgeColor="#3B82F6" illustration={<ChineseZodiacIllustration />} />
            </div>
          </section>

          {/* 2 · Vedic Astrology */}
          <section>
            <SectionHeader title="Vedic Astrology" />
            <div className="grid grid-cols-2 gap-3">
              <ServiceCard title="Kundli" subtitle="Your complete birth chart" route="/kundali" size="wide" theme="peach" illustration={<KundliIllustration />} />
              <ServiceCard title="Match Making" route="/app/match" size="small" theme="pink" illustration={<MatchMakingIllustration />} />
              <ServiceCard title="Transit Chart" route="/app/weekly-zodiac" size="small" theme="sky" illustration={<TransitIllustration />} />
              <ServiceCard title="Rajyoga" route="/divine-ai" size="small" theme="yellow" badge="AI" badgeColor="#D97706" illustration={<CrownIllustration />} />
              <ServiceCard title="Dasha Analysis" route="/dasha" size="small" theme="yellow" illustration={<DashaIllustration />} />
              <ServiceCard title="Hora Muhurat" route="/muhurat" size="small" theme="cream" illustration={<HoraIllustration />} />
              <ServiceCard title="Eclipse Grahan" route="/app/eclipse" size="small" theme="blue" illustration={<ZodiacIllustration />} />
              <ServiceCard title="Sade Sati" subtitle="Saturn transit & remedies" route="/app/sade-sati" size="wide" theme="purple" illustration={<SadeSatiIllustration />} />
              <ServiceCard title="Weekly Zodiac" route="/app/weekly-zodiac" size="small" theme="sage" illustration={<ZodiacIllustration />} />
              <ServiceCard title="Daily Horoscope" route="/horoscope" size="small" theme="pink" illustration={<HoroscopeIllustration />} />
            </div>
          </section>

          {/* 3 · Numerology */}
          <section>
            <SectionHeader title="Numerology" />
            <div className="grid grid-cols-2 gap-3">
              <ServiceCard title="Birth Numerology" subtitle="Life path & destiny" route="/birth-numerology" size="small" theme="sage" illustration={<NumerologyIllustration />} />
              <ServiceCard title="Name Number" subtitle="Vibrational energy" route="/name-numerology" size="small" theme="peach" illustration={<NameNumberIllustration />} />
              <ServiceCard title="Vehicle Number" subtitle="Lucky number insights" route="/vehicle-number" size="wide" theme="sky" illustration={<VehicleIllustration />} />
            </div>
          </section>

          {/* 4 · Spiritual Practice */}
          <section>
            <SectionHeader title="Spiritual Practice" />
            <div className="grid grid-cols-2 gap-3">
              <ServiceCard title="Pranayama & Breathwork" subtitle="Breathing for mind & soul" route="/breathing" size="wide" theme="mint" badge="Practice" badgeColor="#059669" illustration={<BreathingIllustration />} />
              <ServiceCard title="Divine AI Guru" subtitle="Vedic wisdom" route="/divine-ai" size="small" theme="dark" illustration={<DivineAIIllustration />} />
              <ServiceCard title="Daily Guidance" subtitle="Mantras & affirmations" route="/app/daily-guidance" size="small" theme="purple" illustration={<DailyGuidanceIllustration />} />
              <ServiceCard title="Vastu Compass" subtitle="Sacred directions" route="/vastu" size="small" theme="yellow" illustration={<VastuCompassIllustration />} />
              <ServiceCard title="Palmistry Guide" subtitle="Hand line meanings" route="/palmistry" size="small" theme="mint" illustration={<PalmScanIllustration />} />
              <ServiceCard title="Nadi Shodhana" subtitle="Alternate nostril timer" route="/app/nadi-shodhana" size="wide" theme="sky" illustration={<NadiIllustration />} />
              <ServiceCard title="Moon Cycle" subtitle="Tithi & lunar phases" route="/app/moon-cycle" size="small" theme="blue" illustration={<MoonCycleIllustration />} />
              <ServiceCard title="Live Dashboard" subtitle="Real-time Vedic clock" route="/live-dashboard" size="small" theme="sky" badge="Live" badgeColor="#22C55E" illustration={<LiveDashIllustration />} />
            </div>
          </section>

          <div className="text-center pt-1">
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
              🕉 Divine Panchang · Vedic Wisdom
            </p>
          </div>

        </main>

        <BottomNav />
      </div>
    </div>
  );
};

// ── Page-local illustrations ──────────────────────────────────────────────────
const HoroscopeIllustration: React.FC = () => (
  <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
      const rad = a * Math.PI / 180;
      return (
        <line key={a}
          x1={54 + 17 * Math.cos(rad)} y1={54 + 17 * Math.sin(rad)}
          x2={54 + 28 * Math.cos(rad)} y2={54 + 28 * Math.sin(rad)}
          stroke="#F9A8D4" strokeWidth={a % 60 === 0 ? 2.5 : 1.5}
          strokeLinecap="round" opacity={a % 60 === 0 ? 0.75 : 0.4}
        />
      );
    })}
    <circle cx="54" cy="54" r="15" fill="#FCE7F3" opacity="0.65" />
    <circle cx="54" cy="54" r="10" fill="#F472B6" opacity="0.7" />
    <circle cx="54" cy="54" r="5"  fill="white"   opacity="0.55" />
    {Array.from({ length: 12 }).map((_, i) => {
      const rad = (i * 30 - 90) * Math.PI / 180;
      return <circle key={i} cx={54 + 36 * Math.cos(rad)} cy={54 + 36 * Math.sin(rad)} r="2.5" fill="#FBCFE8" opacity="0.55" />;
    })}
    <circle cx="22" cy="22" r="3.5" fill="#F9A8D4" opacity="0.45" />
  </svg>
);

const LiveDashIllustration: React.FC = () => (
  <svg width="112" height="104" viewBox="0 0 112 104" fill="none">
    <rect x="10" y="16" width="82" height="62" rx="10" fill="#DBEAFE" opacity="0.35" stroke="#93C5FD" strokeWidth="1" />
    {[18, 30, 42, 54, 66, 78].map((x, i) => {
      const h = [20, 34, 16, 40, 26, 18][i];
      return <rect key={x} x={x} y={60 - h} width="8" height={h} rx="3" fill="#3B82F6" opacity={0.28 + i * 0.07} />;
    })}
    <polyline points="22,54 34,38 46,50 58,26 70,38 82,32"
      stroke="#60A5FA" strokeWidth="2" fill="none"
      strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
    <circle cx="96" cy="20" r="7"  fill="#EF4444" opacity="0.8" />
    <circle cx="96" cy="20" r="3.5" fill="white"  opacity="0.85" />
    <circle cx="96" cy="20" r="11" fill="none" stroke="#EF4444" strokeWidth="1" opacity="0.25" />
  </svg>
);

export default AppTools;
