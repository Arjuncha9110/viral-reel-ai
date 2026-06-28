import { SpiritualCard } from "../shared/SpiritualCard";
import { Target, Heart, DollarSign, Sparkles, Users } from "lucide-react";

interface LifeThemesSummaryProps {
    // Props for future dynamic calculation
    // For now, using placeholder/mock data
}

type ThemeStrength = "very-strong" | "strong" | "moderate" | "weak" | "very-weak";

interface Theme {
    name: string;
    strength: ThemeStrength;
    icon: React.ReactNode;
}

const LifeThemesSummary = ({ }: LifeThemesSummaryProps) => {
    // Mock data - later will be calculated from planetary positions
    const themes: Theme[] = [
        { name: "Career Strength", strength: "strong", icon: <Target className="h-4 w-4" /> },
        { name: "Marriage Stability", strength: "moderate", icon: <Heart className="h-4 w-4" /> },
        { name: "Financial Flow", strength: "strong", icon: <DollarSign className="h-4 w-4" /> },
        { name: "Spiritual Growth", strength: "very-strong", icon: <Sparkles className="h-4 w-4" /> },
        { name: "Ancestral Karma", strength: "moderate", icon: <Users className="h-4 w-4" /> },
    ];

    return (
        <SpiritualCard className="border-primary/20 bg-gradient-to-br from-primary/5 to-gold/5">
            <div className="mb-4">
                <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Life Themes Snapshot
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Key insights from your birth chart analysis
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
                {themes.map((theme, index) => (
                    <ThemeBadge key={index} theme={theme} />
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground italic">
                    These themes are derived from planetary placements, strengths, and divisional chart analysis.
                </p>
            </div>
        </SpiritualCard>
    );
};

interface ThemeBadgeProps {
    theme: Theme;
}

const ThemeBadge = ({ theme }: ThemeBadgeProps) => {
    const getStrengthConfig = (strength: ThemeStrength) => {
        switch (strength) {
            case "very-strong":
                return {
                    bg: "bg-gradient-to-r from-purple-500/20 to-gold/20",
                    border: "border-purple-500/40",
                    text: "text-purple-700 dark:text-purple-300",
                    dot: "bg-purple-500",
                    label: "Excellent"
                };
            case "strong":
                return {
                    bg: "bg-green-500/10",
                    border: "border-green-500/40",
                    text: "text-green-700 dark:text-green-400",
                    dot: "bg-green-500",
                    label: "Strong"
                };
            case "moderate":
                return {
                    bg: "bg-yellow-500/10",
                    border: "border-yellow-500/40",
                    text: "text-yellow-700 dark:text-yellow-400",
                    dot: "bg-yellow-500",
                    label: "Moderate"
                };
            case "weak":
                return {
                    bg: "bg-orange-500/10",
                    border: "border-orange-500/40",
                    text: "text-orange-700 dark:text-orange-400",
                    dot: "bg-orange-500",
                    label: "Developing"
                };
            case "very-weak":
                return {
                    bg: "bg-red-500/10",
                    border: "border-red-500/40",
                    text: "text-red-700 dark:text-red-400",
                    dot: "bg-red-500",
                    label: "Challenging"
                };
        }
    };

    const config = getStrengthConfig(theme.strength);

    return (
        <div className={`
      flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all
      ${config.bg} ${config.border} hover:scale-105 cursor-default
    `}>
            <div className="flex items-center gap-1.5">
                <div className={`h-2 w-2 rounded-full ${config.dot} animate-pulse`}></div>
                <span className={config.text}>{theme.icon}</span>
            </div>
            <span className={`font-medium text-sm ${config.text}`}>
                {theme.name}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.text} font-semibold`}>
                {config.label}
            </span>
        </div>
    );
};

export default LifeThemesSummary;
