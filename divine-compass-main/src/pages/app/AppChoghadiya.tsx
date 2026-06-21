import React, { useState, useEffect } from "react";
import AppShell from "./AppShell";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/userService";
import { format } from "date-fns";
import { LocationSelector, LocationData } from "../../components/LocationSelector";
import { Input } from "../../components/ui/input";
import { Clock, Sun, Moon, CheckCircle, AlertTriangle, Info } from "lucide-react";
import {
  calculateChoghadiya,
  ChoghadiyaSegment,
  ChoghadiyaStatus,
  getActiveChoghadiya
} from "../../lib/calculators/astrology/choghadiya";
import { cn } from "../../lib/utils";

const defaultLocation: LocationData = {
  name: "Bengaluru",
  stateCode: "KA",
  countryCode: "IN",
  lat: 12.9716,
  lon: 77.5946,
  timezone: "Asia/Kolkata"
};

const getStatusConfig = (status: ChoghadiyaStatus) => {
  switch (status) {
    case "favorable":
      return {
        color: "text-emerald-700",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        icon: <CheckCircle className="h-4 w-4" />,
        label: "Favorable"
      };
    case "neutral":
      return {
        color: "text-amber-700",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        icon: <Info className="h-4 w-4" />,
        label: "Neutral"
      };
    case "avoid":
      return {
        color: "text-rose-700",
        bg: "bg-rose-500/10",
        border: "border-rose-500/20",
        icon: <AlertTriangle className="h-4 w-4" />,
        label: "Avoid"
      };
  }
};

const formatTime = (d: Date, timezone: string) => {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  }).format(d).toLowerCase();
};

export const AppChoghadiya: React.FC = () => {
  const { currentUser } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [location, setLocation] = useState<LocationData>(defaultLocation);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    if (currentUser) {
      userService.getUserProfile(currentUser.uid).then(profile => {
        if (profile?.birthDetails && profile.birthDetails.latitude && profile.birthDetails.longitude) {
          setLocation({
            name: profile.birthDetails.city || "Birth City",
            stateCode: profile.birthDetails.state || "",
            countryCode: profile.birthDetails.country || "",
            lat: profile.birthDetails.latitude,
            lon: profile.birthDetails.longitude,
            timezone: profile.birthDetails.timezoneId || "Asia/Kolkata"
          });
        }
      });
    }
  }, [currentUser]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const choghadiyaData = calculateChoghadiya(date, location.lat, location.lon);
  const isToday = new Date().toDateString() === date.toDateString();
  
  let currentSegment: ChoghadiyaSegment | null = null;
  if (isToday) {
    currentSegment = 
      getActiveChoghadiya(choghadiyaData.daySegments, now) || 
      getActiveChoghadiya(choghadiyaData.nightSegments, now);
  }

  const allSegments = [...choghadiyaData.daySegments, ...choghadiyaData.nightSegments];
  const nextFavorable = allSegments.find(s => 
    s.status === "favorable" && s.startTime.getTime() > now.getTime()
  );

  const renderSegment = (seg: ChoghadiyaSegment, idx: number) => {
    const isActive = currentSegment && currentSegment.name === seg.name && currentSegment.startTime.getTime() === seg.startTime.getTime();
    const config = getStatusConfig(seg.status);
    
    return (
      <div 
        key={idx} 
        className={cn(
          "relative flex items-center justify-between p-3 rounded-xl border mb-3",
          config.bg, config.border,
          isActive && "ring-2 ring-amber-500 bg-white"
        )}
      >
        {isActive && (
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest">
            Active Now
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("font-bold text-sm", config.color)}>
              {seg.name}
            </span>
            <span className={cn("flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded-full border", config.bg, config.border, config.color)}>
              {config.label}
            </span>
          </div>
          <div className="text-[11px] text-stone-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(seg.startTime, location.timezone)} - {formatTime(seg.endTime, location.timezone)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppShell title="Choghadiya" eyebrow="Sacred Vedic Tools" showBack>
      <div className="space-y-5">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
              Date
            </label>
            <Input
              type="date"
              value={format(date, "yyyy-MM-dd")}
              onChange={(e) => {
                if (e.target.value) setDate(new Date(e.target.value));
              }}
              className="h-10 bg-stone-50 border-stone-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
              Location
            </label>
            <LocationSelector
              onLocationSelect={setLocation}
              initialCity={location.name}
            />
          </div>
        </div>

        {isToday && currentSegment && (
          <div className="bg-gradient-to-br from-amber-50 to-white p-5 rounded-2xl border border-amber-200 shadow-sm">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-2">Current Active Period</h3>
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center",
                getStatusConfig(currentSegment.status).bg,
                getStatusConfig(currentSegment.status).color
              )}>
                {getStatusConfig(currentSegment.status).icon}
              </div>
              <div>
                <div className="font-display text-xl font-bold text-stone-900">
                  {currentSegment.name} Choghadiya
                </div>
                <div className="text-xs text-stone-500 font-medium mt-0.5">
                  Ends at {formatTime(currentSegment.endTime, location.timezone)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <Sun className="h-5 w-5 text-amber-500" />
            <h2 className="font-bold text-stone-900 text-lg">Day Choghadiya</h2>
          </div>
          <div>
            {choghadiyaData.daySegments.map((seg, idx) => renderSegment(seg, idx))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <Moon className="h-5 w-5 text-indigo-500" />
            <h2 className="font-bold text-stone-900 text-lg">Night Choghadiya</h2>
          </div>
          <div>
            {choghadiyaData.nightSegments.map((seg, idx) => renderSegment(seg, idx))}
          </div>
        </div>

      </div>
    </AppShell>
  );
};

export default AppChoghadiya;
