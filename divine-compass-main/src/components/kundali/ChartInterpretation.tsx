import { SpiritualCard } from "../shared/SpiritualCard";
import { Sparkles, TrendingUp, TrendingDown, Home, Star, Compass } from "lucide-react";
import divisionalChartsData from "@/data/divisional-charts.json";

interface ChartInterpretationProps {
    chartId: string;
    lagnaSign: string;
}

const ChartInterpretation = ({ chartId, lagnaSign }: ChartInterpretationProps) => {
    const chartInfo = divisionalChartsData.charts.find(c => c.id === chartId);

    return (
        <SpiritualCard hover={false} className="mt-6">
            <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-6 w-6 text-primary" />
                <h3 className="font-display text-2xl font-bold text-foreground">
                    Astrological Insights
                </h3>
            </div>

            {/* Chart Purpose */}
            {chartInfo && (
                <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <h4 className="font-semibold text-primary mb-2">{chartInfo.name} Chart</h4>
                    <p className="text-sm text-muted-foreground">{chartInfo.lifeArea}</p>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Lagna Lord */}
                <InterpretationSection
                    icon={<Home className="h-5 w-5" />}
                    title="Lagna Lord"
                    content={`Your ${chartId} chart has ${lagnaSign} rising. The ruling planet of ${lagnaSign} governs the overall themes of this divisional chart. A strong lagna lord indicates favorable outcomes in this life area.`}
                />

                {/* Strong Planets */}
                <InterpretationSection
                    icon={<TrendingUp className="h-5 w-5 text-green-600" />}
                    title="Strong Planets"
                    content="Planets in their own signs, exaltation, or friendly signs bring positive results. They represent areas of natural talent and ease in this domain of life."
                />

                {/* Weak Planets */}
                <InterpretationSection
                    icon={<TrendingDown className="h-5 w-5 text-orange-600" />}
                    title="Weak Planets"
                    content="Debilitated or afflicted planets indicate challenges that require conscious effort. These areas offer opportunities for growth and karmic learning."
                />

                {/* House Emphasis */}
                <InterpretationSection
                    icon={<Compass className="h-5 w-5" />}
                    title="House Emphasis"
                    content="Houses with multiple planets receive extra focus and energy. This concentration of planetary power highlights key themes in this life area."
                />

                {/* Nakshatra Themes */}
                <InterpretationSection
                    icon={<Star className="h-5 w-5 text-gold" />}
                    title="Nakshatra Themes"
                    content="The Moon's nakshatra in this chart reveals the emotional and karmic undertones. It shows how you instinctively approach this area of life."
                />

                {/* Life Areas */}
                <InterpretationSection
                    icon={<Sparkles className="h-5 w-5 text-primary" />}
                    title="Life Areas Influenced"
                    content={chartInfo?.lifeArea || "This chart reveals specific karmic patterns and life themes that unfold through planetary placements and aspects."}
                />
            </div>

            {/* Note */}
            <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-xs text-muted-foreground italic">
                    <strong>Note:</strong> These are general interpretations. A complete analysis requires examining planetary strengths, aspects, yogas, and dasha periods. Consult a qualified Vedic astrologer for personalized insights.
                </p>
            </div>
        </SpiritualCard>
    );
};

interface InterpretationSectionProps {
    icon: React.ReactNode;
    title: string;
    content: string;
}

const InterpretationSection = ({ icon, title, content }: InterpretationSectionProps) => {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
                {icon}
                <h4 className="font-semibold text-sm uppercase tracking-wide">{title}</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {content}
            </p>
        </div>
    );
};

export default ChartInterpretation;
