import React from "react";
import { Link } from "react-router-dom";
import { ChineseZodiacSign } from "../../data/chineseZodiacData";
import { ChineseAnimalIllustration } from "./ChineseAnimalIllustration";
import { ChevronRight } from "lucide-react";

type Props = {
  sign: ChineseZodiacSign;
};

export const ChineseZodiacCard: React.FC<Props> = ({ sign }) => {
  return (
    <Link
      to={`/chinese-horoscope/${sign.slug}`}
      className="flex flex-col items-center justify-between rounded-2xl border border-amber-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow active:scale-[0.98] transition-transform text-center relative overflow-hidden"
    >
      {/* Decorative circle watermark */}
      <div className="absolute -top-6 -right-6 w-12 h-12 rounded-full border border-amber-100/50 pointer-events-none" />

      {/* Emblem & Chinese Character Row */}
      <div className="relative mb-3 flex flex-col items-center">
        <ChineseAnimalIllustration sign={sign.slug} size="small" />
        <span className="absolute -bottom-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider bg-red-600 text-white shadow-sm border border-red-500/20">
          {sign.chineseCharacter}
        </span>
      </div>

      {/* Info */}
      <div className="mt-2 space-y-1 w-full">
        <p className="text-sm font-bold text-stone-900 leading-tight">{sign.name}</p>
        <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider truncate">
          {sign.years[sign.years.length - 2]}, {sign.years[sign.years.length - 1]}
        </p>
        <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed h-[34px] pt-1">
          {sign.shortDescription}
        </p>
      </div>

      {/* CTA Button */}
      <div className="mt-4 flex items-center justify-center gap-1 text-[11px] font-bold text-amber-600 group w-full pt-2 border-t border-stone-50">
        <span>Explore Guidance</span>
        <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
};

export default ChineseZodiacCard;
