import React from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import planetMeanings from "@/data/planet-meanings.json";
import { PlanetPosition } from "@/lib/astro/kundaliEngine";
import { formatDMS } from "@/lib/astro/planetFormatters";
import { getDignityLabel, getDignityMarker, getPlanetDignity } from "@/lib/astro/chartPresentation";

interface PlanetTooltipProps {
    planetName: string;
    planetData?: PlanetPosition;
    children: React.ReactNode;
    isSvg?: boolean;
}

const PlanetTooltip = ({ planetName, planetData, children, isSvg = false }: PlanetTooltipProps) => {
    const planetMeaning = planetMeanings[planetName as keyof typeof planetMeanings];
    const dignity = planetData ? getPlanetDignity(planetData.name, Math.floor(planetData.longitude / 30)) : null;

    if (!planetMeaning) {
        return <>{children}</>;
    }

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    {isSvg ? <g className="cursor-help">{children}</g> : <span className="cursor-help">{children}</span>}
                </TooltipTrigger>
                <TooltipContent
                    side="top"
                    className="max-w-xs border-2 border-primary/20 bg-card p-4 shadow-xl"
                >
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                            <span className="text-2xl">{planetMeaning.symbol}</span>
                            <h4 className="font-display font-bold text-foreground">{planetMeaning.name}</h4>
                        </div>

                        {planetData && (
                            <div className="rounded bg-primary/5 p-2">
                                <div className="space-y-1 text-sm font-mono">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Position:</span>
                                        <span className="font-bold">{formatDMS(planetData.dms)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Sign:</span>
                                        <span className="font-bold">{planetData.sign}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">House:</span>
                                        <span className="font-bold">{planetData.house}</span>
                                    </div>
                                    {dignity && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Dignity:</span>
                                            <span className="font-bold">
                                                {getDignityLabel(dignity)}
                                                {getDignityMarker(dignity) ? ` ${getDignityMarker(dignity)}` : ""}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {planetData && (planetData.retrograde || planetData.combust || dignity === "exalted" || dignity === "debilitated") && (
                            <div className="space-y-1">
                                {planetData.retrograde && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="font-bold text-orange-500">* </span>
                                        <span className="text-orange-600">Retrograde</span>
                                    </div>
                                )}
                                {planetData.combust && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="font-bold text-red-500">^</span>
                                        <span className="text-red-600">Combust</span>
                                    </div>
                                )}
                                {dignity === "exalted" && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="font-bold text-emerald-600">↑</span>
                                        <span className="text-emerald-700">Exalted</span>
                                    </div>
                                )}
                                {dignity === "debilitated" && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className="font-bold text-violet-600">↓</span>
                                        <span className="text-violet-700">Debilitated</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {planetData?.combust && (
                            <div className="border-t border-border/50 pt-2">
                                <p className="text-xs italic text-red-600">
                                    Planet strength is reduced due to closeness with the Sun.
                                </p>
                            </div>
                        )}

                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                                Karaka (Significator)
                            </p>
                            <p className="text-sm text-foreground">{planetMeaning.karaka}</p>
                        </div>

                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                                Core Themes
                            </p>
                            <p className="text-sm text-muted-foreground">{planetMeaning.themes}</p>
                        </div>

                        <div className="border-t border-border/50 pt-2">
                            <p className="text-xs italic text-muted-foreground">{planetMeaning.spiritual}</p>
                        </div>

                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export default PlanetTooltip;
