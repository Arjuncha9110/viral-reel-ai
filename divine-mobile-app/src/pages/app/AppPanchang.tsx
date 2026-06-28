import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Flame,
  Loader2,
  Moon,
  ShieldAlert,
  Sparkles,
  Sun,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { getSamplePanchangData } from "../../lib/calculators/astrology/panchang";
import { HoraPeriod, PanchangData, PanchangSegment } from "../../lib/data/panchang";
import { DailyPanchangCard } from "../../components/dashboard/DailyPanchangCard";
import AppShell from "./AppShell";

const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

const DAY_LORDS: Record<string, string> = {
  Sunday: "Surya",
  Monday: "Chandra",
  Tuesday: "Mangala",
  Wednesday: "Budha",
  Thursday: "Guru",
  Friday: "Shukra",
  Saturday: "Shani",
};

const HORA_NOTES: Record<string, string> = {
  Sun: "authority, confidence, visibility",
  Moon: "care, calm, emotional clarity",
  Mars: "courage, action, discipline",
  Mercury: "learning, trade, writing",
  Jupiter: "wisdom, teaching, prayer",
  Venus: "beauty, harmony, relationships",
  Saturn: "patience, duty, long-term work",
};

const splitTiming = (text: string) => {
  const [label, ...rest] = text.split(":");
  return {
    label: label?.trim() || "Timing",
    value: rest.join(":").trim() || text,
  };
};

