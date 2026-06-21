import React from "react";
import { UserProfile } from "../../types/user";
import { Bell } from "lucide-react";

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
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Suprabhatam" : hour < 17 ? "Shubh Aparahna" : "Shubh Sandhya";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "short",
  });

  const displayName = profile?.profile?.displayName?.split(" ")[0] || "Seeker";
  const location    = profile?.birthDetails?.city || "";
  const tithiLine   =
    tithiName || pakshaName
      ? [tithiName, pakshaName].filter(Boolean).join(" · ")
      : null;

  return (
    <header
      style={{
        background: "linear-gradient(160deg, #FFF6E0 0%, #FFE082 60%, #FFCA28 100%)",
      }}
    >
      {/* Top row */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between">
        {/* Logo + name */}
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-srichakra.png"
            alt="Divine Panchang"
            className="w-9 h-9 rounded-full object-cover shadow-sm"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          <div>
            <p className="font-display text-[16px] font-bold text-[#0E1A3A] leading-none">
              Divine Panchang
            </p>
            <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-amber-700/60 mt-0.5">
              Ancient Vedic Wisdom
            </p>
          </div>
        </div>

        {/* Avatar + bell */}
        <div className="flex items-center gap-2">
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(14,26,58,0.07)" }}
          >
            <Bell className="w-4 h-4 text-[#0E1A3A]/60" />
          </button>
          <div className="relative">
            {profile?.profile?.photoURL ? (
              <img
                src={profile.profile.photoURL}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-white object-cover shadow-sm"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-base shadow-sm"
                style={{ background: "linear-gradient(135deg, #3658B5, #1E3A8A)" }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white"
              style={{ background: "#22C55E" }}
            />
          </div>
        </div>
      </div>

      {/* Greeting + date */}
      <div className="px-5 pb-7 pt-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-800/50 mb-1">
          {today}{location ? ` · ${location}` : ""}
        </p>
        <h1
          className="font-display font-bold text-[#0E1A3A] leading-tight tracking-tight"
          style={{ fontSize: 30 }}
        >
          {greeting},
          <br />
          <span style={{ color: "#B45309" }}>{displayName} 🙏</span>
        </h1>
        {tithiLine && (
          <p className="text-[12px] text-amber-800/55 font-medium mt-2">
            ☽ {tithiLine}
          </p>
        )}
      </div>
    </header>
  );
};
