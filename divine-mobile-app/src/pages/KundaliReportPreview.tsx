import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileDown, FileText, Printer, Share2, ShieldCheck, Sparkles } from "lucide-react";

import { KundaliReportTemplate, KundaliBirthData } from "@/components/shared/KundaliReportTemplate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

class ReportErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            background: "#1a0a2a",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
          }}
        >
          <div
            style={{
              background: "#2d1040",
              border: "1px solid #b59449",
              borderRadius: 16,
              padding: 32,
              maxWidth: 700,
              width: "100%",
              color: "#fff",
            }}
          >
            <h2
              style={{
                color: "#b59449",
                fontFamily: "serif",
                fontSize: 20,
                marginBottom: 12,
              }}
            >
              Report Render Error
            </h2>
            <p
              style={{
                color: "#f87171",
                fontFamily: "monospace",
                fontSize: 13,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {this.state.error.message}
            </p>
            <details style={{ marginTop: 16 }}>
              <summary style={{ color: "#b59449", cursor: "pointer", fontSize: 12 }}>
                Full Stack Trace
              </summary>
              <pre
                style={{
                  color: "#aaa",
                  fontSize: 11,
                  marginTop: 8,
                  overflowX: "auto",
                }}
              >
                {this.state.error.stack}
              </pre>
            </details>
            <button
              onClick={() => this.setState({ error: null })}
              style={{
                marginTop: 16,
                background: "#b59449",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "8px 20px",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const demoData: KundaliBirthData = {
  name: "Arun C",
  email: "customer@divinepanchang.space",
  dob: "1992-12-05",
  tob: "15:20",
  gender: "male",
  city: "Bangalore",
  lat: 12.58,
  lon: 77.34,
  timezone: "Asia/Kolkata",
  plan: "detailed",
  chartStyle: "north",
};

const KundaliReportPreview: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [data, setData] = useState<KundaliBirthData | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [language, setLanguage] = useState<string>("en");
  const [templateKey, setTemplateKey] = useState(0);
  const [isPdfExportMode, setIsPdfExportMode] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const reportContainerRef = useRef<HTMLDivElement | null>(null);
  const translationRunning = useRef(false);

  useEffect(() => {
    const prevBodyBackground = document.body.style.background;
    const prevHtmlBackground = document.documentElement.style.background;

    document.body.style.background = "#0f0a14";
    document.documentElement.style.background = "#0f0a14";

    return () => {
      document.body.style.background = prevBodyBackground;
      document.documentElement.style.background = prevHtmlBackground;
    };
  }, []);

  useEffect(() => {
    const nameParam = searchParams.get("name");
    const dobParam = searchParams.get("dob");
    const tobParam = searchParams.get("tob");
    const emailParam = searchParams.get("email");
    const genderParam = searchParams.get("gender") || "male";
    const cityParam = searchParams.get("city");
    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const tzParam = searchParams.get("tz") || "Asia/Kolkata";
    const planParam = searchParams.get("plan") as "basic" | "detailed";
    const chartStyleParam = searchParams.get("chartStyle");
    const tokenParam = searchParams.get("token");
    const sessionIdParam = searchParams.get("session_id");

    const langParam = searchParams.get("lang");
    if (langParam) {
      setLanguage(langParam);
    } else {
      const savedLang = localStorage.getItem("kundali_report_lang");
      if (savedLang) {
        setLanguage(savedLang);
      }
    }

    const verifyAccess = async (token: string | null | undefined, sessionId: string | null | undefined) => {
      if (planParam === "free") return true; // Free plan bypasses payment check
      if (!token && !sessionId) return false;

      // Try API verification first (production path)
      try {
        const res = await fetch("/api/payment/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, sessionId, reportType: "kundali" }),
        });
        if (res.ok) {
          const payload = await res.json();
          return payload.status === "success";
        }
      } catch (err) {
        console.error("Session verify error", err);
      }

      // Fallback: accept dev/fake tokens generated by handlePayRazorpay
      // (base64-encoded JSON with { plan, timestamp } fields)
      if (token) {
        try {
          const decoded = JSON.parse(atob(token));
          if (decoded && decoded.plan && typeof decoded.timestamp === "number") return true;
        } catch (_) {
          // not a fake token — fall through
        }
      }

      return false;
    };

    const loadData = async () => {
      if (nameParam && dobParam && tobParam) {
        setIsAuthorized(false);
        const hasAccess = await verifyAccess(tokenParam, sessionIdParam);
        setIsAuthorized(hasAccess);
        
        setData({
          name: nameParam,
          email: emailParam || "customer@divinepanchang.space",
          dob: dobParam,
          tob: tobParam,
          gender: genderParam,
          city: cityParam || "Bengaluru",
          lat: latParam ? parseFloat(latParam) : 12.9716,
          lon: lonParam ? parseFloat(lonParam) : 77.5946,
          timezone: tzParam,
          plan: planParam || "detailed",
          chartStyle: chartStyleParam === "south" ? "south" : "north",
        });
        setIsDemo(false);
        return;
      }

      const saved = localStorage.getItem("kundali_report_details");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.name) {
            setIsAuthorized(false);
            const hasAccess = await verifyAccess(parsed.token || tokenParam, parsed.sessionId || sessionIdParam);
            setIsAuthorized(hasAccess);
            setData(parsed);
            setIsDemo(false);
            return;
          }
        } catch (error) {
          console.error("Error parsing saved details", error);
        }
      }

      setData(demoData);
      setIsDemo(true);
      setIsAuthorized(true);
    };

    loadData();
  }, [searchParams]);

  useEffect(() => {
    if (language === "en" || !data) return;
    if (translationRunning.current) return;

    // Wait for the DOM to be fully rendered before translating
    const timer = setTimeout(async () => {
      if (!reportContainerRef.current) return;
      translationRunning.current = true;
      setIsTranslating(true);
      try {
        const { translateReportDom } = await import("@/lib/pdf/translateReportDom");
        await translateReportDom(reportContainerRef.current, language);
        // Force React to re-run the translation pass on any newly mounted nodes
        setTemplateKey((k) => k + 1);
        // Second pass after re-render to catch newly added text nodes
        await new Promise((r) => setTimeout(r, 300));
        if (reportContainerRef.current) {
          await translateReportDom(reportContainerRef.current, language);
        }
      } catch (error) {
        console.warn(`${language} translation skipped:`, error);
      } finally {
        setIsTranslating(false);
        translationRunning.current = false;
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      translationRunning.current = false;
    };
  }, [data, language]);

  const handleShareLink = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      })
      .catch((error) => {
        console.error("Failed to copy share link:", error);
      });
  };

  const getPdfFileName = () => {
    const cleanName = (data?.name || "Kundali_Report")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_");
    return `Divine_Panchang_Kundali_${cleanName || "Report"}.pdf`;
  };

  const handleDownloadPDF = async () => {
    if (!data || isDownloading) return;

    setIsDownloading(true);
    setDownloadError("");
    setDownloadProgress("Preparing report...");

    try {
      if (language !== "en") {
        setDownloadProgress("Warming up translations...");
        const { preTranslateContent } = await import("@/lib/pdf/preTranslate");
        const { buildSharedReportData } = await import("@/lib/pdf/sharedReportModel");

        // 1. Build the complete English report structure (source of truth)
        const sharedData = buildSharedReportData(data, "en");

        // 2. Warm up all translations directly from the source of truth structure
        await preTranslateContent([sharedData], language);
      }

      setDownloadProgress("Opening print dialog...");
      setTimeout(() => {
        window.print();
        setDownloadProgress("");
        setIsDownloading(false);
      }, 300);
    } catch (error) {
      console.error("Failed to print PDF", error);
      setDownloadError(error instanceof Error ? error.message : "Unknown print error");
      setIsDownloading(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0f0a14] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1c1424] border border-[#b59449]/40 rounded-3xl p-8 text-center shadow-2xl text-[#fdfbf7]">
          <div className="w-16 h-16 bg-[#b59449]/10 border border-[#b59449]/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl text-[#b59449]">🔒</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#fdfbf7] mb-3">Payment Verification Required</h2>
          <p className="text-sm text-[#fdfbf7]/70 leading-relaxed mb-6">
            To view and download your custom 70–90 page personalized Kundali report, please complete your payment. If you have already paid, please check your email for the secure access link.
          </p>
          <Button
            onClick={() => navigate("/kundali-report")}
            className="w-full bg-gradient-to-r from-[#b59449] to-[#722f37] border border-[#b59449]/40 text-white font-bold py-3 rounded-xl shadow-lg hover:brightness-110 transition animate-pulse"
          >
            Go to Payment Page
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0f0a14] px-4 py-12 text-[#fdfbf7]">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#b59449]/30 bg-[#1f0e2b]/90 px-8 py-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#b59449]">
            Preparing Preview
          </p>
          <h1 className="mt-4 font-serif text-3xl text-[#fdfbf7]">Loading your Janma Kundali</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#fdfbf7]/75">
            We&apos;re gathering the birth details and composing the printable report layout.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0a14] flex flex-col">
      <div className="sticky top-0 z-50 bg-[#15121d]/95 backdrop-blur border-b border-gray-800 py-3.5 px-6 flex flex-wrap justify-between items-center print:hidden shadow-2xl text-white">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate("/kundali-report")}
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white border border-white/20 rounded-xl"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Button>
          <div>
            <h2 className="text-white font-serif font-bold text-sm flex items-center gap-1.5 leading-none">
              {data.name}&apos;s Janma Kundali
              {isDemo && (
                <span className="bg-[#b59449] text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5" /> Sample
                </span>
              )}
            </h2>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Vedic Report - Plan:{" "}
              <span className="font-bold text-[#b59449] uppercase">{data.plan}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setIsPdfExportMode(false)}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                !isPdfExportMode ? "bg-[#b59449] text-white shadow-md" : "text-gray-400 hover:text-white"
              )}
            >
              Digital Ornate
            </button>
            <button
              onClick={() => setIsPdfExportMode(true)}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                isPdfExportMode ? "bg-[#b59449] text-white shadow-md" : "text-gray-400 hover:text-white"
              )}
            >
              Print Friendly
            </button>
          </div>

          <div className="flex bg-gray-900/80 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => setData((prev) => (prev ? { ...prev, chartStyle: "north" } : null))}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                data.chartStyle !== "south" ? "bg-[#b59449] text-white shadow-md" : "text-gray-400 hover:text-white"
              )}
            >
              North Indian Chart
            </button>
            <button
              onClick={() => setData((prev) => (prev ? { ...prev, chartStyle: "south" } : null))}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg transition-all",
                data.chartStyle === "south" ? "bg-[#b59449] text-white shadow-md" : "text-gray-400 hover:text-white"
              )}
            >
              South Indian Chart
            </button>
          </div>

          <div className="flex bg-gray-900/80 rounded-xl border border-gray-800 relative">
            <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  if (language !== newLang) {
                    import("@/lib/pdf/preTranslate").then(m => m.clearTranslationCache());
                    setLanguage(newLang);
                    setTemplateKey((k) => k + 1);
                    localStorage.setItem("kundali_report_lang", newLang);
                    searchParams.set("lang", newLang);
                    setSearchParams(searchParams);
                  }
                }}
                className="bg-transparent text-white px-3 py-1 text-xs font-bold rounded-lg transition-all appearance-none cursor-pointer pr-6 focus:outline-none"
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
                  <option key={lang.code} value={lang.code} className="bg-gray-900 text-white">
                    {lang.name}
                  </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-[#b59449]">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 text-[11px] text-gray-300 bg-gray-900/60 border border-gray-800 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="h-3.5 w-3.5 text-green-400 mr-1" />
            Vedic Authenticated
          </div>

          <Button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            variant="default"
            size="sm"
            className="rounded-xl px-5 font-bold flex items-center gap-1.5 text-white bg-gradient-to-r from-[#b59449] to-[#722f37] border border-[#b59449]/40 shadow-lg hover:brightness-110 transition shrink-0"
          >
            <FileDown className="h-4 w-4" />
            <span>{isDownloading ? downloadProgress || "Generating..." : "Download PDF"}</span>
          </Button>
          <Button
            onClick={handlePrintPDF}
            variant="outline"
            size="sm"
            className="rounded-xl px-5 font-bold flex items-center gap-1.5 text-white hover:bg-white/10 border border-white/20 shadow-lg transition"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </Button>
          <Button
            onClick={handleShareLink}
            variant="outline"
            size="sm"
            className="rounded-xl px-5 font-bold flex items-center gap-1.5 text-white hover:bg-white/10 border border-white/20 shadow-lg transition"
          >
            <Share2 className="h-4 w-4" />
            <span>Share Report</span>
          </Button>
        </div>
      </div>

      <ReportErrorBoundary>
        <div className="flex-1 overflow-y-auto bg-[#0f0a14] py-8 flex flex-col items-center gap-6 print:p-0 print:bg-transparent print:gap-0">
          {shareSuccess && (
            <div className="max-w-[210mm] w-full bg-emerald-950/30 border border-emerald-500/30 p-3.5 text-center text-xs text-emerald-300 rounded-xl font-serif print:hidden animate-pulse">
              Share link copied to clipboard successfully.
            </div>
          )}

          {isPdfExportMode && (
            <div className="max-w-[210mm] w-full bg-[#b59449]/10 border border-[#b59449]/30 p-3.5 text-xs text-[#b59449] rounded-xl flex items-center justify-center gap-2 print:hidden font-serif">
              <FileText className="h-4 w-4 shrink-0" />
              <span>
                <strong>Print Layout Mode:</strong> Displaying clean, white, high-contrast, ink-saving A4 sheets.
                Press <strong>Print Report</strong> or <strong>Ctrl+P</strong> and tick{" "}
                <strong>Background graphics</strong> for optimal results.
              </span>
            </div>
          )}

          {isTranslating && (
            <div className="max-w-[210mm] w-full bg-[#1a1040]/80 border border-[#b59449]/40 p-3.5 text-xs text-[#b59449] rounded-xl flex items-center justify-center gap-2 print:hidden animate-pulse font-serif">
              <span>🔄</span>
              <span>Translating content to selected language, please wait...</span>
            </div>
          )}

          {downloadError && (
            <div className="max-w-[210mm] w-full bg-red-950/20 border border-red-500/30 p-3 text-center text-xs text-red-300 rounded-xl">
              {downloadError}
            </div>
          )}

          <div key={language} ref={reportContainerRef} className="w-full flex flex-col items-center print:block">
            <KundaliReportTemplate
              key={templateKey}
              data={data}
              isDemo={isDemo}
              exportMode={isPdfExportMode}
              language={language}
            />
          </div>
        </div>
      </ReportErrorBoundary>
    </div>
  );
};

export default KundaliReportPreview;

