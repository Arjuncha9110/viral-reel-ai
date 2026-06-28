/**
 * AppTools.tsx — Services Page
 * Premium app-style Services grid. No list rows.
 * Custom cream header · Pastel illustration cards · Mixed grid layout.
 */
import React from "react";
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
      className="px-6 pt-10 pb-8"
      style={{ background: "linear-gradient(160deg, #FFE4B5 0%, #FFD580 100%)" }}
    >
      <div className="flex items-center gap-5">
        {/* Avatar with menu overlay */}
        <div className="relative flex-shrink-0">
          <div
            className="h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #3658B5, #1E3A8A)" }}
          >
            {initial}
          </div>
          <div
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full flex items-center justify-center shadow-sm border-2 border-white"
            style={{ background: "#FFF8F0" }}
          >
            <Menu className="w-3.5 h-3.5 text-stone-700" />
          </div>
        </div>

        {/* Page title */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700/60 mb-0.5">
            Divine Panchang
          </p>
          <h1 className="font-display text-[32px] font-bold text-[#0E1A3A] leading-none tracking-tight">
            Services
          </h1>
        </div>
      </div>
    </header>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export const AppTools: React.FC = () => (
  /* Phone shell — matches AppShell width/centering but without sticky header */
  <div className="min-h-screen bg-stone-200 font-body">
    <div
      className="w-full max-w-[430px] mx-auto min-h-screen relative"
      style={{
        background: "#FFF8EF",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.07), 0 8px 60px rgba(0,0,0,0.13)",
      }}
    >
      {/* Custom cream header */}
      <ServicesHeader />

      {/* ── Sections ─────────────────────────────────────────────────── */}
      <main className="px-5 pt-6 pb-32 space-y-10">

        {/* 1 · Latest Offerings */}
        <section>
          <SectionHeader title="Latest Offerings" badge="NEW" />
          <div className="grid grid-cols-2 gap-4">
            {/* Wide: AI Astro Guides */}
            <ServiceCard
              title="AI Astro Guides"
              subtitle="Your Vedic companion for Kundali, Sade Sati & daily guidance"
              route="/divine-ai"
              size="wide"
              theme="dark"
              illustration={<DivineAIIllustration />}
            />
            {/* Palm Scan AI */}
            <ServiceCard
              title="Palm Scan AI"
              subtitle="Hand line wisdom"
              route="/palmistry"
              size="small"
              theme="mint"
              illustration={<PalmScanIllustration />}
            />
            {/* Bhrigu Margdarshan */}
            <ServiceCard
              title="Bhrigu Margdarshan"
              subtitle="Ancient destiny scroll"
              route="/divine-ai"
              size="small"
              theme="cream"
              illustration={<ScrollIllustration />}
            />
            {/* Chinese Horoscope — wide */}
            <ServiceCard
              title="Chinese Horoscope 2026"
              route="/horoscope"
              size="wide"
              theme="blue"
              badge="NEW"
              badgeColor="#3B82F6"
              illustration={<ChineseZodiacIllustration />}
            />
          </div>
        </section>

        {/* 2 · Vedic Astrology */}
        <section>
          <SectionHeader title="Vedic Astrology" />
          <div className="grid grid-cols-2 gap-4">
            {/* Kundli — wide */}
            <ServiceCard
              title="Kundli"
              subtitle="Your complete birth chart"
              route="/kundali"
              size="wide"
              theme="peach"
              illustration={<KundliIllustration />}
            />
            {/* Half cards */}
            <ServiceCard
              title="Match Making"
              route="/app/match"
              size="small"
              theme="pink"
              illustration={<MatchMakingIllustration />}
            />
            <ServiceCard
              title="Transit Chart"
              route="/app/weekly-zodiac"
              size="small"
              theme="sky"
              illustration={<TransitIllustration />}
            />
            <ServiceCard
              title="Rajyoga"
              route="/divine-ai"
              size="small"
              theme="yellow"
              badge="AI"
              badgeColor="#D97706"
              illustration={<CrownIllustration />}
            />
            <ServiceCard
              title="Dasha Analysis"
              route="/dasha"
              size="small"
              theme="yellow"
              illustration={<DashaIllustration />}
            />
            <ServiceCard
              title="Hora Muhurat"
              route="/muhurat"
              size="small"
              theme="cream"
              illustration={<HoraIllustration />}
            />
            <ServiceCard
              title="Eclipse Grahan"
              route="/app/eclipse"
              size="small"
              theme="blue"
              illustration={<ZodiacIllustration />}
            />
            {/* Sade Sati — wide */}
            <ServiceCard
              title="Sade Sati"
              subtitle="Saturn transit guide & remedies"
              route="/app/sade-sati"
              size="wide"
              theme="purple"
              illustration={<SadeSatiIllustration />}
            />
            {/* Weekly Zodiac */}
            <ServiceCard
              title="Weekly Zodiac"
              route="/app/weekly-zodiac"
              size="small"
              theme="sage"
              illustration={<ZodiacIllustration />}
            />
            <ServiceCard
              title="Daily Horoscope"
              route="/horoscope"
              size="small"
              theme="pink"
              illustration={<HoroscopeIllustration />}
            />
          </div>
        </section>

        {/* 3 · Numerology */}
        <section>
          <SectionHeader title="Numerology" />
          <div className="grid grid-cols-2 gap-4">
            <ServiceCard
              title="Birth Numerology"
              subtitle="Life path & destiny"
              route="/birth-numerology"
              size="small"
              theme="sage"
              illustration={<NumerologyIllustration />}
            />
            <ServiceCard
              title="Name Number"
              subtitle="Vibrational energy"
              route="/name-numerology"
              size="small"
              theme="peach"
              illustration={<NameNumberIllustration />}
            />
            <ServiceCard
              title="Vehicle Number"
              subtitle="Lucky number insights"
              route="/vehicle-number"
              size="wide"
              theme="sky"
              illustration={<VehicleIllustration />}
            />
          </div>
        </section>

        {/* 4 · Spiritual Practice */}
        <section>
          <SectionHeader title="Spiritual Practice" />
          <div className="grid grid-cols-2 gap-4">
            {/* Wide: Pranayama */}
            <ServiceCard
              title="Pranayama & Breathwork"
              subtitle="Breathing for mind & soul"
              route="/breathing"
              size="wide"
              theme="mint"
              badge="Practice"
              badgeColor="#059669"
              illustration={<BreathingIllustration />}
            />
            <ServiceCard
              title="Divine AI Guru"
              subtitle="Vedic wisdom on demand"
              route="/divine-ai"
              size="small"
              theme="dark"
              illustration={<DivineAIIllustration />}
            />
            <ServiceCard
              title="Daily Guidance"
              subtitle="Mantras & affirmations"
              route="/app/daily-guidance"
              size="small"
              theme="purple"
              illustration={<DailyGuidanceIllustration />}
            />
            <ServiceCard
              title="Vastu Compass"
              subtitle="Sacred space & directions"
              route="/vastu"
              size="small"
              theme="yellow"
              illustration={<VastuCompassIllustration />}
            />
            <ServiceCard
              title="Palmistry Guide"
              subtitle="Hand line meanings"
              route="/palmistry"
              size="small"
              theme="mint"
              illustration={<PalmScanIllustration />}
            />
            {/* Nadi Shodhana */}
            <ServiceCard
              title="Nadi Shodhana"
              subtitle="Alternate nostril timer"
              route="/app/nadi-shodhana"
              size="wide"
              theme="sky"
              illustration={<NadiIllustration />}
            />
            {/* Moon Cycle */}
            <ServiceCard
              title="Moon Cycle"
              subtitle="Tithi & lunar phases"
              route="/app/moon-cycle"
              size="small"
              theme="blue"
              illustration={<MoonCycleIllustration />}
            />
            <ServiceCard
              title="Live Dashboard"
              subtitle="Real-time Vedic clock"
              route="/live-dashboard"
              size="small"
              theme="sky"
              badge="Live"
              badgeColor="#22C55E"
              illustration={<LiveDashIllustration />}
            />
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
            🕉 Divine Panchang · Vedic Wisdom
          </p>
        </div>

      </main>

      {/* Fixed bottom nav */}
      <BottomNav />
    </div>
  </div>
);

