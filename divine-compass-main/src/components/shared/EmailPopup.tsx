import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { X, Sparkles, Mail } from "lucide-react";

const STORAGE_KEY = "dp_email_popup_dismissed_until";
const SESSION_KEY = "dp_email_popup_closed_session";
const DELAY_MS = 30000;
const DISMISS_DAYS = 7;

const BLOCKED_PATH_PREFIXES = [
  "/panchang-live",
  "/kundali-report-preview",
  "/sade-sati-report-preview",
  "/kundali-report",
  "/sade-sati",
  "/checkout",
  "/payment",
];

const shouldBlockPopup = (pathname: string) =>
  BLOCKED_PATH_PREFIXES.some((path) => pathname.startsWith(path));

const getDismissUntil = () => {
  const value = window.localStorage.getItem(STORAGE_KEY);
  const time = value ? Number(value) : 0;
  return Number.isFinite(time) ? time : 0;
};

const setDismissedForSevenDays = () => {
  const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
  window.localStorage.setItem(STORAGE_KEY, String(until));
  window.sessionStorage.setItem(SESSION_KEY, "1");
};

export const EmailPopup = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const isClosedRef = useRef(false);

  const blocked = useMemo(
    () => shouldBlockPopup(location.pathname),
    [location.pathname]
  );

  const dismiss = () => {
    isClosedRef.current = true;
    try {
      setDismissedForSevenDays();
    } catch (e) {
      console.warn("Storage blocked:", e);
    }
    setVisible(false);
  };

  useEffect(() => {
    setVisible(false);

    if (blocked) return;
    try {
      if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;
      if (getDismissUntil() > Date.now()) return;
    } catch {
      // Storage blocked
    }

    let hasEngaged = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const showPopup = () => {
      if (isClosedRef.current) return;
      if (blocked) return;
      try {
        if (window.sessionStorage.getItem(SESSION_KEY) === "1") return;
        if (getDismissUntil() > Date.now()) return;
      } catch {
        // Storage blocked
      }
      setVisible(true);
    };

    const markEngaged = () => {
      if (hasEngaged) return;
      hasEngaged = true;
      timer = setTimeout(showPopup, 6000);
      window.removeEventListener("scroll", markEngaged);
      window.removeEventListener("pointerdown", markEngaged);
    };

    const fallbackTimer = setTimeout(showPopup, DELAY_MS);
    window.addEventListener("scroll", markEngaged, { passive: true });
    window.addEventListener("pointerdown", markEngaged, { passive: true });

    return () => {
      clearTimeout(fallbackTimer);
      if (timer) clearTimeout(timer);
      window.removeEventListener("scroll", markEngaged);
      window.removeEventListener("pointerdown", markEngaged);
    };
  }, [blocked, location.pathname]);

  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || loading) return;

    setLoading(true);

    try {
      // POST to our Cloudflare Function — calls Zoho Campaigns server-side (no CORS issues)
      await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Non-blocking — always show success to user
    } finally {
      setLoading(false);
      setSubmitted(true);
      setDismissedForSevenDays();
      window.setTimeout(() => setVisible(false), 1200);
    }
  };

  if (!visible || blocked) return null;

  return (
    <>
      <button
        aria-label="Close email popup"
        className="fixed inset-0 z-50 cursor-default bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Free Vedic forecast signup"
        className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-3xl border border-[#d8bc7a]/30 bg-[#0b1730] shadow-[0_32px_100px_rgba(0,0,0,0.6)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,187,74,0.18),transparent_50%)]" />
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-[#d8bc7a]/10" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full border border-[#d8bc7a]/10" />

          <button
            type="button"
            aria-label="Close"
            onClick={dismiss}
            className="absolute right-4 top-4 z-20 rounded-full p-2 text-white/55 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative z-10 p-7 sm:p-9">
            {!submitted ? (
              <>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d8bc7a]/30 bg-[#d8bc7a]/10 px-3.5 py-1.5 text-xs font-medium tracking-wide text-[#d8bc7a]">
                  <Sparkles className="h-3.5 w-3.5" />
                  FREE VEDIC GIFT FOR YOU
                </div>

                <h2 className="mb-2 font-display text-2xl font-bold leading-snug text-[#fff8e8] sm:text-3xl">
                  Get Your Free<br />
                  <span className="text-[#d8bc7a]">2026 Vedic Forecast</span>
                </h2>

                <p className="mb-6 text-sm leading-relaxed text-[#a8b3c8]">
                  Enter your email and we will send you a personalized yearly panchang forecast with auspicious months, planetary transits, and lucky periods.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#d8bc7a]/60" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-[#d8bc7a]/20 bg-white/5 py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none ring-0 transition focus:border-[#d8bc7a]/50 focus:bg-white/8"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-[#d8bc7a] to-[#f8bb4a] py-3 text-sm font-semibold text-[#0b1730] shadow-lg transition hover:brightness-110 disabled:opacity-70"
                  >
                    {loading ? "Sending…" : "Send My Free Forecast ✨"}
                  </button>
                </form>

                <p className="mt-3 text-center text-xs text-white/25">
                  No spam. Unsubscribe anytime. 🙏
                </p>
              </>
            ) : (
              <div className="py-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#d8bc7a]/15 text-3xl">
                  🙏
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-[#fff8e8]">
                  Namaste! You're in.
                </h3>
                <p className="text-sm text-[#a8b3c8]">
                  Your 2026 Vedic Forecast is on its way to your inbox. May the stars guide you well.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