const SectionCard = ({
  title,
  eyebrow,
  icon,
  children,
}: {
  title: string;
  eyebrow?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
    <div className="mb-4 flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
        {icon}
      </div>
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-500">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-lg font-bold leading-tight text-stone-900">
          {title}
        </h2>
      </div>
    </div>
    {children}
  </section>
);

const SegmentRow = ({ label, segment }: { label: string; segment?: PanchangSegment }) => (
  <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
          {label}
        </p>
        <p className="mt-1 text-sm font-bold text-stone-900">{segment?.name || "-"}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
          Ends
        </p>
        <p className="mt-1 text-xs font-semibold text-stone-700">{segment?.endTime || "-"}</p>
      </div>
    </div>
    {(segment?.paksha || segment?.lord || segment?.pada) && (
      <p className="mt-2 text-[11px] leading-relaxed text-stone-500">
        {[segment.paksha, segment.lord ? `Lord: ${segment.lord}` : "", segment.pada ? `Pada ${segment.pada}` : ""]
          .filter(Boolean)
          .join(" | ")}
      </p>
    )}
  </div>
);

const TimingRow = ({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "good" | "caution" }) => (
  <div className="flex items-center justify-between gap-3 border-b border-stone-100 py-2.5 last:border-0">
    <span className="text-sm text-stone-600">{label}</span>
    <span
      className={
        tone === "good"
          ? "text-sm font-bold text-emerald-700"
          : tone === "caution"
            ? "text-sm font-bold text-rose-600"
            : "text-sm font-semibold text-stone-800"
      }
    >
      {value}
    </span>
  </div>
);

const HoraCard = ({ hora }: { hora: HoraPeriod }) => (
  <div className="rounded-xl border border-stone-100 bg-stone-50 p-3">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm shadow-sm">
          {hora.symbol}
        </span>
        <div>
          <p className="text-sm font-bold text-stone-900">{hora.planet} Hora</p>
          <p className="text-[11px] text-stone-500">{HORA_NOTES[hora.planet] || "daily action"}</p>
        </div>
      </div>
      <span className="text-right text-[11px] font-semibold text-stone-600">
        {hora.startTime}
        <br />
        {hora.endTime}
      </span>
    </div>
  </div>
);

const DetailedPanchangSections = ({
  panchang,
  locationLabel,
}: {
  panchang: PanchangData;
  locationLabel: string;
}) => {
  const tithi = panchang.tithi[0];
  const nakshatra = panchang.nakshatra[0];
  const yoga = panchang.yoga[0];
  const karana = panchang.karana[0];
  const upcomingHora = panchang.hora.slice(0, 6);
  const dayLord = DAY_LORDS[panchang.day] || panchang.day;

  return (
    <div className="space-y-4">
      <SectionCard title="Panchang Details" eyebrow="Ends & Lords" icon={<CalendarDays className="h-4 w-4" />}>
        <div className="grid gap-2.5">
          <SegmentRow label="Tithi" segment={tithi} />
          <SegmentRow label="Nakshatra" segment={nakshatra} />
          <SegmentRow label="Yoga" segment={yoga} />
          <SegmentRow label="Karana" segment={karana} />
        </div>
      </SectionCard>

      <SectionCard title="Day Quality" eyebrow="Vedic Context" icon={<Sun className="h-4 w-4" />}>
        <div className="rounded-xl bg-stone-50 p-3">
          <TimingRow label="Location" value={locationLabel} />
          <TimingRow label="Vara" value={`${panchang.day} | ${dayLord}`} />
          <TimingRow label="Paksha" value={tithi?.paksha || "-"} />
          <TimingRow label="Nakshatra Lord" value={nakshatra?.lord || "-"} />
          <TimingRow label="Nakshatra Pada" value={nakshatra?.pada ? String(nakshatra.pada) : "-"} />
        </div>
      </SectionCard>

      <SectionCard title="Auspicious Windows" eyebrow="Shubha Muhurat" icon={<BadgeCheck className="h-4 w-4" />}>
        <div className="rounded-xl bg-emerald-50/60 p-3">
          {panchang.auspiciousTimings.map((item) => {
            const timing = splitTiming(item);
            return <TimingRow key={item} label={timing.label} value={timing.value} tone="good" />;
          })}
        </div>
      </SectionCard>

      <SectionCard title="Caution Windows" eyebrow="Avoid Major Starts" icon={<ShieldAlert className="h-4 w-4" />}>
        <div className="rounded-xl bg-rose-50/60 p-3">
          {panchang.inauspiciousTimings.map((item) => {
            const timing = splitTiming(item);
            return <TimingRow key={item} label={timing.label} value={timing.value} tone="caution" />;
          })}
        </div>
      </SectionCard>

      <SectionCard title="Planetary Hora" eyebrow="Next Time Blocks" icon={<Clock3 className="h-4 w-4" />}>
        <div className="space-y-2">
          {upcomingHora.map((hora) => (
            <HoraCard key={`${hora.planet}-${hora.startTime}-${hora.endTime}`} hora={hora} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Daily Spiritual Note" eyebrow="For Reflection" icon={<Sparkles className="h-4 w-4" />}>
        <div className="space-y-3 text-sm leading-relaxed text-stone-600">
          <p>
            Today carries {tithi?.name || "the current tithi"} in {tithi?.paksha || "the lunar phase"} with
            {nakshatra?.name ? ` ${nakshatra.name} Nakshatra` : " the active Nakshatra"}. Use this as a gentle
            guide for prayer, planning, and mindful action.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
              <Flame className="mb-2 h-4 w-4 text-amber-600" />
              <p className="text-xs font-bold text-stone-900">Suggested Ritual</p>
              <p className="mt-1 text-[11px] text-stone-500">Light a diya and chant quietly for 5 minutes.</p>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
              <Moon className="mb-2 h-4 w-4 text-indigo-500" />
              <p className="text-xs font-bold text-stone-900">Inner Focus</p>
              <p className="mt-1 text-[11px] text-stone-500">Complete pending work before starting something heavy.</p>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export const AppPanchang: React.FC = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(toInputDate(new Date()));
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  const [locationLabel, setLocationLabel] = useState("New Delhi");
  const [isLoading, setIsLoading] = useState(true);
  const selectedDateObject = useMemo(() => new Date(`${selectedDate}T12:00:00`), [selectedDate]);

  useEffect(() => {
    let isMounted = true;

    const loadPanchang = async () => {
      if (authLoading) return;
      setIsLoading(true);

      try {
        let lat = 28.6139;
        let lng = 77.209;
        let timezone = "Asia/Kolkata";
        let label = "New Delhi";

        if (currentUser) {
          const birthDetails = await userService.getBirthDetails(currentUser.uid);
          if (birthDetails) {
            lat = birthDetails.latitude ?? lat;
            lng = birthDetails.longitude ?? lng;
            timezone = birthDetails.timezoneId || timezone;
            label = birthDetails.city || birthDetails.formattedAddress || label;
          }
        }

        const data = getSamplePanchangData(selectedDateObject, lat, lng, timezone);

        if (isMounted) {
          setPanchang(data);
          setLocationLabel(label);
        }
      } catch (error) {
        console.error("Error loading app panchang:", error);
        if (isMounted) {
          setPanchang(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPanchang();
    return () => { isMounted = false; };
  }, [currentUser, authLoading, selectedDateObject]);

  return (
    <AppShell title="Panchang" eyebrow="Sacred Daily Timing">
      <section className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm">
        <label className="text-[11px] uppercase tracking-[0.16em] font-bold text-amber-600">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="mt-2 w-full rounded-xl border border-amber-100 bg-amber-50 px-3 py-3 text-sm font-semibold text-stone-800 outline-none focus:border-amber-400"
        />
      </section>

      {isLoading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="w-7 h-7 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="space-y-4">
          <DailyPanchangCard panchangData={panchang} isLoading={false} />
          {panchang && (
            <DetailedPanchangSections
              panchang={panchang}
              locationLabel={locationLabel}
            />
          )}
        </div>
      )}
    </AppShell>
  );
};

export default AppPanchang;
