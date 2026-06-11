import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Map, Calendar, Clock, LayoutGrid, List, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { LocationSelector } from "@/components/LocationSelector";
import {
    getAscendant,
    getPlanetPositions,
    getDivisionalChartData,
    PlanetPosition
} from "@/lib/astro/kundaliEngine";
import { ChartType } from "@/lib/astro/vargaEngine";
import PlanetTable from "@/components/kundali/PlanetTable";
import DivisionalChart from "@/components/kundali/DivisionalChart";
import DivisionalChartSelector from "@/components/kundali/DivisionalChartSelector";
import ChartStyleToggle from "@/components/kundali/ChartStyleToggle";
import LifeThemesSummary from "@/components/kundali/LifeThemesSummary";
import ChartInterpretation from "@/components/kundali/ChartInterpretation";
import DivisionalChartsIntro from "@/components/kundali/DivisionalChartsIntro";
import KundaliFAQ from "@/components/kundali/KundaliFAQ";
import KundaliReviews from "@/components/kundali/KundaliReviews";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { SeoHead } from "@/components/shared/SeoHead";

const SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const KundaliPage = () => {
    const [birthDate, setBirthDate] = useState("");
    const [birthTime, setBirthTime] = useState("");
    const [location, setLocation] = useState({
        country: "",
        state: "",
        city: "",
        lat: 12.9716,
        lon: 77.5946,
        timezone: "Asia/Kolkata"
    });

    const [results, setResults] = useState<{
        planets: PlanetPosition[];
        ascendant: number;
        lagnaSignIdx: number;
    } | null>(null);

    // New state for divisional charts and chart style
    const [selectedChart, setSelectedChart] = useState<string>("D1");
    const [chartStyle, setChartStyle] = useState<"north" | "south">("north");

    // Load chart style preference from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("kundali-chart-style");
        if (saved && (saved === "north" || saved === "south")) {
            setChartStyle(saved);
        }
    }, []);

    // Save chart style preference
    useEffect(() => {
        localStorage.setItem("kundali-chart-style", chartStyle);
    }, [chartStyle]);

    const handleGenerate = () => {
        console.log("Generate clicked with:", { birthDate, birthTime, location });
        if (!birthDate || !birthTime) {
            console.error("Missing date/time");
            return;
        }

        try {
            const date = new Date(`${birthDate}T${birthTime}`);
            console.log("Calculating planets for:", date);
            const planets = getPlanetPositions(date, location.lat, location.lon);
            console.log("Planets calculated:", planets);

            const ascendant = getAscendant(date, location.lat, location.lon);
            console.log("Ascendant calculated:", ascendant);

            const lagnaSignIdx = Math.floor(ascendant / 30);

            setResults({
                planets,
                ascendant,
                lagnaSignIdx
            });
            console.log("Results set successfully");
        } catch (error) {
            console.error("Error generating chart:", error);
            alert("Error generating chart. Check console for details.");
        }
    };

    return (
        <Layout>
            <SeoHead
                title="Free Janam Kundali Online - Vedic Birth Chart Generator"
                description="Generate your free Janam Kundali with accurate planetary positions, lagna, divisional charts, and dasha periods. North and South Indian chart styles."
                path="/kundali"
                type="website"
                keywords="free kundali, janam kundali online, vedic birth chart, kundali generator, lagna chart"
            />
            <div className="container mx-auto px-4 py-8">
                <PageHeader
                    title="Janam Kundali"
                    subtitle="Your precise Vedic birth chart calculated using high-precision astronomical algorithms and Lahiri Ayanamsha"
                    icon={<Star className="h-8 w-8" />}
                />

                {/* Educational Intro Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    <DivisionalChartsIntro />
                </motion.div>

                {/* Input Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto mb-12"
                >
                    <SpiritualCard hover={false}>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary" /> Birth Date
                                    </Label>
                                    <Input
                                        type="date"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                        max={new Date().toISOString().split("T")[0]}
                                        className="h-11 bg-card border-2 border-primary/20 focus:border-primary/50 rounded-xl text-foreground"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-primary" /> Birth Time
                                    </Label>
                                    <Input
                                        type="time"
                                        value={birthTime}
                                        onChange={(e) => setBirthTime(e.target.value)}
                                        className="bg-background"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="flex items-center gap-2">
                                    <Map className="h-4 w-4 text-primary" /> Birth Location
                                </Label>
                                <LocationSelector
                                    onLocationSelect={(loc) => setLocation({
                                        country: loc.countryCode,
                                        state: loc.stateCode,
                                        city: loc.name,
                                        lat: loc.lat,
                                        lon: loc.lon,
                                        timezone: loc.timezone
                                    })}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            variant="saffron"
                            size="lg"
                            className="w-full mt-8 font-bold"
                            disabled={!birthDate || !birthTime}
                        >
                            Generate Kundali
                        </Button>
                    </SpiritualCard>
                </motion.div>

                {/* Result Section */}
                <AnimatePresence mode="wait">
                    {results && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8"
                        >
                            {/* Life Themes Summary */}
                            <LifeThemesSummary />

                            {/* Chart Style Toggle */}
                            <ChartStyleToggle
                                chartStyle={chartStyle}
                                onStyleChange={setChartStyle}
                            />

                            {/* Divisional Chart Selector */}
                            <DivisionalChartSelector
                                selectedChart={selectedChart}
                                onChartSelect={setSelectedChart}
                            />

                            {/* Chart Display with Animation */}
                            <div className="grid gap-8 lg:grid-cols-2">
                                {/* Chart Section */}
                                <SpiritualCard hover={false} className="h-full">
                                    <div className="mb-6">
                                        <h3 className="font-display text-2xl font-bold flex items-center gap-2">
                                            <LayoutGrid className="h-6 w-6 text-primary" />
                                            {selectedChart === "D1" ? "Birth Chart (Lagna)" : `${selectedChart} Chart`}
                                        </h3>
                                    </div>

                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={selectedChart}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <DivisionalChart
                                                chartId={selectedChart}
                                                chartStyle={chartStyle}
                                                planets={
                                                    selectedChart === "D1"
                                                        ? results.planets
                                                        : getDivisionalChartData(selectedChart as ChartType, results.planets, results.ascendant).planets
                                                }
                                                lagnaSignIdx={
                                                    selectedChart === "D1"
                                                        ? results.lagnaSignIdx
                                                        : getDivisionalChartData(selectedChart as ChartType, results.planets, results.ascendant).lagnaSignIdx
                                                }
                                            />
                                        </motion.div>
                                    </AnimatePresence>
                                </SpiritualCard>

                                {/* Info Section */}
                                <div className="space-y-6">
                                    <SpiritualCard className="border-sacred-amber/30 bg-sacred-amber/5">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Ascendant (Lagna)</p>
                                                <h4 className="text-3xl font-display font-bold text-sacred-amber">
                                                    {SIGNS[results.lagnaSignIdx]}
                                                </h4>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Rasi (Moon Sign)</p>
                                                <h4 className="text-2xl font-display font-medium text-foreground">
                                                    {results.planets.find(p => p.name === "Moon")?.sign}
                                                </h4>
                                            </div>
                                        </div>
                                    </SpiritualCard>

                                    <PlanetTable
                                        planets={results.planets}
                                        lagna={{
                                            sign: SIGNS[results.lagnaSignIdx],
                                            degree: results.ascendant % 30
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Chart Interpretation */}
                            <ChartInterpretation
                                chartId={selectedChart}
                                lagnaSign={SIGNS[results.lagnaSignIdx]}
                            />

                            {/* Interpretation Placeholder */}
                            <div className="grid gap-6 md:grid-cols-3">
                                {[
                                    { title: "Planetary Strengths", icon: <Star className="h-5 w-5" />, desc: "Analysis of Shadbala and Dignity (Coming Soon)" },
                                    { title: "Yoga Analysis", icon: <Sparkles className="h-5 w-5" />, desc: "Detection of major planetary combinations (Coming Soon)" },
                                    { title: "Life Themes", icon: <List className="h-5 w-5" />, desc: "Deciphering karmic patterns from house placements (Coming Soon)" }
                                ].map((item, i) => (
                                    <SpiritualCard key={i} delay={i * 0.1}>
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold mb-1">{item.title}</h4>
                                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                                            </div>
                                        </div>
                                    </SpiritualCard>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reviews & Feedback — always visible */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="mt-16"
                >
                    <KundaliReviews />
                </motion.div>

                {/* FAQ — always visible */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 }}
                    className="mt-12 mb-8"
                >
                    <KundaliFAQ />
                </motion.div>
            </div>

            <RelatedLinks
                links={[
                    {
                        to: "/blog/how-to-read-kundali",
                        title: "How to Read Your Kundali",
                        description: "Houses, planets, and signs decoded in plain language for beginners.",
                    },
                    {
                        to: "/dasha",
                        title: "Vimshottari Dasha Calculator",
                        description: "See which planetary period governs this chapter of your life.",
                    },
                    {
                        to: "/match",
                        title: "Kundali Matching",
                        description: "Check Vedic compatibility with Ashtakoota guna matching.",
                    },
                    {
                        to: "/panchang",
                        title: "Today's Panchang",
                        description: "Tithi, nakshatra, rahu kaal, and auspicious timings for today.",
                    },
                ]}
            />
        </Layout>
    );
};

export default KundaliPage;
