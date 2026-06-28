import React from "react";
import { Link } from "react-router-dom";
import { Heart, Activity, Shield, Brain, Star, Layers, ArrowRight } from "lucide-react";

interface PalmistryCategoryCardProps {
  slug: string;
  title: string;
  description: string;
  theme: string;
  icon: string;
}

const getIcon = (iconName: string, className: string) => {
  switch (iconName) {
    case "health":     return <Activity className={className} />;
    case "heart":      return <Heart className={className} />;
    case "life":       return <Shield className={className} />;
    case "brain":      return <Brain className={className} />;
    case "star":       return <Star className={className} />;
    default:           return <Layers className={className} />;
  }
};

// Theme: { gradient, icon bg, icon color, accent text, decorLine color, keyword }
const THEMES: Record<string, {
  gradient: string;
  iconBg: string;
  iconColor: string;
  accent: string;
  decor: string;
  keyword: string;
}> = {
  emerald: {
    gradient: "linear-gradient(135deg, #f0fdf8 0%, #ccfbef 100%)",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    accent: "text-teal-700",
    decor: "#5eead4",
    keyword: "Vitality",
  },
  rose: {
    gradient: "linear-gradient(135deg, #fff0f3 0%, #ffe4e9 100%)",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    accent: "text-rose-700",
    decor: "#fda4af",
    keyword: "Emotion",
  },
  amber: {
    gradient: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    accent: "text-amber-700",
    decor: "#fcd34d",
    keyword: "Energy",
  },
  sky: {
    gradient: "linear-gradient(135deg, #f0f9ff 0%, #dbeafe 100%)",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    accent: "text-sky-700",
    decor: "#93c5fd",
    keyword: "Intellect",
  },
  orange: {
    gradient: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    accent: "text-orange-700",
    decor: "#fb923c",
    keyword: "Destiny",
  },
  purple: {
    gradient: "linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%)",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    accent: "text-violet-700",
    decor: "#c4b5fd",
    keyword: "Signs",
  },
};

const PalmistryCategoryCard: React.FC<PalmistryCategoryCardProps> = ({ slug, title, description, theme, icon }) => {
  const t = THEMES[theme] ?? THEMES.purple;

  return (
    <Link
      to={`/palmistry/${slug}`}
      className="relative block rounded-3xl overflow-hidden shadow-sm border border-white/60 active:scale-[0.98] transition-all duration-200 hover:shadow-md"
      style={{ background: t.gradient }}
    >
      {/* Decorative curved line art in corner */}
      <svg
        className="absolute top-0 right-0 pointer-events-none"
        width="80"
        height="80"
        viewBox="0 0 80 80"
        fill="none"
      >
        <path
          d="M80 0 C60 10 20 30 0 80"
          stroke={t.decor}
          strokeWidth="28"
          opacity="0.18"
          strokeLinecap="round"
        />
        <circle cx="68" cy="12" r="6" fill={t.decor} opacity="0.15" />
      </svg>

      <div className="relative z-10 p-4">
        {/* Keyword chip top-right */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-11 h-11 rounded-2xl ${t.iconBg} flex items-center justify-center shadow-sm`}>
            {getIcon(icon, `w-5 h-5 ${t.iconColor}`)}
          </div>
          <span
            className={`text-[9px] font-bold uppercase tracking-widest ${t.accent} bg-white/70 backdrop-blur rounded-full px-2 py-0.5 mt-1`}
          >
            {t.keyword}
          </span>
        </div>

        <h3 className="font-bold text-stone-900 text-[15px] leading-snug mb-1">{title}</h3>
        <p className="text-[12px] text-stone-500 leading-snug mb-3">{description}</p>

        <div className={`flex items-center gap-1 text-[12px] font-bold ${t.accent}`}>
          Explore
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
};

export default PalmistryCategoryCard;
