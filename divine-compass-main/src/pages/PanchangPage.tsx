import { useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  MapPin,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Clock,
  Star,
  AlertTriangle,
  CheckCircle,
  Timer,
  ArrowRight
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SeoHead } from "@/components/shared/SeoHead";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getSamplePanchangData } from "@/lib/calculators/astrology/panchang";
import { LocationSelector, LocationData } from "@/components/LocationSelector";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { panchangCities } from "@/data/panchangCities";
import { PanchangSegment } from "@/lib/data/panchang";
import { AdSenseBanner } from "@/components/shared/AdSenseBanner";

// Default location (Bengaluru)
const defaultLocation: LocationData = {
  name: "Bengaluru",
  stateCode: "KA",
  countryCode: "IN",
  lat: 12.9716,
  lon: 77.5946,
  timezone: "Asia/Kolkata"
};

const PanchangSegmentDisplay = ({ segments, icon: Icon, title, colorClass }: {
  segments: PanchangSegment[],
  icon: any,
  title: string,
  colorClass: string
}) => {
  return (
    <SpiritualCard delay={0.1}>
      <div className="text-center space-y-2 h-full flex flex-col items-center">
        <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-full mb-1", colorClass)}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{title}</div>

        <div className="flex-1 w-full space-y-3 pt-2">
          {segments.map((seg, idx) => (
            <div key={idx} className={cn(
              "relative pb-2",
              idx === 0 && segments.length > 1 && "border-b border-border/50 pb-3"
            )}>
              <div className="font-display text-lg font-bold text-foreground leading-tight">
                {seg.name}
              </div>

              {/* Contextual Info (Lord, Paksha, Pada) */}
              <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                {seg.paksha && <span>{seg.paksha}</span>}
                {seg.lord && <span>Lord: {seg.lord}</span>}
                {seg.pada && <span>Pada {seg.pada}</span>}
              </div>

              {/* Timing */}
              <div className="text-[11px] font-medium text-primary/80 mt-1 flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" />
                {segments.length === 1 ? (
                  `until ${seg.endTime}`
                ) : (
                  idx === 0 ? `until ${seg.endTime}` : `after ${segments[0].endTime}`
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SpiritualCard>
  );
};

export interface PanchangPageProps {
  /** Preset location for city landing pages (/panchang/:citySlug). */
  presetLocation?: LocationData;
  headerTitle?: string;
  headerSubtitle?: string;
  seo?: {
    title: string;
    description: string;
    path: string;
    keywords?: string;
  };
}

const PanchangPage = ({ presetLocation, headerTitle, headerSubtitle, seo }: PanchangPageProps = {}) => {
  const [date, setDate] = useState<Date>(new Date());
  const [location, setLocation] = useState<LocationData>(presetLocation ?? defaultLocation);

  const panchangData = getSamplePanchangData(date, location.lat, location.lon, location.timezone);

  // Get current hora
  const getCurrentHora = () => {
    const now = new Date();
    // Use local time for comparison
    const currentHour = now.getHours() + now.getMinutes() / 60;

    for (const hora of panchangData.hora) {
      const [startH, startM] = hora.startTime.replace(/[APM\s]/g, '').split(':').map(Number);
      const [endH, endM] = hora.endTime.replace(/[APM\s]/g, '').split(':').map(Number);

      let startHour = startH + startM / 60;
      let endHour = endH + endM / 60;

      if (hora.startTime.includes('PM') && startH !== 12) startHour += 12;
      if (hora.endTime.includes('PM') && endH !== 12) endHour += 12;
      if (hora.startTime.includes('AM') && startH === 12) startHour = startM / 60;
      if (hora.endTime.includes('AM') && endH === 12) endHour = endM / 60;

      if (currentHour >= startHour && currentHour < endHour) {
        return hora;
      }
    }
    return panchangData.hora[0];
  };

  const currentHora = getCurrentHora();

  return (
    <Layout>
      <SeoHead
        title={seo?.title ?? "Today's Panchang | Tithi, Nakshatra, Rahu Kaal & Muhurat"}
        description={
          seo?.description ??
          "Find today's panchang with tithi, nakshatra, yoga, karana, rahu kaal, abhijit muhurat, sunrise, and sunset for your location."
        }
        path={seo?.path ?? "/panchang"}
        type="website"
        keywords={
          seo?.keywords ??
          "today panchang, daily panchang, rahu kaal today, nakshatra today, tithi today, muhurat"
        }
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: seo?.title ?? "Today's Panchang",
          url: `https://www.divinepanchang.space${seo?.path ?? "/panchang"}`,
          description:
            seo?.description ??
            "Daily Panchang with tithi, nakshatra, yoga, karana, rahu kaal, abhijit muhurat, and location-aware timings.",
        }}
      />
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title={headerTitle ?? "Daily Panchang"}
          subtitle={
            headerSubtitle ??
            "Discover today's auspicious timings, Tithi, Nakshatra, and planetary positions for your location"
          }
          icon={<CalendarIcon className="h-8 w-8" />}
        />

        <div className="max-w-3xl mx-auto text-center mt-4 mb-6 text-muted-foreground italic">
          <p className="text-sm">
            Note: Moon-based elements (Tithi, Nakshatra, etc.) often transition mid-day.
            We display these transitions with precise "until" and "after" timings.
          </p>
        </div>

        {/* Date & Location Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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

        {/* Panchang Display */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 bg-card rounded-full px-6 py-3 border border-border/50 shadow-soft">
              <Star className="h-5 w-5 text-primary" />
              <span className="font-display text-xl font-semibold text-foreground">
                {panchangData.day}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{panchangData.date}</span>
            </div>
          </motion.div>

          {/* Main Panchang Elements Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PanchangSegmentDisplay
              title="Tithi"
              segments={panchangData.tithi}
              icon={Moon}
              colorClass="bg-primary/10 text-primary"
            />
            <PanchangSegmentDisplay
              title="Nakshatra"
              segments={panchangData.nakshatra}
              icon={Star}
              colorClass="bg-accent/20 text-accent-foreground"
            />
            <PanchangSegmentDisplay
              title="Yoga"
              segments={panchangData.yoga}
              icon={Sun}
              colorClass="bg-secondary/20 text-secondary"
            />
            <PanchangSegmentDisplay
              title="Karana"
              segments={panchangData.karana}
              icon={Clock}
              colorClass="bg-gold/20 text-gold"
            />
          </div>

          {/* Google AdSense Middle Banner */}
          <AdSenseBanner adSlot="panchang_middle_banner" adFormat="horizontal" />
          
          {/* Sun & Moon Times */}
          <div className="grid gap-4 md:grid-cols-2">
            <SpiritualCard delay={0.3}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-sacred-amber flex items-center justify-center">
                    <Sunrise className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Sunrise</div>
                    <div className="font-display text-2xl font-semibold text-foreground">
                      {panchangData.sunrise}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Sunset</div>
                  <div className="font-display text-2xl font-semibold text-foreground">
                    {panchangData.sunset}
                  </div>
                </div>
              </div>
            </SpiritualCard>

            <SpiritualCard delay={0.35}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-secondary to-maroon-light flex items-center justify-center">
                    <Moon className="h-7 w-7 text-secondary-foreground" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Moonrise</div>
                    <div className="font-display text-2xl font-semibold text-foreground">
                      {panchangData.moonrise}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Moonset</div>
                  <div className="font-display text-2xl font-semibold text-foreground">
                    {panchangData.moonset}
                  </div>
                </div>
              </div>
            </SpiritualCard>
          </div>

          {/* Hora Section */}
          <SpiritualCard delay={0.37} hover={false}>
            <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              Hora (Planetary Hours)
            </h3>

            <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-gold/10 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{currentHora.symbol}</span>
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Current Hora</div>
                    <div className="font-display text-xl font-semibold text-foreground">
                      {currentHora.planet}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {currentHora.startTime} - {currentHora.endTime}
                  </div>
                  <div className="font-display font-bold text-foreground mt-1">
                    {currentHora.isDay ? "☀️ Day Hora" : "🌙 Night Hora"}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-medium text-foreground flex items-center gap-2">
                <Sun className="h-4 w-4 text-primary" />
                Day Horas (Sunrise to Sunset)
              </div>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {panchangData.hora.filter(h => h.isDay).map((hora, idx) => (
                  <div
                    key={`day-${idx}`}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg text-sm border",
                      hora.planet === currentHora.planet && hora.isDay === currentHora.isDay
                        ? "bg-primary/10 border-primary/30"
                        : "bg-muted/30 border-transparent"
                    )}
                  >
                    <span className="text-lg">{hora.symbol}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-xs truncate">{hora.planet}</div>
                      <div className="text-[10px] text-muted-foreground">{hora.startTime}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-sm font-medium text-foreground flex items-center gap-2 mt-4">
                <Moon className="h-4 w-4 text-secondary" />
                Night Horas (Sunset to Sunrise)
              </div>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {panchangData.hora.filter(h => !h.isDay).map((hora, idx) => (
                  <div
                    key={`night-${idx}`}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg text-sm border",
                      hora.planet === currentHora.planet && hora.isDay === currentHora.isDay
                        ? "bg-secondary/10 border-secondary/30"
                        : "bg-muted/30 border-transparent"
                    )}
                  >
                    <span className="text-lg">{hora.symbol}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-xs truncate">{hora.planet}</div>
                      <div className="text-[10px] text-muted-foreground">{hora.startTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SpiritualCard>

          {/* Inauspicious Periods */}
          <SpiritualCard delay={0.4} hover={false}>
            <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Inauspicious Periods (Avoid Important Work)
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                <Clock className="h-5 w-5 text-destructive" />
                <div>
                  <div className="text-sm font-medium text-foreground">Rahu Kaal</div>
                  <div className="text-sm text-muted-foreground">{panchangData.rahuKaal}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                <Clock className="h-5 w-5 text-destructive" />
                <div>
                  <div className="text-sm font-medium text-foreground">Yamagandam</div>
                  <div className="text-sm text-muted-foreground">{panchangData.yamagandam}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                <Clock className="h-5 w-5 text-destructive" />
                <div>
                  <div className="text-sm font-medium text-foreground">Gulika Kaal</div>
                  <div className="text-sm text-muted-foreground">{panchangData.gulikaKaal}</div>
                </div>
              </div>
            </div>
          </SpiritualCard>

          {/* Auspicious Periods */}
          <div className="grid gap-4 md:grid-cols-2">
            <SpiritualCard delay={0.45} hover={false}>
              <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Auspicious Timings
              </h3>
              <div className="space-y-2">
                {panchangData.auspiciousTimings.map((timing, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg bg-green-500/5 border border-green-500/20"
                  >
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-foreground">{timing}</span>
                  </div>
                ))}
              </div>
            </SpiritualCard>

            <SpiritualCard delay={0.5} hover={false}>
              <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-gold" />
                Abhijit Muhurat
              </h3>
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-gold/10 to-primary/10 border border-gold/20">
                  <div className="font-display text-2xl font-bold text-foreground">
                    {panchangData.abhijitMuhurat}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  The most auspicious time of the day, ideal for starting new ventures
                </p>
              </div>
            </SpiritualCard>
          </div>

          {/* Choghadiya CTA */}
          <div className="mt-8 text-center bg-primary/5 border border-primary/20 rounded-2xl p-6 shadow-sm">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2 flex items-center justify-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              Looking for specific timing windows?
            </h3>
            <p className="text-muted-foreground text-sm mb-5">Discover the most auspicious periods for your daily tasks with our Choghadiya calculator.</p>
            <Link to="/choghadiya" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm">
              Check Today's Choghadiya <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Google AdSense Bottom Banner */}
          <AdSenseBanner adSlot="panchang_bottom_banner" adFormat="horizontal" />

          {/* Content Section */}
          <div className="max-w-3xl mx-auto mt-16">
            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-3 mb-10">
              <span className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40 rounded-full" />
              <span className="text-primary/60 text-lg">☀</span>
              <span className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40 rounded-full" />
            </div>

            <div className="rounded-2xl border border-[#d8bc7a]/30 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-8 shadow-card space-y-8">
              <div className="text-center">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
                  What is a Daily Panchang?
                </h2>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="h-px w-8 bg-primary/40 rounded-full" />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                  <span className="h-px w-8 bg-primary/40 rounded-full" />
                </div>
                <p className="text-foreground/70 leading-relaxed max-w-xl mx-auto">
                  The Panchang is a sacred Vedic almanac capturing five essential qualities of each day — helping you move in harmony with cosmic rhythms.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { icon: "🕉️", title: "Five Sacred Elements", desc: "Tithi, Vara, Nakshatra, Yoga, and Karana - each element reveals a different quality of the day's energy." },
                  { icon: "📍", title: "Truly Local", desc: "Timings for sunrise, Rahu Kaal, and Brahma Muhurta are calculated precisely for your city, not a generic average." },
                  { icon: "✨", title: "Plan Auspiciously", desc: "Choose the best times for ceremonies, travel, new ventures, and important decisions with confidence." }
                ].map((item, idx) => (
                  <div key={item.title} className="rounded-xl border border-border/60 bg-card/80 p-5 text-center space-y-2">
                    <div className="text-2xl">{item.icon}</div>
                    <h3 className="font-serif text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border/40 pt-6 space-y-4">
                <h3 className="font-serif text-lg font-semibold text-foreground">Understanding Rahu Kaal</h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  Rahu Kaal is a daily period of approximately 90 minutes considered inauspicious for new beginnings. It is governed by Rahu (the north lunar node) and falls at different times each day of the week. Starting a journey, signing a contract, or launching a new project during Rahu Kaal is traditionally avoided in Vedic practice — however, continuing ongoing work during this window is perfectly fine.
                </p>
              </div>

              {/* Panchang by city — internal links to prerendered city pages */}
              <div className="border-t border-border/40 pt-6 space-y-4">
                <h3 className="font-serif text-lg font-semibold text-foreground">Today's Panchang by City</h3>
                <div className="flex flex-wrap gap-2">
                  {panchangCities
                    .filter((city) => `/panchang/${city.slug}` !== seo?.path)
                    .map((city) => (
                      <Link
                        key={city.slug}
                        to={`/panchang/${city.slug}`}
                        className="rounded-full border border-border/70 bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        {city.name} Panchang
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RelatedLinks
        links={[
          {
            to: "/blog/what-is-panchang",
            title: "What is Panchang? A Complete Guide",
            description: "Tithi, Vara, Nakshatra, Yoga, and Karana explained — and how to use them for auspicious timing.",
          },
          {
            to: "/ekadashi",
            title: "Ekadashi Dates & Fasting Calendar",
            description: "Upcoming Ekadashi tithis with fasting and parana timings.",
          },
          {
            to: "/daily-guidance",
            title: "Daily Vedic Guidance",
            description: "Practical guidance for the day based on the current panchang.",
          },
          {
            to: "/kundali",
            title: "Free Janam Kundali",
            description: "Generate your Vedic birth chart with accurate planetary positions.",
          },
        ]}
      />
    </Layout>
  );
};

export default PanchangPage;
