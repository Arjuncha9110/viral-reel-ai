import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LocationSelector, LocationData } from "@/components/LocationSelector";
import ChartStyleToggle from "@/components/kundali/ChartStyleToggle";
import { Zap, IndianRupee, Shield, Tag, Phone, CheckCircle2, Star } from "lucide-react";
import { Plan, Region } from "@/hooks/useKundaliReportPayment";
import { ORIGINAL_PRICES } from "@/data/reportData";
import { RefObject } from "react";
import { COUNTRY_CODES } from "@/data/countryCodes";
import { BirthDatePicker } from "@/components/shared/BirthDatePicker";

interface ReportFormProps {
  name: string; setName: (v: string) => void;
  dob: string; setDob: (v: string) => void;
  tob: string; setTob: (v: string) => void;
  gender: string; setGender: (v: string) => void;
  location: LocationData; setLocation: (v: LocationData) => void;
  email: string; setEmail: (v: string) => void;
  countryCode: string; setCountryCode: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  chartStyle: "north" | "south"; setChartStyle: (v: "north" | "south") => void;
  language: string; setLanguage: (v: string) => void;
  paymentRegion: Region;
  selectedPlan: Plan;
  priceINR: number;
  priceUSD: number;
  handlePayRazorpay: () => void;
  canProceed: boolean;
  paypalContainerRef: RefObject<HTMLDivElement>;
}

