import React, { Component, ErrorInfo, ReactNode } from "react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Compass,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  ChevronDown,
  Settings,
  MapPin,
  Activity,
  Award,
  Sparkles,
  Timer,
  Check,
  Map,
  Volume
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SeoHead } from "@/components/shared/SeoHead";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LocationSelector, LocationData } from "@/components/LocationSelector";

const rahuKaalSlots = [8, 2, 7, 5, 6, 4, 3];

// Modular calculations imports
import {
  loadLocationFromStorage,
  saveLocationToStorage,
  getBrowserLocation,
  defaultLocation
} from "@/lib/panchang-live/location";
import {
  calculateVedicTime,
  calculateSwaraNadi,
  calculateTattwas,
  VedicTimeData,
  SwaraData,
  TattwaElement
} from "@/lib/panchang-live/vedicTime";
import {
  calculateHorasForDay,
  getCurrentHoraIndex,
  PremiumHoraPeriod,
  horaPlanetMetadata
} from "@/lib/panchang-live/hora";
import {
  calculateMuhurtas,
  calculateChoghadiyas,
  TimeWindow,
  ChoghadiyaPeriod
} from "@/lib/panchang-live/muhurta";
import {
  AlarmConfig,
  loadAlarmsFromStorage,
  saveAlarmsToStorage,
  loadAudioEnabled,
  saveAudioEnabled,
  playTibetanBowlChime
} from "@/lib/panchang-live/alarms";
import { getSamplePanchangData } from "@/lib/calculators/astrology/panchang";
import { fetchLivePanchang } from "@/lib/astrologyApi";
import { SearchRiseSet, SearchAltitude, Body, Observer, AstroTime } from "astronomy-engine";

