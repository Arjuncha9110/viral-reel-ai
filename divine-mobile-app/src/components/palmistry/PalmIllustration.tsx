import React from "react";

export type PalmLine =
  | "health-line"
  | "heart-line"
  | "life-line"
  | "head-line"
  | "fate-line"
  | "none"
  | "others";

interface PalmIllustrationProps {
  activeLine: PalmLine;
  className?: string;
  label?: string;
  /** compact=true → small circular badge for the main /palmistry hero */
  compact?: boolean;
}

// ── Label text shown below the palm on detail pages ──────────────────────────
const LINE_LABELS: Record<PalmLine, string> = {
  "health-line": "HEALTH LINE",
  "heart-line":  "HEART LINE",
  "life-line":   "LIFE LINE",
  "head-line":   "HEAD LINE",
  "fate-line":   "FATE LINE",
  "others":      "OTHER SIGNS",
  "none":        "",
};

// ── Stroke colour for each line ──────────────────────────────────────────────
const LINE_COLORS: Record<PalmLine, string> = {
  "health-line": "#0FA79A",
  "heart-line":  "#E94E7A",
  "life-line":   "#F59E0B",
  "head-line":   "#238BD0",
  "fate-line":   "#E96B1D",
  "others":      "#3B55A4",
  "none":        "transparent",
};

// ── SVG paths — viewBox 0 0 1024 1536
// Palm-base-clean.png is portrait, thumb on the LEFT.
// Coordinates calibrated against reference screenshots.
// Palm skin region: roughly x:215–815, y:155–1360.
const LINE_PATH: Record<string, React.ReactNode> = {

  // Health Line – diagonal inside lower-right palm toward Mercury/little-finger mount
  // Ref: straight-ish diagonal from lower-centre to upper-right
  "health-line": (
    <path d="M630 1080 L735 810" />
  ),

  // Heart Line – gently curved across upper palm just below the finger mounts
  // Ref: starts left (index side), ends right (little finger side), gentle bow upward
  "heart-line": (
    <path d="M788 788 C680 780, 520 700, 480 645" />
  ),

  // Life Line – curves tightly around the thumb mound on the LEFT side
  // Ref: arc starting near index-thumb junction, sweeping down-left to wrist
  "life-line": (
    <path d="M398 750 C350 820, 330 1050, 525 1245" />
  ),

  // Head/Brain Line – diagonal from thumb-index junction downward to outer palm
  // Ref: NOT horizontal — starts upper-left and slopes down to lower-right
  "head-line": (
    <path d="M398 750 C480 780, 580 850, 660 945" />
  ),

  // Fate Line – near-straight vertical through the centre of the palm
  // Ref: thin red vertical line from lower palm up toward middle finger
  "fate-line": (
    <path d="M555 1230 L548 660" />
  ),

  // Others – two minor curved arcs near the thumb mound (A & B as in reference)
  // Line A: leftmost arc (blue), Line B: slightly right/inner arc (dark)
  "others": (
    <>
      <path d="M405 780 C365 870, 380 1020, 465 1170" stroke="#3B55A4" strokeWidth="6" fill="none" />
      <path d="M442 750 C490 850, 495 980, 510 1110" stroke="#2D2A26" strokeWidth="6" fill="none" />
    </>
  ),

};


// ── Base image path (Image 2: clean palm, no text, no baked lines) ────────────
const BASE_IMAGE = "/images/palmistry/palm-base-clean.png";

// =============================================================================
const PalmIllustration: React.FC<PalmIllustrationProps> = ({
  activeLine,
  className = "",
  label,
  compact = false,
}) => {
  const activeColor = LINE_COLORS[activeLine] ?? "transparent";
  const activeLabel = label ?? LINE_LABELS[activeLine] ?? "";

  // ── COMPACT: small circular badge for the /palmistry hero ──────────────────
  if (compact) {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        {/* Gold ambient glow */}
        <div
          className="absolute inset-0 rounded-full -z-10"
          style={{
            background:
              "radial-gradient(circle, rgba(251,146,60,0.3) 0%, transparent 70%)",
            transform: "scale(1.55)",
          }}
        />
        {/* Circular image */}
        <img
          src={BASE_IMAGE}
          alt="Palmistry"
          className="w-[108px] h-[108px] rounded-full object-cover shadow-lg"
          style={{
            border:       "4px solid rgba(255,255,255,0.92)",
            boxShadow:    "0 8px 28px rgba(0,0,0,0.13)",
            objectPosition: "center 15%",
          }}
        />
      </div>
    );
  }

  // ── FULL: large detail-page illustration ────────────────────────────────────
  return (
    <div className={`flex flex-col items-center gap-4 w-full ${className}`}>

      {/* Image + SVG overlay — single container, identical sizing */}
      <div className="relative mx-auto w-full max-w-[380px]">
        {/* Clean base palm image */}
        <img
          src={BASE_IMAGE}
          alt={`${activeLabel || "Palmistry"} illustration`}
          className="block w-full object-contain drop-shadow-xl"
        />

        {/* Dynamic SVG line overlay — inset-0, exact same area as image */}
        {activeLine !== "none" && (
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none"
            viewBox="0 0 1024 1536"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* No heavy glow — lines are premium thin */}
            <g
              stroke={activeColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.95"
              style={{ transition: "stroke 0.4s ease" }}
            >
              {LINE_PATH[activeLine]}
            </g>
          </svg>
        )}
      </div>

      {/* Dynamic label chip */}
      {activeLine !== "none" && activeLabel && (
        <div
          className="flex items-center gap-2 px-5 py-2 rounded-full text-white text-[12px] font-bold tracking-[0.18em] shadow-lg"
          style={{ backgroundColor: activeColor }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
          {activeLabel}
        </div>
      )}
    </div>
  );
};

export default PalmIllustration;
