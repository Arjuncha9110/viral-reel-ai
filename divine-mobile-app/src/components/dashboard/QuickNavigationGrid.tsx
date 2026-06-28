import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Star,
  TrendingUp,
  Hash,
  Calculator,
  ChevronRight,
} from "lucide-react";

interface ToolItem {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  path: string;
  iconBg: string;
  iconColor: string;
  featured?: boolean;
}

const TOOLS: ToolItem[] = [
  {
    title: "Daily Panchang",
    subtitle: "Tithi, Nakshatra, Yoga, Karana and auspicious times for your day.",
    icon: <CalendarDays className="w-5 h-5" />,
    path: "/panchang",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    title: "Janam Kundali",
    subtitle: "Your Vedic birth chart with accurate planetary placements.",
    icon: <Star className="w-5 h-5" />,
    path: "/kundali",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-700",
  },
  {
    title: "Sade Sati",
    subtitle: "Track Saturn's transit — understand its challenges and remedies.",
    icon: <TrendingUp className="w-5 h-5" />,
    path: "/sade-sati",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
  },
  {
    title: "Name Numerology",
    subtitle: "Vibrational science behind your name, personality and destiny numbers.",
    icon: <Hash className="w-5 h-5" />,
    path: "/name-numerology",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
  },
  {
    title: "Birth Numerology",
    subtitle: "Lifepath, Destiny, and Maturity numbers derived from your date of birth.",
    icon: <Calculator className="w-5 h-5" />,
    path: "/birth-numerology",
    iconBg: "bg-amber-600",
    iconColor: "text-white",
    featured: true,
  },
];

export const QuickNavigationGrid: React.FC = () => {
  return (
    <div className="pb-2">
      <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-600 mb-1.5 px-1">
        ✦ Sacred Vedic Tools
      </p>
      <h3 className="font-display text-[22px] font-bold text-stone-900 mb-4 px-1">
        Everything You Need
      </h3>

      <div className="space-y-2.5">
        {TOOLS.map((tool) => (
          <Link
            key={tool.path}
            to={tool.path}
            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all active:scale-[0.99] hover:shadow-md ${
              tool.featured
                ? "bg-amber-500 border-amber-400"
                : "bg-white border-amber-100"
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                tool.featured ? "bg-amber-600" : tool.iconBg
              }`}
            >
              <span className={tool.featured ? "text-white" : tool.iconColor}>
                {tool.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-[14px] font-bold leading-snug mb-0.5 ${
                  tool.featured ? "text-white" : "text-stone-900"
                }`}
              >
                {tool.title}
              </p>
              <p
                className={`text-[12px] leading-snug line-clamp-2 ${
                  tool.featured ? "text-amber-100" : "text-stone-400"
                }`}
              >
                {tool.subtitle}
              </p>
            </div>
            <ChevronRight
              className={`w-4 h-4 flex-shrink-0 ${
                tool.featured ? "text-amber-200" : "text-stone-300"
              }`}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};
