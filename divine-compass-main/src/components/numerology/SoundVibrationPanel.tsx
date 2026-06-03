import React from "react";
import { Music, Sparkles, Zap, Flower2, ScrollText, Flame } from "lucide-react";
import { SpiritualCard } from "../shared/SpiritualCard";
import { cn } from "@/lib/utils";

type Props = {
    result: {
        dominantSound: string;
        beej: string;
        planet: string;
        chakra: string;
        traits: string[];
        mantra: string;
        remedies: string[];
    };
};

const SoundVibrationPanel: React.FC<Props> = ({ result }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-sacred-amber/10 flex items-center justify-center text-sacred-amber border border-sacred-amber/20">
                    <Music className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">
                        Sound Vibration Analysis
                    </h2>
                    <p className="text-xs text-muted-foreground italic">
                        Beejakshara resonance based on phonetic vibration of your name
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <SpiritualCard className="bg-orange-50/50 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/30">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <Zap className="h-6 w-6 text-orange-500" />
                        <h3 className="text-sm font-semibold text-orange-700 dark:text-orange-400">Beej Mantra</h3>
                        <p className="text-xl font-display font-bold text-foreground">{result.beej}</p>
                    </div>
                </SpiritualCard>

                <SpiritualCard className="bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/30">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <Sparkles className="h-6 w-6 text-green-500" />
                        <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">Planetary Influence</h3>
                        <p className="text-xl font-display font-bold text-foreground">{result.planet}</p>
                    </div>
                </SpiritualCard>

                <SpiritualCard className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/30">
                    <div className="flex flex-col items-center text-center space-y-2">
                        <Flower2 className="h-6 w-6 text-blue-500" />
                        <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400">Activated Chakra</h3>
                        <p className="text-xl font-display font-bold text-foreground">{result.chakra}</p>
                    </div>
                </SpiritualCard>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <SpiritualCard hover={false} className="border-primary/10 bg-primary/5">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <ScrollText className="h-5 w-5" />
                            <h3 className="font-semibold">Strength Traits</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {result.traits.map((t) => (
                                <span
                                    key={t}
                                    className="px-3 py-1 bg-white dark:bg-zinc-800 border border-primary/20 rounded-full text-xs font-medium text-primary shadow-sm"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-primary/10">
                            <div className="flex items-center gap-2 text-primary mb-3">
                                <Flame className="h-5 w-5" />
                                <h3 className="font-semibold">🕉 Recommended Mantra</h3>
                            </div>
                            <p className="text-2xl font-display font-medium text-foreground text-center bg-white dark:bg-zinc-800 py-3 rounded-xl border border-primary/20 shadow-inner">
                                {result.mantra}
                            </p>
                        </div>
                    </div>
                </SpiritualCard>

                <SpiritualCard hover={false} className="border-sacred-amber/10 bg-sacred-amber/5">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sacred-amber">
                            <div className="h-2 w-2 rounded-full bg-sacred-amber animate-pulse" />
                            <h3 className="font-semibold uppercase tracking-wider text-xs">Correction & Remedies</h3>
                        </div>
                        <ul className="space-y-3">
                            {result.remedies.map((r, i) => (
                                <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                                    <span className="flex-shrink-0 flex items-center justify-center h-5 w-5 rounded-full bg-sacred-amber/10 text-sacred-amber text-[10px] font-bold">
                                        {i + 1}
                                    </span>
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                </SpiritualCard>
            </div>
        </div>
    );
};

export default SoundVibrationPanel;
