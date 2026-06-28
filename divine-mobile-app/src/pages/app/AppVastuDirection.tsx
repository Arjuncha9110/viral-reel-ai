import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VASTU_DIRECTIONS, getVastuDir, GUNA_COLOR, GUNA_BG } from "../../data/vastuDirections";
import AppShell from "./AppShell";

// ── Mini chakra SVG ────────────────────────────────────────────────────────────
const MC = 80, MR_OUT = 68, MR_IN = 40;
const CARDINALS = new Set(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]);

function toRad(deg: number) { return (deg - 90) * Math.PI / 180; }

function miniSector(r1: number, r2: number, startDeg: number, endDeg: number) {
  const s = toRad(startDeg), e = toRad(endDeg);
  const f = (n: number) => n.toFixed(2);
  const ox1 = MC + r2 * Math.cos(s), oy1 = MC + r2 * Math.sin(s);
  const ox2 = MC + r2 * Math.cos(e), oy2 = MC + r2 * Math.sin(e);
  const ix1 = MC + r1 * Math.cos(e), iy1 = MC + r1 * Math.sin(e);
  const ix2 = MC + r1 * Math.cos(s), iy2 = MC + r1 * Math.sin(s);
  return `M${f(ox1)} ${f(oy1)} A${r2} ${r2} 0 0 1 ${f(ox2)} ${f(oy2)} L${f(ix1)} ${f(iy1)} A${r1} ${r1} 0 0 0 ${f(ix2)} ${f(iy2)}Z`;
}

function MiniChakra({ activeKey }: { activeKey: string }) {
  return (
    <svg viewBox="0 0 160 160" width="140" height="140">
      <circle cx={MC} cy={MC} r={MR_OUT + 5} fill="#d4a843" />
      <circle cx={MC} cy={MC} r={MR_OUT + 2} fill="#fef5e4" />
      {VASTU_DIRECTIONS.map((dir) => {
        const isActive = dir.key === activeKey;
        return (
          <path
            key={dir.key}
            d={miniSector(MR_IN, MR_OUT, dir.deg - 11.25, dir.deg + 11.25)}
            fill={isActive ? "#f59e0b" : CARDINALS.has(dir.key) ? "#d4a843" : "#ddb84e"}
            stroke="#fef5e4"
            strokeWidth="1"
          />
        );
      })}
      {VASTU_DIRECTIONS.map((dir) => {
        const isActive = dir.key === activeKey;
        const rad = toRad(dir.deg);
        const r = (MR_OUT + MR_IN) / 2;
        return (
          <text
            key={dir.key + "-lbl"}
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="'Outfit', sans-serif"
            fontSize={CARDINALS.has(dir.key) ? "8" : "6.5"}
            fontWeight={isActive ? "800" : "600"}
            fill={isActive ? "#1a2040" : "#3a3000"}
            x={MC + r * Math.cos(rad)}
            y={MC + r * Math.sin(rad)}
            transform={`rotate(${dir.deg} ${MC + r * Math.cos(rad)} ${MC + r * Math.sin(rad)})`}
          >
            {dir.shortLabel}
          </text>
        );
      })}
      <circle cx={MC} cy={MC} r={MR_IN - 2} fill="white" />
      <circle cx={MC} cy={MC} r={7} fill="#d4a843" />
      <circle cx={MC} cy={MC} r={4} fill="white" />
    </svg>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-stone-100 last:border-0">
      <span className="text-base w-6 text-center flex-shrink-0 mt-0.5">{icon}</span>
      <span className="text-[12px] font-semibold text-stone-400 w-20 flex-shrink-0 mt-0.5">{label}</span>
      <span className="text-[13px] font-medium text-stone-800 flex-1 leading-snug">{value}</span>
    </div>
  );
}

const AppVastuDirection: React.FC = () => {
  const { direction } = useParams<{ direction: string }>();
  const navigate = useNavigate();
  const dir = VASTU_DIRECTIONS.find((d) => d.key === direction) ?? getVastuDir(0);

  const gunaColor = GUNA_COLOR[dir.guna];
  const gunaBg = GUNA_BG[dir.guna];

  return (
    <AppShell title={dir.label} eyebrow="Vastu Direction" showBack>
      <div className="space-y-5 pb-8">

        {/* Hero card */}
        <div
          className="rounded-3xl p-5 text-white shadow-lg"
          style={{ background: "linear-gradient(135deg, #1e2b5e 0%, #2a3f8e 60%, #1e2b5e 100%)" }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-0.5">{dir.sanskrit}</p>
              <h1 className="font-display text-[36px] font-bold leading-none">{dir.label}</h1>
              <p className="text-[13px] text-white/50 mt-1">Lord {dir.lord}</p>
            </div>
            <div className="text-right">
              <p className="text-[42px] leading-none">{dir.elementIcon}</p>
              <span
                className="inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mt-1"
                style={{ background: gunaBg, color: gunaColor }}
              >
                {dir.guna}
              </span>
            </div>
          </div>
          <p className="text-[13px] text-white/70 leading-relaxed">{dir.description}</p>
        </div>

        {/* Properties */}
        <div className="bg-white rounded-2xl px-4 py-1 shadow-sm border border-amber-50">
          <InfoRow icon="🌊" label="Element"  value={dir.element} />
          <InfoRow icon="⚕️"  label="Dosha"    value={dir.dosha} />
          <InfoRow icon="✨"  label="Guna"     value={dir.guna} />
          <InfoRow icon="📍"  label="Best For" value={dir.location} />
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-50">
          <p className="text-[11px] uppercase tracking-widest font-bold text-emerald-700 mb-3">Benefits</p>
          <div className="space-y-2">
            {dir.benefits.map((b, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="text-emerald-500 text-base leading-snug flex-shrink-0">✓</span>
                <p className="text-[13px] text-stone-700 leading-snug">{b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Avoid */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-50">
          <p className="text-[11px] uppercase tracking-widest font-bold text-red-600 mb-3">Avoid</p>
          <div className="space-y-2">
            {dir.avoid.map((a, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="text-red-400 text-base leading-snug flex-shrink-0">✕</span>
                <p className="text-[13px] text-stone-700 leading-snug">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Guidance */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-50">
          <p className="text-[11px] uppercase tracking-widest font-bold text-amber-700 mb-3">
            Practical Vastu Guidance
          </p>
          <div className="space-y-2">
            {dir.guidance.map((g, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="text-amber-500 text-sm leading-snug flex-shrink-0 mt-0.5">✦</span>
                <p className="text-[13px] text-stone-700 leading-snug">{g}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mini Chakra */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-50 flex flex-col items-center gap-2">
          <p className="text-[11px] uppercase tracking-widest font-bold text-stone-400">Vastu Chakra</p>
          <MiniChakra activeKey={dir.key} />
          <p className="text-[12px] text-stone-400 text-center">
            {dir.shortLabel} highlighted on the 16-direction Vastu wheel
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate("/vastu")}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold text-[15px] border-2 border-stone-900 text-stone-900 bg-transparent active:scale-[0.98] transition-transform"
        >
          🧭 Open Vastu Compass
        </button>
      </div>
    </AppShell>
  );
};

export default AppVastuDirection;
