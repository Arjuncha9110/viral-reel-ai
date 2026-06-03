import { Check, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChartStyleToggleProps {
    chartStyle: "north" | "south";
    onStyleChange: (style: "north" | "south") => void;
}

const ChartStyleToggle = ({ chartStyle, onStyleChange }: ChartStyleToggleProps) => {
    return (
        <div className="rounded-[1.5rem] border border-[#dcc69b]/55 bg-[linear-gradient(180deg,rgba(255,253,248,0.98),rgba(251,246,236,0.96))] p-3 shadow-[0_14px_32px_rgba(84,58,18,0.06)]">
            <div className="mb-2.5 flex items-center justify-between gap-3 text-[#8a6a2f]">
                <div className="flex items-center gap-2">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em]">Chart Tradition</p>
                </div>
                <p className="text-[10px] text-[#9b8460]">Choose your preferred view</p>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
                {[
                    {
                        value: "north" as const,
                        title: "North Indian",
                    },
                    {
                        value: "south" as const,
                        title: "South Indian",
                    },
                ].map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onStyleChange(option.value)}
                        className={cn(
                            "rounded-[1.15rem] border px-4 py-3 text-left transition-all duration-200",
                            chartStyle === option.value
                                ? "border-[#b59449] bg-[linear-gradient(135deg,rgba(181,148,73,0.16),rgba(255,249,234,0.98))] shadow-[0_10px_22px_rgba(181,148,73,0.14)]"
                                : "border-[#eadfc6] bg-white/80 hover:border-[#cfb073] hover:bg-[#fffaf1]"
                        )}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="font-display text-[17px] font-semibold text-[#3f2b0f]">{option.title}</h3>
                                <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-[#b59449]">
                                    {chartStyle === option.value ? "Selected" : "Tap to select"}
                                </p>
                            </div>
                            {chartStyle === option.value && (
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#b59449] text-white">
                                    <Check className="h-3.5 w-3.5" />
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChartStyleToggle;
