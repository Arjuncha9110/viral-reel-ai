import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/userService";
import { kundliService } from "../services/kundliService";
import { UserProfile } from "../types/user";
import { CosmicIdentity } from "../types/kundli";
import { getSamplePanchangData } from "../lib/calculators/astrology/panchang";
import { PanchangData } from "../lib/data/panchang";
import { useNavigate } from "react-router-dom";

import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { DailyPanchangCard } from "../components/dashboard/DailyPanchangCard";
import { BirthSummaryCard } from "../components/dashboard/BirthSummaryCard";
import { QuickNavigationGrid } from "../components/dashboard/QuickNavigationGrid";
import { BottomNav } from "../components/dashboard/BottomNav";

// ─── Morning Ritual card (inline, data-free) ─────────────────────────────────
const MorningRitualCard: React.FC<{ sunriseTime?: string }> = ({ sunriseTime }) => {
  const navigate = useNavigate();
  return (
    <div
      className="relative overflow-hidden rounded-[24px] px-5 py-5"
      style={{
        background: "linear-gradient(135deg, #FFF8E7 0%, #FFEFC0 100%)",
        border: "1px solid rgba(251,191,36,0.25)",
      }}
    >
      {/* Subtle mandala watermark */}
      <div
        className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #F59E0B 0%, transparent 70%)",
          border: "2px solid #F59E0B",
        }}
      />

      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700/60 mb-1.5">
        🌅 Morning Ritual
      </p>
      <p
        className="font-display font-bold text-[#0E1A3A] mb-1"
        style={{ fontSize: 18, lineHeight: 1.3 }}
      >
        "ॐ सूर्याय नमः"
      </p>
      <p className="text-[12px] text-amber-900/50 mb-4">
        Begin your day with Vedic clarity.{sunriseTime ? ` Sunrise at ${sunriseTime}` : ""}
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => navigate("/breathing")}
          className="flex-1 py-2.5 rounded-[14px] text-[13px] font-bold text-white"
          style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", boxShadow: "0 3px 14px rgba(217,119,6,0.35)" }}
        >
          ▶ Begin Pranayama
        </button>
        <button
          onClick={() => navigate("/divine-ai")}
          className="px-4 py-2.5 rounded-[14px] text-[13px] font-bold text-amber-700"
          style={{ background: "rgba(217,119,6,0.10)", border: "1px solid rgba(217,119,6,0.2)" }}
        >
          AI Guide
        </button>
      </div>
    </div>
  );
};

// ─── Live Vedic Dashboard card (inline) ──────────────────────────────────────
const LiveVedicCard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate("/live-dashboard")}
      className="cursor-pointer group relative overflow-hidden rounded-[24px] p-5 active:scale-[0.98] transition-transform"
      style={{
        background: "linear-gradient(145deg, #1a0f30, #221040, #140b26)",
        border: "1px solid rgba(139,92,246,0.25)",
        boxShadow: "0 4px 24px rgba(20,11,38,0.4)",
      }}
    >
      {/* Glow orb */}
      <div className="absolute top-0 right-0 w-28 h-28 opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle at top right, #F59E0B, transparent 60%)" }} />

      <div className="relative z-10 flex justify-between items-start mb-3">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-amber-400"
          style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Live Now
        </div>
        <svg className="w-5 h-5 text-amber-500/70 group-hover:translate-x-1 transition-transform"
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <div className="relative z-10">
        <h3 className="font-display text-[20px] font-bold text-white mb-1">
          Live Vedic Dashboard
        </h3>
        <p className="text-[12px] text-amber-200/60">
          Swara · Tattwa · Hora · Vedic clock & sadhana alarms
        </p>
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile,    setProfile]    = useState<UserProfile | null>(null);
  const [kundli,     setKundli]     = useState<CosmicIdentity | null>(null);
  const [panchang,   setPanchang]   = useState<PanchangData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingPanchang, setIsLoadingPanchang] = useState(true);

  // Always open at top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!currentUser) { if (isMounted) setIsLoadingProfile(false); return; }
      try {
        const [userProfile, userKundli] = await Promise.all([
          userService.getUserProfile(currentUser.uid),
          kundliService.getKundli(currentUser.uid),
        ]);
        if (isMounted) {
          if (!userProfile || !userKundli) { navigate("/onboarding"); return; }
          setProfile(userProfile);
          setKundli(userKundli);
          setIsLoadingProfile(false);
          const lat = userProfile?.birthDetails?.latitude ?? 28.6139;
          const lng = userProfile?.birthDetails?.longitude ?? 77.209;
          const tz  = userProfile?.birthDetails?.timezoneId || "Asia/Kolkata";
          try {
            setPanchang(getSamplePanchangData(new Date(), lat, lng, tz));
          } catch { /* ok */ }
          setIsLoadingPanchang(false);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        if (isMounted) { setIsLoadingProfile(false); setIsLoadingPanchang(false); }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-stone-200 font-body">
      <div
        className="w-full max-w-[430px] mx-auto min-h-screen relative"
        style={{
          background: "#FFF8EF",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 8px 60px rgba(0,0,0,0.12)",
        }}
      >
        <DashboardHeader
          profile={profile}
          tithiName={panchang?.tithi?.[0]?.name}
          pakshaName={panchang?.tithi?.[0]?.paksha}
        />

        <main className="px-4 pt-6 pb-44 space-y-5">
          <MorningRitualCard sunriseTime={panchang?.sunrise} />
          <LiveVedicCard />
          <DailyPanchangCard  panchangData={panchang}  isLoading={isLoadingPanchang} />
          <BirthSummaryCard   profile={profile} kundli={kundli} isLoading={isLoadingProfile} />
          <QuickNavigationGrid />
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Dashboard;
