import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LocationData } from "@/components/LocationSelector";
import { PRICES, PAYPAL_CLIENT_ID, RAZORPAY_KEY } from "@/data/reportData";

export type Step = "plan" | "form" | "processing" | "done";
export type Region = "india" | "international";
export type Plan = "basic" | "detailed";

interface UseKundaliReportPaymentProps {
  defaultLocation: LocationData;
}

export const useKundaliReportPayment = ({ defaultLocation }: UseKundaliReportPaymentProps) => {
  const navigate = useNavigate();

  // Core State
  const [selectedPlan, setSelectedPlan] = useState<Plan>("detailed");
  const [step, setStep] = useState<Step>("plan");
  const [paymentRegion, setPaymentRegion] = useState<Region>(detectRegion());

  // Form State
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [tob, setTob] = useState("12:00");
  const [gender, setGender] = useState("male");
  const [location, setLocation] = useState<LocationData>(defaultLocation);
  const [email, setEmail] = useState("");
  const [chartStyle, setChartStyle] = useState<"north" | "south">("north");
  const [language, setLanguage] = useState<"en" | "kn">("en");

  // Output State
  const [error, setError] = useState<string | null>(null);

  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const paypalRenderedRef = useRef(false);

  const priceINR = selectedPlan === "basic" ? PRICES.INR.BASIC : PRICES.INR.DETAILED;
  const priceUSD = selectedPlan === "basic" ? PRICES.USD.BASIC : PRICES.USD.DETAILED;
  
  const canProceed = name.trim().length > 0 && dob !== "" && tob !== "" && email.includes("@");

  const buildPreviewUrl = (token?: string) => {
    const params = new URLSearchParams({
      name: name.trim(),
      dob, tob,
      email: email.trim(),
      gender,
      city: location.name,
      lat: String(location.lat),
      lon: String(location.lon),
      tz: location.timezone,
      plan: selectedPlan,
      chartStyle,
      lang: language,
    });
    if (token) params.set("token", token);
    return `/kundali-report-preview?${params.toString()}`;
  };

  const saveReportDetails = (token?: string) => {
    localStorage.setItem("kundali_report_details", JSON.stringify({
      name, email, dob, tob, gender,
      city: location.name,
      lat: location.lat,
      lon: location.lon,
      timezone: location.timezone,
      plan: selectedPlan,
      chartStyle,
      token,
    }));
    localStorage.setItem("kundali_report_lang", language);
  };

  // Paddle Payment
  const handlePayPaddle = async () => {
    setError(null);
    setStep("processing");
    try {
      const res = await fetch("/api/payment/paddle-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          email,
          name,
          dob,
          tob,
          gender,
          city: location.name,
          lat: location.lat,
          lon: location.lon,
          timezone: location.timezone,
          chartStyle,
          language,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        if (data.url) {
          window.location.href = data.url;
        } else {
          saveReportDetails(data.token);
          navigate(buildPreviewUrl(data.token));
        }
      } else {
        throw new Error(data.message || "Paddle checkout failed.");
      }
    } catch (e: any) {
      setError(e.message || "Paddle processing failed.");
      setStep("form");
    }
  };

  // Razorpay
  const handlePayRazorpay = async () => {
    setError(null);
    setStep("processing");

    const loadRazorpay = () => new Promise<boolean>((res) => {
      if (window.Razorpay) return res(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => res(true);
      s.onerror = () => res(false);
      document.body.appendChild(s);
    });

    if (!(await loadRazorpay())) {
      setError("Razorpay load failed.");
      setStep("form");
      return;
    }

    const options = {
      key: RAZORPAY_KEY,
      amount: priceINR * 100,
      currency: "INR",
      name: "Divine Panchang",
      description: `${selectedPlan === "basic" ? "Basic" : "Detailed"} Kundali Report`,
      image: "/logo-srichakra.png",
      handler: async (response: any) => {
        try {
          setStep("processing");
          const res = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              email, name, dob, tob, gender,
              city: location.name, lat: location.lat, lon: location.lon, timezone: location.timezone,
              plan: selectedPlan, chartStyle,
            }),
          });
          const data = await res.json();
          if (res.ok && data.status === "success") {
            saveReportDetails(data.token);
            navigate(buildPreviewUrl(data.token));
          } else { throw new Error(data.message || "Verification failed."); }
        } catch (e: any) {
          setError(e.message || "Payment failed.");
          setStep("form");
        }
      },
      prefill: { name, email },
      theme: { color: "#0b1730" },
      modal: { ondismiss: () => setStep("form") },
    };

    new window.Razorpay(options).open();
    setStep("form");
  };

  const handleTestBypass = () => {
    if (!canProceed) return;
    saveReportDetails("local-test-bypass");
    navigate(buildPreviewUrl("local-test-bypass"));
  };

  return {
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
    error, setError,
    handlePayRazorpay,
    handlePayPaddle,
    handleTestBypass,
    canProceed,
    priceINR, priceUSD
  };
};

function detectRegion(): Region {
  try {
    const lang = navigator.language || "";
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (lang.startsWith("en-IN") || lang.startsWith("hi") || tz.startsWith("Asia/Kolkata")) return "india";
  } catch (_) {}
  return "international";
}
