import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { VASTU_DIRECTIONS, getVastuDir, GUNA_COLOR, GUNA_BG, type VastuDir } from "../../data/vastuDirections";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { BottomNav } from "../../components/dashboard/BottomNav";

// ── SVG geometry ──────────────────────────────────────────────────────────────
const CX = 190, CY = 190;
const R_DIR_OUT  = 178;   // outer edge of direction ring
const R_DIR_IN   = 114;   // inner / outer of guna ring
const R_GUNA_IN  = 78;    // inner / outer of element ring
const R_ELEM_IN  = 52;    // inner / outer of center
const R_CENTER   = 49;    // white hub

// Text radii
const R_DIR_LBL  = 145;   // direction short label
const R_KEY_LBL  = 122;   // keyword
const R_GUNA_LBL = 95;    // guna text
const R_ELEM_LBL = 63;    // element text

// ── Helpers ───────────────────────────────────────────────────────────────────
function toRad(deg: number) { return (deg - 90) * Math.PI / 180; }

/** Annular sector path (ring segment) */
function sector(r1: number, r2: number, startDeg: number, endDeg: number) {
  let ed = endDeg;
  if (ed <= startDeg) ed += 360;
  const span = ed - startDeg;
  const lg = span > 180 ? 1 : 0;
  const s = toRad(startDeg), e = toRad(endDeg);
  const f = (n: number) => n.toFixed(2);
  const ox1 = CX + r2 * Math.cos(s), oy1 = CY + r2 * Math.sin(s);
  const ox2 = CX + r2 * Math.cos(e), oy2 = CY + r2 * Math.sin(e);
  const ix1 = CX + r1 * Math.cos(e), iy1 = CY + r1 * Math.sin(e);
  const ix2 = CX + r1 * Math.cos(s), iy2 = CY + r1 * Math.sin(s);
  return `M${f(ox1)} ${f(oy1)} A${r2} ${r2} 0 ${lg} 1 ${f(ox2)} ${f(oy2)} L${f(ix1)} ${f(iy1)} A${r1} ${r1} 0 ${lg} 0 ${f(ix2)} ${f(iy2)}Z`;
}

/** Middle angle of a zone (handles wrap) */
function midDeg(start: number, end: number) {
  let e = end;
  if (e < start) e += 360;
  return ((start + e) / 2) % 360;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const KEYWORDS: Record<string, string> = {
  N: "Wealth",   NNE: "Immunity", NE: "Wisdom",  ENE: "Joy",
  E: "Network",  ESE: "Money",    SE: "Energy",  SSE: "Karma",
  S: "Fame",     SSW: "Release",  SW: "Power",   WSW: "Love",
  W: "Growth",   WNW: "Rest",     NW: "Support", NNW: "Flow",
};

// Guna zones — boundaries aligned to segment edges (±11.25° from dir center)
const GUNA_ZONES = [
  { name: "Sattva", startDeg: 303.75, endDeg: 56.25  },  // NW → NE (5 dirs)
  { name: "Kapha",  startDeg: 56.25,  endDeg: 123.75 },  // ENE → ESE (3 dirs)
  { name: "Pitta",  startDeg: 123.75, endDeg: 213.75 },  // SE → SSW (4 dirs)
  { name: "Tamas",  startDeg: 213.75, endDeg: 258.75 },  // SW → WSW (2 dirs)
  { name: "Rajas",  startDeg: 258.75, endDeg: 303.75 },  // W → WNW (2 dirs)
];

const ELEMENT_ZONES = [
  { name: "WATER", startDeg: 348.75, endDeg: 56.25,  color: "#1d4ed8" },  // N–NNE–NE
  { name: "AIR",   startDeg: 56.25,  endDeg: 146.25, color: "#15803d" },  // ENE–E–ESE–SE
  { name: "FIRE",  startDeg: 146.25, endDeg: 213.75, color: "#b91c1c" },  // SSE–S–SSW
  { name: "EARTH", startDeg: 213.75, endDeg: 281.25, color: "#92400e" },  // SW–WSW–W
  { name: "SPACE", startDeg: 281.25, endDeg: 348.75, color: "#6d28d9" },  // WNW–NW–NNW
];

const CARDINALS = new Set(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]);

// Segment fill: two alternating warm golds
function segFill(key: string, active: boolean) {
  if (active) return "#f59e0b";
  return CARDINALS.has(key) ? "#d4a843" : "#ddb84e";
}

