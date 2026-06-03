import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocationSelector, LocationData } from "@/components/LocationSelector";
import ChartStyleToggle from "@/components/kundali/ChartStyleToggle";
import { Zap, IndianRupee, Globe, Shield, Tag } from "lucide-react";
import { Plan, Region } from "@/hooks/useKundaliReportPayment";
import { ORIGINAL_PRICES } from "@/data/reportData";
import { RefObject } from "react";

interface ReportFormProps {
  name: string; setName: (v: string) => void;
  dob: string; setDob: (v: string) => void;
  tob: string; setTob: (v: string) => void;
  gender: string; setGender: (v: string) => void;
  location: LocationData; setLocation: (v: LocationData) => void;
  email: string; setEmail: (v: string) => void;
  chartStyle: "north" | "south"; setChartStyle: (v: "north" | "south") => void;
  language: "en" | "kn"; setLanguage: (v: "en" | "kn") => void;
  paymentRegion: Region;
  selectedPlan: Plan;
  priceINR: number;
  priceUSD: number;
  handlePayRazorpay: () => void;
  handleTestBypass: () => void;
  canProceed: boolean;
  paypalContainerRef: RefObject<HTMLDivElement>;
  testBypassEnabled: boolean;
}

export const ReportForm = ({
  name, setName, dob, setDob, tob, setTob, gender, setGender,
  location, setLocation, email, setEmail, chartStyle, setChartStyle,
  language, setLanguage,
  paymentRegion, selectedPlan, priceINR, priceUSD,
  handlePayRazorpay, handleTestBypass, canProceed,
  paypalContainerRef, testBypassEnabled
}: ReportFormProps) => {
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8">
      {/* Left: Form */}
      <div className="space-y-6 bg-card border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <div className="flex gap-2">
              {["male", "female"].map((g) => (
                <Button key={g} variant={gender === g ? "default" : "outline"} className="flex-1 capitalize" onClick={() => setGender(g)}>
                  {g}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tob">Time of Birth</Label>
            <Input id="tob" type="time" value={tob} onChange={(e) => setTob(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Place of Birth</Label>
          <LocationSelector onLocationSelect={setLocation} defaultLocation={location} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address (To receive report)</Label>
          <Input id="email" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="pt-2">
          <Label className="mb-3 block">Chart Style</Label>
          <ChartStyleToggle chartStyle={chartStyle} onStyleChange={setChartStyle} />
        </div>

        <div className="pt-2">
          <Label className="mb-3 block">Report Language</Label>
          <div className="flex gap-2">
            {[
              { code: "en", name: "English" },
              { code: "kn", name: "ಕನ್ನಡ (Kannada)" }
            ].map((lang) => (
              <Button
                key={lang.code}
                variant={language === lang.code ? "default" : "outline"}
                type="button"
                className="flex-1 font-semibold"
                onClick={() => setLanguage(lang.code as any)}
              >
                {lang.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Checkout Sidebar */}
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl border border-[#d4651a]/20 bg-gradient-to-b from-[#13203e] to-[#0c1628] p-6 text-white shadow-[0_12px_40px_rgba(12,22,40,0.28)]">
          {/* Top accent */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4651a]/70 to-transparent" />

          <h3 className="text-[15px] font-bold mb-5 flex items-center gap-2">
            <Zap className="h-4 w-4 text-[#f09050]" /> Order Summary
          </h3>

          {/* Discount banner */}
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#d4651a]/30 bg-[#d4651a]/10 px-3 py-2.5">
            <Tag className="h-3.5 w-3.5 text-[#f09050] shrink-0" />
            <p className="text-[12px] font-semibold text-[#f09050]">Limited offer — 60% discount applied</p>
            <span className="ml-auto rounded-full bg-[#d4651a] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">60% OFF</span>
          </div>

          {/* Line items */}
          <div className="space-y-2.5 mb-5">
            <div className="flex justify-between text-[13px] text-white/55">
              <span>{selectedPlan === "basic" ? "Basic" : "Detailed"} Report</span>
              <span className="line-through">
                {paymentRegion === "india"
                  ? `₹${selectedPlan === "basic" ? ORIGINAL_PRICES.INR.BASIC : ORIGINAL_PRICES.INR.DETAILED}`
                  : `$${selectedPlan === "basic" ? ORIGINAL_PRICES.USD.BASIC : ORIGINAL_PRICES.USD.DETAILED}`}
              </span>
            </div>
            <div className="flex justify-between text-[13px] text-[#f09050]">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3 w-3" /> 60% Discount
              </span>
              <span className="font-semibold">
                −{paymentRegion === "india"
                  ? `₹${selectedPlan === "basic" ? ORIGINAL_PRICES.INR.BASIC - priceINR : ORIGINAL_PRICES.INR.DETAILED - priceINR}`
                  : `$${selectedPlan === "basic"
                      ? (ORIGINAL_PRICES.USD.BASIC - priceUSD).toFixed(2)
                      : (ORIGINAL_PRICES.USD.DETAILED - priceUSD).toFixed(2)}`}
              </span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex justify-between items-baseline">
              <span className="text-[14px] font-bold">Total</span>
              <div className="text-right">
                <span className="font-display text-2xl font-black text-white">
                  {paymentRegion === "india" ? `₹${priceINR}` : `$${priceUSD}`}
                </span>
                <p className="text-[10px] text-white/35 mt-0.5">One-time · Instant PDF</p>
              </div>
            </div>
          </div>

          {!canProceed ? (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-[12px] text-white/45 text-center">
              Complete all birth details above to enable payment
            </div>
          ) : (
            <div className="space-y-2.5">
              {paymentRegion === "india" ? (
                <button
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#d4651a] via-[#c25510] to-[#a84410] px-5 py-3.5 text-[14.5px] font-bold text-white shadow-[0_4px_18px_rgba(212,101,26,0.38)] transition-all hover:brightness-110 hover:shadow-[0_6px_24px_rgba(212,101,26,0.52)]"
                  onClick={handlePayRazorpay}
                >
                  <IndianRupee className="h-4 w-4" />
                  Pay ₹{priceINR} with Razorpay
                </button>
              ) : (
                <div id="paypal-button-container" ref={paypalContainerRef} className="min-h-[44px]" />
              )}

              {testBypassEnabled && (
                <button
                  type="button"
                  onClick={handleTestBypass}
                  className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#f09050]/40 bg-[#f09050]/10 px-5 py-2.5 text-[13px] font-semibold text-[#f09050] hover:bg-[#f09050]/20 transition-all"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Bypass Payment (Test Mode)
                </button>
              )}
            </div>
          )}

          <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-white/28">
            <Shield className="h-3.5 w-3.5" />
            Secure · Encrypted · Instant delivery
          </div>
        </div>
      </div>
    </div>
  );
};
