import React, { useState, useEffect, useRef, useCallback } from "react";
import { Sunrise, Sunset, Wind, Bell, BellOff, MapPin, X, Check } from "lucide-react";
import AppShell from "./AppShell";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { LocationSelector, LocationData as LocSelectorData } from "../../components/LocationSelector";
import {
  calculateVedicTime,
  calculateSwaraNadi,
  calculateTattwas,
  VedicTimeData,
  SwaraData,
  TattwaElement,
} from "../../lib/panchang-live/vedicTime";
import {
  calculateHorasForDay,
  getCurrentHoraIndex,
  PremiumHoraPeriod,
} from "../../lib/panchang-live/hora";
import {
  AlarmConfig,
  defaultAlarms,
  loadAlarmsFromStorage,
  saveAlarmsToStorage,
  loadAudioEnabled,
  saveAudioEnabled,
  playTibetanBowlChime,
} from "../../lib/panchang-live/alarms";
import { SearchAltitude, Body, Observer, AstroTime } from "astronomy-engine";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

interface LocationData {
  name: string;
  lat: number;
  lon: number;
  timezone: string;
}

const DEFAULT_LOCATION: LocationData = {
  name: "Bengaluru",
  lat: 12.9716,
  lon: 77.5946,
  timezone: "Asia/Kolkata",
};

const RAHU_SLOTS = [8, 2, 7, 5, 6, 4, 3]; // Sun→Sat

const PLANET_COLOR: Record<string, string> = {
  Sun: "#f59e0b",
  Moon: "#94a3b8",
  Mars: "#ef4444",
  Mercury: "#10b981",
  Jupiter: "#16a34a",
  Venus: "#ec4899",
  Saturn: "#6366f1",
};

const PLANET_SYMBOL: Record<string, string> = {
  Sun: "☉",
  Moon: "☽",
  Mars: "♂",
  Mercury: "☿",
  Jupiter: "♃",
  Venus: "♀",
  Saturn: "♄",
};

const TATTWA_EMOJI: Record<string, string> = {
  Space: "✨",
  Air: "💨",
  Fire: "🔥",
  Earth: "🌍",
  Water: "💧",
};

const pad = (n: number) => n.toString().padStart(2, "0");

