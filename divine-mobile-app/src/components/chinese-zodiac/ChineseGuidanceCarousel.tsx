import React from "react";
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  Heart,
  Briefcase,
  Coins,
  Activity,
  Sparkles,
  HelpCircle,
  LucideIcon
} from "lucide-react";

interface CardItem {
  icon: string;
  title: string;
  text: string;
}

type Props = {
  cards: CardItem[];
  accentColor?: string;
};

const ICON_MAP: Record<string, LucideIcon> = {
  Shield: Shield,
  AlertTriangle: AlertTriangle,
  TrendingUp: TrendingUp,
  Heart: Heart,
  Briefcase: Briefcase,
  Coins: Coins,
  Activity: Activity,
  Sparkles: Sparkles,
};

export const ChineseGuidanceCarousel: React.FC<Props> = ({ cards, accentColor = "#D97706" }) => {
  return (
    <div className="w-full relative">
      {/* Horizontal scroll container with snaps */}
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-1 pb-5 w-full">
        {cards.map((card, idx) => {
          const IconComponent = ICON_MAP[card.icon] || HelpCircle;

          // Define color themes per card type to make it feel premium
          let cardColor = "text-amber-600 bg-amber-50";
          if (card.icon === "AlertTriangle") {
            cardColor = "text-rose-600 bg-rose-50";
          } else if (card.icon === "Heart") {
            cardColor = "text-pink-600 bg-pink-50";
          } else if (card.icon === "TrendingUp" || card.icon === "Briefcase") {
            cardColor = "text-indigo-600 bg-indigo-50";
          } else if (card.icon === "Coins") {
            cardColor = "text-emerald-600 bg-emerald-50";
          }

          return (
            <div
              key={idx}
              className="flex-shrink-0 w-[260px] snap-center rounded-3xl border border-stone-100 bg-white p-6 shadow-md shadow-stone-100/50 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Icon Circle */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cardColor}`}>
                  <IconComponent size={24} />
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider">{card.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-body">
                    {card.text}
                  </p>
                </div>
              </div>

              {/* Decorative bottom line */}
              <div className="mt-6 w-8 h-1 rounded-full" style={{ backgroundColor: accentColor }} />
            </div>
          );
        })}
      </div>
      
      {/* Swipe hint */}
      <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest pointer-events-none select-none mt-1">
        <span>Swipe for more</span>
        <div className="flex gap-0.5">
          <span className="w-1 h-1 rounded-full bg-stone-300 animate-ping" />
          <span className="w-1 h-1 rounded-full bg-stone-300" />
          <span className="w-1 h-1 rounded-full bg-stone-300" />
        </div>
      </div>
    </div>
  );
};

export default ChineseGuidanceCarousel;
