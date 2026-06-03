import React from "react";
import { PlanetPosition } from "@/lib/astro/kundaliEngine";
import NorthIndianChart from "./NorthIndianChart";
import SouthIndianChart from "./SouthIndianChart";

interface DivisionalChartProps {
    chartId: string;
    chartStyle: "north" | "south";
    planets: PlanetPosition[];
    lagnaSignIdx: number;
}

/**
 * Generic Divisional Chart Component
 * Renders either North or South Indian style based on preference
 * For now, uses the same planetary positions as D1 (mock data)
 * Later, actual divisional calculations will be implemented
 */
const DivisionalChart = ({ chartId, chartStyle, planets, lagnaSignIdx }: DivisionalChartProps) => {
    // TODO: Implement actual divisional chart calculations
    // For now, we use the same positions as the birth chart
    // Each divisional chart will have its own calculation formula

    // Mock: Adjust lagna for different divisional charts (placeholder logic)
    const adjustedLagnaIdx = chartId === "D1"
        ? lagnaSignIdx
        : (lagnaSignIdx + parseInt(chartId.substring(1) || "0") % 12) % 12;

    return (
        <div className="w-full">
            {chartStyle === "north" ? (
                <NorthIndianChart
                    planets={planets}
                    lagnaSignIdx={adjustedLagnaIdx}
                />
            ) : (
                <SouthIndianChart
                    planets={planets}
                    lagnaSignIdx={adjustedLagnaIdx}
                />
            )}

            {/* Chart Info */}
            <div className="mt-4 text-center text-sm text-muted-foreground">
                <p>
                    {chartId === "D1"
                        ? "Birth Chart (Lagna)"
                        : `${chartId} Divisional Chart`}
                </p>
                {chartId !== "D1" && (
                    <p className="text-xs mt-1 text-primary/60">
                        Note: Using mock data. Actual divisional calculations will be implemented.
                    </p>
                )}
            </div>
        </div>
    );
};

export default DivisionalChart;
