import React from "react";
import { Link } from "react-router-dom";

interface QuickTool {
  title: string;
  subtitle: string;
  path: string;
  bg: string;
  emoji: string;
  wide?: boolean;
}

const TOOLS: QuickTool[] = [
  { title: "Daily Panchang",       subtitle: "Tithi & auspicious times", path: "/app/panchang",     bg: "#FFF0C0", emoji: "📅" },
  { title: "Janam Kundali",        subtitle: "Your birth chart",          path: "/kundali",          bg: "#FFE4D4", emoji: "⭐" },
  { title: "Sade Sati",            subtitle: "Saturn transit guide",      path: "/app/sade-sati",    bg: "#EAE0FF", emoji: "🪐" },
  { title: "Birth Numerology",     subtitle: "Life path & destiny",       path: "/birth-numerology", bg: "#D4F2E8", emoji: "🔢" },
  { title: "Chinese Horoscope",    subtitle: "2026 forecast",             path: "/horoscope",        bg: "#D4EBFF", emoji: "🐉", wide: true },
  { title: "Palmistry",            subtitle: "Hand line meanings",        path: "/palmistry",        bg: "#FFE0EC", emoji: "✋" },
  { title: "Pranayama",            subtitle: "Breathing & breathwork",    path: "/breathing",        bg: "#D4F2E8", emoji: "🌬️" },
  { title: "Divine AI Guru",       subtitle: "Vedic wisdom on demand",    path: "/divine-ai",        bg: "#1c0f02", emoji: "✨", wide: true },
];

export const QuickNavigationGrid: React.FC = () => {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700/70 mb-1.5 px-1">
        ✦ Sacred Tools
      </p>
      <h3 className="font-display text-[22px] font-bold text-[#0E1A3A] mb-4 px-1">
        Explore
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {TOOLS.map(tool => {
          const isDark = tool.bg.startsWith("#1") || tool.bg.startsWith("#0");
          const textColor    = isDark ? "#FFFFFF"               : "#0E1A3A";
          const subtitleClr  = isDark ? "rgba(255,255,255,0.5)" : "rgba(14,26,58,0.45)";

          return (
            <Link
              key={tool.path}
              to={tool.path}
              className={`relative overflow-hidden flex flex-col no-underline active:scale-[0.97] transition-transform duration-100 ${tool.wide ? "col-span-2" : "col-span-1"}`}
              style={{
                borderRadius: 22,
                minHeight: 130,
                background: isDark
                  ? "linear-gradient(145deg, #1c0f02, #2d1805, #1a0e03)"
                  : tool.bg,
                textDecoration: "none",
              }}
            >
              {/* Sparkle */}
              <span className="absolute top-3 right-10 w-2 h-2 rounded-full pointer-events-none"
                style={{ background: isDark ? "rgba(255,255,255,0.18)" : "rgba(14,26,58,0.09)" }} />
              <span className="absolute top-6 right-6 w-1.5 h-1.5 rounded-full pointer-events-none"
                style={{ background: isDark ? "rgba(255,255,255,0.12)" : "rgba(14,26,58,0.06)" }} />

              <div className="p-4 flex flex-col gap-1.5 flex-1">
                <span className="text-2xl leading-none mb-0.5">{tool.emoji}</span>
                <h4 style={{
                  fontSize: tool.wide ? 19 : 17, fontWeight: 700,
                  color: textColor, lineHeight: 1.25,
                  display: "-webkit-box", WebkitBoxOrient: "vertical" as const,
                  WebkitLineClamp: 2, overflow: "hidden",
                }}>
                  {tool.title}
                </h4>
                <p style={{ fontSize: 11, color: subtitleClr, lineHeight: 1.35 }}>
                  {tool.subtitle}
                </p>
              </div>

              {/* Bottom sparkle glyph */}
              <span className="absolute bottom-3 left-4 text-[12px] pointer-events-none select-none"
                style={{ color: isDark ? "rgba(255,255,255,0.2)" : "rgba(14,26,58,0.09)", fontWeight: 700 }}
                aria-hidden>✦</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
