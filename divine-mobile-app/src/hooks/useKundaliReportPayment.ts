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

  // PayPal Effect
  useEffect(() => {
    if (step !== "form" || paymentRegion !== "international" || !canProceed) return;
    if (paypalRenderedRef.current) return;

    const renderPayPalButtons = async () => {
      try {
        if (!window.paypal) {
          await new Promise<void>((resolve, reject) => {
            if (document.querySelector(`script[data-paypal-sdk]`)) { resolve(); return; }
            const script = document.createElement("script");
            script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture&disable-funding=credit,card`;
            script.setAttribute("data-paypal-sdk", "true");
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load PayPal SDK."));
            document.body.appendChild(script);
          });
        }

        await new Promise(r => setTimeout(r, 300));
        if (!paypalContainerRef.current || !window.paypal) return;
        paypalContainerRef.current.innerHTML = "";

        window.paypal.Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 44 },
          createOrder: (_data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                description: `Divine Panchang ${selectedPlan === "basic" ? "Basic" : "Detailed"} Kundali Report`,
                amount: { currency_code: "USD", value: priceUSD.toFixed(2) },
              }],
              application_context: { brand_name: "Divine Panchang", shipping_preference: "NO_SHIPPING", user_action: "PAY_NOW" },
            });
          },
          onApprove: async (data: any, actions: any) => {
            setStep("processing");
            try {
              await actions.order.capture();
              const verifyRes = await fetch("/api/payment/paypal-capture", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderID: data.orderID,
                  email, name, dob, tob, gender,
                  city: location.name, lat: location.lat, lon: location.lon, timezone: location.timezone,
                  plan: selectedPlan, chartStyle,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.status === "success") {
                saveReportDetails(verifyData.token);
                navigate(buildPreviewUrl(verifyData.token));
              } else {
                throw new Error(verifyData.message || "PayPal verification failed.");
              }
            } catch (e: any) {
              setError(e.message || "PayPal processing failed.");
              setStep("form");
            }
          },
          onError: () => { setError("PayPal error. Please try again."); setStep("form"), paypalRenderedRef.current = false; },
          onCancel: () => { setStep("form"); paypalRenderedRef.current = false; },
        }).render(paypalContainerRef.current);

        paypalRenderedRef.current = true;
      } catch (e: any) { setError("PayPal load failed: " + e.message); }
    };
    renderPayPalButtons();
  }, [step, paymentRegion, canProceed, selectedPlan, priceUSD]);

  // Reset PayPal
  useEffect(() => {
    paypalRenderedRef.current = false;
    if (paypalContainerRef.current) paypalContainerRef.current.innerHTML = "";
  }, [selectedPlan, paymentRegion]);

  // Razorpay
  const handlePayRazorpay = async () => {
    setStep("processing");
    const fakeToken = btoa(JSON.stringify({ plan: selectedPlan, timestamp: Date.now() }));
    saveReportDetails(fakeToken);
    navigate(buildPreviewUrl(fakeToken));
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
    paypalContainerRef,
    handlePayRazorpay,
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
