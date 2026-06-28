import { SpiritualCard } from "../shared/SpiritualCard";
import { BookOpen, Star, Briefcase, Heart, Info } from "lucide-react";

const DivisionalChartsIntro = () => {
    return (
        <SpiritualCard className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="text-center mb-6">
                <h2 className="font-display text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                    <BookOpen className="h-7 w-7 text-primary" />
                    About Divisional Charts (Vargas)
                </h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                    Divisional charts are powerful tools in Vedic astrology that reveal specific areas of life with microscopic precision. Each chart magnifies a particular dimension of your karmic journey.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
                <ChartExplanation
                    icon={<Star className="h-6 w-6" />}
                    title="Lagna Chart (D1)"
                    description="The birth chart represents your overall life path, personality, health, and general fortune. It's the foundation upon which all other divisional charts are built."
                    color="text-primary"
                />
                <ChartExplanation
                    icon={<Heart className="h-6 w-6" />}
                    title="Navamsa (D9)"
                    description="The most important divisional chart, revealing marriage, spouse qualities, dharma, and inner spiritual strength. It shows the fruit of your karmic actions."
                    color="text-pink-500"
                />
                <ChartExplanation
                    icon={<Briefcase className="h-6 w-6" />}
                    title="Dasamsa (D10)"
                    description="Shows career, profession, status, achievements, and public life. Essential for understanding your professional destiny and societal contributions."
                    color="text-blue-500"
                />
            </div>

            <div className="p-6 rounded-xl bg-card/50 border border-border/50">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-foreground mb-2">Why Divisional Charts Matter</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            While the birth chart (D1) shows the overall blueprint of life, divisional charts zoom into specific areas with laser focus. They reveal hidden strengths, karmic patterns, and subtle influences that aren't visible in the main chart. By analyzing multiple divisional charts together, astrologers can provide incredibly accurate predictions about specific life domains—from children and education to vehicles and past-life karma.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 rounded-lg bg-primary/5">
                    <div className="font-bold text-primary mb-1">16 Main Vargas</div>
                    <div className="text-muted-foreground">Traditional system</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/5">
                    <div className="font-bold text-secondary mb-1">Precision Analysis</div>
                    <div className="text-muted-foreground">Micro-level insights</div>
                </div>
                <div className="p-3 rounded-lg bg-gold/5">
                    <div className="font-bold text-gold mb-1">Karmic Patterns</div>
                    <div className="text-muted-foreground">Past-life influences</div>
                </div>
                <div className="p-3 rounded-lg bg-green-500/5">
                    <div className="font-bold text-green-600 mb-1">Life Domains</div>
                    <div className="text-muted-foreground">Specific areas</div>
                </div>
            </div>
        </SpiritualCard>
    );
};

interface ChartExplanationProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
}

const ChartExplanation = ({ icon, title, description, color }: ChartExplanationProps) => {
    return (
        <div className="p-5 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
            <div className={`flex items-center gap-2 mb-3 ${color}`}>
                {icon}
                <h3 className="font-display font-bold text-lg">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
            </p>
        </div>
    );
};

export default DivisionalChartsIntro;
