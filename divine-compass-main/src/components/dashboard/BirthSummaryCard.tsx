import React from "react";
import { UserProfile } from "../../types/user";
import { CosmicIdentity } from "../../types/kundli";
import { Link } from "react-router-dom";

interface BirthSummaryCardProps {
  profile: UserProfile | null;
  kundli: CosmicIdentity | null;
  isLoading: boolean;
  personName?: string;
}

export const BirthSummaryCard: React.FC<BirthSummaryCardProps> = ({
  profile,
  kundli,
  isLoading,
  personName,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 animate-pulse">
        <div className="h-3 bg-amber-100 rounded w-2/5 mb-3"></div>
        <div className="h-6 bg-slate-100 rounded w-1/2 mb-4"></div>
        <div className="h-20 bg-amber-50 rounded-xl"></div>
      </div>
    );
  }

  if (!profile || !kundli) return null;

  const birthDate = new Date(profile.birthDetails.date).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
      {/* Card header */}
      <div className="px-5 pt-5 pb-4 border-b border-amber-50">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-500 mb-1.5">
          ✦ Your Cosmic Identity
        </p>
        <h3 className="font-display text-[22px] font-bold text-stone-900 leading-none">
          {personName ? personName : "Birth Chart Overview"}
        </h3>
      </div>

      {/* Birth data strip */}
      <div className="px-5 py-4 bg-amber-50 border-b border-amber-100">
        <div className="grid grid-cols-2 gap-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-0.5">
              Date
            </p>
            <p className="text-[13px] font-semibold text-stone-800">{birthDate}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-0.5">
              Time
            </p>
            <p className="text-[13px] font-semibold text-stone-800">
              {formatTime(profile.birthDetails.time)}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-0.5">
              Place
            </p>
            <p className="text-[13px] font-semibold text-stone-800 truncate">
              {[profile.birthDetails.city, profile.birthDetails.state].filter(Boolean).join(", ") || profile.birthDetails.formattedAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Cosmic highlights — 3 equal tiles */}
      <div className="px-5 py-4 grid grid-cols-3 gap-2.5">
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-1">
            Rashi
          </p>
          <p className="text-[13px] font-bold text-orange-900 leading-snug">
            {kundli.moonSign}
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold mb-1">
            Nakshatra
          </p>
          <p className="text-[13px] font-bold text-indigo-900 leading-snug">
            {kundli.nakshatra}
          </p>
        </div>
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-rose-500 font-bold mb-1">
            Lagna
          </p>
          <p className="text-[13px] font-bold text-rose-900 leading-snug">
            {kundli.lagna}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Link
          to="/app/kundali-report"
          className="block w-full py-3.5 text-center rounded-xl bg-stone-900 text-white text-[14px] font-bold tracking-wide hover:bg-stone-800 active:bg-stone-950 transition-colors"
        >
          Dive Deeper Into Your Chart →
        </Link>
      </div>
    </div>
  );
};
