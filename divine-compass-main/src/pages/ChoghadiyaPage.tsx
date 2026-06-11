import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  Sun,
  Moon,
  CheckCircle,
  AlertTriangle,
  Info,
  Timer
} from "lucide-react";

import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SeoHead } from "@/components/shared/SeoHead";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { AdSenseBanner } from "@/components/shared/AdSenseBanner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LocationSelector, LocationData } from "@/components/LocationSelector";

import { 
  calculateChoghadiya, 
  ChoghadiyaSegment, 
  ChoghadiyaStatus,
  getActiveChoghadiya
} from "@/lib/calculators/astrology/choghadiya";

// Default location (Bengaluru) as fallback
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
        color: "text-emerald-700 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        icon: <CheckCircle className="h-4 w-4" />,
        label: "Favorable"
      };
    case "neutral":
      return {
        color: "text-amber-700 dark:text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        icon: <Info className="h-4 w-4" />,
        label: "Neutral"
      };
    case "avoid":
      return {
        color: "text-rose-700 dark:text-rose-400",
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

export const ChoghadiyaPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [location, setLocation] = useState<LocationData>(defaultLocation);
  const [now, setNow] = useState<Date>(new Date());

  // Update current time every minute to keep active choghadiya accurate
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const choghadiyaData = calculateChoghadiya(date, location.lat, location.lon);

  const isToday = new Date().toDateString() === date.toDateString();
  
  // Find current segment if the selected date is today
  let currentSegment: ChoghadiyaSegment | null = null;
  if (isToday) {
    currentSegment = 
      getActiveChoghadiya(choghadiyaData.daySegments, now) || 
      getActiveChoghadiya(choghadiyaData.nightSegments, now);
  }

  // Find next favorable window
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
          "relative flex items-center justify-between p-4 rounded-xl border transition-colors",
          config.bg, config.border,
          isActive && "ring-2 ring-primary shadow-glow-saffron ring-offset-2 ring-offset-background"
        )}
      >
        {isActive && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest shadow-sm">
            Active Now
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("font-display text-lg font-bold", config.color)}>
              {seg.name}
            </span>
            <span className={cn("flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border", config.bg, config.border, config.color)}>
              {config.icon}
              {config.label}
            </span>
          </div>
          <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {formatTime(seg.startTime, location.timezone)} - {formatTime(seg.endTime, location.timezone)}
          </div>
        </div>
        
        <div className="w-1/3 text-right">
          <div className="text-[11px] text-muted-foreground/80 leading-tight">
            {seg.meaning.split(" - ")[1]}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <SeoHead
        title="Today's Choghadiya Timings | Shubh, Amrit & Rahu Kaal"
        description={`Check today's Choghadiya timings for ${location.name}. Find the most auspicious (Shubh, Amrit, Labh) times of the day and night for new beginnings.`}
        path="/choghadiya"
        type="website"
        keywords="choghadiya today, today choghadiya, shubh choghadiya today, amrit choghadiya, choghadiya timings today, day choghadiya, night choghadiya"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Today's Choghadiya Timings",
          url: "https://www.divinepanchang.space/choghadiya",
          description: "Daily Day and Night Choghadiya timings with accurate astronomical sunrise calculations."
        }}
      />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <PageHeader
          title="Daily Choghadiya"
          subtitle="Discover the most auspicious timing windows throughout your day and night"
          icon={<Timer className="h-8 w-8" />}
        />

        {/* Date & Location Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10"
        >
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="spiritual"
                size="lg"
                className="w-full sm:w-auto min-w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <div className="w-full max-w-2xl">
            <LocationSelector
              onLocationSelect={setLocation}
              initialCity={location.name}
            />
          </div>
        </motion.div>
        
        {/* Timing Context Note */}
        <div className="text-center mb-8 text-sm text-muted-foreground">
          Showing precise Choghadiya calculations based on local Sunrise 
          <span className="font-semibold text-foreground mx-1">({formatTime(choghadiyaData.sunrise, location.timezone)})</span> 
          and Sunset 
          <span className="font-semibold text-foreground mx-1">({formatTime(choghadiyaData.sunset, location.timezone)})</span> 
          in <span className="font-semibold text-foreground">{location.name}</span>.
        </div>

        {/* Summary Blocks */}
        {isToday && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid gap-4 md:grid-cols-2 mb-10"
          >
            {currentSegment ? (
              <div className="p-6 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card shadow-sm flex flex-col justify-center">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Current Active Period</h3>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "h-14 w-14 rounded-full flex items-center justify-center border-4",
                    getStatusConfig(currentSegment.status).bg,
                    getStatusConfig(currentSegment.status).border,
                    getStatusConfig(currentSegment.status).color
                  )}>
                    {getStatusConfig(currentSegment.status).icon}
                  </div>
                  <div>
                    <div className="font-display text-2xl font-bold text-foreground">
                      {currentSegment.name} Choghadiya
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mt-0.5">
                      Ends at {formatTime(currentSegment.endTime, location.timezone)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-border/50 bg-card shadow-sm flex flex-col justify-center text-center">
                <div className="font-medium text-muted-foreground">No active Choghadiya found for current time.</div>
              </div>
            )}

            <div className="p-6 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-card shadow-sm flex flex-col justify-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Next Favorable Window</h3>
              {nextFavorable ? (
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-emerald-500/10 border-4 border-emerald-500/20 text-emerald-600 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-display text-2xl font-bold text-foreground">
                      {nextFavorable.name} Choghadiya
                    </div>
                    <div className="text-sm text-muted-foreground font-medium mt-0.5">
                      Starts at {formatTime(nextFavorable.startTime, location.timezone)}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm font-medium text-muted-foreground">
                  No favorable windows remaining today. Check tomorrow's timings.
                </div>
              )}
            </div>
          </motion.div>
        )}

        <AdSenseBanner adSlot="choghadiya_top_banner" adFormat="horizontal" />

        {/* Choghadiya Tables */}
        <div className="grid lg:grid-cols-2 gap-8 mt-10">
          <SpiritualCard delay={0.3}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Sun className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Day Choghadiya</h2>
                <p className="text-sm text-muted-foreground">Sunrise to Sunset</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {choghadiyaData.daySegments.map((seg, idx) => renderSegment(seg, idx))}
            </div>
          </SpiritualCard>

          <SpiritualCard delay={0.4}>
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Moon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Night Choghadiya</h2>
                <p className="text-sm text-muted-foreground">Sunset to Next Sunrise</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {choghadiyaData.nightSegments.map((seg, idx) => renderSegment(seg, idx))}
            </div>
          </SpiritualCard>
        </div>

        {/* Educational Content */}
        <div className="mt-16 max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Understanding Choghadiya</h2>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="h-px w-12 bg-primary/40 rounded-full" />
              <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
              <span className="h-px w-12 bg-primary/40 rounded-full" />
            </div>
            <p className="text-foreground/80 leading-relaxed text-lg">
              Choghadiya is a traditional Vedic astrology system used to find favorable and unfavorable times of the day. 
              By dividing the day and night into 8 equal segments each, it helps in planning important activities, travels, and new beginnings.
            </p>
            <p className="text-sm text-muted-foreground mt-4 italic">
              Please note: Choghadiya is supportive planning guidance, not an absolute certainty. Use it to align your efforts with favorable cosmic tides.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border bg-card/50">
              <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4" /> Favorable
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                <li><strong className="text-foreground">Amrit:</strong> Nectar. Best for all types of work.</li>
                <li><strong className="text-foreground">Shubh:</strong> Auspicious. Good for marriage, wealth, and ceremonies.</li>
                <li><strong className="text-foreground">Labh:</strong> Gain. Ideal for business, education, and starting new projects.</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-xl border bg-card/50">
              <h3 className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2 mb-2">
                <Info className="h-4 w-4" /> Neutral
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                <li><strong className="text-foreground">Char:</strong> Variable. This is a generally workable and safe period. It is well-suited for movement, travel, communication, and routine starts without strong positive or negative bias.</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border bg-card/50">
              <h3 className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4" /> Avoid
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                <li><strong className="text-foreground">Rog:</strong> Disease. Avoid medical treatments or major starts.</li>
                <li><strong className="text-foreground">Kaal:</strong> Death/Loss. Strictly avoid for new beginnings or wealth matters.</li>
                <li><strong className="text-foreground">Udveg:</strong> Anxiety. Can cause distress, delays, and obstacles.</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* SEO FAQ Section */}
        <div className="mt-16 pt-12 border-t border-border/50 max-w-3xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-2">How is Choghadiya calculated?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Choghadiya relies on accurate astronomical calculations. The time between local Sunrise and local Sunset is divided into 8 equal parts to form the "Day Choghadiya". Similarly, the time between Sunset and the Next Sunrise is divided into 8 equal parts for the "Night Choghadiya". Each segment lasts approximately 1.5 hours, but varies slightly depending on the season and location.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-2">What is Amrit Choghadiya?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Amrit is considered the most powerful and auspicious Choghadiya segment. Governed by the Moon, it brings nourishing, nectar-like energy that is highly beneficial for almost any important task, journey, or ceremony.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Is Choghadiya the same as Rahu Kaal?</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                No, they are different systems. Rahu Kaal is a fixed 90-minute period every day governed by the shadow planet Rahu, which is strictly avoided for new beginnings. Choghadiya is a continuous cycle of 8 periods throughout the day and night that indicates varying levels of auspiciousness based on planetary hours.
              </p>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default ChoghadiyaPage;
