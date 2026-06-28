import React from "react";
import AppShell from "./AppShell";
import { palmistryCategories } from "../../data/palmistryData";
import PalmistryCategoryCard from "../../components/palmistry/PalmistryCategoryCard";
import PalmReflectionQuiz from "../../components/palmistry/PalmReflectionQuiz";
import PalmistryPremiumCTA from "../../components/palmistry/PalmistryPremiumCTA";
import PalmScanComingSoon from "../../components/palmistry/PalmScanComingSoon";
import PalmistryDisclaimer from "../../components/palmistry/PalmistryDisclaimer";
import PalmIllustration from "../../components/palmistry/PalmIllustration";

const AppPalmistry: React.FC = () => {
  return (
    <AppShell title="Palmistry" eyebrow="Self Reflection" showBack>
      <div className="space-y-8 pb-24">

        {/* ── Hero Section ── */}
        <div
          className="relative overflow-hidden rounded-none px-5 pt-6 pb-8"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, #fef3d8 0%, #fae8c4 55%, #f5dba8 100%)",
          }}
        >
          {/* Decorative sacred dot ring */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" viewBox="0 0 390 220" preserveAspectRatio="xMidYMid slice">
            <circle cx="195" cy="-20" r="160" fill="none" stroke="#d4a843" strokeWidth="0.5" opacity="0.25" />
            <circle cx="195" cy="-20" r="185" fill="none" stroke="#d4a843" strokeWidth="0.5" opacity="0.15" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
              const rad = (deg - 90) * Math.PI / 180;
              return (
                <circle
                  key={deg}
                  cx={195 + 160 * Math.cos(rad)}
                  cy={-20 + 160 * Math.sin(rad)}
                  r="2"
                  fill="#d4a843"
                  opacity="0.3"
                />
              );
            })}
          </svg>

          <div className="relative z-10 flex flex-col items-center text-center gap-4">
            {/* Hand icon using the uploaded image via PalmIllustration */}
            <PalmIllustration activeLine="none" compact />

            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-amber-700/60 mb-1">
                Divine Panchang
              </p>
              <h1 className="font-display text-[32px] font-bold text-stone-900 leading-tight">
                Palmistry
              </h1>
              <p className="font-display text-[18px] font-semibold text-amber-700 mt-0.5">
                Wisdom of the Hands
              </p>
              <p className="text-[12px] text-stone-500 leading-relaxed mt-2 max-w-[280px]">
                Explore the traditional meaning of palm lines, mounts, and signs through gentle spiritual reflection.
              </p>
            </div>

            {/* Stats badges */}
            <div className="flex items-center gap-3 mt-1">
              {[
                { val: "5", label: "Major Lines" },
                { val: "9", label: "Sacred Signs" },
                { val: "AI", label: "Reflection" },
              ].map(({ val, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center px-3 py-2 rounded-2xl bg-white/70 backdrop-blur shadow-sm border border-amber-100"
                >
                  <span className="font-display text-[18px] font-bold text-stone-900">{val}</span>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-4 space-y-8">

          {/* ── Category Cards ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 rounded-full bg-amber-500" />
              <h2 className="font-display text-[18px] font-bold text-stone-900">Explore Palm Lines</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {palmistryCategories.map(cat => (
                <PalmistryCategoryCard
                  key={cat.slug}
                  slug={cat.slug}
                  title={cat.title}
                  description={cat.shortDescription}
                  theme={cat.theme}
                  icon={cat.icon}
                />
              ))}
              <PalmistryCategoryCard
                slug="others"
                title="Signs & Mounts"
                description="Minor lines, mounts, fish sign, marriage line, and more."
                theme="purple"
                icon="footprints"
              />
            </div>
          </div>

          {/* ── Interactive Quiz ── */}
          <PalmReflectionQuiz />

          {/* ── Coming Soon ── */}
          <PalmScanComingSoon />

          {/* ── Premium CTA ── */}
          <PalmistryPremiumCTA />

          {/* ── Disclaimer ── */}
          <PalmistryDisclaimer />
        </div>
      </div>
    </AppShell>
  );
};

export default AppPalmistry;
