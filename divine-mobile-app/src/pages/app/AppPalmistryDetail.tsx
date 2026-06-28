import React from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import AppShell from "./AppShell";
import { palmistryCategories, palmistryOthers } from "../../data/palmistryData";
import PalmIllustration, { type PalmLine } from "../../components/palmistry/PalmIllustration";
import PalmistryDetailSection from "../../components/palmistry/PalmistryDetailSection";
import PalmistryDisclaimer from "../../components/palmistry/PalmistryDisclaimer";
import { ChevronLeft, Layers } from "lucide-react";

// Per-line accent colors (matches PalmIllustration)
const LINE_COLOR: Record<string, string> = {
  "health-line": "#0d9488",
  "heart-line":  "#e11d48",
  "life-line":   "#d97706",
  "head-line":   "#2563eb",
  "fate-line":   "#f97316",
};

const LINE_BG: Record<string, string> = {
  "health-line": "linear-gradient(135deg, #f0fdf9 0%, #ccfbef 100%)",
  "heart-line":  "linear-gradient(135deg, #fff0f4 0%, #ffe4e9 100%)",
  "life-line":   "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
  "head-line":   "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
  "fate-line":   "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
};

// Quick insight data per line
const QUICK_INSIGHT: Record<string, { theme: string; bestFor: string; energy: string }> = {
  "health-line": { theme: "Vitality",   bestFor: "Routine & Balance",  energy: "Restore" },
  "heart-line":  { theme: "Emotion",    bestFor: "Love & Connection",  energy: "Open" },
  "life-line":   { theme: "Energy",     bestFor: "Resilience & Growth",energy: "Renew" },
  "head-line":   { theme: "Intellect",  bestFor: "Focus & Clarity",    energy: "Reflect" },
  "fate-line":   { theme: "Destiny",    bestFor: "Purpose & Career",   energy: "Align" },
};

const VALID_LINES: PalmLine[] = ["health-line", "heart-line", "life-line", "head-line", "fate-line"];

// ── Others page ───────────────────────────────────────────────────────────────
const OthersPage: React.FC = () => (
  <AppShell title="Signs & Mounts" eyebrow="Palmistry" showBack>
    <div className="px-4 space-y-5 pb-24">

      {/* Hero */}
      <div
        className="rounded-3xl p-5 text-center"
        style={{ background: "linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)" }}
      >
        <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-3">
          <Layers className="w-7 h-7 text-violet-600" />
        </div>
        <h2 className="font-display text-[22px] font-bold text-stone-900 mb-1">Minor Lines & Mounts</h2>
        <p className="text-[12px] text-stone-500 leading-relaxed max-w-[260px] mx-auto">
          Explore the supporting signs, mounts, and special markings traditionally used in palmistry.
        </p>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {palmistryOthers.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-5 rounded-full bg-violet-400" />
              <h3 className="font-bold text-stone-900 text-[14px]">{item.title}</h3>
            </div>
            <p className="text-[12px] text-stone-500 leading-relaxed pl-3.5">{item.description}</p>
          </div>
        ))}
      </div>

      <Link
        to="/palmistry"
        className="flex items-center justify-center gap-2 py-3.5 text-amber-700 font-bold text-[14px] bg-amber-50 rounded-2xl border border-amber-100"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Palmistry
      </Link>

      <PalmistryDisclaimer />
    </div>
  </AppShell>
);

// ── Main detail page ──────────────────────────────────────────────────────────
const AppPalmistryDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  if (slug === "others") return <OthersPage />;

  const data = palmistryCategories.find(c => c.slug === slug);
  if (!data) return <Navigate to="/palmistry" replace />;

  const activeLine: PalmLine = (VALID_LINES.includes(data.slug as PalmLine) ? data.slug : "none") as PalmLine;
  const accentColor = LINE_COLOR[data.slug] ?? "#d97706";
  const heroBg = LINE_BG[data.slug] ?? "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)";
  const insight = QUICK_INSIGHT[data.slug];

  return (
    <AppShell title={data.title} eyebrow="Palmistry" showBack>
      <div className="px-4 space-y-5 pb-24">

        {/* ── Hero visual card ── */}
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{ background: heroBg }}
        >
          {/* Subtle decorative arc */}
          <svg className="absolute top-0 right-0 pointer-events-none opacity-20" width="120" height="120" viewBox="0 0 120 120">
            <circle cx="110" cy="10" r="80" fill="none" stroke={accentColor} strokeWidth="2" />
            <circle cx="110" cy="10" r="55" fill="none" stroke={accentColor} strokeWidth="1" />
          </svg>

          <div className="relative z-10 px-5 pt-5 pb-4 text-center">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
              style={{ color: accentColor }}
            >
              Palmistry Guide
            </p>
            <h2 className="font-display text-[26px] font-bold text-stone-900 leading-tight mb-1">
              {data.title}
            </h2>
            <p className="text-[12px] text-stone-500 mb-4 max-w-[240px] mx-auto">
              {data.shortDescription}
            </p>
          </div>

          {/* Palm illustration */}
          <div className="flex justify-center pb-5">
            <PalmIllustration
              activeLine={activeLine}
              label={data.title}
            />
          </div>
        </div>

        {/* ── Quick Insight badges ── */}
        {insight && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Core Theme", val: insight.theme },
              { label: "Best For", val: insight.bestFor },
              { label: "Energy", val: insight.energy },
            ].map(({ label, val }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-3 text-center shadow-sm border border-stone-100"
              >
                <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">{label}</p>
                <p className="text-[12px] font-bold text-stone-800 leading-tight">{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Overview ── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-1.5 h-5 rounded-full"
              style={{ background: accentColor }}
            />
            <h3 className="font-bold text-stone-900 text-[14px]">Overview</h3>
          </div>
          <p className="text-[13px] text-stone-600 leading-relaxed">{data.overview}</p>
        </div>

        {/* ── Detail sections ── */}
        <PalmistryDetailSection data={data} lineColor={accentColor} />

        {/* ── Back link ── */}
        <Link
          to="/palmistry"
          className="flex items-center justify-center gap-2 py-3.5 text-amber-700 font-bold text-[14px] bg-amber-50 rounded-2xl border border-amber-100"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Palmistry
        </Link>

        <PalmistryDisclaimer />
      </div>
    </AppShell>
  );
};

export default AppPalmistryDetail;
