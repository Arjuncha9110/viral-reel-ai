import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Star, Sparkles, Calendar, Clock, ChevronRight, Info, CheckCircle, Download, User, Mail, Phone } from "lucide-react";
import { BirthDatePicker } from "@/components/shared/BirthDatePicker";
import { COUNTRY_CODES } from "@/data/countryCodes";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PAYPAL_CLIENT_ID } from "@/data/reportData";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LocationSelector, LocationData } from "@/components/LocationSelector";
import { AdSenseBanner } from "@/components/shared/AdSenseBanner";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import {
    getSadeSatiPhases,
    getCurrentSadeSatiStatus,
    RASHI_NAMES,
    SadeSatiPhase,
    getSiderealSaturnLongitude
} from "@/lib/calculators/astrology/sadeSati";

import { SeoHead } from "@/components/shared/SeoHead";

// Stripe replaces PayPal for international payments

function detectRegion(): "india" | "international" {
    try {
        const lang = navigator.language || "";
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (lang.startsWith("en-IN") || lang.startsWith("hi") || tz.startsWith("Asia/Kolkata")) {
            return "india";
        }
    } catch (_) { /* ignore */ }
    return "international";
}

const defaultLocation: LocationData = {
    name: "Bengaluru",
    stateCode: "KA",
    countryCode: "IN",
    lat: 12.9716,
    lon: 77.5946,
    timezone: "Asia/Kolkata"
};

const premiumReportFeatures = [
    "Complete Sade Sati timeline",
    "Rising, peak, and setting phase analysis",
    "Lagna, Moon, and Saturn transit charts",
    "Saturn placement and karmic lessons",
    "Remedies, mantras, charity, and lifestyle guidance",
    "Instant PDF after birth details",
];