export const ReportForm = ({
  name, setName, dob, setDob, tob, setTob, gender, setGender,
  location, setLocation, email, setEmail,
  countryCode, setCountryCode, phone, setPhone,
  chartStyle, setChartStyle, language, setLanguage,
  paymentRegion, selectedPlan, priceINR, priceUSD,
  handlePayRazorpay, canProceed, paypalContainerRef
}: ReportFormProps) => {
  const fieldClass = "h-11 rounded-xl border border-input bg-white/70 px-4 text-[14px] shadow-sm focus:ring-2 focus:ring-[#d4651a]/30 focus:border-[#d4651a]/60 transition-all";

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start">

      {/* ── Left: Birth Details Form ── */}
      <div className="rounded-3xl border border-[#e8d5b0]/60 bg-white/80 backdrop-blur-sm shadow-[0_8px_32px_rgba(122,91,40,0.08)] overflow-hidden">
        {/* Header */}
        <div className="px-7 py-5 border-b border-[#e8d5b0]/50 bg-gradient-to-r from-[#fdf8f0] to-[#faf4e8]">
          <h3 className="font-display text-[17px] font-bold text-[#2a1a08] flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4651a] text-white text-[12px] font-black">1</span>
            Birth Details
          </h3>
          <p className="text-[12px] text-[#8b6840] mt-0.5">All fields required for accurate calculations</p>
        </div>

        <div className="p-7 space-y-5">
          {/* Name + Gender */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-[#4a3520] uppercase tracking-wide">Full Name</Label>
              <Input placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)}
                className={fieldClass} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-[#4a3520] uppercase tracking-wide">Gender</Label>
              <div className="flex gap-2 h-11">
                {["male", "female"].map((g) => (
                  <button key={g} type="button" onClick={() => setGender(g)}
                    className={`flex-1 rounded-xl text-[13px] font-semibold capitalize transition-all ${
                      gender === g
                        ? "bg-[#d4651a] text-white shadow-[0_4px_12px_rgba(212,101,26,0.35)]"
                        : "bg-white/70 border border-input text-[#4a3520] hover:border-[#d4651a]/40"
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DOB + TOB */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-[#4a3520] uppercase tracking-wide">Date of Birth</Label>
              <BirthDatePicker value={dob} onChange={setDob} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-semibold text-[#4a3520] uppercase tracking-wide">Time of Birth</Label>
              <Input type="time" value={tob} onChange={(e) => setTob(e.target.value)} className={`${fieldClass} max-w-[200px]`} />
            </div>
          </div>

          {/* Place */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-semibold text-[#4a3520] uppercase tracking-wide">Place of Birth</Label>
            <LocationSelector onLocationSelect={setLocation} defaultLocation={location} />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-[#e8d5b0]/60" />
            <span className="text-[11px] text-[#b09070] font-medium uppercase tracking-widest">Delivery & Contact</span>
            <div className="flex-1 h-px bg-[#e8d5b0]/60" />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-semibold text-[#4a3520] uppercase tracking-wide flex items-center gap-1.5">
              Email Address
              <span className="normal-case font-normal text-[#b09070] tracking-normal">(report PDF delivered here)</span>
            </Label>
            <Input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className={fieldClass} />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-semibold text-[#4a3520] uppercase tracking-wide flex items-center gap-1.5">
              <Phone className="h-3 w-3 text-[#d4651a]" />
              Phone Number
              <span className="normal-case font-normal text-[#b09070] tracking-normal">(WhatsApp updates)</span>
            </Label>
            <div className="flex h-11 w-full rounded-xl border border-input bg-white/70 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-[#d4651a]/30 focus-within:border-[#d4651a]/60 transition-all">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                className="h-full w-[82px] shrink-0 border-r border-input bg-[#fdf8f0] px-2 text-[13px] font-bold text-[#4a3520] outline-none cursor-pointer">
                {COUNTRY_CODES.map(c => <option key={c.iso3} value={c.code}>{c.code}</option>)}
              </select>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="00000 00000 00000"
                className="flex-1 min-w-0 h-full px-4 bg-transparent text-[14px] tracking-widest outline-none placeholder:text-muted-foreground/40 placeholder:tracking-normal" />
            </div>
          </div>

          {/* Chart style + language */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-[12px] font-semibold text-[#4a3520] uppercase tracking-wide">Chart Tradition</Label>
            <ChartStyleToggle chartStyle={chartStyle} onStyleChange={setChartStyle} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[12px] font-semibold text-[#4a3520] uppercase tracking-wide">Report Language</Label>
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-white/70 px-4 text-[14px] text-[#4a3520] shadow-sm focus:ring-2 focus:ring-[#d4651a]/30 focus:border-[#d4651a]/60 transition-all appearance-none cursor-pointer"
              >
                {[
                  { code: "en", name: "English" },
                  { code: "ml", name: "Malayalam" },
                  { code: "ta", name: "Tamil" },
                  { code: "te", name: "Telugu" },
                  { code: "hi", name: "Hindi" },
                  { code: "kn", name: "Kannada" },
                  { code: "mr", name: "Marathi" },
                  { code: "bn", name: "Bengali" },
                  { code: "or", name: "Oriya" },
                  { code: "gu", name: "Gujarati" },
                  { code: "si", name: "Sinhala" },
                ].map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#d4651a]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Premium Checkout Sidebar ── */}
      <div className="space-y-4 lg:sticky lg:top-24">

        {/* What you get */}
        <div className="rounded-2xl border border-[#e8d5b0]/60 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
          <p className="text-[11px] font-bold text-[#d4651a] uppercase tracking-widest mb-3">What's included</p>
          {[
            "70–90 page detailed PDF report",
            "Planetary positions & aspects",
            "Dasha timeline & predictions",
            "Yogas, doshas & remedies",
            "Delivered instantly to email",
          ].map((item) => (
            <div key={item} className="flex items-start gap-2 mb-2 last:mb-0">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#d4651a] shrink-0 mt-0.5" />
              <span className="text-[12.5px] text-[#4a3520]">{item}</span>
            </div>
          ))}
        </div>

        {/* Order summary card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#13203e] to-[#0c1628] p-6 text-white shadow-[0_16px_48px_rgba(12,22,40,0.32)]">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4651a]/80 to-transparent" />
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#d4651a]/8 blur-2xl" />

          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[15px] font-bold flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#f09050]" /> Order Summary
            </h3>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_,i) => <Star key={i} className="h-2.5 w-2.5 fill-[#f0b050] text-[#f0b050]" />)}
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2 rounded-xl border border-[#d4651a]/30 bg-[#d4651a]/12 px-3 py-2.5">
            <Tag className="h-3.5 w-3.5 text-[#f09050] shrink-0" />
            <p className="text-[11.5px] font-semibold text-[#f09050]">Limited offer — 60% OFF applied</p>
            <span className="ml-auto rounded-full bg-[#d4651a] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">SAVE 60%</span>
          </div>

          <div className="space-y-2 mb-5">
            <div className="flex justify-between text-[13px] text-white/50">
              <span>{selectedPlan === "basic" ? "Basic" : "Detailed"} Kundali Report</span>
              <span className="line-through">
                {paymentRegion === "india"
                  ? `₹${selectedPlan === "basic" ? ORIGINAL_PRICES.INR.BASIC : ORIGINAL_PRICES.INR.DETAILED}`
                  : `$${selectedPlan === "basic" ? ORIGINAL_PRICES.USD.BASIC : ORIGINAL_PRICES.USD.DETAILED}`}
              </span>
            </div>
            <div className="flex justify-between text-[12.5px] text-[#f09050]">
              <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> 60% Discount</span>
              <span className="font-semibold">
                −{paymentRegion === "india"
                  ? `₹${selectedPlan === "basic" ? ORIGINAL_PRICES.INR.BASIC - priceINR : ORIGINAL_PRICES.INR.DETAILED - priceINR}`
                  : `$${selectedPlan === "basic" ? (ORIGINAL_PRICES.USD.BASIC - priceUSD).toFixed(2) : (ORIGINAL_PRICES.USD.DETAILED - priceUSD).toFixed(2)}`}
              </span>
            </div>
            <div className="h-px bg-white/10 my-1" />
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-bold">Total Due</span>
              <div className="text-right">
                <span className="font-display text-3xl font-black tracking-tight">
                  {paymentRegion === "india" ? `₹${priceINR}` : `$${priceUSD}`}
                </span>
                <p className="text-[10px] text-white/35">One-time · No subscription</p>
              </div>
            </div>
          </div>

          {!canProceed ? (
            <div className="rounded-xl border border-white/8 bg-white/5 px-4 py-3.5 text-center">
              <p className="text-[12px] text-white/40">Complete all birth details to unlock payment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paymentRegion === "india" ? (
                <button onClick={handlePayRazorpay}
                  disabled={!canProceed}
                  className="w-full h-12 rounded-xl bg-[#d4651a] text-white font-bold text-[15px] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(212,101,26,0.45)] transition-all hover:shadow-[0_8px_28px_rgba(212,101,26,0.6)] hover:brightness-110 active:scale-[0.98]"
                >
                  Pay ₹{priceINR} — Get Report Instantly
                </button>
              ) : (
                <button
                  onClick={handlePayRazorpay}
                  disabled={!canProceed}
                  className="w-full h-12 rounded-xl bg-[#0070ba] text-white font-bold text-[15px] disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all hover:brightness-110"
                >
                  Pay ${priceUSD} via PayPal
                </button>
              )}
            </div>
          )}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-white/25">
            <span>🔒</span>
            <span>Secure payment · Encrypted · Instant PDF delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};