// ── Component ─────────────────────────────────────────────────────────────────
const AppVastuCompass: React.FC = () => {
  const navigate = useNavigate();
  const [heading, setHeading]       = useState(0);
  const [activeDir, setActiveDir]   = useState<VastuDir>(VASTU_DIRECTIONS[0]);
  const [permState, setPermState]   = useState<"ask" | "granted" | "na">("ask");
  const [demoMode, setDemoMode]     = useState(false);
  const demoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onOrientation = useCallback((e: DeviceOrientationEvent) => {
    const ios = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
    const h = ios != null ? ios : e.alpha != null ? (360 - e.alpha) % 360 : null;
    if (h != null) { setHeading(h); setActiveDir(getVastuDir(h)); }
  }, []);

  useEffect(() => {
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DOE.requestPermission === "function") {
      setPermState("ask");
    } else if (typeof window.DeviceOrientationEvent !== "undefined") {
      window.addEventListener("deviceorientation", onOrientation, true);
      setPermState("granted");
    } else {
      setPermState("na"); setDemoMode(true);
    }
    return () => window.removeEventListener("deviceorientation", onOrientation, true);
  }, [onOrientation]);

  const requestPerm = async () => {
    const DOE = DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> };
    const res = await DOE.requestPermission().catch(() => "denied");
    if (res === "granted") { window.addEventListener("deviceorientation", onOrientation, true); setPermState("granted"); }
    else { setPermState("na"); setDemoMode(true); }
  };

  useEffect(() => {
    if (!demoMode) { if (demoRef.current) clearInterval(demoRef.current); return; }
    demoRef.current = setInterval(() => setHeading(h => { const n = (h + 0.5) % 360; setActiveDir(getVastuDir(n)); return n; }), 60);
    return () => { if (demoRef.current) clearInterval(demoRef.current); };
  }, [demoMode]);

  const deg = Math.round(heading);
  const gunaColor = GUNA_COLOR[activeDir.guna];
  const gunaBg = GUNA_BG[activeDir.guna];

  return (
    <div
      className="min-h-screen flex flex-col font-body"
      style={{ maxWidth: 430, margin: "0 auto", background: "linear-gradient(175deg, #fef5e4 0%, #fae9c8 50%, #faeacb 100%)" }}
    >
      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/60 backdrop-blur border border-amber-200"
        >
          <ArrowLeft size={17} className="text-stone-700" />
        </button>
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-amber-700/60">Divine Panchang</p>
          <h1 className="font-display text-[20px] font-bold text-stone-900 leading-tight">Vastu Compass</h1>
        </div>
      </div>

      {/* ── iOS permission prompt ── */}
      {permState === "ask" && (
        <button
          onClick={requestPerm}
          className="mx-5 mb-2 flex items-center gap-3 rounded-2xl bg-stone-900 px-4 py-3 text-left"
        >
          <span className="text-lg">🧭</span>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-white">Enable Live Compass</p>
            <p className="text-[11px] text-white/50">Tap to allow device orientation</p>
          </div>
          <ChevronRight size={15} className="text-amber-400" />
        </button>
      )}

      {/* ── Heading display ── */}
      <div className="text-center px-5 pt-2 pb-1">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-700/60">Vastu Chakra Direction</p>
        <p className="font-display text-[42px] font-bold text-stone-900 leading-tight">
          {deg}° <span className="text-[32px] text-amber-700">{activeDir.shortLabel}</span>
        </p>
      </div>

      {/* ── Sacred Vastu Chakra SVG ── */}
      <div className="px-3 flex-shrink-0">
        <div className="relative" style={{ width: "100%", aspectRatio: "1" }}>
          {/* Static multi-ring wheel */}
          <svg
            viewBox="0 0 380 380"
            width="100%"
            className="absolute inset-0"
          >
            <defs>
              <filter id="segGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* ── Outer golden rim ── */}
            <circle cx={CX} cy={CY} r={R_DIR_OUT + 6} fill="#c8921e" />
            <circle cx={CX} cy={CY} r={R_DIR_OUT + 3} fill="#fef5e4" />
            <circle cx={CX} cy={CY} r={R_DIR_OUT + 1} fill="#c8921e" opacity="0.5" />

            {/* ── Direction ring (16 annular segments) ── */}
            {VASTU_DIRECTIONS.map((dir) => {
              const isActive = dir.key === activeDir.key;
              return (
                <path
                  key={dir.key}
                  d={sector(R_DIR_IN, R_DIR_OUT, dir.deg - 11.25, dir.deg + 11.25)}
                  fill={segFill(dir.key, isActive)}
                  stroke="#fef5e4"
                  strokeWidth="1.5"
                  style={isActive ? { filter: "url(#segGlow)" } : undefined}
                />
              );
            })}

            {/* Direction short labels (rotated radially) */}
            {VASTU_DIRECTIONS.map((dir) => (
              <text
                key={dir.key + "-lbl"}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="'Outfit', sans-serif"
                fontSize={CARDINALS.has(dir.key) ? "10.5" : "9"}
                fontWeight="700"
                fill={dir.key === activeDir.key ? "#1a2040" : "#1a2040"}
                opacity={dir.key === activeDir.key ? 1 : 0.82}
                transform={`rotate(${dir.deg} ${CX} ${CY})`}
                x={CX}
                y={CY - R_DIR_LBL}
              >
                {dir.shortLabel}
              </text>
            ))}

            {/* Keyword labels */}
            {VASTU_DIRECTIONS.map((dir) => (
              <text
                key={dir.key + "-kw"}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="'Outfit', sans-serif"
                fontSize="7"
                fontWeight="500"
                fill="#1a2040"
                opacity="0.6"
                transform={`rotate(${dir.deg} ${CX} ${CY})`}
                x={CX}
                y={CY - R_KEY_LBL}
              >
                {KEYWORDS[dir.key]}
              </text>
            ))}

            {/* Separator ring between direction and guna */}
            <circle cx={CX} cy={CY} r={R_DIR_IN} fill="none" stroke="#fef5e4" strokeWidth="3" />

            {/* ── Guna ring ── */}
            {GUNA_ZONES.map((z) => (
              <path
                key={z.name}
                d={sector(R_GUNA_IN, R_DIR_IN, z.startDeg, z.endDeg)}
                fill="#d4a843"
                stroke="#fef5e4"
                strokeWidth="1"
              />
            ))}

            {/* Guna labels */}
            {GUNA_ZONES.map((z) => {
              const md = midDeg(z.startDeg, z.endDeg);
              return (
                <text
                  key={z.name + "-lbl"}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="'Cormorant Garamond', serif"
                  fontSize="9.5"
                  fontWeight="600"
                  fontStyle="italic"
                  fill="#1a2040"
                  opacity="0.85"
                  transform={`rotate(${md} ${CX} ${CY})`}
                  x={CX}
                  y={CY - R_GUNA_LBL}
                >
                  {z.name}
                </text>
              );
            })}

            {/* Separator ring between guna and element */}
            <circle cx={CX} cy={CY} r={R_GUNA_IN} fill="none" stroke="#fef5e4" strokeWidth="2.5" />

            {/* ── Element ring ── */}
            {ELEMENT_ZONES.map((z) => (
              <path
                key={z.name}
                d={sector(R_ELEM_IN, R_GUNA_IN, z.startDeg, z.endDeg)}
                fill="#deb754"
                stroke="#fef5e4"
                strokeWidth="1"
              />
            ))}

            {/* Element labels with colored text */}
            {ELEMENT_ZONES.map((z) => {
              const md = midDeg(z.startDeg, z.endDeg);
              return (
                <text
                  key={z.name + "-lbl"}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="'Outfit', sans-serif"
                  fontSize="8"
                  fontWeight="700"
                  fill={z.color}
                  transform={`rotate(${md} ${CX} ${CY})`}
                  x={CX}
                  y={CY - R_ELEM_LBL}
                >
                  {z.name}
                </text>
              );
            })}

            {/* Separator ring between element and center */}
            <circle cx={CX} cy={CY} r={R_ELEM_IN} fill="none" stroke="#fef5e4" strokeWidth="2.5" />

            {/* ── White center hub ── */}
            <circle cx={CX} cy={CY} r={R_CENTER} fill="white" />
            <circle cx={CX} cy={CY} r={R_CENTER - 3} fill="none" stroke="#d4a843" strokeWidth="0.75" opacity="0.6" />
          </svg>

          {/* ── Rotating compass needle (separate layer) ── */}
          <svg
            viewBox="0 0 380 380"
            width="100%"
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `rotate(${heading}deg)`,
              transformOrigin: "50% 50%",
              transition: "transform 0.15s ease-out",
            }}
          >
            {/* Top (north) point — dark navy */}
            <polygon
              points={`${CX},${CY - 68} ${CX - 5},${CY - 5} ${CX + 5},${CY - 5}`}
              fill="#1e2b5e"
              style={{ filter: "drop-shadow(0 0 3px rgba(30,43,94,0.5))" }}
            />
            {/* Bottom counter-point — lighter */}
            <polygon
              points={`${CX},${CY + 40} ${CX - 4},${CY + 6} ${CX + 4},${CY + 6}`}
              fill="#8c9ec8"
            />
            {/* Pivot rings */}
            <circle cx={CX} cy={CY} r={7} fill="#1e2b5e" />
            <circle cx={CX} cy={CY} r={4} fill="white" />
            <circle cx={CX} cy={CY} r={1.5} fill="#1e2b5e" />
          </svg>
        </div>
      </div>

      {/* ── Active direction badge ── */}
      <div className="flex items-center justify-center gap-2 px-5 mt-1">
        <span className="text-xl">{activeDir.elementIcon}</span>
        <span className="font-display text-[18px] font-bold text-stone-900">{activeDir.label}</span>
        <span
          className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: gunaBg, color: gunaColor }}
        >
          {activeDir.guna}
        </span>
      </div>
      <p className="text-center text-[11px] text-stone-400 mt-0.5">
        {activeDir.sanskrit} · Lord {activeDir.lord}
      </p>

      {/* ── CTA area ── */}
      <div className="mt-auto px-5 pb-4 pt-4 space-y-3">
        <div className="text-center">
          <p className="text-[14px] font-semibold text-stone-700">Want to see more details?</p>
          <p className="text-[11px] text-stone-400">Explore {activeDir.label} direction insights</p>
        </div>
        <button
          onClick={() => navigate(`/vastu/${activeDir.key}`)}
          className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-bold text-[15px] text-white shadow-md active:scale-[0.98] transition-transform"
          style={{ background: "linear-gradient(135deg, #1e2b5e 0%, #2a3f8e 100%)" }}
        >
          Check Direction Details
          <ChevronRight size={18} className="opacity-80" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default AppVastuCompass;