const fmtTime = (d: Date) => {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${pad(m)} ${ampm}`;
};

const cntdown = (target: Date, now: Date): string => {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

const toRad = (deg: number) => (deg * Math.PI) / 180;

// ---------------------------------------------------------------------------
// Sub-component: Vedic Clock
// ---------------------------------------------------------------------------
const VedicClock: React.FC<{
  vedicTime: VedicTimeData;
  now: Date;
  sunriseDate: Date;
  sunsetDate: Date;
}> = ({ vedicTime, now, sunriseDate, sunsetDate }) => {
  const progress = Math.min(100, (vedicTime.ghati / 60) * 100);
  const isNight = now < sunriseDate || now > sunsetDate;

  return (
    <div className="rounded-2xl overflow-hidden border border-amber-100 shadow-sm">
      <div className="bg-stone-900 px-5 py-5">
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-400 mb-2">
          ✦ Vedic Time (Ghati · Pal · Vipal)
        </p>
        <div className="font-mono text-[38px] font-bold text-white leading-none tracking-widest">
          {vedicTime.formatted}
        </div>
        <div className="flex gap-4 mt-3 text-[11px] text-stone-400">
          <span>Ghati <span className="text-amber-400 font-bold">{pad(vedicTime.ghati)}</span></span>
          <span>Pal <span className="text-amber-400 font-bold">{pad(vedicTime.pal)}</span></span>
          <span>Vipal <span className="text-amber-400 font-bold">{pad(vedicTime.vipal)}</span></span>
        </div>
      </div>
      <div className="bg-white px-5 py-3.5">
        <div className="flex justify-between text-[10px] font-semibold text-stone-400 mb-1.5">
          <span>Vedic day progress</span>
          <span className="text-amber-600">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-amber-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-stone-400 mt-2 text-center">
          {isNight
            ? "🌙 Night — Vedic day continues from yesterday's sunrise"
            : "☀️ Daytime — Vedic day active since sunrise"}
        </p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-component: Agnihotra Timers
// ---------------------------------------------------------------------------
const AgnihotraTimers: React.FC<{
  sunriseDate: Date;
  sunsetDate: Date;
  now: Date;
}> = ({ sunriseDate, sunsetDate, now }) => {
  let nextSunrise = new Date(sunriseDate);
  let nextSunset = new Date(sunsetDate);
  if (now > sunriseDate) nextSunrise = new Date(sunriseDate.getTime() + 86400000);
  if (now > sunsetDate) nextSunset = new Date(sunsetDate.getTime() + 86400000);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
            <Sunrise className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest font-bold text-stone-400">Sunrise</p>
            <p className="text-[13px] font-bold text-stone-800 leading-none mt-0.5">{fmtTime(sunriseDate)}</p>
          </div>
        </div>
        <p className="text-[9px] uppercase tracking-widest text-amber-600 font-bold mb-1">Agnihotra in</p>
        <p className="font-mono text-[18px] font-bold text-amber-700 leading-none">{cntdown(nextSunrise, now)}</p>
        <p className="text-[9px] text-stone-400 mt-1">Pratah Agnihotra 🔥</p>
      </div>

      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
            <Sunset className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest font-bold text-stone-400">Sunset</p>
            <p className="text-[13px] font-bold text-stone-800 leading-none mt-0.5">{fmtTime(sunsetDate)}</p>
          </div>
        </div>
        <p className="text-[9px] uppercase tracking-widest text-indigo-600 font-bold mb-1">Agnihotra in</p>
        <p className="font-mono text-[18px] font-bold text-indigo-700 leading-none">{cntdown(nextSunset, now)}</p>
        <p className="text-[9px] text-stone-400 mt-1">Sayam Agnihotra 🌅</p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-component: SVG Hora Wheel
// ---------------------------------------------------------------------------
const HoraWheel: React.FC<{
  horas: PremiumHoraPeriod[];
  currentHoraIdx: number;
}> = ({ horas, currentHoraIdx }) => {
  const CX = 180;
  const CY = 180;
  const R_OUTER = 156;
  const R_INNER = 92;
  const SLICE = 360 / 24;

  const slicePath = (idx: number, ro: number, ri: number): string => {
    const sa = -90 + idx * SLICE;
    const ea = sa + SLICE;
    const x1O = CX + ro * Math.cos(toRad(sa));
    const y1O = CY + ro * Math.sin(toRad(sa));
    const x2O = CX + ro * Math.cos(toRad(ea));
    const y2O = CY + ro * Math.sin(toRad(ea));
    const x1I = CX + ri * Math.cos(toRad(sa));
    const y1I = CY + ri * Math.sin(toRad(sa));
    const x2I = CX + ri * Math.cos(toRad(ea));
    const y2I = CY + ri * Math.sin(toRad(ea));
    return `M ${x1I} ${y1I} L ${x1O} ${y1O} A ${ro} ${ro} 0 0 1 ${x2O} ${y2O} L ${x2I} ${y2I} A ${ri} ${ri} 0 0 0 ${x1I} ${y1I} Z`;
  };

  const activeHora = horas[currentHoraIdx];
  const auspColor =
    activeHora?.auspiciousness === "Auspicious"
      ? "#16a34a"
      : activeHora?.auspiciousness === "Avoid"
      ? "#dc2626"
      : "#d97706";

  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-500">✦ Hora Wheel</p>
          <h3 className="font-display text-[21px] font-bold text-stone-900 leading-tight">Planetary Hours</h3>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
          {activeHora ? `Hora #${activeHora.index}` : "24 Horas"}
        </span>
      </div>

      <svg viewBox="0 0 360 360" className="w-full" style={{ maxHeight: 310 }}>
        {/* Background */}
        <circle cx={CX} cy={CY} r={R_OUTER + 14} fill="#fef9f0" />

        {/* 24 slices */}
        {horas.map((hora, idx) => {
          const isActive = idx === currentHoraIdx;
          const ro = isActive ? R_OUTER + 7 : R_OUTER;
          const ri = isActive ? R_INNER - 5 : R_INNER;
          const color = PLANET_COLOR[hora.planet] || "#888";
          const fill = isActive ? color : color + "88";
          const midAngle = -90 + idx * SLICE + SLICE / 2;
          const symR = (ro + ri) / 2;
          const tx = CX + symR * Math.cos(toRad(midAngle));
          const ty = CY + symR * Math.sin(toRad(midAngle));

          return (
            <g key={idx}>
              <path
                d={slicePath(idx, ro, ri)}
                fill={fill}
                stroke="white"
                strokeWidth={isActive ? 2.5 : 1.5}
                strokeLinejoin="round"
              />
              <text
                x={tx}
                y={ty + 4}
                textAnchor="middle"
                fontSize={isActive ? "12" : "10"}
                fontWeight="bold"
                fill="white"
                opacity={isActive ? 1 : 0.9}
                pointerEvents="none"
                style={{ fontFamily: "serif" }}
              >
                {PLANET_SYMBOL[hora.planet] || hora.planet[0]}
              </text>
            </g>
          );
        })}

        {/* Center circle */}
        <circle cx={CX} cy={CY} r={R_INNER - 8} fill="white" stroke="#fef3c7" strokeWidth="2.5" />

        {/* Center: active hora info */}
        {activeHora && (
          <>
            <text x={CX} y={CY - 20} textAnchor="middle" fontSize="24"
              fill={PLANET_COLOR[activeHora.planet] || "#888"} style={{ fontFamily: "serif" }}>
              {PLANET_SYMBOL[activeHora.planet]}
            </text>
            <text x={CX} y={CY + 5} textAnchor="middle" fontSize="13" fontWeight="bold"
              fill="#1c1917" style={{ fontFamily: "system-ui, sans-serif" }}>
              {activeHora.planet}
            </text>
            <text x={CX} y={CY + 20} textAnchor="middle" fontSize="9"
              fill="#78716c" style={{ fontFamily: "system-ui, sans-serif" }}>
              {activeHora.startTime}–{activeHora.endTime}
            </text>
            <rect x={CX - 28} y={CY + 26} width="56" height="16" rx="8" fill={auspColor + "22"} />
            <text x={CX} y={CY + 37} textAnchor="middle" fontSize="9" fontWeight="bold"
              fill={auspColor} style={{ fontFamily: "system-ui, sans-serif" }}>
              {activeHora.auspiciousness}
            </text>
          </>
        )}

        {/* Cardinal markers */}
        {([0, 6, 12, 18] as const).map((i) => {
          const angle = -90 + i * SLICE;
          const mr = R_OUTER + 18;
          const mx = CX + mr * Math.cos(toRad(angle));
          const my = CY + mr * Math.sin(toRad(angle));
          const labels = ["SR", "6h", "SS", "18h"];
          return (
            <text key={i} x={mx} y={my + 3} textAnchor="middle" fontSize="7"
              fill="#a8a29e" fontWeight="bold" style={{ fontFamily: "system-ui, sans-serif" }}>
              {labels[i / 6]}
            </text>
          );
        })}
      </svg>

      {/* Active hora detail strip */}
      {activeHora && (
        <div className="mt-1 rounded-xl bg-amber-50 border border-amber-100 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-bold text-amber-600 mb-0.5">
                Active — Hora #{activeHora.index} · {activeHora.isDay ? "Day" : "Night"}
              </p>
              <p className="text-sm font-bold text-stone-900 leading-snug">{activeHora.sanskritName}</p>
              <p className="text-xs text-stone-500 mt-0.5 leading-snug">{activeHora.energyTheme}</p>
            </div>
            <div
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: (PLANET_COLOR[activeHora.planet] || "#888") + "22" }}
            >
              <span style={{ fontFamily: "serif" }}>{PLANET_SYMBOL[activeHora.planet]}</span>
            </div>
          </div>
          <p className="text-[11px] text-stone-600 mt-2.5 leading-relaxed italic">{activeHora.description}</p>
        </div>
      )}

      {/* Next 4 horas mini grid */}
      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-widest font-bold text-stone-400 mb-2">Next Horas</p>
        <div className="grid grid-cols-4 gap-1.5">
          {horas.slice(currentHoraIdx + 1, currentHoraIdx + 5).map((h, i) => (
            <div key={i} className="rounded-xl border border-stone-100 bg-stone-50 p-2 text-center">
              <span className="text-[16px] leading-none block"
                style={{ fontFamily: "serif", color: PLANET_COLOR[h.planet] || "#888" }}>
                {PLANET_SYMBOL[h.planet]}
              </span>
              <p className="text-[9px] font-bold text-stone-500 mt-1 leading-tight">{h.planet}</p>
              <p className="text-[8px] text-stone-400 leading-tight">{h.startTime}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-component: Swara Card
// ---------------------------------------------------------------------------
const SwaraCard: React.FC<{ swara: SwaraData }> = ({ swara }) => {
  const isPingala = swara.name === "PINGALA";
  const isSushumna = swara.name === "SUSHUMNA";
  const bg = isPingala
    ? "bg-amber-50 border-amber-100"
    : isSushumna
    ? "bg-purple-50 border-purple-100"
    : "bg-sky-50 border-sky-100";
  const dot = isPingala ? "bg-amber-400" : isSushumna ? "bg-purple-400" : "bg-sky-400";
  const textColor = isPingala ? "text-amber-700" : isSushumna ? "text-purple-700" : "text-sky-700";

  return (
    <div className={`rounded-2xl border shadow-sm p-4 ${bg}`}>
      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-stone-400 mb-3">
        ✦ Active Swara (Breath Dominance)
      </p>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex flex-col items-center gap-1.5">
          <Wind className={`w-6 h-6 ${textColor}`} />
          <span className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />
        </div>
        <div>
          <p className={`font-display text-[22px] font-black leading-none ${textColor}`}>
            {swara.name}
          </p>
          <p className="text-[11px] font-semibold text-stone-600 mt-0.5">{swara.energy}</p>
        </div>
      </div>
      <p className="text-xs text-stone-600 leading-relaxed border-l-2 pl-3 border-stone-300 italic">
        {swara.recommendation}
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-component: Tattwa Card
// ---------------------------------------------------------------------------
const TattwaCard: React.FC<{ tattwas: TattwaElement[] }> = ({ tattwas }) => {
  const active = tattwas.find((t) => t.isActive);

  return (
    <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
      <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-500 mb-1">
        ✦ Active Tattwa (Element)
      </p>
      {active && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{TATTWA_EMOJI[active.name] || "⚡"}</span>
          <div>
            <p className="font-display text-[19px] font-bold text-stone-900 leading-none">
              {active.name}
              <span className="text-stone-400 text-sm font-normal ml-1">({active.element})</span>
            </p>
            <p className="text-xs text-stone-500 mt-0.5">{active.description}</p>
          </div>
        </div>
      )}
      <div className="space-y-2.5 mt-3">
        {tattwas.map((t, i) => (
          <div key={i} className={t.isActive ? "opacity-100" : "opacity-50"}>
            <div className="flex justify-between text-[11px] font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className={`h-2 w-2 rounded-full ${t.color}`} />
                {TATTWA_EMOJI[t.name] || ""} {t.name}
              </span>
              <span className={t.isActive ? "text-amber-600 font-bold" : "text-stone-400"}>
                {t.isActive ? `${Math.round(t.progress)}%` : t.progress === 100 ? "Done" : "Pending"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  t.isActive ? "bg-amber-500" : t.progress === 100 ? "bg-stone-300" : "bg-transparent"
                }`}
                style={{ width: `${t.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sub-component: Sadhana Alarms
// ---------------------------------------------------------------------------
const ALARM_TYPE_STYLE: Record<string, string> = {
  sandhya: "bg-amber-100 text-amber-700",
  muhurta: "bg-emerald-100 text-emerald-700",
  inauspicious: "bg-rose-100 text-rose-700",
};

const AlarmsCard: React.FC<{
  alarms: AlarmConfig[];
  audioEnabled: boolean;
  onToggleAlarm: (id: string) => void;
  onToggleAudio: () => void;
}> = ({ alarms, audioEnabled, onToggleAlarm, onToggleAudio }) => (
  <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4">
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-amber-500">✦ Sadhana Alarms</p>
        <h3 className="font-display text-[20px] font-bold text-stone-900 leading-tight">Sacred Reminders</h3>
      </div>
      <button
        type="button"
        onClick={onToggleAudio}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${
          audioEnabled
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-stone-100 border-stone-200 text-stone-500"
        }`}
      >
        {audioEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
        {audioEnabled ? "Chime On" : "Chime Off"}
      </button>
    </div>

    {/* TODO: Connect to native push notifications — browser notifications unreliable on iOS standalone PWAs */}
    <p className="text-[11px] text-stone-400 italic mb-4 leading-relaxed">
      Tibetan bowl chimes play via your device speaker when this tab is open.
    </p>

    <div className="space-y-1">
      {alarms.map((alarm) => (
        <div
          key={alarm.id}
          className="flex items-start justify-between gap-3 py-3 border-b border-stone-50 last:border-0"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span
                className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  ALARM_TYPE_STYLE[alarm.type] || "bg-stone-100 text-stone-600"
                }`}
              >
                {alarm.type}
              </span>
              <p className="text-sm font-bold text-stone-900 leading-snug">{alarm.name}</p>
            </div>
            <p className="text-xs text-stone-400 leading-snug">{alarm.description}</p>
            <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
              {alarm.offsetMinutes > 0 ? `Alert ${alarm.offsetMinutes} min before` : "Alert at exact time"}
            </p>
          </div>
          {/* Custom toggle switch */}
          <button
            type="button"
            onClick={() => onToggleAlarm(alarm.id)}
            aria-label={`Toggle ${alarm.name}`}
            className={`flex-shrink-0 w-11 h-6 rounded-full border-2 relative transition-colors mt-0.5 ${
              alarm.enabled ? "bg-amber-500 border-amber-500" : "bg-stone-200 border-stone-200"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                alarm.enabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------
export const AppLiveDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [location, setLocation] = useState<LocationData>(DEFAULT_LOCATION);
  const [now, setNow] = useState<Date>(() => new Date());
  const [isClient, setIsClient] = useState(false);

  const [alarms, setAlarms] = useState<AlarmConfig[]>(() =>
    typeof window !== "undefined" ? loadAlarmsFromStorage() : defaultAlarms
  );
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() =>
    typeof window !== "undefined" ? loadAudioEnabled() : false
  );
  const lastTriggeredRef = useRef<string>("");
  const [showLocationEdit, setShowLocationEdit] = useState(false);

  // Hydration guard + 1-second clock
  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Resolve user's birth location
  useEffect(() => {
    if (!currentUser) return;
    userService.getUserProfile(currentUser.uid).then((profile) => {
      if (profile?.birthDetails?.latitude && profile?.birthDetails?.longitude) {
        setLocation({
          name: profile.birthDetails.city || "My Location",
          lat: profile.birthDetails.latitude,
          lon: profile.birthDetails.longitude,
          timezone: profile.birthDetails.timezoneId || "Asia/Kolkata",
        });
      }
    });
  }, [currentUser]);

  // Persist alarms & audio
  useEffect(() => {
    if (typeof window !== "undefined") saveAlarmsToStorage(alarms);
  }, [alarms]);
  useEffect(() => {
    if (typeof window !== "undefined") saveAudioEnabled(audioEnabled);
  }, [audioEnabled]);

  // Handlers
  const handleToggleAlarm = useCallback(
    (id: string) =>
      setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))),
    []
  );
  const handleToggleAudio = useCallback(() => setAudioEnabled((p) => !p), []);

  // Block render until client-side (avoids SSR hydration mismatch)
  if (!isClient) return null;

  // ---------------------------------------------------------------------------
  // Astronomical calculations
  // ---------------------------------------------------------------------------
  const observer = new Observer(location.lat, location.lon, 0);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const todaySunriseDate: Date =
    SearchAltitude(Body.Sun, observer, +1, new AstroTime(startOfDay), 1, 0)?.date ??
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);

  const todaySunsetDate: Date =
    SearchAltitude(Body.Sun, observer, -1, new AstroTime(startOfDay), 1, 0)?.date ??
    new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);

  const vedicTime: VedicTimeData = calculateVedicTime(now, todaySunriseDate);
  const swara: SwaraData = calculateSwaraNadi(now, todaySunriseDate, todaySunsetDate);
  const tattwas: TattwaElement[] = calculateTattwas(now, todaySunriseDate, todaySunsetDate);
  const horas: PremiumHoraPeriod[] = calculateHorasForDay(now, todaySunriseDate, todaySunsetDate);
  const currentHoraIdx = getCurrentHoraIndex(now, horas);

  // Alarm trigger engine (runs inside render because we need computed sunrise/sunset)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const checkAlarms = () => {
    if (!audioEnabled) return;
    const currentMinStr = `${now.getHours()}:${now.getMinutes()}`;
    if (lastTriggeredRef.current === currentMinStr) return;

    const toDecimal = (d: Date) => d.getHours() + d.getMinutes() / 60;
    const currentDec = toDecimal(now);

    alarms.forEach((alarm) => {
      if (!alarm.enabled) return;
      let targetDec = 0;
      if (alarm.id === "pratah_sandhya") targetDec = toDecimal(todaySunriseDate);
      else if (alarm.id === "sayam_sandhya") targetDec = toDecimal(todaySunsetDate);
      else if (alarm.id === "madhyahna_sandhya")
        targetDec = (toDecimal(todaySunriseDate) + toDecimal(todaySunsetDate)) / 2;
      else if (alarm.id === "brahma_muhurta") targetDec = toDecimal(todaySunriseDate) - 1.6;
      else if (alarm.id === "abhijit_muhurta")
        targetDec = (toDecimal(todaySunriseDate) + toDecimal(todaySunsetDate)) / 2 - 0.4;
      else if (alarm.id === "rahu_kaal") {
        const dur = toDecimal(todaySunsetDate) - toDecimal(todaySunriseDate);
        targetDec = toDecimal(todaySunriseDate) + (RAHU_SLOTS[now.getDay()] - 1) * (dur / 8);
      }
      const triggerDec = targetDec - alarm.offsetMinutes / 60;
      if (Math.abs((currentDec - triggerDec) * 60) < 0.5) {
        if (typeof window !== "undefined") playTibetanBowlChime();
        lastTriggeredRef.current = currentMinStr;
      }
    });
  };
  checkAlarms();

  // ---------------------------------------------------------------------------
  return (
    <AppShell title="Live Dashboard" eyebrow="Real-Time Vedic Alignment" showBack>
      {/* Location badge + edit */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="inline-flex items-center gap-2 bg-stone-900 text-white text-[11px] font-bold rounded-full px-4 py-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <MapPin size={11} className="text-emerald-400" />
          {location.name} · Live
        </div>
        <button
          onClick={() => setShowLocationEdit((v) => !v)}
          className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 underline underline-offset-2"
        >
          <MapPin size={9} />
          {showLocationEdit ? "Close" : "Change location"}
        </button>
      </div>

      {/* Location edit panel */}
      {showLocationEdit && (
        <div className="mx-1 rounded-2xl border border-stone-200 bg-white shadow-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-widest font-bold text-stone-500">Change Location</p>
            <button onClick={() => setShowLocationEdit(false)} className="p-1 rounded-lg bg-stone-100 text-stone-400">
              <X size={14} />
            </button>
          </div>
          <LocationSelector
            onLocationSelect={(loc: LocSelectorData) => {
              setLocation({
                name: loc.name,
                lat: loc.lat,
                lon: loc.lon,
                timezone: loc.timezone,
              });
              setShowLocationEdit(false);
            }}
          />
          <p className="text-[10px] text-stone-400 text-center">
            Currently: <span className="font-semibold text-stone-600">{location.name}</span> · {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
          </p>
        </div>
      )}

      <VedicClock vedicTime={vedicTime} now={now} sunriseDate={todaySunriseDate} sunsetDate={todaySunsetDate} />
      <AgnihotraTimers sunriseDate={todaySunriseDate} sunsetDate={todaySunsetDate} now={now} />
      <HoraWheel horas={horas} currentHoraIdx={currentHoraIdx} />
      <SwaraCard swara={swara} />
      <TattwaCard tattwas={tattwas} />
      <AlarmsCard
        alarms={alarms}
        audioEnabled={audioEnabled}
        onToggleAlarm={handleToggleAlarm}
        onToggleAudio={handleToggleAudio}
      />
    </AppShell>
  );
};

export default AppLiveDashboard;
