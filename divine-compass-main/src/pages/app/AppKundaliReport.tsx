import React, { useState, useRef, useCallback } from "react";
import {
  Check, CheckCircle2, ChevronRight, Globe, IndianRupee,
  MapPin, Phone, Shield, Sparkles, Star, Tag, Zap,
} from "lucide-react";
import AppShell from "./AppShell";
import { LocationData } from "@/components/LocationSelector";
import { useKundaliReportPayment } from "@/hooks/useKundaliReportPayment";
import { basicFeatures, detailedFeatures, PRICES, ORIGINAL_PRICES } from "@/data/reportData";
import { BirthDatePicker } from "@/components/shared/BirthDatePicker";
import ChartStyleToggle from "@/components/kundali/ChartStyleToggle";
import { COUNTRY_CODES } from "@/data/countryCodes";

// ─── Nominatim city autocomplete ─────────────────────────────────────────────

const NOM_HEADERS = { "Accept-Language": "en", "User-Agent": "DivinePanchang/1.0" };

interface CitySuggestion {
  placeId: string;
  shortName: string;
  displayName: string;
  lat: number;
  lon: number;
  timezone: string;
}

function estimateTimezone(lat: number, lon: number): string {
  if (lat >= 8 && lat <= 37 && lon >= 68 && lon <= 97) return "Asia/Kolkata";
  if (lat >= 26 && lat <= 30 && lon >= 80 && lon <= 88) return "Asia/Kathmandu";
  if (lat >= 6  && lat <= 10 && lon >= 79 && lon <= 82) return "Asia/Colombo";
  if (lat >= 23 && lat <= 38 && lon >= 60 && lon <= 75) return "Asia/Karachi";
  if (lat >= 20 && lat <= 27 && lon >= 88 && lon <= 93) return "Asia/Dhaka";
  if (lat >= 22 && lat <= 26 && lon >= 51 && lon <= 56) return "Asia/Dubai";
  if (lat >= 49 && lat <= 59 && lon >= -8 && lon <= 2)  return "Europe/London";
  if (lat >= 35 && lat <= 71 && lon >= -5 && lon <= 25) return "Europe/Berlin";
  if (lat >= 24 && lat <= 50 && lon >= -125 && lon <= -65) {
    if (lon > -75) return "America/New_York";
    if (lon > -100) return "America/Chicago";
    return "America/Los_Angeles";
  }
  if (lat >= -45 && lat <= -10 && lon >= 110 && lon <= 155) return "Australia/Sydney";
  if (lat >= 1   && lat <= 2   && lon >= 103 && lon <= 104) return "Asia/Singapore";
  const off = Math.round(lon / 15);
  return `Etc/GMT${off >= 0 ? "-" : "+"}${Math.abs(off)}`;
}