const SadeSatiPage = () => {
    const navigate = useNavigate();
    const [birthDate, setBirthDate] = useState("");
    const [birthTime, setBirthTime] = useState("12:00");
    const [location, setLocation] = useState<LocationData>(defaultLocation);
    const [purchaseStep, setPurchaseStep] = useState<"idle" | "form" | "processing" | "done">("idle");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [countryCode, setCountryCode] = useState("+91");
    const [gender, setGender] = useState("male");
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [paymentRegion, setPaymentRegion] = useState<"india" | "international">(detectRegion);
    const [results, setResults] = useState<{
        phases: SadeSatiPhase[];
        currentStatus: string;
        activePhase: SadeSatiPhase | null;
        currentSaturnSign: string;
    } | null>(null);

    const [stripeLoading, setStripeLoading] = useState(false);
    const paypalContainerRef = useRef<HTMLDivElement>(null);
    const paypalRenderedRef = useRef(false);

    const REPORT_PRICE = 399; // Premium Sade Sati report price

    const loadRazorpay = (): Promise<boolean> =>
        new Promise((resolve) => {
            if ((window as any).Razorpay) { resolve(true); return; }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

    const handlePay = async () => {
        setPaymentError(null);
        setPurchaseStep("processing");

        const ok = await loadRazorpay();
        if (!ok) { setPaymentError("Failed to load payment gateway. Please try again."); setPurchaseStep("form"); return; }

        try {
            const orderRes = await fetch("/api/payment/razorpay-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: REPORT_PRICE, currency: "INR", plan: "sade-sati" }),
            });
            const orderData = await orderRes.json();
            if (!orderRes.ok || !orderData.orderId) {
                throw new Error(orderData.message || "Failed to create Razorpay order.");
            }

            const options = {
                key: "rzp_live_Su2QpyCfiUhFPm",
                amount: REPORT_PRICE * 100,
                currency: "INR",
                order_id: orderData.orderId,
                name: "Divine Panchang",
                description: "Premium In-depth Sade Sati Report",
                image: "/om_logo.jpg?v=3",
                handler: async (response: any) => {
                    try {
                        setPurchaseStep("processing");
                        const dobString = birthDate;
                        const verifyRes = await fetch("/api/payment/verify", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                paymentId: response.razorpay_payment_id,
                                orderId: response.razorpay_order_id,
                                signature: response.razorpay_signature,
                                email,
                                name,
                                dob: dobString,
                                tob: birthTime,
                                gender,
                                city: location.name,
                                lat: location.lat,
                                lon: location.lon,
                                timezone: location.timezone,
                                plan: "sade-sati",
                            }),
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyRes.ok && verifyData.status === "success") {
                            const details = {
                                name,
                                email,
                                dob: dobString,
                                tob: birthTime,
                                gender,
                                city: location.name,
                                lat: location.lat,
                                lon: location.lon,
                                timezone: location.timezone,
                                token: verifyData.token,
                            };
                            localStorage.setItem("sade_sati_report_details", JSON.stringify(details));
                            navigate(
                                `/sade-sati-report-preview?name=${encodeURIComponent(name)}&dob=${dobString}&tob=${birthTime}&email=${encodeURIComponent(email)}&gender=${gender}&city=${encodeURIComponent(location.name)}&lat=${location.lat}&lon=${location.lon}&tz=${location.timezone}&token=${verifyData.token}`
                            );
                        } else {
                            throw new Error(verifyData.message || "Payment verification failed on server.");
                        }
                    } catch (e: any) {
                        setPaymentError(e.message || "Report generation failed. Please contact support@divinepanchang.space with your payment ID: " + response.razorpay_payment_id);
                        setPurchaseStep("form");
                    }
                },
                prefill: { name, email },
                theme: { color: "#0b1730" },
                modal: {
                    ondismiss: () => { if (purchaseStep === "processing") setPurchaseStep("idle"); }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.open();
            setPurchaseStep("form");
        } catch (err: any) {
            setPaymentError(err.message || "Failed to initiate payment.");
            setPurchaseStep("form");
        }
    };

    const handleCalculate = () => {
        if (!birthDate) return;
        const [hours, minutes] = birthTime.split(':').map(Number);
        const dob = new Date(birthDate);
        dob.setHours(hours, minutes);

        const phases = getSadeSatiPhases(dob);
        const { status, details } = getCurrentSadeSatiStatus(phases);

        const satLon = getSiderealSaturnLongitude(new Date());
        const satSign = RASHI_NAMES[Math.floor(satLon / 30)];

        setResults({
            phases,
            currentStatus: status,
            activePhase: details,
            currentSaturnSign: satSign
        });
    };

    const handleGetPremiumCTA = () => {
        if (!birthDate) {
            // Populate default birth details so calculations work and checkout form is rendered
            setBirthDate("2000-05-05");
            setBirthTime("12:00");
            setLocation({
                name: "Bengaluru",
                stateCode: "KA",
                countryCode: "IN",
                lat: 12.9716,
                lon: 77.5946,
                timezone: "Asia/Kolkata"
            });

            const dob = new Date("2000-05-05T12:00:00");
            const phases = getSadeSatiPhases(dob);
            const { status, details } = getCurrentSadeSatiStatus(phases);
            const satLon = getSiderealSaturnLongitude(new Date());
            const satSign = RASHI_NAMES[Math.floor(satLon / 30)];

            setResults({
                phases,
                currentStatus: status,
                activePhase: details,
                currentSaturnSign: satSign
            });

            setPurchaseStep("form");
            setName(name || "Arjun C");
            setEmail(email || "customer@divinepanchang.space");

            // Scroll down to checkout payment card after rendering
            setTimeout(() => {
                const element = document.getElementById("payment-section");
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 300);
        } else {
            // If birth details are filled, run calculations and continue to payment
            handleCalculate();
            setPurchaseStep("form");
            setName(name || "Arjun C");
            setEmail(email || "customer@divinepanchang.space");

            // Scroll down to checkout payment card after rendering
            setTimeout(() => {
                const element = document.getElementById("payment-section");
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 300);
        }
    };

    // ─── Stripe Checkout for international payments ───
    const handleStripeCheckout = async () => {
        setStripeLoading(true);
        setPaymentError(null);
        try {
            const res = await fetch("/api/payment/stripe-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    plan: "sade-sati",
                    email, name,
                    dob: birthDate,
                    tob: birthTime,
                    gender,
                    city: location.name,
                    lat: location.lat,
                    lon: location.lon,
                    timezone: location.timezone,
                }),
            });
            const data = await res.json();
            if (data.status === "success" && data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(data.message || "Failed to start checkout. Please try again.");
            }
        } catch (e: any) {
            setPaymentError(e.message || "Stripe checkout failed. Please try again.");
        } finally {
            setStripeLoading(false);
        }
    };

    // PayPal SDK Integration
    useEffect(() => {
        if (purchaseStep !== "form" || paymentRegion !== "international" || !name.trim() || !email.includes("@") || !birthDate) {
            return;
        }
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
                    style: { layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 40 },
                    createOrder: (_data: any, actions: any) => {
                        return actions.order.create({
                            purchase_units: [{
                                description: "Divine Panchang Premium Sade Sati Report",
                                amount: { currency_code: "USD", value: "4.99" },
                            }],
                            application_context: { brand_name: "Divine Panchang", shipping_preference: "NO_SHIPPING", user_action: "PAY_NOW" },
                        });
                    },
                    onApprove: async (data: any, actions: any) => {
                        setPurchaseStep("processing");
                        try {
                            await actions.order.capture();
                            const dobString = birthDate;
                            const verifyRes = await fetch("/api/payment/paypal-capture", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    orderID: data.orderID,
                                    email, name, dob: dobString, tob: birthTime, gender,
                                    city: location.name, lat: location.lat, lon: location.lon, timezone: location.timezone,
                                    plan: "sade-sati",
                                }),
                            });
                            const verifyData = await verifyRes.json();
                            if (verifyRes.ok && verifyData.status === "success") {
                                const details = {
                                    name, email, dob: dobString, tob: birthTime, gender,
                                    city: location.name, lat: location.lat, lon: location.lon, timezone: location.timezone,
                                    token: verifyData.token,
                                };
                                localStorage.setItem("sade_sati_report_details", JSON.stringify(details));
                                navigate(
                                    `/sade-sati-report-preview?name=${encodeURIComponent(name)}&dob=${dobString}&tob=${birthTime}&email=${encodeURIComponent(email)}&gender=${gender}&city=${encodeURIComponent(location.name)}&lat=${location.lat}&lon=${location.lon}&tz=${location.timezone}&token=${verifyData.token}`
                                );
                            } else {
                                throw new Error(verifyData.message || "PayPal verification failed.");
                            }
                        } catch (e: any) {
                            setPaymentError(e.message || "PayPal processing failed.");
                            setPurchaseStep("form");
                        }
                    },
                    onError: () => { setPaymentError("PayPal error. Please try again."); setPurchaseStep("form"); paypalRenderedRef.current = false; },
                    onCancel: () => { setPurchaseStep("form"); paypalRenderedRef.current = false; },
                }).render(paypalContainerRef.current);

                paypalRenderedRef.current = true;
            } catch (e: any) {
                setPaymentError("PayPal load failed: " + e.message);
            }
        };

        renderPayPalButtons();
    }, [purchaseStep, paymentRegion, name, email, birthDate, birthTime, location, gender]);

    useEffect(() => {
        paypalRenderedRef.current = false;
        if (paypalContainerRef.current) paypalContainerRef.current.innerHTML = "";
    }, [purchaseStep, paymentRegion]);


    return (
        <Layout>
            <SeoHead
                title="Sade Sati Calculator - Check Your Saturn Transit Phase"
                description="Find out if Sade Sati is active for your Moon sign. Accurate Saturn transit phases with dates, intensity, and traditional remedies."
                path="/sade-sati"
                type="website"
                keywords="sade sati calculator, sade sati check, saturn transit moon sign, shani sade sati"
            />
            <div className="container mx-auto px-4 py-8">
                <PageHeader
                    title="Shani Sade Sati Calculator"
                    subtitle="Discover your Saturn transit periods and understand the transformative phases of Sade Sati"
                    icon={<Star className="h-8 w-8 text-primary" />}
                />

                {/* ── Premium Report Upsell — shown BEFORE the calculator ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="max-w-4xl mx-auto mb-10"
                >
                    <div className="relative overflow-hidden rounded-[28px] border-2 border-[#b59449]/40 bg-gradient-to-b from-[#0b1730] to-[#0e2145] shadow-xl p-5 md:p-8 lg:p-10 text-[#fdfbf7]">
                        {/* Subtle gold accent background pattern */}
                        <div className="absolute -right-4 -top-4 w-40 h-40 bg-[#b59449]/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -left-4 -bottom-4 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,340px)] items-stretch">
                            {/* Left Side: title, subtitle, feature list, trust note */}
                            <div className="flex flex-col justify-between space-y-5 lg:pr-4">
                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-1.5 self-start bg-[#b59449]/20 border border-[#b59449]/40 text-[#b59449] text-[10px] font-bold tracking-wider uppercase rounded-full px-3 py-1 font-serif">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Vedic Premium Guidance
                                    </div>
                                    <h3 className="font-serif text-2xl md:text-[2rem] font-bold leading-tight text-white max-w-[16ch]">
                                        Personalized Sade Sati Premium Report
                                    </h3>
                                    <p className="max-w-[48ch] text-sm text-[#fdfbf7]/80 font-serif leading-relaxed">
                                        Understand your Saturn phase, timeline, remedies, and spiritual growth path.
                                    </p>
                                </div>

                                {/* Feature rows with icons */}
                                <div className="grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-1">
                                    {premiumReportFeatures.map((feature) => (
                                        <div key={feature} className="flex items-start gap-2.5 text-sm text-[#fdfbf7]/90 leading-snug">
                                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#b59449]" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="text-xs text-[#fdfbf7]/55 pt-3 border-t border-[#b59449]/15 italic font-serif">
                                    Includes practical Saturn guidance, phase timelines, chart insights, and grounded remedies for reflection and growth.
                                </div>
                            </div>

                            {/* Right Side: price, plan badge, CTA, small note */}
                            <div className="flex w-full max-w-[340px] mx-auto flex-col justify-end items-center text-center p-4 md:p-5 bg-[#070e1b] border border-[#b59449]/20 rounded-[24px] relative overflow-hidden min-h-[420px]">
                                {/* Shani Dev Background Image */}
                                <div className="absolute inset-0 z-0">
                                    <img src="/shani-crow.jpg" alt="Lord Shani" className="w-full h-full object-cover object-center" />
                                </div>
                                {/* Soft ambient gradient */}
                                <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#070e1b]/40 via-transparent to-[#070e1b]/60" />

                                {/* Lifetime Guide Badge (Floating Top) */}
                                <div className="absolute top-4 z-10">
                                    <span className="bg-[#070e1b]/60 backdrop-blur-md text-white text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-lg border border-[#f0a500]/40">
                                        LIFETIME GUIDE
                                    </span>
                                </div>

                                {/* Floating Glassmorphic Text Container to reveal the crow */}
                                <div className="relative z-10 w-full max-w-[240px] mt-auto p-5 bg-[#070e1b]/70 backdrop-blur-md rounded-[22px] border border-white/10 shadow-2xl">
                                    <div className="space-y-0.5">
                                        <div>
                                            <span className="text-[11px] text-[#fdfbf7]/80 line-through mr-2 font-mono">Rs 799</span>
                                            <span className="text-3xl font-black text-white font-serif tracking-tight drop-shadow-md">Rs 399</span>
                                        </div>
                                        <p className="text-[10px] text-[#f0a500] font-bold tracking-wider">One-time payment - Lifetime access</p>
                                    </div>

                                    <div className="w-full space-y-2 mt-4">
                                        <Button
                                            onClick={handleGetPremiumCTA}
                                            className="w-full h-auto min-h-11 bg-gradient-to-r from-[#b59449] to-[#8a6f35] hover:brightness-110 text-white font-bold rounded-xl px-4 py-3 shadow-lg border border-[#b59449]/60 transition transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5 text-center leading-tight text-sm"
                                        >
                                            <Sparkles className="h-4 w-4 text-white" />
                                            Get Premium Report
                                        </Button>
                                        
                                        <p className="text-[11px] text-[#fdfbf7]/80 italic font-medium leading-tight px-1 mt-3">
                                            {!birthDate 
                                                ? "Calculation starts after your birth details are filled" 
                                                : "Enter birth details below to continue"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Input Section */}
                <motion.div
                    id="birth-form-container"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-3xl mx-auto mb-12"
                >
                    <SpiritualCard hover={false} className="border-2 border-[#b59449]/30 bg-[#fffdf9] shadow-[0_10px_30px_rgba(181,148,73,0.08)] relative overflow-hidden p-6 md:p-8 rounded-2xl">
                        {/* Elegant background mandalas or glowing indicators */}
                        <div className="absolute right-0 top-0 w-24 h-24 bg-[#b59449]/5 rounded-full blur-2xl pointer-events-none" />
                        <div className="absolute left-0 bottom-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="space-y-6 relative z-10">
                            {/* Name + Email + Phone */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label className="text-[#0b1730] font-serif font-semibold text-sm flex items-center gap-1.5">
                                        <User className="h-4 w-4 text-primary" /> Full Name
                                    </Label>
                                    <Input
                                        type="text"
                                        placeholder="e.g. Arjun Sharma"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-11 bg-[#fffdfa] border-2 border-[#b59449]/20 focus:border-[#b59449]/60 rounded-xl text-foreground focus:ring-1 focus:ring-[#b59449] transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#0b1730] font-serif font-semibold text-sm flex items-center gap-1.5">
                                        <Mail className="h-4 w-4 text-primary" /> Email Address
                                    </Label>
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11 bg-[#fffdfa] border-2 border-[#b59449]/20 focus:border-[#b59449]/60 rounded-xl text-foreground focus:ring-1 focus:ring-[#b59449] transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[#0b1730] font-serif font-semibold text-sm flex items-center gap-1.5">
                                        <Phone className="h-4 w-4 text-primary" /> WhatsApp / Phone
                                    </Label>
                                    <div className="flex h-11 rounded-xl border-2 border-[#b59449]/20 bg-[#fffdfa] overflow-hidden focus-within:border-[#b59449]/60 focus-within:ring-1 focus-within:ring-[#b59449] transition-all">
                                        <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
                                            className="h-full w-[76px] shrink-0 border-r border-[#b59449]/20 bg-[#fdf8f0] px-2 text-[12px] font-bold text-[#0b1730] outline-none cursor-pointer">
                                            {COUNTRY_CODES.map(c => <option key={c.iso3} value={c.code}>{c.code}</option>)}
                                        </select>
                                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                                            placeholder="9110295352"
                                            className="flex-1 min-w-0 h-full px-3 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground/50" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-[#0b1730] font-serif font-semibold text-sm flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        Date of Birth
                                    </Label>
                                    <BirthDatePicker value={birthDate} onChange={setBirthDate} />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[#0b1730] font-serif font-semibold text-sm flex items-center gap-1.5">
                                        <Clock className="h-4 w-4 text-primary" />
                                        Time of Birth
                                    </Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#b59449]" />
                                        <Input
                                            type="time"
                                            value={birthTime}
                                            onChange={(e) => setBirthTime(e.target.value)}
                                            className="h-11 pl-10 bg-[#fffdfa] border-2 border-[#b59449]/20 focus:border-[#b59449]/60 rounded-xl text-foreground font-serif focus:ring-1 focus:ring-[#b59449] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <LocationSelector
                                        onLocationSelect={setLocation}
                                        initialCity={location.name}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleCalculate}
                                variant="saffron"
                                size="lg"
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-sacred-amber to-[#d97706] hover:brightness-110 text-white font-bold shadow-lg transition duration-300 transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 border border-sacred-amber/30 text-sm"
                                disabled={!birthDate}
                            >
                                <Sparkles className="mr-1 h-5 w-5 animate-pulse" />
                                Calculate Sade Sati Transit
                            </Button>
                        </div>
                    </SpiritualCard>
                </motion.div>

                {/* Google AdSense Top Banner */}
                <AdSenseBanner adSlot="sadesati_top_banner" adFormat="horizontal" />

                {/* Results Section */}
                <AnimatePresence mode="wait">
                    {results && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-10 max-w-3xl mx-auto"
                        >
                            {/* Status Overview Card */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <SpiritualCard delay={0.1}>
                                    <div className="text-center space-y-3">
                                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                            <Star className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Sade Sati Status</h3>
                                            <div className={cn(
                                                "text-2xl font-bold mt-1",
                                                results.currentStatus === 'Currently running' ? "text-primary animate-pulse" : "text-foreground"
                                            )}>
                                                {results.currentStatus}
                                            </div>
                                        </div>
                                        {results.activePhase && (
                                            <p className="text-sm text-muted-foreground">
                                                Current/Next Impact: {results.activePhase.name}
                                            </p>
                                        )}
                                    </div>
                                </SpiritualCard>

                                <SpiritualCard delay={0.15}>
                                    <div className="text-center space-y-3">
                                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sacred-amber/10">
                                            <div className="text-xl font-bold text-sacred-amber">♄</div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Current Saturn Transit</h3>
                                            <div className="text-2xl font-bold text-foreground mt-1">
                                                {results.currentSaturnSign}
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Real-time sidereal transit of Shani Dev
                                        </p>
                                    </div>
                                </SpiritualCard>
                            </div>

                            {/* Premium Sade Sati PDF Report Card */}
                            <SpiritualCard id="payment-section" className="border-sacred-amber bg-sacred-amber/5 border-2 shadow-glow-saffron overflow-hidden relative p-6 md:p-8">
                                <div className="absolute top-3 right-3">
                                    <Sparkles className="h-6 w-6 text-sacred-amber animate-pulse" />
                                </div>

                                {purchaseStep === "idle" && (
                                    <div className="text-center space-y-4">
                                        <div className="inline-flex items-center gap-1.5 rounded-full border border-sacred-amber/20 bg-sacred-amber/10 px-3.5 py-1 text-xs text-sacred-amber font-semibold tracking-wider">
                                            🪐 PREMIUM VEDIC Horoscopes
                                        </div>
                                        <h3 className="font-display text-2xl font-bold text-foreground">
                                            Unlock Your Premium Sade Sati PDF Report
                                        </h3>
                                        <p className="text-muted-foreground text-sm max-w-2xl mx-auto leading-relaxed">
                                            Get a comprehensive, professionally styled 10-page personal Sade Sati guide modeled on premium clickastro horoscopes. Includes calculated timelines for all three lifetime cycles, Shani Dev legends, inspiring trials-to-triumph stories of icons (Modi, Bachchan, Musk, Tata), and detailed pacifying remedies (gemstones, rudraksha, vastu rules, and mantras).
                                        </p>
                                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                            <div className="text-left sm:text-right">
                                                <p className="text-xs text-muted-foreground line-through">Regular Price: ₹799</p>
                                                <p className="font-display text-2xl font-black text-foreground">₹399 <span className="text-xs text-muted-foreground font-normal">Only</span></p>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    setPurchaseStep("form");
                                                    setName(name || "Arjun C");
                                                    setEmail(email || "customer@divinepanchang.space");
                                                }}
                                                variant="saffron"
                                                size="lg"
                                                className="px-8 shadow-lg"
                                            >
                                                Get Premium Sade Sati PDF
                                                <ChevronRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {purchaseStep === "form" && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-border/40 pb-4">
                                            <div>
                                                <h3 className="font-display text-lg font-bold text-foreground font-serif">Enter Delivery & Personal Details</h3>
                                                <p className="text-xs text-muted-foreground font-serif">
                                                    Premium Sade Sati PDF Report — {paymentRegion === "india" ? "₹399 INR" : "$9.99 USD"}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setPurchaseStep("idle")}
                                                className="text-xs text-muted-foreground hover:text-foreground transition"
                                            >
                                                ← Cancel
                                            </button>
                                        </div>

                                        {/* Segmented Region Switcher */}
                                        <div className="grid grid-cols-2 gap-2">
                                            {/* India — INR */}
                                            <button
                                                type="button"
                                                onClick={() => setPaymentRegion("india")}
                                                className={cn(
                                                    "relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                                                    paymentRegion === "india"
                                                        ? "bg-[#0b1730] border-[#b59449] shadow-[0_0_12px_rgba(181,148,73,0.2)]"
                                                        : "bg-card border-border hover:border-[#b59449]/40"
                                                )}
                                            >
                                                {/* India tricolor flag SVG */}
                                                <svg width="32" height="22" viewBox="0 0 32 22" fill="none" className="shrink-0 rounded-sm overflow-hidden shadow-sm">
                                                    <rect width="32" height="7.33" fill="#FF9933"/>
                                                    <rect y="7.33" width="32" height="7.34" fill="#FFFFFF"/>
                                                    <rect y="14.67" width="32" height="7.33" fill="#138808"/>
                                                    {/* Ashoka Chakra */}
                                                    <circle cx="16" cy="11" r="3" fill="none" stroke="#000080" strokeWidth="0.8"/>
                                                    {[0,30,60,90,120,150,180,210,240,270,300,330,15,45,75,105,135,165,195,225,255,285,315,345].map((a, i) => (
                                                        <line
                                                            key={i}
                                                            x1={16 + 1.2 * Math.cos(a * Math.PI / 180)}
                                                            y1={11 + 1.2 * Math.sin(a * Math.PI / 180)}
                                                            x2={16 + 3 * Math.cos(a * Math.PI / 180)}
                                                            y2={11 + 3 * Math.sin(a * Math.PI / 180)}
                                                            stroke="#000080"
                                                            strokeWidth="0.5"
                                                        />
                                                    ))}
                                                </svg>
                                                <div>
                                                    <p className={cn("text-xs font-bold leading-tight", paymentRegion === "india" ? "text-[#fdfbf7]" : "text-foreground")}>
                                                        Pay in INR
                                                    </p>
                                                    <p className={cn("text-[10px] leading-tight mt-0.5", paymentRegion === "india" ? "text-[#b59449]" : "text-muted-foreground")}>
                                                        UPI · Card · Net Banking
                                                    </p>
                                                </div>
                                                {paymentRegion === "india" && (
                                                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#b59449]" />
                                                )}
                                            </button>

                                            {/* International — PayPal */}
                                            <button
                                                type="button"
                                                onClick={() => setPaymentRegion("international")}
                                                className={cn(
                                                    "relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                                                    paymentRegion === "international"
                                                        ? "bg-[#0b1730] border-[#b59449] shadow-[0_0_12px_rgba(181,148,73,0.2)]"
                                                        : "bg-card border-border hover:border-[#b59449]/40"
                                                )}
                                            >
                                                {/* PayPal PP logo SVG */}
                                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="shrink-0">
                                                    <rect width="32" height="32" rx="8" fill="#003087"/>
                                                    {/* First P */}
                                                    <path d="M8 22V10h5.5c2.8 0 4.5 1.4 4.5 3.8 0 2.6-1.8 4.2-4.8 4.2H11V22H8z" fill="#009CDE"/>
                                                    <path d="M11 16h2.2c1.4 0 2.3-.7 2.3-2 0-1.1-.8-1.8-2.1-1.8H11V16z" fill="white"/>
                                                    {/* Second P (offset) */}
                                                    <path d="M15 22V12h5c2.5 0 4 1.2 4 3.4 0 2.3-1.6 3.7-4.3 3.7h-2.1V22H15z" fill="#009CDE" opacity="0.7"/>
                                                    <path d="M17.6 17.2h1.9c1.2 0 2-.6 2-1.7 0-1-.7-1.6-1.9-1.6h-2v3.3z" fill="white" opacity="0.8"/>
                                                </svg>
                                                <div>
                                                    <p className={cn("text-xs font-bold leading-tight", paymentRegion === "international" ? "text-[#fdfbf7]" : "text-foreground")}>
                                                        International
                                                    </p>
                                                    <p className={cn("text-[10px] leading-tight mt-0.5", paymentRegion === "international" ? "text-[#b59449]" : "text-muted-foreground")}>
                                                        PayPal · USD · All cards
                                                    </p>
                                                </div>
                                                {paymentRegion === "international" && (
                                                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#b59449]" />
                                                )}
                                            </button>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-foreground">Full Name *</Label>
                                                <Input
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="e.g. Arjun Sharma"
                                                    className="h-10 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-foreground">Email Address *</Label>
                                                <Input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    placeholder="for order receipt"
                                                    className="h-10 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-1.5 sm:col-span-2">
                                                <Label className="text-xs font-semibold text-foreground">Gender</Label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {["male", "female", "other"].map((g) => (
                                                        <button
                                                            key={g}
                                                            type="button"
                                                            onClick={() => setGender(g)}
                                                            className={cn(
                                                                "h-9 rounded-xl border text-xs font-semibold capitalize transition",
                                                                gender === g
                                                                    ? "bg-[#b59449] border-[#b59449] text-white"
                                                                    : "border-border bg-card text-muted-foreground hover:border-[#b59449]/40"
                                                            )}
                                                        >
                                                            {g}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {paymentError && (
                                            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-600">
                                                {paymentError}
                                            </div>
                                        )}

                                        <div className="space-y-3 pt-2">
                                            {paymentRegion === "india" ? (
                                                <Button
                                                    onClick={handlePay}
                                                    variant="saffron"
                                                    size="lg"
                                                    className="w-full h-11"
                                                    disabled={!name.trim() || !email.includes("@")}
                                                >
                                                    Pay ₹399 & Generate Report
                                                </Button>
                                            ) : (
                                                <div className="space-y-2 mt-2">
                                                    {!name.trim() || !email.includes("@") ? (
                                                        <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground text-center">
                                                            Please fill in all required fields above to enable PayPal checkout.
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div ref={paypalContainerRef} id="paypal-button-container" className="min-h-[40px] w-full" />
                                                            <p className="text-[10px] text-center text-muted-foreground font-serif">
                                                                🔒 Secured by PayPal · Visa, Mastercard, Amex, Discover, Debit Cards
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            

                                        </div>
                                    </div>
                                )}
                                {purchaseStep === "processing" && (
                                    <div className="text-center py-10 space-y-4">
                                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-sacred-amber/10 text-sacred-amber">
                                            <Clock className="h-8 w-8 animate-spin" />
                                        </div>
                                        <h3 className="font-display text-lg font-bold text-foreground">Consulting Shani Dev...</h3>
                                        <p className="text-xs text-muted-foreground">Calculating lifetime Saturn cycles and remedies. Takes about 15 seconds.</p>
                                    </div>
                                )}

                                {purchaseStep === "done" && pdfUrl && (
                                    <div className="text-center py-8 space-y-5">
                                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                                            <CheckCircle className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <h3 className="font-display text-xl font-bold text-foreground">Your Sade Sati Report is Ready!</h3>
                                            <p className="text-xs text-muted-foreground mt-1">Namaste {name.split(" ")[0]} 🙏 — your personalized 10-page Saturn guide has been compiled successfully.</p>
                                        </div>
                                        <a
                                            href={pdfUrl}
                                            download={`divine-panchang-sade-sati-${name.replace(/\s+/g, "-").toLowerCase()}.pdf`}
                                            className="inline-block"
                                        >
                                            <Button variant="saffron" size="lg" className="px-10">
                                                <Download className="mr-2 h-5 w-5" />
                                                Download Sade Sati PDF
                                            </Button>
                                        </a>
                                        <p className="text-[10px] text-muted-foreground">This download link is secure and active for this session only.</p>
                                    </div>
                                )}
                            </SpiritualCard>

                            {/* Horizontal Timeline Requirement - We'll implementation as a refined list/step view */}
                            <div className="space-y-6">
                                <h3 className="font-display text-2xl font-semibold text-center text-foreground">
                                    Transit Timeline
                                </h3>

                                <div className="grid gap-4">
                                    {results.phases.map((phase, idx) => (
                                        <SpiritualCard
                                            key={idx}
                                            delay={0.2 + idx * 0.05}
                                            className={cn(
                                                "relative overflow-hidden transition-all",
                                                phase.status === 'Current' ? "ring-2 ring-primary border-primary/20 bg-primary/5 shadow-glow-saffron" : "bg-card/50"
                                            )}
                                            hover={phase.status === 'Current'}
                                        >
                                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-2">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className={cn(
                                                        "h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-bold",
                                                        phase.status === 'Current' ? "bg-primary text-primary-foreground" :
                                                            phase.status === 'Completed' ? "bg-muted text-muted-foreground" : "bg-secondary/20 text-foreground"
                                                    )}>
                                                        {idx % 3 + 1}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-display text-lg font-bold">{phase.name}</h4>
                                                            {phase.status === 'Current' && (
                                                                <span className="bg-primary px-2 py-0.5 rounded text-[10px] font-bold text-primary-foreground animate-pulse">LIVE</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {RASHI_NAMES[phase.signIndex]}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-center md:items-end gap-1">
                                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                                        <span>{format(phase.startDate, "MMM yyyy")}</span>
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                        <span>{format(phase.endDate, "MMM yyyy")}</span>
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground font-mono">
                                                        Duration: {Math.round((phase.endDate.getTime() - phase.startDate.getTime()) / (1000 * 3600 * 24 * 30.44))} months
                                                    </div>
                                                </div>
                                            </div>
                                        </SpiritualCard>
                                    ))}
                                </div>
                            </div>

                            {/* Guidance Section */}
                            {/* ── Shani Phase Guide Cards ── */}
                            <div className="space-y-5">
                                <div className="text-center space-y-1">
                                    <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#b59449]">Understanding Your Journey</p>
                                    <h3 className="font-serif text-2xl font-bold text-foreground">Shani's Three-Phase Alchemy</h3>
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    {/* Rising Phase */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="relative overflow-hidden rounded-2xl border border-[#f0a500]/30 bg-gradient-to-b from-[#1a1200] to-[#0b1730] p-6 flex flex-col gap-4"
                                    >
                                        {/* SVG illustration */}
                                        <div className="flex justify-center">
                                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                                <circle cx="40" cy="40" r="38" stroke="#f0a500" strokeWidth="1" strokeDasharray="4 3" opacity="0.4"/>
                                                <circle cx="40" cy="40" r="28" fill="#f0a500" fillOpacity="0.08" stroke="#f0a500" strokeWidth="1" opacity="0.6"/>
                                                {/* Seed/sprout */}
                                                <ellipse cx="40" cy="48" rx="6" ry="4" fill="#f0a500" fillOpacity="0.25" stroke="#f0a500" strokeWidth="1.2"/>
                                                <line x1="40" y1="44" x2="40" y2="28" stroke="#f0a500" strokeWidth="1.5"/>
                                                <path d="M40 36 Q34 30 28 32" stroke="#f0a500" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                                <path d="M40 32 Q46 26 52 28" stroke="#f0a500" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                                                {/* Glow dots */}
                                                <circle cx="40" cy="28" r="2" fill="#f0a500" opacity="0.7"/>
                                                <circle cx="28" cy="32" r="1.5" fill="#f0a500" opacity="0.5"/>
                                                <circle cx="52" cy="28" r="1.5" fill="#f0a500" opacity="0.5"/>
                                                {/* Phase label ring */}
                                                <text x="40" y="68" textAnchor="middle" fontSize="7" fill="#f0a500" opacity="0.7" fontWeight="bold" letterSpacing="1">12TH HOUSE</text>
                                            </svg>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <div className="inline-block text-[9px] font-bold tracking-widest uppercase text-[#f0a500] border border-[#f0a500]/30 rounded-full px-2.5 py-0.5 bg-[#f0a500]/10">
                                                ~2.5 Years · Moderate
                                            </div>
                                            <h4 className="font-serif text-lg font-bold text-[#fdfbf7]">Rising Phase</h4>
                                            <p className="text-xs text-[#fdfbf7]/60 leading-relaxed">
                                                Saturn approaches from behind. Expect unexpected expenses, a pull toward solitude, and the urge to shed what no longer serves. This is the preparation — not the battle.
                                            </p>
                                        </div>
                                        <div className="border-t border-[#f0a500]/15 pt-3 space-y-1.5">
                                            {["Reduce non-essential spending", "Begin a daily spiritual practice", "Avoid major new commitments"].map((tip, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[10px] text-[#fdfbf7]/50">
                                                    <span className="text-[#f0a500] text-xs">▸</span>{tip}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Peak Phase */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="relative overflow-hidden rounded-2xl border-2 border-[#722f37]/50 bg-gradient-to-b from-[#1a0505] to-[#0b1730] p-6 flex flex-col gap-4 shadow-[0_0_30px_rgba(114,47,55,0.2)]"
                                    >
                                        {/* "Most intense" badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className="text-[8px] font-black uppercase tracking-widest bg-[#722f37] text-white px-2 py-0.5 rounded-full">Most Intense</span>
                                        </div>
                                        {/* SVG illustration */}
                                        <div className="flex justify-center">
                                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                                <circle cx="40" cy="40" r="38" stroke="#722f37" strokeWidth="1.5" opacity="0.5"/>
                                                <circle cx="40" cy="40" r="28" fill="#722f37" fillOpacity="0.12" stroke="#722f37" strokeWidth="1"/>
                                                {/* Saturn symbol */}
                                                <text x="40" y="46" textAnchor="middle" fontSize="30" fill="#722f37" opacity="0.9" fontWeight="bold">♄</text>
                                                {/* Orbit ring */}
                                                <ellipse cx="40" cy="42" rx="22" ry="6" stroke="#722f37" strokeWidth="1" fill="none" opacity="0.4"/>
                                                {/* Pulse rings */}
                                                <circle cx="40" cy="40" r="34" stroke="#722f37" strokeWidth="0.5" opacity="0.2"/>
                                                <text x="40" y="68" textAnchor="middle" fontSize="7" fill="#722f37" opacity="0.7" fontWeight="bold" letterSpacing="1">1ST HOUSE</text>
                                            </svg>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <div className="inline-block text-[9px] font-bold tracking-widest uppercase text-[#e05a64] border border-[#722f37]/40 rounded-full px-2.5 py-0.5 bg-[#722f37]/15">
                                                ~2.5 Years · Intense
                                            </div>
                                            <h4 className="font-serif text-lg font-bold text-[#fdfbf7]">Peak Phase</h4>
                                            <p className="text-xs text-[#fdfbf7]/60 leading-relaxed">
                                                Saturn sits directly on your Moon. Mental peace is most tested. Career, health, and relationships face simultaneous pressure. This crucible forges the person you will be for the next 22 years.
                                            </p>
                                        </div>
                                        <div className="border-t border-[#722f37]/20 pt-3 space-y-1.5">
                                            {["Work hard without ego or recognition", "Maintain health — don't ignore symptoms", "Patience over reaction — always"].map((tip, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[10px] text-[#fdfbf7]/50">
                                                    <span className="text-[#e05a64] text-xs">▸</span>{tip}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>

                                    {/* Setting Phase */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="relative overflow-hidden rounded-2xl border border-[#1a6b3c]/40 bg-gradient-to-b from-[#001a0a] to-[#0b1730] p-6 flex flex-col gap-4"
                                    >
                                        {/* SVG illustration */}
                                        <div className="flex justify-center">
                                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                                <circle cx="40" cy="40" r="38" stroke="#1a6b3c" strokeWidth="1" strokeDasharray="6 2" opacity="0.4"/>
                                                <circle cx="40" cy="40" r="28" fill="#1a6b3c" fillOpacity="0.08" stroke="#1a6b3c" strokeWidth="1" opacity="0.6"/>
                                                {/* Sun rising / reward symbol */}
                                                <path d="M22 48 Q40 28 58 48" stroke="#1a6b3c" strokeWidth="1.5" fill="#1a6b3c" fillOpacity="0.2"/>
                                                <circle cx="40" cy="44" r="8" fill="#1a6b3c" fillOpacity="0.3" stroke="#1a6b3c" strokeWidth="1.5"/>
                                                {/* Rays */}
                                                {[0,45,90,135,180,225,270,315].map((angle, i) => (
                                                    <line
                                                        key={i}
                                                        x1={40 + 11 * Math.cos(angle * Math.PI / 180)}
                                                        y1={44 + 11 * Math.sin(angle * Math.PI / 180)}
                                                        x2={40 + 16 * Math.cos(angle * Math.PI / 180)}
                                                        y2={44 + 16 * Math.sin(angle * Math.PI / 180)}
                                                        stroke="#1a6b3c"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        opacity="0.6"
                                                    />
                                                ))}
                                                <text x="40" y="68" textAnchor="middle" fontSize="7" fill="#1a6b3c" opacity="0.7" fontWeight="bold" letterSpacing="1">2ND HOUSE</text>
                                            </svg>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <div className="inline-block text-[9px] font-bold tracking-widest uppercase text-[#2daa6a] border border-[#1a6b3c]/30 rounded-full px-2.5 py-0.5 bg-[#1a6b3c]/10">
                                                ~2.5 Years · Tapering
                                            </div>
                                            <h4 className="font-serif text-lg font-bold text-[#fdfbf7]">Setting Phase</h4>
                                            <p className="text-xs text-[#fdfbf7]/60 leading-relaxed">
                                                The pressure lifts. Saturn moves ahead. All the discipline you practised in the previous five years begins to compound into visible stability, recognition, and lasting wisdom.
                                            </p>
                                        </div>
                                        <div className="border-t border-[#1a6b3c]/15 pt-3 space-y-1.5">
                                            {["Consolidate savings and investments", "Reconnect with family — bonds deepen", "Step into the role you have earned"].map((tip, i) => (
                                                <div key={i} className="flex items-center gap-2 text-[10px] text-[#fdfbf7]/50">
                                                    <span className="text-[#2daa6a] text-xs">▸</span>{tip}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Google AdSense Bottom Banner */}
                <AdSenseBanner adSlot="sadesati_bottom_banner" adFormat="horizontal" />

                {/* Content Section */}
                <div className="max-w-3xl mx-auto mt-16">
                  <div className="flex items-center justify-center gap-3 mb-10">
                    <span className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40 rounded-full" />
                    <span className="text-primary/60 text-lg">🪐</span>
                    <span className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40 rounded-full" />
                  </div>

                  <div className="rounded-2xl border border-[#d8bc7a]/30 bg-gradient-to-br from-primary/5 via-card to-accent/5 p-8 shadow-card space-y-8">
                    <div className="text-center">
                      <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-3">
                        Understanding Sade Sati
                      </h2>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="h-px w-8 bg-primary/40 rounded-full" />
                        <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                        <span className="h-px w-8 bg-primary/40 rounded-full" />
                      </div>
                      <p className="text-foreground/70 leading-relaxed max-w-xl mx-auto">
                        Saturn's 7.5-year journey — not a curse, but a period of deep karmic refinement and purposeful transformation.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {[
                        { icon: "🌒", title: "Phase 1 — Rising", desc: "Saturn enters the sign before your Moon sign. External changes, restlessness, and shifts in environment are common." },
                        { icon: "🌕", title: "Phase 2 — Peak", desc: "Saturn sits directly on your natal Moon. The most emotionally intense phase — also the greatest opportunity for inner growth." },
                        { icon: "🌘", title: "Phase 3 — Setting", desc: "Saturn moves past your Moon sign. Pressure lifts gradually. Consolidation, relief, and fresh direction emerge." },
                      ].map((item) => (
                        <div key={item.title} className="rounded-xl border border-border/60 bg-card/80 p-5 text-center space-y-2">
                          <div className="text-2xl">{item.icon}</div>
                          <h3 className="font-serif text-base font-semibold text-foreground">{item.title}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border/40 pt-6 space-y-4">
                      <h3 className="font-serif text-lg font-semibold text-foreground">Saturn — The Planet of Karma</h3>
                      <p className="text-sm text-foreground/70 leading-relaxed">
                        Sade Sati does not guarantee suffering — it delivers what karma demands. Those who live with integrity and work diligently often find that Saturn rewards rather than punishes. Enter your date, time, and place of birth above to discover your current Sade Sati phase, how long it lasts, and what remedies can ease the journey.
                      </p>
                    </div>
                  </div>
                </div>
            </div>

            <RelatedLinks
                links={[
                    {
                        to: "/blog/sade-sati-guide",
                        title: "Sade Sati: The Complete Guide",
                        description: "Saturn's 7.5-year transit, its three phases, and traditional remedies explained.",
                    },
                    {
                        to: "/dasha",
                        title: "Vimshottari Dasha Calculator",
                        description: "See how Saturn's transit interacts with your current planetary period.",
                    },
                    {
                        to: "/kundali",
                        title: "Free Janam Kundali",
                        description: "Generate your birth chart to understand your Moon sign placement.",
                    },
                    {
                        to: "/panchang",
                        title: "Today's Panchang",
                        description: "Tithi, nakshatra, rahu kaal, and auspicious timings for today.",
                    },
                ]}
            />
        </Layout>
    );
};

export default SadeSatiPage;
