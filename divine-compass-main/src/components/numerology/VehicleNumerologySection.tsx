import { useState } from "react";
import { BirthDatePicker } from "@/components/shared/BirthDatePicker";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Sparkles, Hash, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateVehicleNumerology, VehicleNumerologyResult } from "@/lib/calculators/numerology/vehicleNumber";
import { cn } from "@/lib/utils";

export const VehicleNumerologySection = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [dob, setDob] = useState("");
  const [result, setResult] = useState<VehicleNumerologyResult | null>(null);

  const handleCalculate = () => {
    if (!vehicleNumber.trim()) return;
    const calc = calculateVehicleNumerology(vehicleNumber, dob);
    setResult(calc);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "Lucky":
        return {
          color: "from-green-500/20 to-emerald-500/10 text-emerald-700",
          borderColor: "border-emerald-500/30",
          icon: <CheckCircle className="h-5 w-5 text-emerald-600" />
        };
      case "Unlucky":
        return {
          color: "from-red-500/20 to-rose-500/10 text-rose-700",
          borderColor: "border-rose-500/30",
          icon: <AlertTriangle className="h-5 w-5 text-rose-600" />
        };
      default:
        return {
          color: "from-amber-500/20 to-yellow-500/10 text-amber-700",
          borderColor: "border-amber-500/30",
          icon: <HelpCircle className="h-5 w-5 text-amber-600" />
        };
    }
  };

  return (
    <div id="vehicle-numerology" className="py-12 mt-12 border-t border-primary/20">
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sacred-amber shadow-glow-saffron text-white mb-2">
          <Car className="h-8 w-8" />
        </div>
        <h2 className="font-display text-4xl font-bold text-foreground tracking-tight">
          Vehicle Number Numerology
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Enter a vehicle registration number to check whether its numerology is lucky, neutral, or unfavorable.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-xl mx-auto mb-12 space-y-4"
      >
        <SpiritualCard hover={false}>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleNumber" className="text-foreground font-medium">
                  Vehicle Number
                </Label>
                <Input
                  id="vehicleNumber"
                  type="text"
                  placeholder="e.g. MH12DE9090"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="h-12 text-lg uppercase bg-background border-2 border-primary/20 focus:border-primary/50"
                  onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-foreground font-medium flex items-center justify-between">
                  <span>Date of Birth</span>
                  <span className="text-[10px] text-muted-foreground bg-primary/10 px-1.5 py-0.5 rounded">Optional</span>
                </Label>
                <BirthDatePicker value={dob} onChange={setDob} />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Add your Date of Birth to calculate your Life Path Number and check personal compatibility with the vehicle.
            </p>

            <Button
              onClick={handleCalculate}
              variant="saffron"
              size="lg"
              className="w-full"
              disabled={!vehicleNumber.trim()}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Check Vehicle Numerology
            </Button>
          </div>
        </SpiritualCard>
      </motion.div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            {/* Summary Card */}
            <SpiritualCard delay={0.1}>
              <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
                <div className="text-center md:text-left space-y-2">
                  <div className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                    Vehicle Number
                  </div>
                  <div className="text-3xl font-display font-bold text-foreground">
                    {result.original}
                  </div>
                  <div className="text-sm text-primary flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <span className="flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      Digits: {result.digits.split('').join('+')} = {result.sum}
                    </span>
                    {result.lifePathNumber && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-xs font-bold border border-primary/20">
                        Life Path: {result.lifePathNumber}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">VSD</div>
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sacred-amber shadow-glow-saffron">
                      <span className="font-display text-4xl font-bold text-white">{result.reduced}</span>
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</div>
                    <div className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm",
                      getStatusConfig(result.status).color,
                      getStatusConfig(result.status).borderColor
                    )}>
                      {getStatusConfig(result.status).icon}
                      {result.status}
                    </div>
                  </div>
                </div>
              </div>

              {result.lifePathNumber && (
                <div className="mt-8 pt-6 border-t border-primary/10">
                  <h4 className="font-semibold text-foreground text-sm mb-4 text-center">
                    Compatibility Breakdown for Life Path {result.lifePathNumber}
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-1 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Lucky</div>
                      <div className="text-sm font-bold text-emerald-700">{result.personalLucky?.join(", ")}</div>
                    </div>
                    <div className="space-y-1 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Neutral</div>
                      <div className="text-sm font-bold text-amber-700">{result.personalNeutral?.join(", ") || "None"}</div>
                    </div>
                    <div className="space-y-1 p-3 rounded-lg bg-rose-500/5 border border-rose-500/10">
                      <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Unlucky</div>
                      <div className="text-sm font-bold text-rose-700">{result.personalUnlucky?.join(", ")}</div>
                    </div>
                  </div>
                </div>
              )}
            </SpiritualCard>

            {/* Detailed Interpretation */}
            <SpiritualCard delay={0.2} hover={false}>
              <div className="space-y-6">
                <h3 className="font-display text-2xl font-semibold text-foreground">
                  Numerology Interpretation
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3 p-5 rounded-xl bg-primary/5 border border-primary/10">
                    <h4 className="font-semibold text-primary uppercase text-sm tracking-wide flex items-center justify-between">
                      <span>Energy Profile</span>
                      {result.isAscending && (
                        <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          Ascending Sequence Detected
                        </span>
                      )}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {result.explanation}
                      {result.isAscending && " The digits form an ascending sequence, which strongly attracts progressive, forward-moving energy!"}
                    </p>
                  </div>

                  <div className="space-y-3 p-5 rounded-xl bg-gold/5 border border-gold/10">
                    <h4 className="font-semibold text-gold uppercase text-sm tracking-wide flex items-center justify-between">
                      <span>Practical Suggestion</span>
                      {result.isCompatible !== undefined && (
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full border",
                          result.isCompatible ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
                        )}>
                          {result.isCompatible ? "Compatible Match" : "Incompatible Match"}
                        </span>
                      )}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {result.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            </SpiritualCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
