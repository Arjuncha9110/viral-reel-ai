import { motion } from "framer-motion";
import { Check, Sparkles, IndianRupee, Globe, ChevronRight, Star, Zap, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { basicFeatures, detailedFeatures, PRICES, ORIGINAL_PRICES } from "@/data/reportData";
import { Plan, Region } from "@/hooks/useKundaliReportPayment";

interface PricingSectionProps {
  selectedPlan: Plan;
  setSelectedPlan: (plan: Plan) => void;
  paymentRegion: Region;
  setPaymentRegion: (region: Region) => void;
  onContinue: () => void;
}


export const PricingSection = ({
  selectedPlan,
  setSelectedPlan,
  paymentRegion,
  setPaymentRegion,
  onContinue,
}: PricingSectionProps) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

      {/* Region Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-2xl border border-[#e4cfa0]/60 bg-[#fffdf8] p-1 shadow-[0_2px_12px_rgba(181,148,73,0.08)]">
          <button
            onClick={() => setPaymentRegion("india")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all duration-200",
              paymentRegion === "india"
                ? "bg-gradient-to-br from-[#d4651a] to-[#a84810] text-white shadow-[0_3px_12px_rgba(212,101,26,0.30)]"
                : "text-[#6a4820] hover:text-[#a84810]"
            )}
          >
            <IndianRupee className="h-3.5 w-3.5" />
            India (₹ INR)
          </button>
          <button
            onClick={() => setPaymentRegion("international")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold transition-all duration-200",
              paymentRegion === "international"
                ? "bg-gradient-to-br from-[#d4651a] to-[#a84810] text-white shadow-[0_3px_12px_rgba(212,101,26,0.30)]"
                : "text-[#6a4820] hover:text-[#a84810]"
            )}
          >
            <Globe className="h-3.5 w-3.5" />
            Global ($ USD)
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid md:grid-cols-2 gap-5 items-start">

        {/* ── Basic Card ── */}
        <button
          onClick={() => setSelectedPlan("basic")}
          className={cn(
            "group w-full flex flex-col text-left rounded-2xl border transition-all duration-200 overflow-hidden",
            selectedPlan === "basic"
              ? "border-[#d4651a]/50 shadow-[0_0_0_3px_rgba(212,101,26,0.12),0_8px_28px_rgba(212,101,26,0.12)]"
              : "border-[#e4cfa0]/60 bg-[#fffdf8] hover:border-[#d4651a]/30 hover:shadow-[0_4px_20px_rgba(181,148,73,0.10)]"
          )}
        >
          {/* Card inner top bar */}
          <div className={cn(
            "w-full h-1 transition-all",
            selectedPlan === "basic" ? "bg-gradient-to-r from-[#d4651a]/60 via-[#d4651a] to-[#d4651a]/60" : "bg-transparent"
          )} />

          <div className="p-6 space-y-5 bg-[#fffdf8]">
            {/* Header row */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.26em] text-[#a08050]">Basic Report</p>
                  <span className="rounded-full bg-[#d4651a] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">60% OFF</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[15px] text-[#a08050]/60 line-through font-medium">
                    {paymentRegion === "india" ? `₹${ORIGINAL_PRICES.INR.BASIC}` : `$${ORIGINAL_PRICES.USD.BASIC}`}
                  </span>
                  <span className="font-display text-4xl font-black text-[#1c1408] leading-none">
                    {paymentRegion === "india" ? `₹${PRICES.INR.BASIC}` : `$${PRICES.USD.BASIC}`}
                  </span>
                </div>
                <p className="text-[12px] text-[#7a5c36]/70">Instant PDF download</p>
              </div>
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border-2 mt-1 transition-all shrink-0",
                selectedPlan === "basic"
                  ? "border-[#d4651a] bg-[#d4651a]"
                  : "border-[#d8c090]/60 bg-transparent"
              )}>
                {selectedPlan === "basic" && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
              </div>
            </div>

            {/* Feature list */}
            <ul className="space-y-2.5">
              {basicFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13px] text-[#4a3320]">
                  <span className={cn(
                    "mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full",
                    selectedPlan === "basic" ? "text-[#d4651a]" : "text-[#b59449]"
                  )}>
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </button>

        {/* ── Detailed Card ── */}
        <div className="relative flex flex-col">
          {/* Most popular badge */}
          <div className="absolute -top-3.5 inset-x-0 flex justify-center z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#d4651a] to-[#a84810] px-4 py-1 text-[10.5px] font-black uppercase tracking-[0.18em] text-white shadow-[0_4px_14px_rgba(212,101,26,0.40)]">
              <Star className="h-3 w-3 fill-white" /> Most Popular
            </span>
          </div>

          <button
            onClick={() => setSelectedPlan("detailed")}
            className={cn(
              "group w-full flex flex-col text-left rounded-2xl overflow-hidden transition-all duration-200",
              selectedPlan === "detailed"
                ? "shadow-[0_0_0_2px_rgba(212,101,26,0.50),0_16px_48px_rgba(12,22,40,0.30)]"
                : "shadow-[0_4px_24px_rgba(12,22,40,0.22)] hover:shadow-[0_8px_32px_rgba(212,101,26,0.25)]"
            )}
          >
            {/* Top accent */}
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#d4651a] to-transparent" />

            <div className="p-6 space-y-5 bg-gradient-to-b from-[#13203e] to-[#0c1628] flex-1">
              {/* Watermark */}
              <div className="pointer-events-none absolute right-4 bottom-8 text-[90px] leading-none opacity-[0.05] select-none font-serif text-[#d4651a]">♄</div>

              {/* Header row */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.26em] text-[#f09050]/80">Detailed Analysis</p>
                    <span className="rounded-full bg-[#d4651a] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">60% OFF</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[15px] text-white/35 line-through font-medium">
                      {paymentRegion === "india" ? `₹${ORIGINAL_PRICES.INR.DETAILED}` : `$${ORIGINAL_PRICES.USD.DETAILED}`}
                    </span>
                    <span className="font-display text-4xl font-black text-white leading-none">
                      {paymentRegion === "india" ? `₹${PRICES.INR.DETAILED}` : `$${PRICES.USD.DETAILED}`}
                    </span>
                  </div>
                  <p className="text-[12px] text-white/40">Lifetime predictions & remedies</p>
                </div>
                <div className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2 mt-1 transition-all shrink-0",
                  selectedPlan === "detailed"
                    ? "border-[#d4651a] bg-[#d4651a]"
                    : "border-white/25 bg-transparent"
                )}>
                  {selectedPlan === "detailed" && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                </div>
              </div>

              {/* Feature list */}
              <ul className="space-y-2.5">
                {detailedFeatures.map((f, i) => (
                  <li key={f} className={cn(
                    "flex items-start gap-2.5 text-[13px]",
                    i === 0 ? "text-[#f09050] font-semibold" : "text-white/70"
                  )}>
                    <span className={cn(
                      "mt-0.5 shrink-0",
                      i === 0 ? "text-[#f09050]" : selectedPlan === "detailed" ? "text-[#d4651a]" : "text-white/30"
                    )}>
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </button>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <button
          onClick={onContinue}
          className="group w-full md:w-96 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-br from-[#d4651a] via-[#c25510] to-[#a84410] px-8 py-4 text-[15.5px] font-bold text-white shadow-[0_4px_22px_rgba(212,101,26,0.40)] transition-all duration-200 hover:shadow-[0_6px_30px_rgba(212,101,26,0.55)] hover:brightness-110 active:scale-[0.99]"
        >
          <Sparkles className="h-5 w-5" />
          Continue with {selectedPlan === "basic" ? "Basic" : "Detailed"} Report
          <ChevronRight className="h-4.5 w-4.5 opacity-75 group-hover:translate-x-0.5 transition-transform" />
        </button>
        <div className="flex items-center gap-4 text-[11.5px] text-[#7a5c36]/60">
          <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5 text-[#d4651a]/60" /> Secure checkout</span>
          <span className="h-3 w-px bg-[#d8c090]/50" />
          <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-[#d4651a]/60" /> Instant delivery</span>
          <span className="h-3 w-px bg-[#d8c090]/50" />
          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-[#d4651a]/60" /> Satisfaction guaranteed</span>
        </div>
      </div>
    </motion.div>
  );
};