// ── Inline sub-illustrations that are page-local ──────────────────────────────
const HoroscopeIllustration: React.FC = () => (
  <svg width="100" height="104" viewBox="0 0 100 104" fill="none">
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => {
      const r = a * Math.PI / 180;
      return (
        <line
          key={a}
          x1={50 + 16 * Math.cos(r)} y1={52 + 16 * Math.sin(r)}
          x2={50 + 26 * Math.cos(r)} y2={52 + 26 * Math.sin(r)}
          stroke="#F9A8D4" strokeWidth={a % 60 === 0 ? 2.5 : 1.5}
          strokeLinecap="round" opacity={a % 60 === 0 ? 0.7 : 0.4}
        />
      );
    })}
    <circle cx="50" cy="52" r="14" fill="#FCE7F3" opacity="0.6" />
    <circle cx="50" cy="52" r="9" fill="#F472B6" opacity="0.7" />
    <circle cx="50" cy="52" r="4.5" fill="white" opacity="0.55" />
    {Array.from({ length: 12 }).map((_, i) => {
      const r = (i * 30 - 90) * Math.PI / 180;
      return <circle key={i} cx={50 + 33 * Math.cos(r)} cy={52 + 33 * Math.sin(r)} r="2.5" fill="#FBCFE8" opacity="0.55" />;
    })}
    <circle cx="20" cy="22" r="3" fill="#F9A8D4" opacity="0.5" />
  </svg>
);

const LiveDashIllustration: React.FC = () => (
  <svg width="104" height="100" viewBox="0 0 104 100" fill="none">
    <rect x="12" y="18" width="80" height="60" rx="10" fill="#DBEAFE" opacity="0.35" stroke="#93C5FD" strokeWidth="1" />
    {[20, 32, 44, 56, 68, 80].map((x, i) => {
      const h = [20, 34, 16, 40, 26, 18][i];
      return <rect key={x} x={x} y={58 - h} width="8" height={h} rx="3" fill="#3B82F6" opacity={0.3 + i * 0.07} />;
    })}
    <polyline points="24,52 36,36 48,48 60,24 72,36 84,30" stroke="#60A5FA" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    <circle cx="92" cy="22" r="6" fill="#EF4444" opacity="0.8" />
    <circle cx="92" cy="22" r="3" fill="white" opacity="0.85" />
    <circle cx="92" cy="22" r="10" fill="none" stroke="#EF4444" strokeWidth="1" opacity="0.3" />
  </svg>
);

export default AppTools;
