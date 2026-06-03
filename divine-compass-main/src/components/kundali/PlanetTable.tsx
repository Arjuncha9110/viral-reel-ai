import React from "react";
import { ScrollText } from "lucide-react";
import { PlanetPosition } from "../../lib/astro/kundaliEngine";
import { SpiritualCard } from "../shared/SpiritualCard";
import PlanetTooltip from "./PlanetTooltip";
import { formatDMS } from "@/lib/astro/planetFormatters";
import { getDignityLabel, getDignityMarker, getPlanetDignity } from "@/lib/astro/chartPresentation";

type Props = {
    planets: PlanetPosition[];
    lagna: { sign: string; degree: number };
};

const formatDegree = (deg: number) => {
    const d = Math.floor(deg);
    const m = Math.floor((deg - d) * 60);
    const s = Math.round((((deg - d) * 60) - m) * 60);
    return `${d}° ${m}' ${s}"`;
};

const PlanetTable: React.FC<Props> = ({ planets, lagna }) => {
    return (
        <SpiritualCard className="overflow-hidden border-primary/10 bg-primary/5">
            <div className="mb-4 flex items-center gap-2 text-primary">
                <ScrollText className="h-5 w-5" />
                <h3 className="font-display text-xl font-bold uppercase tracking-wider">Planetary Details</h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                    <thead>
                        <tr className="border-b border-primary/20 text-[10px] uppercase tracking-widest text-muted-foreground">
                            <th className="px-2 py-3">Planet</th>
                            <th className="px-2 py-3">Sign</th>
                            <th className="px-2 py-3">Degree</th>
                            <th className="px-2 py-3">House</th>
                            <th className="px-2 py-3">Dignity</th>
                            <th className="px-2 py-3">Status</th>
                            <th className="px-2 py-3">Nakshatra</th>
                            <th className="px-2 py-3">Pada</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/10">
                        <tr className="bg-primary/5 font-semibold text-primary">
                            <td className="px-2 py-3 italic">Lagna (Asc)</td>
                            <td className="px-2 py-3">{lagna.sign}</td>
                            <td className="px-2 py-3 font-mono text-xs">{formatDegree(lagna.degree)}</td>
                            <td className="px-2 py-3">1</td>
                            <td className="px-2 py-3 text-muted-foreground">Core axis</td>
                            <td className="px-2 py-3 text-muted-foreground">—</td>
                            <td className="px-2 py-3">—</td>
                            <td className="px-2 py-3">—</td>
                        </tr>
                        {planets.map((planet) => {
                            const dignity = getPlanetDignity(planet.name, Math.floor(planet.longitude / 30));
                            const statusTokens = [
                                planet.retrograde ? "* Retrograde" : null,
                                planet.combust ? "^ Combust" : null,
                                dignity === "exalted" ? "↑ Exalted" : null,
                                dignity === "debilitated" ? "↓ Debilitated" : null,
                            ].filter(Boolean) as string[];

                            return (
                                <tr key={planet.name} className="transition-colors hover:bg-primary/10">
                                    <td className="px-2 py-3 font-medium">
                                        <PlanetTooltip planetName={planet.name} planetData={planet}>
                                            <span>{planet.name}</span>
                                        </PlanetTooltip>
                                    </td>
                                    <td className="px-2 py-3">{planet.sign}</td>
                                    <td className="px-2 py-3 font-mono text-xs">{formatDMS(planet.dms)}</td>
                                    <td className="px-2 py-3 font-display font-bold">{planet.house}</td>
                                    <td className="px-2 py-3">
                                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/15 bg-background px-2.5 py-1 text-xs font-medium text-foreground">
                                            <span>{getDignityLabel(dignity)}</span>
                                            {getDignityMarker(dignity) && <span className="text-primary">{getDignityMarker(dignity)}</span>}
                                        </span>
                                    </td>
                                    <td className="px-2 py-3">
                                        {statusTokens.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {statusTokens.map((token) => (
                                                    <span
                                                        key={token}
                                                        className="inline-flex rounded-full border border-primary/15 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-[#6d5530]"
                                                    >
                                                        {token}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">Balanced</span>
                                        )}
                                    </td>
                                    <td className="px-2 py-3 text-xs italic">{planet.nakshatra}</td>
                                    <td className="px-2 py-3">{planet.pada}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 rounded-2xl border border-primary/10 bg-white/70 p-4 text-xs">
                <p className="mb-3 font-semibold uppercase tracking-[0.2em] text-[#8a6a2f]">Legend</p>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-bold text-[#b59449]">*</span>
                        <span>Retrograde — planet appears to move backwards</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-bold text-orange-600">^</span>
                        <span>Combust — weakened by closeness to Sun</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-bold text-emerald-600">↑</span>
                        <span>Exalted — planet at peak strength</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <span className="font-bold text-red-500">↓</span>
                        <span>Debilitated — planet at reduced strength</span>
                    </div>
                </div>
            </div>
        </SpiritualCard>
    );
};

export default PlanetTable;
