import { cn } from "@/lib/utils";

interface ChartStyleToggleProps {
    chartStyle: "north" | "south";
    onStyleChange: (style: "north" | "south") => void;
}

const ChartStyleToggle = ({ chartStyle, onStyleChange }: ChartStyleToggleProps) => {
    return (
        <div className="flex items-center bg-stone-100 rounded-full p-0.5 gap-0.5">
            {(["north", "south"] as const).map((val) => (
                <button
                    key={val}
                    type="button"
                    onClick={() => onStyleChange(val)}
                    className={cn(
                        "px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-150",
                        chartStyle === val
                            ? "bg-white text-amber-700 shadow-sm"
                            : "text-stone-500 hover:text-stone-700"
                    )}
                >
                    {val === "north" ? "North" : "South"}
                </button>
            ))}
        </div>
    );
};

export default ChartStyleToggle;
