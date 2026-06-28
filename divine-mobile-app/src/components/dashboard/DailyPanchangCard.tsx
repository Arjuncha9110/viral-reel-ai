import React from "react";
import { PanchangData } from "../../lib/data/panchang";
import { Sun, Sunset, MoonStar, Moon, BadgeCheck } from "lucide-react";

interface DailyPanchangCardProps {
  panchangData: PanchangData | null;
  isLoading: boolean;
}

export const DailyPanchangCard: React.FC<DailyPanchangCardProps> = ({
  panchangData,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 animate-pulse">
        <div className="h-3 bg-amber-100 rounded w-2/5 mb-3"></div>
        <div className="h-6 bg-slate-100 rounded w-3/5 mb-4"></div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-amber-50 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!panchangData) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 text-center text-stone-400 text-sm py-10">
        Panchang data unavailable right now.
      </div>
    );
  }

  const currentTithi     = panchangData.tithi[0]?.name     || "—";
  const currentPaksha    = panchangData.tithi[0]?.paksha   || "";
  const currentNakshatra = panchangData.nakshatra[0]?.name || "—";
  const currentYoga      = panchangData.yoga[0]?.name      || "—";
  const currentKarana    = panchangData.karana[0]?.name    || "—";

  const GridCell = ({
    label,
    value,
    sub,
  }: {
    label: string;
    value: string;
    sub?: string;
  }) => (
    <div className="bg-amber-50 rounded-xl px-3.5 py-3 border border-amber-100">
      <p className="text-[10px] uppercase tracking-widest font-bold text-amber-600 mb-1">
        {label}
      </p>
      <p className="text-[15px] font-bold text-stone-900 leading-snug">{value}</p>
      {sub && (
        <p className="text-[11px] text-stone-400 mt-0.5">{sub}</p>
      )}
    </div>
  );

  const TimeCell = ({
    icon,
    label,
    value,
    iconClass = "",
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    iconClass?: string;
  }) => (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0 ${iconClass}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-stone-400 uppercase tracking-wide leading-none mb-0.5">
          {label}
        </p>
        <p className="text-[14px] font-bold text-stone-800 leading-tight">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
      {/* Card header */}
      <div className="px-5 pt-5 pb-4 border-b border-amber-50">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-500 mb-1.5">
          ✦ Sacred Daily Alignment
        </p>
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-[22px] font-bold text-stone-900 leading-none">
            Today's Panchang
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full whitespace-nowrap">
            {panchangData.day}
          </span>
        </div>
      </div>

      {/* 2×2 Panchang grid */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-2.5">
          <GridCell label="Tithi"     value={currentTithi}     sub={currentPaksha} />
          <GridCell label="Nakshatra" value={currentNakshatra} />
          <GridCell label="Yoga"      value={currentYoga}      />
          <GridCell label="Karana"    value={currentKarana}    />
        </div>
      </div>

      {/* Sun & Moon transit */}
      <div className="mx-5 mb-4 bg-stone-50 rounded-xl p-4 border border-stone-100">
        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-stone-400 mb-3">
          Sun &amp; Moon Transit
        </p>
        <div className="grid grid-cols-2 gap-3">
          <TimeCell icon={<Sun className="w-4 h-4" />}     iconClass="text-amber-500"  label="Sunrise"  value={panchangData.sunrise}  />
          <TimeCell icon={<Sunset className="w-4 h-4" />}  iconClass="text-orange-500" label="Sunset"   value={panchangData.sunset}   />
          <TimeCell icon={<MoonStar className="w-4 h-4" />} iconClass="text-indigo-400" label="Moonrise" value={panchangData.moonrise} />
          <TimeCell icon={<Moon className="w-4 h-4" />}    iconClass="text-slate-400"  label="Moonset"  value={panchangData.moonset}  />
        </div>
      </div>

      {/* Abhijit muhurat banner */}
      {panchangData.abhijitMuhurat && (
        <div className="mx-5 mb-4 bg-amber-500 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BadgeCheck className="w-5 h-5 text-white flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-amber-100">
                Auspicious Window
              </p>
              <p className="text-[15px] font-bold text-white leading-tight">Abhijit Muhurat</p>
            </div>
          </div>
          <span className="text-[14px] font-bold text-white whitespace-nowrap">
            {panchangData.abhijitMuhurat}
          </span>
        </div>
      )}

      {/* Cautionary periods */}
      <div className="px-5 pb-5">
        <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-rose-500 mb-2.5">
          Cautionary Periods
        </p>
        <div className="space-y-0.5">
          {[
            { label: "Rahu Kaal",   value: panchangData.rahuKaal   },
            { label: "Gulika Kaal", value: panchangData.gulikaKaal },
            { label: "Yamaganda",   value: panchangData.yamagandam },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0"
            >
              <span className="text-[13px] text-stone-500">{label}</span>
              <span className="text-[13px] font-semibold text-stone-700 tabular-nums">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
