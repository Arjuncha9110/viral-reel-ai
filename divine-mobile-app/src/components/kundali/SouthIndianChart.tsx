import React from "react";
import { PlanetPosition } from "../../lib/astro/kundaliEngine";
import { cn } from "@/lib/utils";
import { formatDMSCompact } from "@/lib/astro/planetFormatters";
import PlanetTooltip from "./PlanetTooltip";

type Props = {
    planets: PlanetPosition[];
    lagnaSignIdx: number; // 0-11
};

const SouthIndianChart: React.FC<Props> = ({ planets, lagnaSignIdx }) => {
    // Map planets to sign indices (0-11)
    const signPlanets: Record<number, PlanetPosition[]> = {};
    for (let i = 0; i < 12; i++) signPlanets[i] = [];

    planets.forEach(p => {
        // Determine sign index from longitude
        const idx = Math.floor(p.longitude / 30);
        signPlanets[idx].push(p);
    });

    // ... (SIGNS and grid definition consistent with original)
    const SIGNS = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];

    const grid = [
        [11, 0, 1, 2],
        [10, null, null, 3],
        [9, null, null, 4],
        [8, 7, 6, 5]
    ];

    return (
        <div className="w-full max-w-[500px] mx-auto p-4 bg-sacred-amber/5 rounded-3xl border border-sacred-amber/20 shadow-inner">
            <div className="grid grid-cols-4 aspect-square border-2 border-primary/30">
                {grid.flat().map((signIdx, i) => {
                    if (signIdx === null) {
                        return (
                            <div key={`empty-${i}`} className="bg-primary/5 flex items-center justify-center p-2 border border-primary/10">
                                {i === 5 && <span className="text-[10px] uppercase font-bold text-primary/40 tracking-widest -rotate-45">Divine Kundali</span>}
                            </div>
                        );
                    }

                    const isLagna = signIdx === lagnaSignIdx;
                    const planetsInSign = signPlanets[signIdx];

                    return (
                        <div
                            key={signIdx}
                            className={cn(
                                "relative border border-primary/20 p-1 flex flex-col items-center justify-center min-h-0 overflow-hidden",
                                isLagna && "bg-primary/10 shadow-inner"
                            )}
                        >
                            {/* Sign Label */}
                            <span className="absolute top-1 left-1 text-[8px] font-bold text-primary/40 uppercase">
                                {SIGNS[signIdx].substring(0, 3)}
                            </span>

                            {/* Lagna Indicator */}
                            {isLagna && (
                                <span className="absolute top-1 right-1 text-[8px] font-black text-primary animate-pulse">
                                    ASC
                                </span>
                            )}

                            {/* Planets */}
                            <div className="flex flex-col items-center justify-center gap-0.5 mt-3 w-full max-h-full overflow-y-auto no-scrollbar">
                                {planetsInSign.map((p) => (
                                    <PlanetTooltip key={p.name} planetName={p.name} planetData={p}>
                                        <div className="flex items-center gap-1 text-[10px] leading-tight hover:bg-black/5 rounded px-1 cursor-help w-full justify-center">
                                            <div className="font-bold relative flex items-start">
                                                <span>{p.name.substring(0, 2)}</span>
                                                <span className="flex text-[8px] leading-none -mt-0.5">
                                                    {p.retrograde && <span className="text-[#E67E22]">℞</span>}
                                                    {p.combust && <span className="text-[#D35400] text-[9px]">🔥</span>}
                                                </span>
                                            </div>
                                            <span className="opacity-70 font-mono text-[9px] -ml-0.5">{formatDMSCompact(p.dms)}</span>
                                        </div>
                                    </PlanetTooltip>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SouthIndianChart;