// ----------------------------------------------------
// REACT ERROR BOUNDARY FOR CELESTIAL LIVE DASHBOARD
// ----------------------------------------------------
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class PanchangLiveErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error inside Panchang Live Dashboard:", error, errorInfo);
  }

  private handleClearStorage = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0e0704] text-[#f7f3eb] flex items-center justify-center p-6 text-center font-body">
          <div className="max-w-md w-full bg-[#1c120c] border-2 border-red-500/30 p-8 rounded-3xl space-y-6 shadow-2xl">
            <div className="h-14 w-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-500 text-2xl font-bold">
              ⚠
            </div>
            <h1 className="font-display text-xl font-bold text-[#f09050]">Dashboard Sync Issue</h1>
            <p className="text-xs text-[#a69888] leading-relaxed">
              We encountered a runtime render exception. This is likely due to an incompatible date format or coordinate state in your browser context.
            </p>
            <div className="bg-[#0e0704] border border-[#d4651a]/10 p-4 rounded-xl text-left overflow-auto max-h-48">
              <div className="text-[10px] font-bold text-red-400 font-mono">
                {this.state.error?.toString()}
              </div>
              <pre className="text-[9px] text-[#a69888] font-mono mt-2 whitespace-pre-wrap leading-tight">
                {this.state.errorInfo?.componentStack || this.state.error?.stack}
              </pre>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                className="border-red-500/40 hover:bg-red-500/10 text-[#f7f3eb] h-11"
                onClick={this.handleClearStorage}
              >
                Clear Saved Data &amp; Force Reset
              </Button>
              <Button
                variant="ghost"
                className="text-[#a69888] hover:text-[#f7f3eb] text-xs h-9"
                onClick={() => window.location.reload()}
              >
                Retry Refresh
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const PanchangLive = () => {
  // 1. Core States
  const [now, setNow] = useState<Date>(new Date());
  const [location, setLocation] = useState<LocationData>(loadLocationFromStorage());
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  
  // 2. Alarm Config states
  const [alarms, setAlarms] = useState<AlarmConfig[]>(loadAlarmsFromStorage());
  const [audioEnabled, setAudioEnabled] = useState<boolean>(loadAudioEnabled());
  const [livePanchang, setLivePanchang] = useState<any | null>(null);

  // 3. Keep track of the last alarm sound trigger minute to prevent multiple plays in the same minute
  const lastTriggeredMinuteRef = useRef<string>("");

  // 4. Update Time Every Second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 5. Save location and alarms on changes
  useEffect(() => {
    saveLocationToStorage(location);
  }, [location]);

  useEffect(() => {
    saveAlarmsToStorage(alarms);
  }, [alarms]);

  useEffect(() => {
    saveAudioEnabled(audioEnabled);
  }, [audioEnabled]);

  // 5b. Fetch Live Production Prokerala API (with graceful local fallback)
  useEffect(() => {
    let active = true;
    const fetchLive = async () => {
      try {
        const res = await fetchLivePanchang(now, {
          city: location.name,
          state: location.stateCode || "GPS",
          timezone: location.timezone,
          lat: location.lat,
          lng: location.lon
        });

        if (active && res.status === "live" && res.data) {
          const liveData = res.data;
          
          // Map segments into full array models
          const mappedTithi = [
            {
              name: liveData.tithi.name || "Tithi",
              endTime: liveData.tithi.endTime || "",
              paksha: liveData.tithi.paksha || ""
            }
          ];
          const mappedNakshatra = [
            {
              name: liveData.nakshatra.name || "Nakshatra",
              endTime: liveData.nakshatra.endTime || "",
              lord: liveData.nakshatra.lord || "",
              pada: Number(liveData.nakshatra.pada || 1)
            }
          ];
          const mappedYoga = [
            {
              name: liveData.yoga.name || "Yoga",
              endTime: liveData.yoga.endTime || ""
            }
          ];
          const mappedKarana = [
            {
              name: liveData.karana.name || "Karana",
              endTime: liveData.karana.endTime || ""
            }
          ];

          setLivePanchang({
            date: liveData.date || panchangData.date,
            day: liveData.day || panchangData.day,
            sunrise: liveData.sunrise || panchangData.sunrise,
            sunset: liveData.sunset || panchangData.sunset,
            moonrise: liveData.moonrise || panchangData.moonrise,
            moonset: liveData.moonset || panchangData.moonset,
            rahuKaal: liveData.rahuKaal || panchangData.rahuKaal,
            yamagandam: liveData.yamagandam || panchangData.yamagandam,
            gulikaKaal: liveData.gulikaKaal || panchangData.gulikaKaal,
            abhijitMuhurat: liveData.abhijitMuhurat || panchangData.abhijitMuhurat,
            auspiciousTimings: liveData.auspiciousTimings.length > 0 ? liveData.auspiciousTimings : panchangData.auspiciousTimings,
            inauspiciousTimings: liveData.inauspiciousTimings.length > 0 ? liveData.inauspiciousTimings : panchangData.inauspiciousTimings,
            hora: panchangData.hora, 
            tithi: mappedTithi,
            nakshatra: mappedNakshatra,
            yoga: mappedYoga,
            karana: mappedKarana
          });
        }
      } catch (error) {
        console.warn("Prokerala API offline/unconfigured. Gracefully falling back to high-fidelity local engine:", error);
      }
    };

    fetchLive();
    return () => {
      active = false;
    };
  }, [location, now.toDateString()]);

  // 6. Astrological Data Resolvers (defaults to high-fidelity local engine, upgrades to live Prokerala API on success)
  const panchangData = getSamplePanchangData(now, location.lat, location.lon, location.timezone);
  const activePanchang = livePanchang || panchangData;

  // Calculate Exact Sunrise and Sunset using astronomy-engine (Vedic Geometric Horizon: 0 degrees)
  const observer = new Observer(location.lat, location.lon, 0);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  
  let todaySunriseDate = SearchAltitude(Body.Sun, observer, +1, new AstroTime(startOfDay), 1, 0)?.date;
  let todaySunsetDate = SearchAltitude(Body.Sun, observer, -1, new AstroTime(startOfDay), 1, 0)?.date;

  if (!todaySunriseDate) {
    todaySunriseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);
  }
  if (!todaySunsetDate) {
    todaySunsetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0, 0);
  }

  const formatTimeExact = (date: Date): string => {
    let h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    h = h ? h : 12;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} ${ampm}`;
  };

  const vedicTime: VedicTimeData = calculateVedicTime(now, todaySunriseDate);
  const swaraNadi: SwaraData = calculateSwaraNadi(now, todaySunriseDate, todaySunsetDate);
  const tattwas: TattwaElement[] = calculateTattwas(now, todaySunriseDate, todaySunsetDate);
  const horas: PremiumHoraPeriod[] = calculateHorasForDay(now, todaySunriseDate, todaySunsetDate);
  const currentHoraIdx = getCurrentHoraIndex(now, horas);
  const activeHora = horas[currentHoraIdx];
  
  const muhurtas: TimeWindow[] = calculateMuhurtas(now, todaySunriseDate, todaySunsetDate);
  const choghadiyas: ChoghadiyaPeriod[] = calculateChoghadiyas(now, todaySunriseDate, todaySunsetDate);

  // 7. Get upcoming Horas (Current + next 5)
  const upcomingHoras = horas
    .slice(currentHoraIdx, currentHoraIdx + 6)
    .concat(horas.slice(0, Math.max(0, 6 - (horas.length - currentHoraIdx))));

  // 8. Agnihotra Sunset & Sunrise Times & Countdown Calculations
  // Determine next Agnihotra events
  let nextSunriseAgnihotra = todaySunriseDate;
  let nextSunsetAgnihotra = todaySunsetDate;

  if (now.getTime() > todaySunriseDate.getTime()) {
    // If past sunrise, next sunrise Agnihotra is tomorrow
    nextSunriseAgnihotra = new Date(todaySunriseDate.getTime() + 24 * 3600 * 1000);
  }
  if (now.getTime() > todaySunsetDate.getTime()) {
    // If past sunset, next sunset Agnihotra is tomorrow
    nextSunsetAgnihotra = new Date(todaySunsetDate.getTime() + 24 * 3600 * 1000);
  }

  const getCountdownString = (target: Date): { text: string; hours: number; minutes: number; seconds: number } => {
    const diffMs = target.getTime() - now.getTime();
    if (diffMs <= 0) return { text: "00:00:00", hours: 0, minutes: 0, seconds: 0 };
    const totSec = Math.floor(diffMs / 1000);
    const h = Math.floor(totSec / 3600);
    const m = Math.floor((totSec % 3600) / 60);
    const s = totSec % 60;
    return {
      text: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`,
      hours: h,
      minutes: m,
      seconds: s
    };
  };

  const sunriseAgnihotraTimer = getCountdownString(nextSunriseAgnihotra);
  const sunsetAgnihotraTimer = getCountdownString(nextSunsetAgnihotra);

  // 9. Alarm Threshold Evaluation Engine
  useEffect(() => {
    if (!audioEnabled) return;

    // Helper to evaluate alarm trigger conditions
    const checkAlarmTriggers = () => {
      const currentMinStr = `${now.getHours()}:${now.getMinutes()}`;
      if (lastTriggeredMinuteRef.current === currentMinStr) return; // Trigger once per minute maximum

      const timeToDecimal = (t: Date): number => t.getHours() + t.getMinutes() / 60;
      const currentDec = timeToDecimal(now);

      alarms.forEach(alarm => {
        if (!alarm.enabled) return;

        let targetDec = 0;
        let eventName = "";

        // Map target periods
        if (alarm.id === "pratah_sandhya") {
          targetDec = timeToDecimal(todaySunriseDate);
          eventName = "Pratah Sandhya";
        } else if (alarm.id === "madhyahna_sandhya") {
          const middayHours = (timeToDecimal(todaySunriseDate) + timeToDecimal(todaySunsetDate)) / 2;
          targetDec = middayHours;
          eventName = "Madhyahna Sandhya";
        } else if (alarm.id === "sayam_sandhya") {
          targetDec = timeToDecimal(todaySunsetDate);
          eventName = "Sayam Sandhya";
        } else if (alarm.id === "brahma_muhurta") {
          targetDec = timeToDecimal(todaySunriseDate) - 1.6; // Brahma Muhurta starts 96 mins before sunrise
          eventName = "Brahma Muhurta";
        } else if (alarm.id === "abhijit_muhurta") {
          const middayHours = (timeToDecimal(todaySunriseDate) + timeToDecimal(todaySunsetDate)) / 2;
          targetDec = middayHours - 0.4; // Abhijit starts 24 mins before noon
          eventName = "Abhijit Muhurta";
        } else if (alarm.id === "rahu_kaal") {
          const dayIndex = now.getDay();
          const dayDuration = timeToDecimal(todaySunsetDate) - timeToDecimal(todaySunriseDate);
          const rahuPeriodDuration = dayDuration / 8;
          targetDec = timeToDecimal(todaySunriseDate) + (rahuKaalSlots[dayIndex] - 1) * rahuPeriodDuration;
          eventName = "Rahu Kaal";
        }

        // Apply alarm offset (offset is in minutes before the event)
        const alarmTriggerDec = targetDec - alarm.offsetMinutes / 60;
        
        // Match current time to trigger time (within a 1-minute window)
        const diffMins = Math.abs((currentDec - alarmTriggerDec) * 60);
        if (diffMins < 0.5) {
          // Play the chime!
          playTibetanBowlChime();
          lastTriggeredMinuteRef.current = currentMinStr;
          console.log(`Alarm triggered: ${eventName} (${alarm.offsetMinutes} mins offset)`);
        }
      });
    };

    checkAlarmTriggers();
  }, [now, alarms, audioEnabled]);

  // 10. Manual fallbacks triggering
  const handleGPSLocation = async () => {
    setGpsLoading(true);
    try {
      const coords = await getBrowserLocation();
      if (coords.lat && coords.lon) {
        setLocation({
          name: "My Location",
          stateCode: "GPS",
          countryCode: location.countryCode || "IN",
          lat: parseFloat(coords.lat.toFixed(4)),
          lon: parseFloat(coords.lon.toFixed(4)),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata"
        });
      }
    } catch (e) {
      console.warn("GPS location permission denied or failed:", e);
      alert("GPS permission denied. Please select a city manually from the dropdown.");
    } finally {
      setGpsLoading(false);
    }
  };

  // 11. SVG segments coordinates calculator for circular 24 segments Hora Wheel
  const drawHoraWheelSegments = () => {
    const cx = 200;
    const cy = 200;
    const rOuter = 175;
    const rInner = 110;
    const slices = 24;

    const planetColors: Record<string, string> = {
      Sun: "url(#grad-sun)",
      Venus: "url(#grad-venus)",
      Mercury: "url(#grad-mercury)",
      Moon: "url(#grad-moon)",
      Saturn: "url(#grad-saturn)",
      Jupiter: "url(#grad-jupiter)",
      Mars: "url(#grad-mars)"
    };

    return horas.map((hora, idx) => {
      // 24 segments. Slices start from sunrise at top-center or slightly offset.
      // Traditionally, the 1st day hora starts exactly at sunrise. Let's make slice 1 start at 270 degrees (top-center) and go clockwise.
      const sliceAngle = 360 / slices;
      const startAngle = 270 + idx * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      const rad = (deg: number) => (deg * Math.PI) / 180;

      const x1O = cx + rOuter * Math.cos(rad(startAngle));
      const y1O = cy + rOuter * Math.sin(rad(startAngle));
      const x2O = cx + rOuter * Math.cos(rad(endAngle));
      const y2O = cy + rOuter * Math.sin(rad(endAngle));

      const x1I = cx + rInner * Math.cos(rad(startAngle));
      const y1I = cy + rInner * Math.sin(rad(startAngle));
      const x2I = cx + rInner * Math.cos(rad(endAngle));
      const y2I = cy + rInner * Math.sin(rad(endAngle));

      const pathData = `
        M ${x1I} ${y1I}
        L ${x1O} ${y1O}
        A ${rOuter} ${rOuter} 0 0 1 ${x2O} ${y2O}
        L ${x2I} ${y2I}
        A ${rInner} ${rInner} 0 0 0 ${x1I} ${y1I}
        Z
      `;

      const isActive = idx === currentHoraIdx;

      return (
        <g key={idx} className="group cursor-pointer select-none">
          <title>{`${hora.index}. ${hora.planet} Hora (${hora.startTime} - ${hora.endTime})\nQuality: ${hora.auspiciousness}\nBreath: ${hora.planet === 'Sun' || hora.planet === 'Mars' || hora.planet === 'Saturn' ? 'Pingala' : 'Ida'} Swara`}</title>
          <path
            d={pathData}
            fill={planetColors[hora.planet] || "#333"}
            stroke="#1c120c"
            strokeWidth="1.5"
            className={`transition-all duration-300 ${
              isActive
                ? "filter drop-shadow-[0_0_8px_rgba(216,188,122,0.8)] opacity-100 scale-102"
                : "opacity-85 hover:opacity-100"
            }`}
            style={{
              transformOrigin: "200px 200px",
              transform: isActive ? "scale(1.03)" : "scale(1)"
            }}
          />
          {/* Hour number label drawn at radius center */}
          {(() => {
            const mid = startAngle + sliceAngle / 2;
            const textR = (rOuter + rInner) / 2;
            const tx = cx + textR * Math.cos(rad(mid));
            const ty = cy + textR * Math.sin(rad(mid));
            return (
              <text
                x={tx}
                y={ty + 3}
                fill="#f7f3eb"
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
                className="pointer-events-none"
              >
                {hora.index}
              </text>
            );
          })()}
        </g>
      );
    });
  };

  return (
    <Layout dark>
      <SeoHead
        title="Live Vedic Panchang & Sadhana Dashboard | Real-Time Spiritual Guidance"
        description="Access today's real-time Panchang live tracking. Featuring synthesized Tibetan singing bowl clocks, Swara breath meters, dynamic Tattwa cycle indicators, and a majestic vector Hora Wheel."
        path="/panchang-live"
        type="website"
        keywords="live panchang, vedic clock, swara yoga, tattwa cycle, hora wheel, agnihotra clock, sadhana alarms, brahma muhurta"
      />
      
      {/* Premium Modular Styles for flickers and pulsing */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes sacredFire {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 12px rgba(212, 101, 26, 0.22)); transform: scale(1); }
          50% { filter: brightness(1.08) drop-shadow(0 0 22px rgba(212, 101, 26, 0.35)); transform: scale(1.01); }
        }
        @keyframes sacredSunset {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 12px rgba(152, 112, 200, 0.18)); transform: scale(1); }
          50% { filter: brightness(1.08) drop-shadow(0 0 22px rgba(152, 112, 200, 0.30)); transform: scale(1.01); }
        }
        .animate-sacred-fire {
          animation: sacredFire 4s infinite ease-in-out;
        }
        .animate-sacred-sunset {
          animation: sacredSunset 4s infinite ease-in-out;
        }
        .custom-glass {
          background: linear-gradient(180deg, rgba(30, 16, 50, 0.90), rgba(24, 12, 42, 0.92));
          backdrop-filter: blur(18px);
          border: 1px solid rgba(212, 101, 26, 0.18);
          box-shadow: 0 18px 42px rgba(10, 4, 20, 0.30);
        }
        .custom-glass-amber {
          background: linear-gradient(180deg, rgba(34, 18, 55, 0.93), rgba(26, 13, 46, 0.95));
          backdrop-filter: blur(18px);
          border: 1px solid rgba(212, 101, 26, 0.20);
          box-shadow: 0 20px 48px rgba(10, 4, 20, 0.32);
        }
        .dark footer {
          background: rgba(16, 8, 28, 0.96) !important;
          border-top: 1px solid rgba(212, 101, 26, 0.15) !important;
        }
        .dark footer h3, .dark footer h4, .dark footer p, .dark footer a, .dark footer span {
          color: #f7f3eb !important;
        }
        .dark footer .text-muted-foreground {
          color: #a69888 !important;
        }
        .dark header {
          background: rgba(20, 10, 32, 0.88) !important;
          border-bottom: 1px solid rgba(212, 101, 26, 0.15) !important;
          backdrop-filter: blur(16px) !important;
        }
        .dark header h1, .dark header p, .dark header a, .dark header span {
          color: #f7f3eb !important;
        }
        .dark header .text-muted-foreground {
          color: #a69888 !important;
        }
      `}} />

      <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(ellipse_90%_40%_at_50%_0%,rgba(212,101,26,0.22),transparent_60%),linear-gradient(180deg,#1a0f30_0%,#140b26_48%,#0f081e_100%)] text-[#f4f1ea] py-8">
        <div className="container mx-auto px-3 sm:px-4">
          
          {/* Header Title */}
          <div className="text-center space-y-5 mb-12">
            {/* Premium logo — layered rings + Sri Chakra image */}
            <div className="relative inline-flex items-center justify-center">
              {/* Outer diffuse glow */}
              <div className="absolute h-40 w-40 rounded-full bg-[#d4651a]/15 blur-3xl" />
              {/* Outermost thin orbit ring */}
              <div className="absolute h-36 w-36 rounded-full border border-[#e07030]/15 animate-[spin_20s_linear_infinite]" />
              {/* Middle ring */}
              <div className="absolute h-28 w-28 rounded-full border border-[#d4651a]/25" style={{animation: "spin 14s linear infinite reverse"}} />
              {/* Gradient ring frame */}
              <div className="relative h-24 w-24 rounded-full p-[2px]"
                style={{background: "conic-gradient(from 0deg, #e07030, #f0a060, #c05018, #e87840, #e07030)"}}>
                <div className="h-full w-full rounded-full bg-[#180d2e] flex items-center justify-center shadow-[inset_0_0_24px_rgba(212,101,26,0.15)]">
                  {/* Inner content: Sri Chakra logo */}
                  <img
                    src="/logo-srichakra.png?v=locked"
                    alt="Divine Panchang"
                    className="h-14 w-14 rounded-full object-cover opacity-90"
                    onError={(e) => {
                      // Fallback to OM symbol if image missing
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                  <span className="hidden text-3xl font-serif text-[#f09050]">ॐ</span>
                </div>
              </div>
              {/* Small pulsing dot at top of ring */}
              <div className="absolute top-0.5 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-[#f09050] shadow-[0_0_8px_rgba(240,144,80,0.8)]" />
            </div>

            {/* Title */}
            <div className="space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.40em] text-[#e07030]/75">
                Divine Panchang · Live
              </p>
              <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#f0a060] via-[#fff8f2] to-[#f0a060]">
                Live Vedic Dashboard
              </h1>
              <p className="font-body text-[#c8b8d8]/80 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                Real-time daily alignment — synchronize your actions with the cosmic rhythm of Vedic Time, Swara &amp; planetary Horas.
              </p>
            </div>

            {/* Elegant divider */}
            <div className="flex items-center justify-center gap-4 pt-1">
              <div className="h-px w-20 bg-gradient-to-r from-transparent via-[#d4651a]/40 to-[#d4651a]/50" />
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-1 rounded-full bg-[#d4651a]/50" />
                <span className="text-[#d4651a]/70 text-sm font-serif">✦</span>
                <div className="h-1 w-1 rounded-full bg-[#d4651a]/50" />
              </div>
              <div className="h-px w-20 bg-gradient-to-l from-transparent via-[#d4651a]/40 to-[#d4651a]/50" />
            </div>
          </div>

          {/* Location & Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 custom-glass p-3 sm:p-4 rounded-2xl mb-6 sm:mb-8">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <MapPin className="h-5 w-5 text-[#e07030] shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#c8b8d8]/60">Current Station</div>
                <div className="text-sm font-semibold text-[#f7f3eb] truncate">
                  {location.name} <span className="text-[#f09050] font-medium">({location.timezone})</span>
                </div>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
              {/* GPS Fetch Button */}
              <Button
                variant="ghost"
                onClick={handleGPSLocation}
                disabled={gpsLoading}
                className="h-10 text-xs px-3 border border-[#d4651a]/25 bg-[#1e1440]/80 hover:bg-[#2a1850] text-[#f09050]"
              >
                {gpsLoading ? "Acquiring GPS..." : "Detect Location"}
              </Button>

              {/* Toggle manual selector */}
              <Popover open={showLocationSettings} onOpenChange={setShowLocationSettings}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 text-xs px-3 border border-[#d4651a]/28 bg-[#22164a]/80 hover:bg-[#2e1e60] text-[#f7f3eb]"
                  >
                    <Settings className="h-4 w-4 mr-2 text-[#e07030]" />
                    Change Station
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 bg-[linear-gradient(180deg,#1a0f30,#140a26)] border border-[#d4651a]/28 shadow-2xl text-foreground">
                  <div className="space-y-4">
                    <h3 className="font-display font-semibold text-sm text-[#f7f3eb] border-b border-[#d4651a]/20 pb-2">Select Location Manually</h3>
                    <LocationSelector
                      onLocationSelect={(loc) => {
                        setLocation(loc);
                        setShowLocationSettings(false);
                      }}
                      initialCity={location.name}
                    />
                  </div>
                </PopoverContent>
              </Popover>

              {/* Master Audio Controller */}
              <div className="flex items-center gap-2 border-l border-[#d4651a]/20 pl-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`h-9 w-9 rounded-full transition-all duration-300 ${
                    audioEnabled
                      ? "bg-[#d4651a]/18 text-[#f09050] hover:bg-[#d4651a]/28"
                      : "bg-[#1e1440]/80 text-[#9880b8] hover:bg-[#2a1850]"
                  }`}
                  title={audioEnabled ? "Disable Chimes" : "Enable Chimes"}
                >
                  {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Grid: Modules 1 & 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            
            {/* MODULE 1: VEDIC TIME DASHBOARD (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="custom-glass-amber p-6 rounded-3xl space-y-6">
                
                {/* Module title */}
                <div className="flex items-center justify-between border-b border-[#d4651a]/10 pb-3">
                  <h2 className="font-display text-lg font-bold text-[#f09050] flex items-center gap-2">
                    <Activity className="h-5 w-5 text-amber-500" />
                    Vedic time dashboard
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#a69888]">
                    One Vedic Day = 60 Ghati • 60 Pal • 60 Vipal
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Swara Dominance, Tattwa, Day Cycle boundaries */}
                  <div className="space-y-4">
                    
                    {/* Swara Nadi card */}
                    <div className="bg-[#1e1440]/92 border border-[#d4651a]/10 rounded-2xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#a69888]">Current dominant swara</span>
                      <div className={`font-display text-3xl font-black tracking-widest mt-1 ${swaraNadi.color}`}>
                        {swaraNadi.name}
                      </div>
                      <div className="text-[11px] font-semibold text-[#f7f3eb]/90 mt-0.5">{swaraNadi.energy}</div>
                      <p className="text-xs text-[#a69888] mt-2 italic">{swaraNadi.recommendation}</p>
                    </div>

                    {/* Current Tattwa card */}
                    <div className="bg-[#1e1440]/92 border border-[#d4651a]/10 rounded-2xl p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-[#a69888]">Active tattwa (element)</span>
                      {(() => {
                        const activeTattwa = tattwas.find(t => t.isActive);
                        return activeTattwa ? (
                          <div className="mt-1">
                            <div className="font-display text-2xl font-bold text-[#f7f3eb] flex items-center gap-2">
                              <span className={`inline-block h-3.5 w-3.5 rounded-full ${activeTattwa.color}`} />
                              {activeTattwa.name} ({activeTattwa.element})
                            </div>
                            <p className="text-xs text-[#a69888] mt-2 leading-relaxed">{activeTattwa.description}</p>
                          </div>
                        ) : (
                          <div className="text-sm mt-1">Resolving active element...</div>
                        );
                      })()}
                    </div>

                    {/* Day boundaries */}
                    <div className="bg-[#1e1440]/92 border border-[#d4651a]/10 rounded-2xl p-4 flex justify-between items-center shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                      <div>
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[#a69888]">Local Sunrise</div>
                        <div className="font-display text-lg font-bold text-[#f7f3eb] mt-1 flex items-center gap-1.5">
                          <Sunrise className="h-4.5 w-4.5 text-amber-500" />
                          {formatTimeExact(todaySunriseDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold tracking-widest text-[#a69888]">Local Sunset</div>
                        <div className="font-display text-lg font-bold text-[#f7f3eb] mt-1 flex items-center gap-1.5 justify-end">
                          <Sunset className="h-4.5 w-4.5 text-purple-400" />
                          {formatTimeExact(todaySunsetDate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Tattwa progress cycles */}
                    <div className="bg-[#1e1440]/92 border border-[#d4651a]/10 rounded-2xl p-4 space-y-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#a69888] block border-b border-[#d4651a]/10 pb-2">Tattwa progress (element cycles)</span>
                    <div className="space-y-3.5">
                      {tattwas.map((t, idx) => (
                        <div key={idx} className={`space-y-1.5 ${t.isActive ? "opacity-100" : "opacity-45"}`}>
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-[#f7f3eb] flex items-center gap-1.5">
                              <span className={`h-2.5 w-2.5 rounded-full ${t.color}`} />
                              {t.name} <span className="text-[10px] text-[#a69888]/80">({t.element})</span>
                            </span>
                            <span className="text-[#f09050]">{t.isActive ? `${Math.round(t.progress)}%` : t.progress === 100 ? "Completed" : "Pending"}</span>
                          </div>
                          <div className="h-2 w-full bg-[#160e36] rounded-full overflow-hidden p-[1px] border border-[#d4651a]/10">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${
                                t.isActive
                                  ? "bg-gradient-to-r from-amber-500 to-[#d8bc7a]"
                                  : t.progress === 100
                                  ? "bg-[#d8bc7a]/20"
                                  : "bg-transparent"
                              }`}
                              style={{ width: `${t.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footer segment: The Ticking clocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#d4651a]/10">
                  {/* Vedic time clock */}
                  <div className="bg-[#1e1440]/92 border border-[#d4651a]/15 rounded-2xl p-5 text-center relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute right-3 top-3 h-14 w-14 rounded-full border border-[#d4651a]/5 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-[#f09050]/10" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#a69888]">Vedic real-time clock</span>
                    <div className="font-display text-4xl md:text-5xl font-black text-[#f09050] tracking-wider my-2">
                      {vedicTime.formatted}
                    </div>
                    <div className="flex justify-center gap-8 text-[9px] uppercase tracking-widest font-black text-[#a69888]">
                      <span>Ghati</span>
                      <span>Pal</span>
                      <span>Vipal</span>
                    </div>
                  </div>

                  {/* Standard time clock */}
                  <div className="bg-[#1e1440]/92 border border-[#d4651a]/15 rounded-2xl p-5 text-center relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute right-3 top-3 h-14 w-14 rounded-full border border-[#d4651a]/5 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-[#f09050]/10" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#a69888]">Standard clock</span>
                    <div className="font-display text-4xl md:text-5xl font-black text-[#f7f3eb] tracking-wide my-2">
                      {now.toLocaleTimeString("en-US", { hour12: false })}
                    </div>
                    <div className="text-[10px] font-bold text-[#a69888]">
                      {now.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* MODULE 5: HORA PLANETARY WHEEL (lg:col-span-4) */}
            <div className="lg:col-span-4">
              <div className="custom-glass-amber p-6 rounded-3xl h-full flex flex-col justify-between space-y-6">
                
                {/* Module title */}
                <div className="border-b border-[#d4651a]/10 pb-3 text-center">
                  <h2 className="font-display text-lg font-bold text-[#f09050] inline-flex items-center gap-2">
                    <Compass className="h-5 w-5 text-amber-500" />
                    Interactive Hora Wheel
                  </h2>
                  <div className="text-[9px] uppercase tracking-wider font-bold text-[#a69888] mt-0.5">
                    Click segments to inspect ruling properties
                  </div>
                </div>

                {/* SVG Planetary wheel */}
                <div className="flex justify-center items-center my-2 relative">
                  <svg
                    viewBox="0 0 400 400"
                    className="w-full max-w-[280px] md:max-w-[320px] aspect-square transition-all duration-300"
                  >
                    <defs>
                      {/* Gradient presets for segments */}
                      <radialGradient id="grad-center" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#432c16" />
                        <stop offset="60%" stopColor="#1c120c" />
                        <stop offset="100%" stopColor="#0e0704" />
                      </radialGradient>
                      <linearGradient id="grad-sun" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#b45309" />
                      </linearGradient>
                      <linearGradient id="grad-venus" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" /><stop offset="100%" stopColor="#be185d" />
                      </linearGradient>
                      <linearGradient id="grad-mercury" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#047857" />
                      </linearGradient>
                      <linearGradient id="grad-moon" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a1a1aa" /><stop offset="100%" stopColor="#4b5563" />
                      </linearGradient>
                      <linearGradient id="grad-saturn" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3f3f46" /><stop offset="100%" stopColor="#09090b" />
                      </linearGradient>
                      <linearGradient id="grad-jupiter" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" />
                      </linearGradient>
                      <linearGradient id="grad-mars" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#b91c1c" />
                      </linearGradient>
                    </defs>

                    {/* Wheel segment rendering */}
                    {drawHoraWheelSegments()}

                    {/* Center Core Circle with Day Lord info */}
                    <circle cx="200" cy="200" r="105" fill="url(#grad-center)" stroke="#d8bc7a" strokeWidth="2.5" />
                    <circle cx="200" cy="200" r="100" fill="transparent" stroke="#d8bc7a" strokeWidth="0.5" strokeDasharray="3,3" />

                    <g transform="translate(200, 200)" textAnchor="middle">
                      <text y="-35" fill="#a69888" fontSize="8" fontWeight="bold" letterSpacing="2" className="uppercase">Vara (Day)</text>
                      <text y="-10" fill="#f7f3eb" fontSize="20" fontWeight="900" fontFamily="serif">{panchangData.day}</text>
                      
                      <line x1="-50" y1="5" x2="50" y2="5" stroke="rgba(216,188,122,0.3)" strokeWidth="1" />
                      
                      <text y="24" fill="#d8bc7a" fontSize="11" fontWeight="bold" letterSpacing="1" className="uppercase">Ruler: {activeHora?.planet}</text>
                      <text y="48" fill="#f7f3eb" fontSize="24" className="opacity-90">{activeHora?.symbol}</text>
                    </g>
                  </svg>
                </div>

                {/* Inner legend */}
                <div className="bg-[#1e1440]/92 border border-[#d4651a]/10 p-3.5 rounded-2xl">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-[#a69888]">Active Hora:</span>
                    <span className="font-bold text-[#f09050]">{activeHora?.planet} ({activeHora?.startTime} - {activeHora?.endTime})</span>
                  </div>
                  <p className="text-[11px] text-[#a69888] italic text-center leading-tight">
                    "{activeHora?.description}"
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* MODULE 2: AUSPICIOUS WORK WINDOWS */}
          <div className="custom-glass-amber p-6 rounded-3xl mb-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#d4651a]/10 pb-3">
              <h2 className="font-display text-lg font-bold text-[#f09050] flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                Best windows for auspicious work
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a69888]">
                Classical Saumya (benefic) Horas are highly recommended for new starts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingHoras.map((hora, idx) => {
                const isCurrent = hora.index === activeHora?.index && hora.isDay === activeHora?.isDay;
                return (
                  <div
                    key={idx}
                    className={`relative p-4 rounded-2xl border transition-all duration-300 ${
                      isCurrent
                        ? "bg-[linear-gradient(180deg,#162742,#132136)] border-[#d4651a] shadow-[0_0_18px_rgba(216,188,122,0.16)]"
                        : "bg-[#1e1440]/84 border-[#d4651a]/10"
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-[#d8bc7a] text-[#0e0704] text-[9px] uppercase tracking-widest font-black animate-pulse">
                        Active now
                      </span>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-lg font-bold border"
                          style={{
                            borderColor: isCurrent ? "#d8bc7a" : "rgba(216,188,122,0.15)",
                            background: "rgba(12, 23, 41, 0.92)"
                          }}
                        >
                          {hora.symbol}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#f7f3eb]">
                            Hour {hora.index} • {hora.planet} <span className="text-xs text-[#a69888] font-normal">({hora.sanskritName})</span>
                          </div>
                          <div className="text-[10px] text-[#a69888] uppercase tracking-wide font-medium mt-0.5">
                            {hora.energyTheme}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${hora.badgeColor}`}>
                          {hora.auspiciousness}
                        </span>
                        <div className="text-xs font-medium text-[#f7f3eb] mt-1.5">
                          {hora.startTime}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MODULE 3: AGNIHOTRA CLOCK */}
          <div className="custom-glass-amber p-6 rounded-3xl mb-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#d4651a]/10 pb-3 gap-2">
              <div className="text-left">
                <h2 className="font-display text-lg font-bold text-[#f09050] flex items-center gap-2">
                  <Timer className="h-5 w-5 text-amber-500" />
                  Agnihotra Clock
                </h2>
                <p className="text-[10px] text-[#a69888] mt-0.5">
                  Synchronized fire ritual timing based on exact local coordinates of sunrise and sunset.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs text-[#a69888] font-medium">Agnihotra Sound Warning:</span>
                <Switch
                  checked={audioEnabled}
                  onCheckedChange={setAudioEnabled}
                  className="data-[state=checked]:bg-[#d8bc7a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Sunrise Agnihotra card */}
              <div className="bg-[#1e1440]/92 border border-[#d4651a]/15 rounded-3xl p-6 relative overflow-hidden group shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="absolute top-0 right-0 p-4 opacity-10 mix-blend-screen group-hover:opacity-20 transition-opacity">
                  <Sunrise className="h-24 w-24 text-[#e07030]" />
                </div>
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <div className="h-12 w-12 rounded-full border border-[#d4651a]/20 bg-[#d4651a]/10 flex items-center justify-center animate-sacred-fire">
                    <Sunrise className="h-6 w-6 text-[#f09050]" />
                  </div>
                  
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#f2dcc0] uppercase tracking-widest">Sunrise Agnihotra</h3>
                    <div className="text-sm text-[#f7f3eb] font-semibold mt-1">Local Ritual Hour: {formatTimeExact(todaySunriseDate)}</div>
                  </div>

                  {/* Large countdown container */}
                  <div className="w-full bg-[#160e36]/92 border border-[#d4651a]/14 py-4 rounded-xl flex flex-col justify-center items-center">
                    <div className="text-[10px] uppercase font-black text-[#a69888] tracking-widest mb-1">Time Remaining</div>
                    <div className="font-display text-4xl md:text-5xl font-black text-[#f09050] tracking-wider">
                      {sunriseAgnihotraTimer.text}
                    </div>
                    <div className="flex justify-center gap-10 text-[9px] uppercase tracking-widest font-black text-[#a69888] mt-1.5">
                      <span>Hrs</span>
                      <span>Min</span>
                      <span>Sec</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sunset Agnihotra card */}
              <div className="bg-[#1a0f30]/92 border border-purple-500/15 rounded-3xl p-6 relative overflow-hidden group shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                <div className="absolute top-0 right-0 p-4 opacity-10 mix-blend-screen group-hover:opacity-20 transition-opacity">
                  <Sunset className="h-24 w-24 text-purple-400" />
                </div>
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <div className="h-12 w-12 rounded-full border border-purple-500/20 bg-purple-500/10 flex items-center justify-center animate-sacred-sunset">
                    <Sunset className="h-6 w-6 text-purple-400" />
                  </div>
                  
                  <div>
                    <h3 className="font-display text-xl font-bold text-purple-200 uppercase tracking-widest">Sunset Agnihotra</h3>
                    <div className="text-sm text-[#f7f3eb] font-semibold mt-1">Local Ritual Hour: {formatTimeExact(todaySunsetDate)}</div>
                  </div>

                  {/* Large countdown container */}
                  <div className="w-full bg-[#160e36]/92 border border-[#7594c4]/18 py-4 rounded-xl flex flex-col justify-center items-center">
                    <div className="text-[10px] uppercase font-black text-[#a69888] tracking-widest mb-1">Time Remaining</div>
                    <div className="font-display text-4xl md:text-5xl font-black text-[#9bb3db] tracking-wider">
                      {sunsetAgnihotraTimer.text}
                    </div>
                    <div className="flex justify-center gap-10 text-[9px] uppercase tracking-widest font-black text-[#a69888] mt-1.5">
                      <span>Hrs</span>
                      <span>Min</span>
                      <span>Sec</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* MODULE 4: SADHANA ALARMS */}
          <div className="custom-glass-amber p-6 rounded-3xl mb-8 space-y-6">
            <div className="flex items-center justify-between border-b border-[#d4651a]/10 pb-3">
              <h2 className="font-display text-lg font-bold text-[#f09050] flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                Sadhana alarms
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a69888]">
                Alarms persist in local browser storage. Alarm chimes trigger singing bowl Audio alerts.
              </span>
            </div>

            <div className="space-y-6">
              
              {/* Category 1: Sandhya Junctions */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-black text-[#f09050] border-b border-[#d4651a]/5 pb-1">
                  Sandhya (Junction Times) संध्या
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {alarms.filter(a => a.type === "sandhya").map((alarm) => {
                    const alarmStatus = alarms.find(a => a.id === alarm.id);
                    const isEnabled = alarmStatus?.enabled ?? alarm.enabled;
                    
                    let displayTimeStr = "";
                    if (alarm.id === "pratah_sandhya") displayTimeStr = formatTimeExact(todaySunriseDate);
                    else if (alarm.id === "sayam_sandhya") displayTimeStr = formatTimeExact(todaySunsetDate);
                    else if (alarm.id === "madhyahna_sandhya") {
                      const sunMs = todaySunriseDate.getTime();
                      const setMs = todaySunsetDate.getTime();
                      const midDate = new Date((sunMs + setMs) / 2);
                      displayTimeStr = midDate.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true
                      }).toLowerCase();
                    } else if (alarm.id === "sayam_sandhya") displayTimeStr = panchangData.sunset;

                    return (
                      <div key={alarm.id} className="bg-[#1e1440]/60 border border-[#d4651a]/10 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-display font-semibold text-sm text-[#f7f3eb] flex items-center gap-1.5">
                            {alarm.name}
                            <span className="text-[10px] text-[#a69888] font-normal">({alarm.sanskritName})</span>
                          </div>
                          <div className="text-xs font-semibold text-[#f09050] mt-0.5">{displayTimeStr}</div>
                          <p className="text-[10px] text-[#a69888] mt-1.5 leading-tight">{alarm.description}</p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-[#a69888] font-bold">Offset</span>
                            <select
                              value={alarm.offsetMinutes}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setAlarms(alarms.map(a => a.id === alarm.id ? { ...a, offsetMinutes: val } : a));
                              }}
                              className="text-[10px] font-bold bg-[#1c120c] text-[#f7f3eb] border border-[#d4651a]/25 rounded px-1.5 py-0.5 focus:outline-none"
                            >
                              <option value="0">0m</option>
                              <option value="5">5m</option>
                              <option value="10">10m</option>
                              <option value="15">15m</option>
                            </select>
                          </div>
                          <Switch
                            checked={alarm.enabled}
                            onCheckedChange={(checked) => {
                              setAlarms(alarms.map(a => a.id === alarm.id ? { ...a, enabled: checked } : a));
                            }}
                            className="data-[state=checked]:bg-[#d8bc7a]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category 2: Muhurta Alarms */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase tracking-widest font-black text-[#f09050] border-b border-[#d4651a]/5 pb-1">
                  Muhurta (Auspicious & Warnings) मुहूर्त
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {alarms.filter(a => a.type !== "sandhya").map((alarm) => {
                    let displayTimeStr = "";
                    if (alarm.id === "brahma_muhurta") {
                      const bm = muhurtas.find(m => m.name === "Brahma Muhurta");
                      displayTimeStr = bm ? `${bm.startTime}` : "BM Window";
                    } else if (alarm.id === "abhijit_muhurta") {
                      const ab = muhurtas.find(m => m.name === "Abhijit Muhurta");
                      displayTimeStr = ab ? `${ab.startTime}` : "Abhijit Window";
                    } else if (alarm.id === "rahu_kaal") {
                      const rk = muhurtas.find(m => m.name === "Rahu Kaal");
                      displayTimeStr = rk ? `${rk.startTime}` : "Rahu Window";
                    }

                    return (
                      <div key={alarm.id} className="bg-[#1e1440]/60 border border-[#d4651a]/10 p-4 rounded-xl flex items-center justify-between">
                        <div>
                                                    <div className="font-display font-semibold text-sm text-[#f7f3eb] flex items-center gap-1.5">
                            {alarm.name}
                            <span className="text-[10px] text-[#a69888] font-normal">({alarm.sanskritName})</span>
                          </div>
                          <div className="text-xs font-semibold text-[#f09050] mt-0.5">{displayTimeStr}</div>
                          <p className="text-[10px] text-[#a69888] mt-1.5 leading-tight">{alarm.description}</p>
                        </div>

                        <div className="flex flex-col items-end gap-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] text-[#a69888] font-bold">Offset</span>
                            <select
                              value={alarm.offsetMinutes}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10);
                                setAlarms(alarms.map(a => a.id === alarm.id ? { ...a, offsetMinutes: val } : a));
                              }}
                              className="text-[10px] font-bold bg-[#1c120c] text-[#f7f3eb] border border-[#d4651a]/25 rounded px-1.5 py-0.5 focus:outline-none"
                            >
                              <option value="0">0m</option>
                              <option value="5">5m</option>
                              <option value="10">10m</option>
                              <option value="15">15m</option>
                            </select>
                          </div>
                          <Switch
                            checked={alarm.enabled}
                            onCheckedChange={(checked) => {
                              setAlarms(alarms.map(a => a.id === alarm.id ? { ...a, enabled: checked } : a));
                            }}
                            className="data-[state=checked]:bg-[#d8bc7a]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default PanchangLive;
