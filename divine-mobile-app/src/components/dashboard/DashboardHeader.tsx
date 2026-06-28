import React from "react";
import { UserProfile } from "../../types/user";
import { Calendar, MapPin } from "lucide-react";

interface DashboardHeaderProps {
  profile: UserProfile | null;
  tithiName?: string;
  pakshaName?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  profile,
  tithiName,
  pakshaName,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Suprabhatam";
    if (hour < 17) return "Shubh Aparahna";
    return "Shubh Sandhya";
  };

  const today = new Date();
  const gregorianDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const displayName = profile?.profile?.displayName?.split(" ")[0] || "Seeker";
  const location = profile?.birthDetails?.city || "";
  const tithiLine =
    tithiName || pakshaName
      ? [tithiName, pakshaName].filter(Boolean).join(" · ")
      : null;

  return (
    <div className="bg-[#FFF8F0] border-b border-amber-100/80">
      {/* App brand bar */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
        {/* Logo + app name */}
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-srichakra.png"
            alt="Divine Panchang"
            className="w-9 h-9 rounded-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div>
            <p className="font-display text-[17px] font-bold text-stone-900 leading-none">
              Divine Panchang
            </p>
            <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-amber-600 mt-0.5">
              ✦ Ancient Vedic Wisdom ✦
            </p>
          </div>
        </div>

        {/* User avatar */}
        {profile?.profile?.photoURL ? (
          <img
            src={profile.profile.photoURL}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-amber-300 object-cover shadow-sm flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full border-2 border-amber-300 bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-base shadow-sm flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Greeting + name */}
      <div className="px-5 pb-3">
        <h1 className="font-display text-[26px] font-bold text-stone-900 leading-snug">
          {getGreeting()},{" "}
          <span className="text-amber-700">{displayName}</span>
        </h1>
      </div>

      {/* Date / tithi / location strip */}
      <div className="px-5 pb-4 space-y-1">
        <div className="flex items-center gap-1.5 text-[13px] text-stone-500">
          <Calendar className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span>{gregorianDate}</span>
        </div>

        {tithiLine && (
          <div className="flex items-center gap-1.5 text-[13px] text-amber-700 font-medium">
            <span className="w-3.5 text-center text-amber-400 leading-none flex-shrink-0">☽</span>
            <span>{tithiLine}</span>
          </div>
        )}

        {location && (
          <div className="flex items-center gap-1.5 text-[12px] text-stone-400">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{location}</span>
          </div>
        )}
      </div>
    </div>
  );
};