async function searchCities(query: string): Promise<CitySuggestion[]> {
  if (query.length < 2) return [];
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`;
  const res = await fetch(url, { headers: NOM_HEADERS });
  const data: any[] = await res.json();
  return data.map((item) => {
    const addr = item.address || {};
    const city    = addr.city || addr.town || addr.village || addr.county || query;
    const state   = addr.state || addr.region || "";
    const country = addr.country || "";
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const shortName = [city, state !== city ? state : "", country].filter(Boolean).join(", ");
    return {
      placeId: item.place_id?.toString() ?? Math.random().toString(),
      shortName,
      displayName: item.display_name,
      lat, lon,
      timezone: estimateTimezone(lat, lon),
    };
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const defaultLocation: LocationData = {
  name: "Bengaluru", stateCode: "KA", countryCode: "IN",
  lat: 12.9716, lon: 77.5946, timezone: "Asia/Kolkata",
};

type Region = "india" | "international";
type Plan   = "basic" | "detailed";

function fmt(region: Region, plan: Plan, type: "current" | "original"): string {
  const isINR = region === "india";
  const p = type === "current" ? PRICES : ORIGINAL_PRICES;
  const val = plan === "basic"
    ? (isINR ? p.INR.BASIC : p.USD.BASIC)
    : (isINR ? p.INR.DETAILED : p.USD.DETAILED);
  return isINR ? `₹${val}` : `$${val}`;
}

function discountStr(region: Region, plan: Plan): string {
  const isINR = region === "india";
  const diff = plan === "basic"
    ? (isINR ? ORIGINAL_PRICES.INR.BASIC  - PRICES.INR.BASIC  : ORIGINAL_PRICES.USD.BASIC  - PRICES.USD.BASIC)
    : (isINR ? ORIGINAL_PRICES.INR.DETAILED - PRICES.INR.DETAILED : ORIGINAL_PRICES.USD.DETAILED - PRICES.USD.DETAILED);
  return isINR ? `₹${diff}` : `$${diff.toFixed(2)}`;
}

// ─── Shared style tokens ─────────────────────────────────────────────────────

const fieldCls =
  "w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-stone-800 " +
  "placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-400/40 " +
  "focus:border-amber-400 transition-all";
const labelCls = "block text-[11px] font-bold uppercase tracking-[0.15em] text-stone-500 mb-1.5";

// ─── Component ───────────────────────────────────────────────────────────────

export const AppKundaliReport: React.FC = () => {
  const {
    selectedPlan, setSelectedPlan,
    step, setStep,
    paymentRegion, setPaymentRegion,
    name, setName,
    dob, setDob,
    tob, setTob,
    gender, setGender,
    location, setLocation,
    email, setEmail,
    chartStyle, setChartStyle,
    language, setLanguage,
    error,
    paypalContainerRef,
    handlePayRazorpay,
    canProceed,
    priceINR, priceUSD,
  } = useKundaliReportPayment({ defaultLocation });

  const [phone, setPhone]           = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  // City autocomplete state
  const [cityInput, setCityInput]         = useState("");
  const [suggestions, setSuggestions]     = useState<CitySuggestion[]>([]);
  const [showDrop, setShowDrop]           = useState(false);
  const [searching, setSearching]         = useState(false);
  const [cityResolved, setCityResolved]   = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleCityChange = useCallback((val: string) => {
    setCityInput(val);
    setCityResolved(false);
    clearTimeout(debounceRef.current);
    if (val.length < 2) { setSuggestions([]); setShowDrop(false); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const res = await searchCities(val);
      setSuggestions(res);
      setShowDrop(res.length > 0);
      setSearching(false);
    }, 350);
  }, []);

  const handleCitySelect = useCallback((s: CitySuggestion) => {
    setCityInput(s.shortName);
    setShowDrop(false);
    setCityResolved(true);
    setLocation({ name: s.shortName, stateCode: "", countryCode: "", lat: s.lat, lon: s.lon, timezone: s.timezone });
  }, [setLocation]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppShell title="Kundali Report" eyebrow="Cosmic Blueprint" showBack>
      <div className="space-y-5 pb-10">

        {/* Step 2 breadcrumb */}
        {step === "form" && (
          <div className="flex items-center gap-3">
            <button onClick={() => setStep("plan")}
              className="text-[13px] font-semibold text-amber-700">
              ← Back to plans
            </button>
            <div className="h-4 w-px bg-amber-200" />
            <p className="text-[12px] font-bold text-stone-700">Step 2 of 2 — Birth Details</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
            {error}
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 1 — Plan Selection
        ══════════════════════════════════════════════ */}
        {step === "plan" && (
          <div className="space-y-4">

            {/* Region toggle */}
            <div className="flex rounded-2xl border border-amber-200 bg-amber-50 p-1 gap-1">
              {(["india", "international"] as const).map((r) => (
                <button key={r} onClick={() => setPaymentRegion(r)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-bold transition-all ${
                    paymentRegion === r
                      ? "bg-gradient-to-br from-orange-500 to-orange-700 text-white shadow-sm"
                      : "text-amber-800"
                  }`}>
                  {r === "india"
                    ? <><IndianRupee className="w-3.5 h-3.5" /> India (₹ INR)</>
                    : <><Globe className="w-3.5 h-3.5" /> Global ($ USD)</>}
                </button>
              ))}
            </div>

            {/* Basic card */}
            <button onClick={() => setSelectedPlan("basic")}
              className={`w-full text-left rounded-2xl border p-5 transition-all ${
                selectedPlan === "basic"
                  ? "border-orange-400 bg-white shadow-[0_0_0_3px_rgba(249,115,22,0.12)]"
                  : "border-amber-100 bg-white"
              }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                      Basic Report
                    </span>
                    <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-black text-white">
                      60% OFF
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] text-stone-300 line-through">
                      {fmt(paymentRegion, "basic", "original")}
                    </span>
                    <span className="font-display text-3xl font-black text-stone-900">
                      {fmt(paymentRegion, "basic", "current")}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">Instant PDF download</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                  selectedPlan === "basic" ? "border-orange-500 bg-orange-500" : "border-stone-200"
                }`}>
                  {selectedPlan === "basic" && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
              </div>
              <ul className="space-y-2">
                {basicFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[12.5px] text-stone-600">
                    <Check className="w-3.5 h-3.5 text-orange-400 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                    {f}
                  </li>
                ))}
              </ul>
            </button>

            {/* Detailed card */}
            <div className="relative mt-5">
              <div className="absolute -top-3.5 inset-x-0 flex justify-center z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-700 px-4 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-md">
                  <Star className="w-3 h-3 fill-white" /> Most Popular
                </span>
              </div>
              <button onClick={() => setSelectedPlan("detailed")}
                className={`w-full text-left rounded-2xl overflow-hidden transition-all ${
                  selectedPlan === "detailed"
                    ? "shadow-[0_0_0_2px_rgba(249,115,22,0.5),0_16px_48px_rgba(12,22,40,0.3)]"
                    : "shadow-[0_4px_24px_rgba(12,22,40,0.22)]"
                }`}>
                <div className="h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                <div className="p-5 bg-gradient-to-b from-[#13203e] to-[#0c1628]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-300/80">
                          Detailed Analysis
                        </span>
                        <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-black text-white">
                          60% OFF
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[13px] text-white/30 line-through">
                          {fmt(paymentRegion, "detailed", "original")}
                        </span>
                        <span className="font-display text-3xl font-black text-white">
                          {fmt(paymentRegion, "detailed", "current")}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/40 mt-0.5">Lifetime predictions & remedies</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      selectedPlan === "detailed" ? "border-orange-500 bg-orange-500" : "border-white/25"
                    }`}>
                      {selectedPlan === "detailed" && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {detailedFeatures.map((f, i) => (
                      <li key={f} className={`flex items-start gap-2 text-[12.5px] ${
                        i === 0 ? "text-orange-300 font-semibold" : "text-white/65"
                      }`}>
                        <Check className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                          i === 0 ? "text-orange-400" : "text-orange-500/70"
                        }`} strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </button>
            </div>

            {/* CTA */}
            <button onClick={() => setStep("form")}
              className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-800 py-4 text-[15px] font-bold text-white shadow-[0_4px_22px_rgba(249,115,22,0.4)] active:scale-[0.99] transition-transform mt-2">
              <Sparkles className="w-5 h-5" />
              Continue with {selectedPlan === "basic" ? "Basic" : "Detailed"} Report
              <ChevronRight className="w-4 h-4 opacity-75" />
            </button>

            <div className="flex items-center justify-center gap-3 text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-orange-400/60" /> Secure checkout
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-orange-400/60" /> Instant delivery
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-orange-400/60" /> Guaranteed
              </span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 2 — Birth Details + Payment
        ══════════════════════════════════════════════ */}
        {step === "form" && (
          <div className="space-y-4">

            {/* ── Birth Details Card ── */}
            <div className="rounded-2xl border border-amber-100 bg-white overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-amber-100 bg-amber-50/60">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-[11px] font-black flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-display text-[16px] font-bold text-stone-900">Birth Details</h3>
                </div>
                <p className="text-[11.5px] text-stone-400 mt-0.5 ml-8">
                  All fields required for accurate calculations
                </p>
              </div>

              <div className="p-5 space-y-5">

                {/* Full Name */}
                <div>
                  <label className={labelCls}>Full Name</label>
                  <input
                    className={fieldCls}
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className={labelCls}>Gender</label>
                  <div className="flex gap-2 h-11">
                    {["male", "female"].map((g) => (
                      <button key={g} type="button" onClick={() => setGender(g)}
                        className={`flex-1 rounded-xl text-[13px] font-semibold capitalize transition-all ${
                          gender === g
                            ? "bg-orange-500 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-stone-600"
                        }`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className={labelCls}>Date of Birth</label>
                  <BirthDatePicker value={dob} onChange={setDob} />
                </div>

                {/* Time of Birth */}
                <div>
                  <label className={labelCls}>Time of Birth</label>
                  <input
                    type="time"
                    className={`${fieldCls} max-w-[180px]`}
                    value={tob}
                    onChange={(e) => setTob(e.target.value)}
                  />
                </div>

                {/* Place of Birth */}
                <div className="relative">
                  <label className={labelCls}>Place of Birth</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none" />
                    <input
                      className={`${fieldCls} pl-10 pr-8`}
                      placeholder="Search city…"
                      value={cityInput}
                      onChange={(e) => handleCityChange(e.target.value)}
                      onFocus={() => suggestions.length > 0 && setShowDrop(true)}
                      onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                    />
                    {searching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {cityResolved && !searching && (
                      <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                    )}
                  </div>

                  {showDrop && (
                    <ul className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                      {suggestions.map((s) => (
                        <li key={s.placeId}
                          onMouseDown={(e) => { e.preventDefault(); handleCitySelect(s); }}
                          className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-amber-50 border-b border-slate-50 last:border-0">
                          <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[13px] font-semibold text-stone-800 truncate">{s.shortName}</p>
                            <p className="text-[11px] text-stone-400 truncate">{s.displayName}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {cityResolved && (
                    <p className="mt-1.5 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {location.timezone} · {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-amber-100" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    Delivery & Contact
                  </span>
                  <div className="flex-1 h-px bg-amber-100" />
                </div>

                {/* Email */}
                <div>
                  <label className={labelCls}>
                    Email Address{" "}
                    <span className="normal-case font-normal text-stone-300 tracking-normal">
                      (PDF delivered here)
                    </span>
                  </label>
                  <input
                    type="email"
                    className={fieldCls}
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className={labelCls}>
                    <Phone className="w-3 h-3 inline mr-1 text-orange-500" />
                    Phone{" "}
                    <span className="normal-case font-normal text-stone-300 tracking-normal">
                      (WhatsApp updates)
                    </span>
                  </label>
                  <div className="flex h-11 rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-amber-400/40 focus-within:border-amber-400 transition-all">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="h-full w-[75px] shrink-0 border-r border-slate-100 bg-amber-50/50 px-2 text-[13px] font-bold text-stone-700 outline-none cursor-pointer">
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.iso3} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="00000 00000"
                      className="flex-1 min-w-0 h-full px-4 bg-transparent text-[14px] outline-none placeholder:text-stone-300"
                    />
                  </div>
                </div>

                {/* Chart Tradition */}
                <div>
                  <label className={labelCls}>Chart Tradition</label>
                  <ChartStyleToggle chartStyle={chartStyle} onStyleChange={setChartStyle} />
                </div>

                {/* Language */}
                <div>
                  <label className={labelCls}>Report Language</label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className={`${fieldCls} appearance-none cursor-pointer`}>
                      {[
                        { code: "en", name: "English"    },
                        { code: "hi", name: "Hindi"      },
                        { code: "kn", name: "Kannada"    },
                        { code: "ta", name: "Tamil"      },
                        { code: "te", name: "Telugu"     },
                        { code: "ml", name: "Malayalam"  },
                        { code: "mr", name: "Marathi"    },
                        { code: "bn", name: "Bengali"    },
                        { code: "gu", name: "Gujarati"   },
                        { code: "or", name: "Oriya"      },
                        { code: "si", name: "Sinhala"    },
                      ].map((l) => (
                        <option key={l.code} value={l.code}>{l.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-orange-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── What's Included ── */}
            <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
              <p className="text-[10.5px] font-bold uppercase tracking-widest text-orange-600 mb-3">
                What's Included
              </p>
              {[
                "70–90 page detailed PDF report",
                "Planetary positions & aspects",
                "Dasha timeline & predictions",
                "Yogas, doshas & remedies",
                "Delivered instantly to email",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 mb-2 last:mb-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                  <span className="text-[12.5px] text-stone-600">{item}</span>
                </div>
              ))}
            </div>

            {/* ── Order Summary ── */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#13203e] to-[#0c1628] p-5 text-white shadow-[0_16px_48px_rgba(12,22,40,0.32)]">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500/80 to-transparent" />

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400" /> Order Summary
                </h3>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-2 mb-4">
                <Tag className="w-3.5 h-3.5 text-orange-300 shrink-0" />
                <p className="text-[11px] font-semibold text-orange-300">
                  Limited offer — 60% OFF applied
                </p>
                <span className="ml-auto rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-black text-white">
                  SAVE 60%
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[12.5px] text-white/50">
                  <span>{selectedPlan === "basic" ? "Basic" : "Detailed"} Kundali Report</span>
                  <span className="line-through">{fmt(paymentRegion, selectedPlan, "original")}</span>
                </div>
                <div className="flex justify-between text-[12px] text-orange-300">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" /> 60% Discount
                  </span>
                  <span>−{discountStr(paymentRegion, selectedPlan)}</span>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-[13px] font-bold">Total Due</span>
                  <div className="text-right">
                    <span className="font-display text-3xl font-black">
                      {fmt(paymentRegion, selectedPlan, "current")}
                    </span>
                    <p className="text-[10px] text-white/30">One-time · No subscription</p>
                  </div>
                </div>
              </div>

              {!canProceed ? (
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-center">
                  <p className="text-[12px] text-white/40">
                    Complete all birth details to unlock payment
                  </p>
                </div>
              ) : (
                <button
                  onClick={handlePayRazorpay}
                  className="w-full h-12 rounded-xl bg-orange-500 text-white font-bold text-[14px] shadow-[0_4px_20px_rgba(249,115,22,0.45)] transition-all hover:brightness-110 active:scale-[0.98]">
                  Pay {fmt(paymentRegion, selectedPlan, "current")} — Get Report Instantly
                </button>
              )}

              <p className="mt-3 text-center text-[10.5px] text-white/25 flex items-center justify-center gap-1">
                🔒 Secure payment · Encrypted · Instant PDF delivery
              </p>
            </div>

            {/* PayPal container (international) */}
            <div ref={paypalContainerRef} id="paypal-button-container" />
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AppKundaliReport;
