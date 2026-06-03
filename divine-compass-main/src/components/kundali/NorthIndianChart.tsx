import React from "react";
import { PlanetPosition } from "../../lib/astro/kundaliEngine";
import { formatDMSCompact } from "@/lib/astro/planetFormatters";
import PlanetTooltip from "./PlanetTooltip";

type Props = {
    planets: PlanetPosition[];
    lagnaSignIdx: number; // 0-11
};

const NorthIndianChart: React.FC<Props> = ({ planets, lagnaSignIdx }) => {
    const SIGNS = [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
    ];

    // Calculate sign number for each house (1-based: Aries=1)
    const getSignForHouse = (house: number) => {
        // Standard D1: House 1 has Lagna Sign
        // (lagnaSignIdx is 0-11)
        return ((lagnaSignIdx + house - 1) % 12) + 1;
    };

    // Map planets to houses based on SIGN (not house number from engine)
    const housePlanets: Record<number, PlanetPosition[]> = {};
    for (let h = 1; h <= 12; h++) {
        const signNum = getSignForHouse(h);
        const signName = SIGNS[signNum - 1];

        // Find planets that are in this sign
        housePlanets[h] = planets.filter(p => p.sign === signName);
    }

    const viewBoxSize = 500;

    // Chart layout config
    // Chart layout config (Standard North Indian Diamond Chart)
    // Houses are fixed positions.
    // 1 (Top Center), 2 (Top Left), 3 (Left Top), 4 (Left Center), 5 (Left Bottom), 6 (Bottom Left)
    // 7 (Bottom Center), 8 (Bottom Right), 9 (Right Bottom), 10 (Right Center), 11 (Right Top), 12 (Top Right)
    // Wait, Standard North Indian counting is Anti-Clockwise? 
    // No, North Indian is:
    // 1 = Top Diamond
    // 2 = Top Left
    // 3 = Left
    // 4 = Left Bottom
    // ... wait, North Indian counting is: 1 Top, 2 Top Left, 3 Left, 4 Center Left?? 
    // Let's verify standard image.
    // House 1: Top Center Diamond
    // House 2: Upper Left Triangle
    // House 3: Left Triangle (Wait, standard NI has 12 boxes)
    // 1: Top Middle
    // 2: Upper Left
    // 3: Left Top (small triangle?) No.
    // Standard Layout:
    // 1 (Lagna) is Top Middle Quad.
    // Count is Anti-Clockwise.
    // 2 is Top LEFT.
    // 3 is Bottom LEFT? No.
    // 2 is Upper Left Triangle. 
    // 3 is Lower Left Triangle ??
    // Actually the SVG paths are:
    // 1: Mid Top Diamond.
    // 2: Top Left Triangle
    // 3: Left Top Triangle
    // 4: Mid Left Diamond ?? Or Center square is rotated.
    //
    // Correction:
    // North Indian Style (Diamond Chart)
    // Box 1: Top Center
    // Box 2: Top Left
    // Box 3: Left (Triangle)
    // Box 4: Bottom Center (Wait no)

    // Let's stick to the visual grid coordinate system used previously which seemed visually correct for positions, 
    // just the ordering needed verification.
    // Previous Code: 
    // 1: 250, 125 (Top Center)
    // 2: 125, 62 (Top Left)
    // 3: 62, 125 (Left Upper)
    // 4: 125, 250 (Center Left) -> Wait, 4 is usually the "House 4" which is Bottom Center in some schemes?
    // NO. North Indian: 
    // 1=Top, 4=Right(or Left?), 7=Bottom, 10=Left(or Right?)
    // Standard: 1 Ascendant (Top). 4 (Bottom?). 7 (Bottom?). 10 (Top?).
    // Actually: 
    // 1 Top Diamond.
    // 4 Left (or Right) Diamond.
    // 7 Bottom Diamond.
    // 10 Right (or Left) Diamond.
    // Progression 1->2->3 is Anti-Clockwise.
    // So 1 (Top). 2 (Top Left). 3 (Left Top). 4 (Left Diamond? No 4 is usually specific).
    // Actually, usually:
    // 1 Top
    // 2 Top Left
    // 3 Left Top
    // 4 Center (Kendra) - Wait.
    // 1, 4, 7, 10 are Kendras (Diamonds).
    // 1 Top. 4 Left. 7 Bottom. 10 Right. (Or 1 Top, 4 Right, 7 Bottom, 10 Left -- depends on North/South preference but usually Anti-Clockwise).
    // If Anti-Clockwise:
    // 1 Top -> Left is 2, 3? Then 4 is Left Diamond?
    // Let's assume standard: 
    // 1(Top), 2(TopLeft), 3(LeftTop), 4(Left), 5(LeftBot), 6(BotLeft), 7(Bot), 8(BotRight), 9(RightBot), 10(Right), 11(RightTop), 12(TopRight).
    // 
    // Let's correct coordinates based on Anti-Clockwise Logic assuming 4 Diamonds are 1,4,7,10
    // 1: Top Diamond (250, 125)
    // 2: Top Left Triangle (125, 62)
    // 3: Left Top Triangle (62, 125)
    // 4: Left Diamond (125, 250) <-- PREVIOUS CODE had this.
    // 5: Left Bottom Triangle (62, 375)
    // 6: Bottom Left Triangle (125, 437)
    // 7: Bottom Diamond (250, 375)
    // 8: Bottom Right Triangle (375, 437)
    // 9: Right Bottom Triangle (437, 375)
    // 10: Right Diamond (375, 250)
    // 11: Right Top Triangle (437, 125)
    // 12: Top Right Triangle (375, 62)

    // This coordinate mapping seems correct for the Standard Anti-Clockwise North Indian chart.
    // The previous code had:
    // 4: 125, 250 (Left Diamond). Correct.
    // 7: 250, 375 (Bottom Diamond)... Wait 7 should be Bottom Center. 
    // SVG Size 500x500. Center 250,250.
    // 1 (Top Diamond) Center is roughly 250, 125. (Since diamond goes from 0,0 to 250,250? No.)
    // House 1 Diamond: Top-most. Points: 250,250 (Center map) -> 500,0 ??
    // Let's trace lines.
    // Diagonals: (0,0)->(500,500) and (500,0)->(0,500). Center 250,250.
    // Inner Diamond: (250,0), (0,250), (250,500), (500,250).
    //
    // House 1 (Top): Bounded by (0,0)-(500,0) [Top Edge] NO.
    // North Indian Config:
    // 1: Diamond below Top Edge? No, usually Top Diamond is 1.
    // The previous coordinates seem roughly aligned to:
    // 1: X=250, Y=125 (Upper Quadrant) -> Matches Top Diamond.
    // 4: X=125, Y=250 (Left Quadrant) -> Matches Left Diamond.
    // 7: X=250, Y=375 (Bottom Quadrant) -> Matches Bottom Diamond.
    // 10: X=375, Y=250 (Right Quadrant) -> Matches Right Diamond.
    //
    // This implies 1-4-7-10 are the central diamonds.
    // Order: 1 (Top) -> 2 (Top Left) -> 3 (Left Top) -> 4 (Left).
    // This is ANTI-CLOCKWISE.
    //
    // So logic:
    // House 1 Sign = Lagna.
    // House 2 Sign = Lagna + 1
    // ...
    // House N Sign = Lagna + N - 1
    //
    // Our 'getSignForHouse' function does exactly this: ((lagna + house - 1) % 12) + 1.
    // So the logic is correct.
    // Just ensuring coordinates (x,y) and sign positions (signX, signY) are okay.

    const houseConfig = [
        // 1: Top Diamond
        { h: 1, x: 250, y: 125, signX: 250, signY: 85 }, // Sign moved down slightly

        // 2: Top Left Triangle
        { h: 2, x: 125, y: 50, signX: 220, signY: 20 }, // Adjusted Y up

        // 3: Left Top Triangle
        { h: 3, x: 50, y: 125, signX: 20, signY: 20 }, // Adjusted X left

        // 4: Left Diamond
        { h: 4, x: 125, y: 250, signX: 85, signY: 250 },

        // 5: Left Bottom Triangle
        { h: 5, x: 50, y: 375, signX: 20, signY: 480 },

        // 6: Bottom Left Triangle
        { h: 6, x: 125, y: 450, signX: 220, signY: 480 },

        // 7: Bottom Diamond
        { h: 7, x: 250, y: 375, signX: 250, signY: 415 },

        // 8: Bottom Right Triangle
        { h: 8, x: 375, y: 450, signX: 280, signY: 480 },

        // 9: Right Bottom Triangle
        { h: 9, x: 450, y: 375, signX: 480, signY: 480 },

        // 10: Right Diamond
        { h: 10, x: 375, y: 250, signX: 415, signY: 250 },

        // 11: Right Top Triangle
        { h: 11, x: 450, y: 125, signX: 480, signY: 20 },

        // 12: Top Right Triangle
        { h: 12, x: 375, y: 50, signX: 280, signY: 20 },
    ];

    return (
        <div className="w-full max-w-[500px] mx-auto p-4 bg-sacred-amber/5 rounded-3xl border border-sacred-amber/20 shadow-inner">
            <svg
                viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
                width={viewBoxSize}
                height={viewBoxSize}
                className="w-full h-full drop-shadow-xl"
                style={{ filter: "drop-shadow(0 0 10px rgba(212, 163, 115, 0.1))" }}
            >
                {/* Background Frame */}
                <rect x="0" y="0" width="500" height="500" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary/40" />

                {/* Main Diagonals */}
                <line x1="0" y1="0" x2="500" y2="500" stroke="currentColor" strokeWidth="2" className="text-primary/30" />
                <line x1="500" y1="0" x2="0" y2="500" stroke="currentColor" strokeWidth="2" className="text-primary/30" />

                {/* Inner Diamond */}
                <line x1="250" y1="0" x2="0" y2="250" stroke="currentColor" strokeWidth="2" className="text-primary/30" />
                <line x1="0" y1="250" x2="250" y2="500" stroke="currentColor" strokeWidth="2" className="text-primary/30" />
                <line x1="250" y1="500" x2="500" y2="250" stroke="currentColor" strokeWidth="2" className="text-primary/30" />
                <line x1="500" y1="250" x2="250" y2="0" stroke="currentColor" strokeWidth="2" className="text-primary/30" />

                {houseConfig.map((config) => {
                    const planetsInHouse = housePlanets[config.h];
                    const hasPlanets = planetsInHouse.length > 0;
                    const isLagna = config.h === 1;

                    return (
                        <g key={config.h}>
                            {/* Layer 1: House Sign/Number (Faint, Center) */}
                            <text
                                x={config.signX}
                                y={config.signY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="text-sm font-bold fill-primary/40 select-none"
                            >
                                {getSignForHouse(config.h)}
                            </text>

                            {/* Layer 2: Planets (Stacked) */}
                            {hasPlanets ? (
                                planetsInHouse.map((p, idx) => {
                                    // Stacking logic with 3-line layout (Name, Degrees, Status)
                                    // Height per planet block
                                    const planetBlockHeight = 36;

                                    // Total height of all planets to center them
                                    const totalHeight = planetsInHouse.length * planetBlockHeight;

                                    // Start Y position (centered in house)
                                    // Shift up by half total height
                                    // Add small offset to not hit top
                                    const startY = config.y - (totalHeight / 2) + 12;

                                    const pY = startY + (idx * planetBlockHeight);

                                    return (
                                        <PlanetTooltip key={p.name} planetName={p.name} planetData={p} isSvg>
                                            <g>
                                                {/* Line 1: Planet Name */}
                                                <text
                                                    x={config.x}
                                                    y={pY}
                                                    textAnchor="middle"
                                                    className="text-[11px] font-bold fill-foreground cursor-help"
                                                >
                                                    {p.name.substring(0, 2)}
                                                </text>

                                                {/* Line 2: Degrees */}
                                                <text
                                                    x={config.x}
                                                    y={pY + 11}
                                                    textAnchor="middle"
                                                    className="text-[9px] font-medium fill-foreground/70 cursor-help"
                                                >
                                                    {formatDMSCompact(p.dms)}
                                                </text>

                                                {/* Line 3: Markers (only if present) */}
                                                {(p.retrograde || p.combust) && (
                                                    <text
                                                        x={config.x}
                                                        y={pY + 22}
                                                        textAnchor="middle"
                                                        className="text-[9px] font-bold cursor-help"
                                                    >
                                                        {p.retrograde && <tspan fill="#E67E22" dx="0">℞</tspan>}
                                                        {p.combust && <tspan fill="#D35400" dx={p.retrograde ? "4" : "0"}>🔥</tspan>}
                                                    </text>
                                                )}
                                            </g>
                                        </PlanetTooltip>
                                    );
                                })
                            ) : (
                                isLagna && (
                                    <text x={config.x} y={config.y} textAnchor="middle" className="text-xs fill-primary/20 select-none">LAGNA</text>
                                )
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

export default NorthIndianChart;
