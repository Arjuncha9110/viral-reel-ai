import React, { useState, useEffect } from "react";
import AppShell from "./AppShell";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { Moon, Sun, AlertTriangle, Eye, EyeOff, Clock } from "lucide-react";
import { getUpcomingEclipses, EclipseData } from "../../lib/calculators/astrology/eclipse";
import { LocationData } from "../../lib/calculators/astrology/panchang";
import { LocationSelector } from "../../components/LocationSelector";
import { cn } from "../../lib/utils";

const defaultLocation: LocationData = {
  name: "New Delhi",
  lat: 28.6139,
  lon: 77.209,
  timezone: "Asia/Kolkata",
};

const fmt = (d: Date) =>
  d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const fmtTime = (d: Date) =>
  d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

const EclipseCard = ({ data }: { data: EclipseData }) => {
  const isSolar = data.type === "Solar";
  const now = new Date();
  const daysTo = Math.max(0, Math.floor((data.peakTime.getTime() - now.getTime()) / (1000 * 3600 * 24)));

  return (
    <div className={cn(
      "rounded-2xl border p-5 overflow-hidden relative",
      isSolar ? "bg-amber-950/90 border-amber-600/30" : "bg-indigo-950/90 border-indigo-500/30"
    )}>
      {/* bg glow */}
      <div className={cn(
        "absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-20 pointer-events-none",
        isSolar ? "bg-amber-400" : "bg-indigo-400"
      )} />

      <div className="relative z-10 space-y-4">
        {/* Header row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full border flex items-center justify-center",
              isSolar ? "border-amber-500/40 bg-amber-500/10" : "border-indigo-400/40 bg-indigo-500/10"
            )}>
              {isSolar
                ? <Sun className="w-5 h-5 text-amber-400" />
                : <Moon className="w-5 h-5 text-indigo-300" />}
            </div>
            <div>
              <p className={cn("text-[11px] font-bold uppercase tracking-widest", isSolar ? "text-amber-400/70" : "text-indigo-300/70")}>
                Upcoming {data.type} Eclipse
              </p>
              <p className={cn("font-display text-lg font-bold", isSolar ? "text-amber-300" : "text-indigo-200")}>
                {fmt(data.peakTime)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">In</p>
            <p className="font-display text-xl font-bold text-white">{daysTo}d</p>
          </div>
        </div>

        {/* Detail rows */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm">
            <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="text-white/50">Type:</span>
            <span className="text-white font-semibold">{data.kind}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Clock className="w-4 h-4 text-orange-400 shrink-0" />
            <span className="text-white/50">Peak:</span>
            <span className="text-white font-semibold">{fmtTime(data.peakTime)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            {data.isLocallyVisible
              ? <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
              : <EyeOff className="w-4 h-4 text-rose-400 shrink-0" />}
            <span className="text-white/50">Visible at your location:</span>
            <span className={cn("font-semibold", data.isLocallyVisible ? "text-emerald-400" : "text-rose-400")}>
              {data.isLocallyVisible ? "Yes" : "No"}
            </span>
          </div>
        </div>

        {/* Sutak kaal */}
        <div className={cn("rounded-xl border p-3 mt-2", isSolar ? "border-amber-600/20 bg-amber-500/5" : "border-indigo-500/20 bg-indigo-500/5")}>
          <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-1 flex items-center gap-1.5", "text-orange-400")}>
            <AlertTriangle className="w-3 h-3" /> Sutak Kaal Begins
          </p>
          <p className="text-white font-semibold text-sm">{fmt(data.sutakStartTime)} at {fmtTime(data.sutakStartTime)}</p>
          <p className="text-white/40 text-[11px] mt-1 italic">
            {isSolar
              ? "12 hours before first contact. Avoid meals, new ventures, and temple visits."
              : "9 hours before first contact. Avoid meals, new ventures, and temple visits."}
          </p>
        </div>
      </div>
    </div>
  );
};

const AppEclipse: React.FC = () => {
  const { currentUser } = useAuth();
  const [location, setLocation] = useState<LocationData>(defaultLocation);
  const [eclipses, setEclipses] = useState<{ nextSolar: EclipseData; nextLunar: EclipseData } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    userService.getUserProfile(currentUser.uid).then((profile) => {
      if (profile?.birthDetails?.latitude && profile.birthDetails.longitude) {
        setLocation({
          name: profile.birthDetails.city || "Your Location",
          lat: profile.birthDetails.latitude,
          lon: profile.birthDetails.longitude,
          timezone: profile.birthDetails.timezoneId || "Asia/Kolkata",
        });
      }
    });
  }, [currentUser]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    try {
      const data = getUpcomingEclipses(location.lat, location.lon);
      setEclipses(data);
    } catch (e) {
      setError("Could not calculate eclipse data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [location.lat, location.lon]);

  return (
    <AppShell title="Grahan" eyebrow="Eclipse Calendar" showBack>
      {/* Location selector */}
      <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">Your Location</p>
        <LocationSelector
          onLocationSelect={(loc) => setLocation(loc as LocationData)}
          initialCity={location.name}
        />
      </div>

      {loading && (
        <div className="text-center py-10 text-stone-400 text-sm">Calculating eclipses…</div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">{error}</div>
      )}

      {eclipses && !loading && (
        <>
          <EclipseCard data={eclipses.nextSolar} />
          <EclipseCard data={eclipses.nextLunar} />

          {/* Guidelines */}
          <div className="bg-white rounded-2xl border border-amber-100 p-5 space-y-3">
            <p className="font-display text-[15px] font-bold text-stone-800">Vedic Observance Guidelines</p>
            {[
              { title: "Fasting (Upavasa)", desc: "Abstain from meals during the eclipse. Pregnant women, children, and elderly may take simple food." },
              { title: "Prayer & Chanting", desc: "Recite the Maha Mrityunjaya mantra, Aditya Hridayam (Solar), or Chandra Kavacha (Lunar) during the eclipse period." },
              { title: "Avoid New Ventures", desc: "Do not start new projects, sign contracts, or make major decisions during the eclipse and Sutak period." },
              { title: "Donation (Dana)", desc: "Give food, clothes, or sesame seeds to the needy after the eclipse ends. This pacifies grahan dosha." },
              { title: "Bathing", desc: "Take a purifying bath after the eclipse ends. Change into fresh clothes before resuming daily activity." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-stone-700">{item.title}</p>
                  <p className="text-xs text-stone-500 leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
};

export default AppEclipse;
