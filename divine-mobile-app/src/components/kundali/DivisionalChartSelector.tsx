import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import divisionalChartsData from "@/data/divisional-charts.json";

interface DivisionalChartSelectorProps {
    selectedChart: string;
    onChartSelect: (chartId: string) => void;
}

const DivisionalChartSelector = ({ selectedChart, onChartSelect }: DivisionalChartSelectorProps) => {
    const [activeTab, setActiveTab] = useState<"primary" | "secondary" | "advanced">("primary");

    // Filter charts by active tab
    const filteredCharts = divisionalChartsData.charts.filter(c => c.category === activeTab);

    // Auto-select tab logic if external selection changes
    useEffect(() => {
        const chart = divisionalChartsData.charts.find(c => c.id === selectedChart);
        if (chart && chart.category !== activeTab) {
            setActiveTab(chart.category as any);
        }
    }, [selectedChart]);

    return (
        <div className="w-full space-y-4">
            {/* Category Tabs */}
            <div className="flex p-1 bg-muted/40 rounded-lg backdrop-blur-sm border border-border/50">
                {(["primary", "secondary", "advanced"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-md transition-all duration-300 capitalize",
                            activeTab === tab
                                ? "bg-background text-primary shadow-sm ring-1 ring-border"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        )}
                    >
                        {tab} Charts
                    </button>
                ))}
            </div>

            {/* Charts List (Grid Layout) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredCharts.map((chart) => (
                    <motion.button
                        key={chart.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => onChartSelect(chart.id)}
                        className={cn(
                            "relative overflow-hidden p-3 rounded-xl border-2 text-left transition-all duration-200",
                            "hover:border-primary/50 group",
                            selectedChart === chart.id
                                ? "bg-primary/5 border-primary shadow-sm"
                                : "bg-card border-border hover:bg-muted/30"
                        )}
                    >
                        {/* Selection Indicator */}
                        {selectedChart === chart.id && (
                            <motion.div
                                layoutId="active-chart-indicator"
                                className="absolute inset-0 bg-primary/5 -z-10"
                            />
                        )}

                        <div className="font-display font-bold text-sm group-hover:text-primary transition-colors">
                            {chart.shortName}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                            {chart.description}
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default DivisionalChartSelector;
