import { motion } from "framer-motion";
import { FileText, Clock, Download, CheckCircle, Sparkles, Star, Zap, Shield, BookOpen } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { LocationData } from "@/components/LocationSelector";
import { useKundaliReportPayment } from "@/hooks/useKundaliReportPayment";
import { PricingSection } from "@/components/kundali/PricingSection";
import { ReportForm } from "@/components/kundali/ReportForm";

const defaultLocation: LocationData = {
  name: "Bengaluru", stateCode: "KA", countryCode: "IN",
  lat: 12.9716, lon: 77.5946, timezone: "Asia/Kolkata"
};

export const KundaliReportPage = () => {
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
    handlePayRazorpay,
    handlePayPaddle,
    handleTestBypass,
    canProceed,
    priceINR, priceUSD
  } = useKundaliReportPayment({ defaultLocation });

  const testBypassEnabled = import.meta.env.VITE_ENABLE_PAYMENT_BYPASS === "true"; // Configured via environment variables for dev/prod segregation

  return (
    <Layout>
      <style>{`
        #paypal-button-container,
        #paypal-button-container > div,
        #paypal-button-container iframe {
          position: relative !important;
          z-index: 0 !important;
        }
      `}</style>

      <div className="container mx-auto px-4 py-10 max-w-4xl">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 space-y-5"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4651a]/25 bg-[#d4651a]/08 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#a84810]">
            <BookOpen className="h-3.5 w-3.5" />
            Personalised Kundali Report
          </div>

          {/* Headline */}
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1c1408] leading-tight">
              Your Life's{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[#c55810] via-[#d4651a] to-[#a84010] bg-clip-text text-transparent">
                  Cosmic Blueprint
                </span>
                <span className="absolute inset-x-0 bottom-1 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#d4651a]/50 to-transparent" />
              </span>
            </h1>
            <p className="mt-3 text-[15px] text-[#5a4025]/65 max-w-xl mx-auto leading-relaxed">
              A detailed Vedic astrology report from your exact birth details — planets, dashas, houses, yogas, and remedies.
            </p>
          </div>

          {/* Quick trust pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: Star, text: "Vedic precision" },
              { icon: Zap, text: "Instant PDF" },
              { icon: Shield, text: "Secure payment" },
              { icon: CheckCircle, text: "14+ page report" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 rounded-full border border-[#e4cfa0]/70 bg-[#fffdf8] px-3.5 py-1.5 text-[12px] font-medium text-[#6a4820]">
                <Icon className="h-3.5 w-3.5 text-[#d4651a]" />
                {text}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Error Alert ── */}
        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-start gap-3">
            <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5 font-bold">!</div>
            <p>{error}</p>
          </div>
        )}

        {/* ── STEP 1: Plan selection ── */}
        {step === "plan" && (
          <PricingSection
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            paymentRegion={paymentRegion}
            setPaymentRegion={setPaymentRegion}
            onContinue={() => setStep("form")}
          />
        )}

        {/* ── STEP 2: Form & Payment ── */}
        {step === "form" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8 flex items-center gap-3">
              <button
                onClick={() => setStep("plan")}
                className="text-[13px] font-semibold text-[#7a5c36] hover:text-[#a84810] transition-colors"
              >
                ← Back to plans
              </button>
              <div className="h-4 w-px bg-[#d8c090]/50" />
              <p className="text-[13px] font-bold text-[#1c1408]">
                Step 2 of 2 — Birth Details & Checkout
              </p>
            </div>

            <ReportForm
              name={name} setName={setName}
              dob={dob} setDob={setDob}
              tob={tob} setTob={setTob}
              gender={gender} setGender={setGender}
              location={location} setLocation={setLocation}
              email={email} setEmail={setEmail}
              chartStyle={chartStyle} setChartStyle={setChartStyle}
              language={language} setLanguage={setLanguage}
              paymentRegion={paymentRegion}
              selectedPlan={selectedPlan}
              priceINR={priceINR}
              priceUSD={priceUSD}
              handlePayRazorpay={handlePayRazorpay}
              handlePayPaddle={handlePayPaddle}
              handleTestBypass={handleTestBypass}
              canProceed={canProceed}
              testBypassEnabled={testBypassEnabled}
            />
          </motion.div>
        )}

        {/* ── STEP 3: Processing ── */}
        {step === "processing" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center space-y-6">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-[#d4651a]/20 border-t-[#d4651a]" />
              <Sparkles className="h-8 w-8 text-[#d4651a]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1c1408] mb-2">Generating Your Report…</h2>
              <p className="text-[14px] text-[#7a5c36]/70 max-w-sm mx-auto">
                Please don't close this window. We're verifying your payment and preparing your personalised Kundali.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Trust strip ── */}
        {step !== "processing" && (
          <div className="mt-16 pt-8 border-t border-[#e4cfa0]/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { icon: Download, title: "Instant Access", desc: "Download PDF immediately after payment" },
                { icon: Clock, title: "14+ Pages", desc: "In-depth life analysis" },
                { icon: CheckCircle, title: "Vedic Accuracy", desc: "Lahiri ayanamsha calculations" },
                { icon: Sparkles, title: "Remedies Included", desc: "Mantras, gemstones & rituals" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e4cfa0]/60 bg-[#fffdf8] text-[#d4651a] shadow-[0_2px_8px_rgba(181,148,73,0.08)]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#1c1408]">{item.title}</p>
                    <p className="text-[11.5px] text-[#7a5c36]/65 leading-snug mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default KundaliReportPage;
