import React, { useState, useEffect } from "react";
import { CalendarDays, Sun, Moon, MapPin, AlertTriangle } from "lucide-react";
import { getEclipseCalendarList, EclipseData } from "@/lib/calculators/astrology/eclipse";
import { LocationData } from "@/lib/calculators/astrology/panchang";

const formatDateLong = (date: Date) => {
  return date.toLocaleDateString("en-US", { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTimeShort = (date: Date) => {
  return date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const EclipseCalendarTimeline = ({ location, now }: { location: LocationData, now: Date }) => {
  const [calendar, setCalendar] = useState<EclipseData[]>([]);

  useEffect(() => {
    // Get the next 10 overall eclipses globally/locally
    const upcoming = getEclipseCalendarList(location.lat, location.lon, 10, now);
    setCalendar(upcoming);
  }, [location.lat, location.lon, now]);

  return (
    <div className="mt-20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-[#d8bc7a]/30 bg-[#d8bc7a]/5 mb-4">
          <CalendarDays className="h-4 w-4 text-[#d8bc7a]" />
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#d8bc7a]">Eclipse Calendar 2026 - 2030</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-[#f7f3eb]">Upcoming Cosmic Events</h2>
        <p className="text-[#a69888] mt-2">The next 10 mathematical alignments of the Sun, Moon, and Earth.</p>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#d4651a]/30 before:to-transparent">
        {calendar.map((eclipse, index) => {
          const isSolar = eclipse.type === "Solar";
          const Icon = isSolar ? Sun : Moon;
          const isVisible = eclipse.isLocallyVisible;

          return (
            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              {/* Timeline dot */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0a0515] bg-[#1a0f2e] group-hover:bg-[#d4651a]/20 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                <Icon className={`h-4 w-4 ${isSolar ? 'text-amber-500' : 'text-purple-400'}`} />
              </div>

              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border bg-black/40 backdrop-blur-sm transition-all hover:bg-black/60 shadow-lg 
                border-white/5 hover:border-[#d8bc7a]/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <div className={`text-[10px] font-bold uppercase tracking-widest ${isSolar ? 'text-amber-500' : 'text-purple-400'}`}>
                      {eclipse.kind}
                    </div>
                    <div className="font-display text-xl font-bold text-[#f7f3eb]">
                      {formatDateLong(eclipse.peakTime)}
                    </div>
                  </div>
                  <div className="text-right sm:text-left">
                    <div className="text-xs text-[#a69888]">Peak Time</div>
                    <div className="font-semibold text-[#f7f3eb]">{formatTimeShort(eclipse.peakTime)}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-1.5 text-xs">
                    <MapPin className={`h-3.5 w-3.5 ${isVisible ? 'text-emerald-400' : 'text-rose-400'}`} />
                    <span className={isVisible ? 'text-emerald-400' : 'text-[#a69888]'}>
                      {isVisible ? 'Visible at your location' : 'Not visible from here'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-[#d8bc7a]">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Sutak Begins: {formatTimeShort(eclipse.sutakStartTime)}</span>
                  </div>
                </div>
              </div>
              
            </div>
          );
        })}
      </div>
    </div>
  );
};
