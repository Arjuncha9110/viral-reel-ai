import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Clock, AlertTriangle, MapPin, Eye, EyeOff } from "lucide-react";
import { SeoHead } from "@/components/shared/SeoHead";
import { Layout } from "@/components/layout/Layout";
import { LocationSelector } from "@/components/LocationSelector";
import { EclipseGuidelines } from "@/components/eclipse/EclipseGuidelines";
import { EclipseCalendarTimeline } from "@/components/eclipse/EclipseCalendarTimeline";
import { getUpcomingEclipses, EclipseData } from "@/lib/calculators/astrology/eclipse";
import { LocationData } from "@/lib/calculators/astrology/panchang";
import { getBrowserLocation } from "@/lib/panchang-live/location";
import { Button } from "@/components/ui/button";

const defaultLocation: LocationData = {
  name: "New Delhi",
  stateCode: "DL",
  countryCode: "IN",
  lat: 28.6139,
  lon: 77.2090,
  timezone: "Asia/Kolkata"
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true });
};

const EclipseCard = ({ data, now }: { data: EclipseData, now: Date }) => {
  const isSolar = data.type === "Solar";
  const Icon = isSolar ? Sun : Moon;
  
  const timeToEclipseMs = data.peakTime.getTime() - now.getTime();
  const daysToEclipse = Math.floor(timeToEclipseMs / (1000 * 3600 * 24));
  
  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 border ${isSolar ? 'border-amber-500/20 bg-[#160b05]/90' : 'border-purple-500/20 bg-[#0a0515]/90'} shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`}>
      {/* Background Icon Glow */}
      <div className={`absolute top-0 right-0 p-4 opacity-5 mix-blend-screen pointer-events-none`}>
        <Icon className={`h-40 w-40 ${isSolar ? 'text-amber-500' : 'text-purple-400'}`} />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${isSolar ? 'border-amber-500/30 bg-amber-500/10' : 'border-purple-500/30 bg-purple-500/10'}`}>
              <Icon className={`h-5 w-5 ${isSolar ? 'text-amber-500' : 'text-purple-400'}`} />
            </div>
            <div>
              <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-[#a69888]">Upcoming {data.type} Eclipse</h3>
              <p className={`font-display text-2xl font-bold mt-0.5 ${isSolar ? 'text-amber-400' : 'text-purple-300'}`}>{formatDate(data.peakTime)}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#a69888]">Time to Eclipse</div>
            <div className="font-display text-xl font-bold text-[#f7f3eb] mt-0.5">{daysToEclipse} Days</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-6 flex justify-center"><AlertTriangle className="h-4 w-4 text-[#d4651a]" /></div>
            <span className="text-[#a69888]">Type:</span>
            <span className="text-[#f7f3eb] font-semibold">{data.kind}</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="w-6 flex justify-center"><Clock className="h-4 w-4 text-[#d4651a]" /></div>
            <span className="text-[#a69888]">Peak Time:</span>
            <span className="text-[#f7f3eb] font-semibold">{formatTime(data.peakTime)}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <div className="w-6 flex justify-center">
              {data.isLocallyVisible ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4 text-rose-400" />}
            </div>
            <span className="text-[#a69888]">At your location:</span>
            <span className={`font-semibold ${data.isLocallyVisible ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.isLocallyVisible ? "Visible" : "Not Visible"}
            </span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#d4651a] mb-2 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            Sutak Kaal Begins
          </h4>
          <p className="text-[#f7f3eb] font-semibold text-lg">{formatDate(data.sutakStartTime)} at {formatTime(data.sutakStartTime)}</p>
          <p className="text-xs text-[#a69888] mt-1 italic">
            {isSolar ? "12 hours before first contact. Avoid meals, starting new ventures, and temple visits." : "9 hours before first contact. Avoid meals, starting new ventures, and temple visits."}
          </p>
        </div>
      </div>
    </div>
  );
};

const EclipsePage = () => {
  const [location, setLocation] = useState<LocationData>(defaultLocation);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [eclipses, setEclipses] = useState<{nextSolar: EclipseData | null, nextLunar: EclipseData | null}>({ nextSolar: null, nextLunar: null });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Recalculate eclipses when location changes
    const calculated = getUpcomingEclipses(location.lat, location.lon, now);
    setEclipses(calculated);
  }, [location.lat, location.lon]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

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
      console.warn("GPS failed:", e);
      alert("GPS permission denied. Please select a city manually.");
    } finally {
      setGpsLoading(false);
    }
  };

  return (
    <Layout>
      <main className="min-h-screen bg-[linear-gradient(135deg,rgba(15,8,30,1),rgba(10,5,20,1))] text-[#f7f3eb] font-sans selection:bg-[#d4651a]/30">
        <SeoHead
          title="Eclipse Calculator (Grahan) | Divine Panchang"
          description="Calculate upcoming Solar and Lunar Eclipses for any location. Get accurate visibility data and Sutak Kaal timings."
          path="/eclipse"
        />

        {/* Decorative Stars Background */}
        <div className="fixed inset-0 pointer-events-none opacity-40 mix-blend-screen" style={{ backgroundImage: 'radial-gradient(1px 1px at 10px 10px, rgba(255,255,255,0.8) 100%, transparent), radial-gradient(1px 1px at 40px 30px, rgba(255,255,255,0.6) 100%, transparent), radial-gradient(2px 2px at 80px 70px, rgba(212,101,26,0.5) 100%, transparent)', backgroundSize: '120px 120px' }} />

        <div className="relative z-10 container mx-auto px-4 py-8 md:py-16 max-w-5xl">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-[#d8bc7a]/30 bg-[#d8bc7a]/5 mb-6">
              <Moon className="h-3.5 w-3.5 text-[#d8bc7a]" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#d8bc7a]">Vedic Eclipse Calculator</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#fdf6e8] via-[#e4cfa0] to-[#c39a4a] mb-4">
              ECLIPSE CALCULATOR
            </h1>
            <p className="text-sm md:text-base text-[#a69888] max-w-2xl mx-auto leading-relaxed">
              Find precise solar & lunar eclipses for your exact location. Receive authentic Sutak Kaal alerts based on geometric astronomical data.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-[#d4651a]/5 border border-[#d4651a]/20 rounded-2xl p-6 mb-8 backdrop-blur-md">
            <h3 className="font-semibold text-[#e4cfa0] flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-[#d4651a]" />
              ग्रहण (Grahan / Eclipse)
            </h3>
            <p className="text-sm text-[#a69888] leading-relaxed mb-4">
              In Vedic tradition, eclipses are powerful cosmic events marking the interplay of Sun (Surya), Moon (Chandra), and the shadow nodes Rahu & Ketu. The <strong className="text-[#f7f3eb]">Sutak Kaal (सूतक काल)</strong> is the sacred period before an eclipse during which food preparation, eating, and material rituals should be avoided.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm border-t border-[#d4651a]/10 pt-4">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-500" />
                <span className="text-[#d8bc7a]"><strong className="text-[#f7f3eb]">Solar Eclipse:</strong> Sutak begins 12 hours before first contact</span>
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-purple-400" />
                <span className="text-[#d8bc7a]"><strong className="text-[#f7f3eb]">Lunar Eclipse:</strong> Sutak begins 9 hours before first contact</span>
              </div>
            </div>
          </div>

          {/* Active Location Display */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-black/40 border border-[#d8bc7a]/20 rounded-2xl p-6 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
            <div className="flex-1">
              <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#d4651a] mb-1">Active Observation Station</div>
              <div className="flex items-center gap-2 text-[#f7f3eb]">
                <MapPin className="h-5 w-5 text-[#d8bc7a]" />
                <h2 className="font-display text-2xl font-bold">{location.name}</h2>
              </div>
              <div className="text-sm text-[#a69888] mt-1 ml-7">
                Coordinates: {location.lat.toFixed(4)}° N, {location.lon.toFixed(4)}° E
              </div>
            </div>
            
            <div className="w-full md:w-auto p-4 bg-white/5 border border-white/10 rounded-xl">
              <label className="block text-[10px] font-bold tracking-widest uppercase text-[#a69888] mb-3 text-center md:text-left">Change Station</label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-full sm:w-64">
                  <LocationSelector 
                    onLocationSelect={setLocation}
                    initialCity={location.name}
                  />
                </div>
                <div className="hidden sm:block h-10 w-px bg-white/10" />
                <Button 
                  onClick={handleGPSLocation} 
                  disabled={gpsLoading}
                  variant="outline" 
                  className="w-full sm:w-auto border-[#d4651a]/40 bg-[#d4651a]/15 text-[#e4cfa0] hover:bg-[#d4651a]/30 hover:text-white transition-all shadow-[0_2px_10px_rgba(212,101,26,0.2)]"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {gpsLoading ? "Locating..." : "Use Precise GPS"}
                </Button>
              </div>
            </div>
          </div>

          {/* Eclipse Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {eclipses.nextLunar && <EclipseCard data={eclipses.nextLunar} now={now} />}
            {eclipses.nextSolar && <EclipseCard data={eclipses.nextSolar} now={now} />}
          </div>
          
          <EclipseCalendarTimeline location={location} now={now} />
          
          <EclipseGuidelines />
          
        </div>
      </main>
    </Layout>
  );
};

export default EclipsePage;
