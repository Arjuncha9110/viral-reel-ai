/**
 * ServiceCard.tsx
 * Reusable pastel illustration card for the Services / Tools page.
 * Inspired by premium mobile astrology app design.
 */
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

export type CardTheme = "cream" | "blue" | "pink" | "mint" | "yellow" | "purple" | "dark" | "navy" | "sky" | "sage" | "peach";
export type CardSize  = "small" | "wide" | "large";

export interface ServiceCardProps {
  title: string;
  subtitle?: string;
  route: string;
  badge?: string;
  badgeColor?: string; // custom bg colour override e.g. "#22c55e"
  size?: CardSize;
  theme?: CardTheme;
  illustration?: React.ReactNode;
  className?: string;
}

// ── Theme map ─────────────────────────────────────────────────────────────────
const THEME: Record<CardTheme, { bg: string; isDark: boolean }> = {
  cream:  { bg: "#FFF3E0", isDark: false },
  blue:   { bg: "#D4EBFF", isDark: false },
  pink:   { bg: "#FFE0EC", isDark: false },
  mint:   { bg: "#D4F2E8", isDark: false },
  yellow: { bg: "#FFF0C0", isDark: false },
  purple: { bg: "#EAE0FF", isDark: false },
  sky:    { bg: "#D8F0FC", isDark: false },
  sage:   { bg: "#E0EDDF", isDark: false },
  peach:  { bg: "#FFE4D4", isDark: false },
  dark:   { bg: "linear-gradient(145deg, #1c0f02, #2d1805, #1a0e03)", isDark: true },
  navy:   { bg: "linear-gradient(145deg, #0d1535, #1a2050, #0a1020)", isDark: true },
};

const BADGE_DEFAULT_BG: Record<CardTheme, string> = {
  cream:  "#D97706",
  blue:   "#2563EB",
  pink:   "#E11D48",
  mint:   "#059669",
  yellow: "#D97706",
  purple: "#7C3AED",
  sky:    "#0284C7",
  sage:   "#16A34A",
  peach:  "#EA580C",
  dark:   "#F59E0B",
  navy:   "#60A5FA",
};

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  subtitle,
  route,
  badge,
  badgeColor,
  size = "small",
  theme = "cream",
  illustration,
  className,
}) => {
  const t = THEME[theme];
  const textColor = t.isDark ? "#FFFFFF" : "#0E1A3A";
  const subtitleColor = t.isDark ? "rgba(255,255,255,0.5)" : "rgba(14,26,58,0.45)";
  const sparkleColor = t.isDark ? "rgba(255,255,255,0.25)" : "rgba(14,26,58,0.12)";

  return (
    <Link
      to={route}
      className={cn(
        "relative overflow-hidden flex flex-col no-underline",
        "active:scale-[0.97] transition-transform duration-100",
        size === "wide" ? "col-span-2" : "col-span-1",
        className,
      )}
      style={{
        borderRadius: 24,
        minHeight: size === "wide" ? 150 : size === "large" ? 180 : 145,
        background: t.bg,
        textDecoration: "none",
      }}
    >
      {/* Sparkle dots */}
      <span
        className="absolute top-3 right-12 w-2 h-2 rounded-full pointer-events-none"
        style={{ background: sparkleColor }}
      />
      <span
        className="absolute top-6 right-7 w-1.5 h-1.5 rounded-full pointer-events-none"
        style={{ background: sparkleColor }}
      />
      <span
        className="absolute bottom-8 left-6 w-1 h-1 rounded-full pointer-events-none"
        style={{ background: sparkleColor }}
      />

      {/* Text content */}
      <div className="relative z-10 p-5 flex flex-col gap-1.5">
        {badge && (
          <span
            className="inline-block self-start px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white mb-0.5"
            style={{ background: badgeColor ?? BADGE_DEFAULT_BG[theme] }}
          >
            {badge}
          </span>
        )}
        <h3
          className="font-bold leading-tight"
          style={{
            fontSize: size === "wide" ? 22 : 20,
            color: textColor,
            maxWidth: illustration ? "65%" : "90%",
          }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className="text-[12px] leading-snug"
            style={{ color: subtitleColor, maxWidth: illustration ? "65%" : "90%" }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Illustration — absolute bottom-right */}
      {illustration && (
        <div className="absolute bottom-0 right-0 pointer-events-none select-none">
          {illustration}
        </div>
      )}

      {/* Bottom sparkle glyph */}
      <span
        className="absolute bottom-4 left-5 text-[13px] pointer-events-none select-none"
        style={{ color: sparkleColor, fontWeight: 700 }}
        aria-hidden
      >
        ✦
      </span>
    </Link>
  );
};

export default ServiceCard;
