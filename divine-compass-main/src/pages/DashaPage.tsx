import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { Moon, Sparkles, Calendar, Clock, MapPin, Star, ChevronDown, ChevronRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  calculateSampleDasha,
  getCurrentDasha,
  formatDashaDuration
} from "@/lib/calculators/astrology/dasha";
import {
  dashaPlanets,
  planetDescriptions,
  DashaPeriod
} from "@/lib/data/dasha";
import { LocationSelector, LocationData } from "@/components/LocationSelector";
import { SeoHead } from "@/components/shared/SeoHead";

// Default location (Bengaluru)
const defaultLocation: LocationData = {
  name: "Bengaluru",
  stateCode: "KA",
  countryCode: "IN",
  lat: 12.9716,
  lon: 77.5946,
  timezone: "Asia/Kolkata"
};

const DashaPage = () => {
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [location, setLocation] = useState<LocationData>(defaultLocation);
  const [dashaResults, setDashaResults] = useState<{
    dashas: DashaPeriod[];
    current: { mahadasha: DashaPeriod | null; antardasha: any | null };
  } | null>(null);
  const [expandedDasha, setExpandedDasha] = useState<string | null>(null);

  const handleCalculate = () => {
    if (!birthDate) return;

    const [year, month, day] = birthDate.split('-').map(Number);
    const [hours, minutes] = birthTime.split(':').map(Number);

    // Pass components directly to avoid timezone ambiguity in the Date object
    const dashas = calculateSampleDasha({
      year,
      month,
      day,
      hour: hours,
      minute: minutes,
      timezone: location.timezone
    });

    const current = getCurrentDasha(dashas);

    setDashaResults({ dashas, current });
    if (current.mahadasha) {
      setExpandedDasha(current.mahadasha.planet);
    }
  };

  const getPlanetSymbol = (planetName: string) => {
    return dashaPlanets.find(p => p.name === planetName)?.symbol || "☆";
  };

  const getProgressPercentage = (dasha: DashaPeriod) => {
    const now = new Date();
    const total = dasha.endDate.getTime() - dasha.startDate.getTime();
    const elapsed = now.getTime() - dasha.startDate.getTime();
    return Math.min(Math.max((elapsed / total) * 100, 0), 100);
  };

  return (
    <Layout>
        <SeoHead
            title="Vimshottari Dasha Calculator - Current Mahadasha & Antardasha"
            description="Calculate your Vimshottari Dasha periods from your birth details. See your current Mahadasha, Antardasha, and Pratyantardasha with exact dates."
            path="/dasha"
            type="website"
            keywords="dasha calculator, vimshottari dasha, current mahadasha, antardasha calculator"
        />
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Dasha Calculator"
          subtitle="Explore your Vimshottari Dasha periods and understand the planetary influences shaping your life"
          icon={<Moon className="h-8 w-8" />}
        />

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <SpiritualCard hover={false}>
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Date of Birth</Label>
                  <Input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="h-11 bg-card border-2 border-primary/20 focus:border-primary/50 rounded-xl text-foreground"
                  />
                </div>

                {/* Birth Time */}
                <div className="space-y-2">
                  <Label className="text-foreground font-medium">Time of Birth</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input
                      type="time"
                      value={birthTime}
                      onChange={(e) => setBirthTime(e.target.value)}
                      className="h-11 pl-10 bg-card border-2 border-primary/20 focus:border-primary/50"
                    />
                  </div>
                </div>

                {/* Birth Place */}
                <div className="space-y-2 sm:col-span-2">
                  <LocationSelector
                    onLocationSelect={setLocation}
                    initialCity={location.name}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This is a simplified Vimshottari Dasha calculation for demonstration.
                  For accurate results, please consult a professional astrologer with your exact birth details.
                </p>
              </div>

              <Button
                onClick={handleCalculate}
                variant="saffron"
                size="lg"
                className="w-full"
                disabled={!birthDate}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Calculate Dasha Periods
              </Button>
            </div>
          </SpiritualCard>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {dashaResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Current Dasha Highlight */}
              {dashaResults.current.mahadasha && (
                <SpiritualCard delay={0.1} hover={false}>
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                      <Star className="h-4 w-4" />
                      Currently Running
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                      <div className="text-center">
                        <div className="inline-flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sacred-amber shadow-glow-saffron">
                          <span className="text-5xl">{getPlanetSymbol(dashaResults.current.mahadasha.planet)}</span>
                        </div>
                        <div className="mt-3">
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">Mahadasha</div>
                          <div className="font-display text-2xl font-bold text-foreground">
                            {dashaResults.current.mahadasha.planet}
                          </div>
                        </div>
                      </div>

                      {dashaResults.current.antardasha && (
                        <>
                          <div className="hidden sm:block text-muted-foreground">→</div>
                          <div className="text-center">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-light shadow-soft">
                              <span className="text-3xl">{getPlanetSymbol(dashaResults.current.antardasha.planet)}</span>
                            </div>
                            <div className="mt-2">
                              <div className="text-xs uppercase tracking-wide text-muted-foreground">Antardasha</div>
                              <div className="font-display text-lg font-semibold text-foreground">
                                {dashaResults.current.antardasha.planet}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Planet Description */}
                    <div className="max-w-xl mx-auto pt-4">
                      <p className="text-muted-foreground">
                        {planetDescriptions[dashaResults.current.mahadasha.planet]?.effects}
                      </p>
                    </div>
                  </div>
                </SpiritualCard>
              )}

              {/* All Dasha Periods */}
              <div className="space-y-4">
                <h3 className="font-display text-xl font-semibold text-foreground text-center">
                  Complete Dasha Timeline
                </h3>

                <div className="space-y-3">
                  {dashaResults.dashas.map((dasha, index) => {
                    const isActive = dashaResults.current.mahadasha?.planet === dasha.planet;
                    const isPast = new Date() > dasha.endDate;
                    const progress = getProgressPercentage(dasha);

                    return (
                      <motion.div
                        key={dasha.planet}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <Collapsible
                          open={expandedDasha === dasha.planet}
                          onOpenChange={(open) => setExpandedDasha(open ? dasha.planet : null)}
                        >
                          <SpiritualCard
                            hover={false}
                            className={cn(
                              "p-4 transition-all",
                              isActive && "ring-2 ring-primary/50 bg-primary/5"
                            )}
                          >
                            <CollapsibleTrigger className="w-full">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center text-2xl transition-all",
                                    isActive
                                      ? "bg-gradient-to-br from-primary to-sacred-amber shadow-glow-saffron"
                                      : isPast
                                        ? "bg-muted text-muted-foreground"
                                        : "bg-secondary/20"
                                  )}>
                                    {getPlanetSymbol(dasha.planet)}
                                  </div>
                                  <div className="text-left">
                                    <div className="flex items-center gap-2">
                                      <span className="font-display text-lg font-semibold text-foreground">
                                        {dasha.planet}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        ({dasha.years} years)
                                      </span>
                                      {isActive && (
                                        <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                                          Active
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {format(dasha.startDate, "MMM yyyy")} - {format(dasha.endDate, "MMM yyyy")}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {isActive && (
                                    <div className="hidden sm:block w-32">
                                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                                        <div
                                          className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                                          style={{ width: `${progress}%` }}
                                        />
                                      </div>
                                      <div className="text-xs text-muted-foreground text-right mt-1">
                                        {Math.round(progress)}% complete
                                      </div>
                                    </div>
                                  )}
                                  {expandedDasha === dasha.planet ? (
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>

                            <CollapsibleContent>
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="pt-4 mt-4 border-t border-border"
                              >
                                <div className="space-y-4">
                                  <div className="p-3 rounded-lg bg-muted/50">
                                    <div className="text-sm font-medium text-foreground mb-1">
                                      {planetDescriptions[dasha.planet]?.meaning}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      {planetDescriptions[dasha.planet]?.effects}
                                    </p>
                                  </div>

                                  {dasha.antardashas && dasha.antardashas.length > 0 && (
                                    <div>
                                      <div className="text-sm font-medium text-foreground mb-2">
                                        Antardasha Periods:
                                      </div>
                                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                        {dasha.antardashas.map((ad) => {
                                          const isCurrentAd = dashaResults.current.antardasha?.planet === ad.planet &&
                                            isActive;
                                          return (
                                            <div
                                              key={ad.planet}
                                              className={cn(
                                                "flex flex-col gap-1 p-3 rounded-lg text-sm",
                                                isCurrentAd
                                                  ? "bg-gold/20 border border-gold/30"
                                                  : "bg-muted/30"
                                              )}
                                            >
                                              <div className="flex items-center gap-2">
                                                <span>{getPlanetSymbol(ad.planet)}</span>
                                                <span className="font-medium text-foreground">{ad.planet}</span>
                                                {isCurrentAd && (
                                                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-medium">Now</span>
                                                )}
                                              </div>
                                              <div className="text-xs text-muted-foreground pl-6">
                                                {format(ad.startDate, "d MMM yyyy")} – {format(ad.endDate, "d MMM yyyy")}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </CollapsibleContent>
                          </SpiritualCard>
                        </Collapsible>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default DashaPage;
