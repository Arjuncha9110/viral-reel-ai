import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Instagram, Mail, MapPin, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { hasInstagram, siteConfig } from "@/lib/siteConfig";

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || newsletterStatus === "loading") return;
    setNewsletterStatus("loading");
    try {
      const res = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = (await res.json().catch(() => null)) as { status?: string; message?: string } | null;
      if (res.ok && data?.status === "success") {
        setNewsletterStatus("success");
        setNewsletterMessage("You're subscribed! 🙏 Check your inbox for your free forecast.");
        setNewsletterEmail("");
        try {
          window.sessionStorage.setItem("dp_email_popup_closed_session", "1");
          window.localStorage.setItem("dp_email_popup_dismissed_until", String(Date.now() + 7 * 24 * 60 * 60 * 1000));
        } catch { /* storage blocked */ }
      } else {
        setNewsletterStatus("error");
        setNewsletterMessage(data?.message || "Something went wrong. Please try again.");
      }
    } catch {
      setNewsletterStatus("error");
      setNewsletterMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <footer className="mt-auto border-t border-[#d8bc7a]/24 bg-[linear-gradient(180deg,rgba(252,248,241,0.96),rgba(245,237,223,0.94))]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[#d8bc7a]/40 bg-[linear-gradient(180deg,#fffdfa,#f3ead8)] p-1 shadow-[0_12px_28px_rgba(122,91,40,0.14)]">
                <div className="absolute inset-[3px] rounded-[1rem] border border-[#b59449]/10" />
                <img
                  src="/logo-srichakra.png"
                  alt="Divine Panchang logo"
                  className="relative h-full w-full rounded-[1rem] object-cover pointer-events-none select-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Divine Panchang
                </h3>
                <p className="text-xs text-muted-foreground">Daily Guidance &amp; Numerology</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Daily panchang guidance, numerology, festival explainers, remedies,
              and practical spiritual clarity designed for reflection and repeat visits.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="border-[#d8bc7a]/24 bg-white/70 text-[#4b3521] hover:bg-white hover:text-[#2a190c]">
                <a href={siteConfig.youtubeUrl} target="_blank" rel="noreferrer">
                  <Youtube className="h-4 w-4" />
                  YouTube
                </a>
              </Button>
              {hasInstagram && (
                <Button asChild variant="outline" size="sm" className="border-[#d8bc7a]/24 bg-white/70 text-[#4b3521] hover:bg-white hover:text-[#2a190c]">
                  <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-display text-base font-semibold text-foreground">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/panchang-live" className="text-sm text-muted-foreground transition-colors hover:text-primary">Live Panchang</Link>
              <Link to="/panchang" className="text-sm text-muted-foreground transition-colors hover:text-primary">Daily Panchang</Link>
              <Link to="/weekly-zodiac" className="text-sm text-muted-foreground transition-colors hover:text-primary">Weekly Zodiac</Link>
              <Link to="/ekadashi" className="text-sm text-muted-foreground transition-colors hover:text-primary">Ekadashi Guide</Link>
              <Link to="/kundali" className="text-sm text-muted-foreground transition-colors hover:text-primary">Janam Kundli</Link>
              <Link to="/numerology/name" className="text-sm text-muted-foreground transition-colors hover:text-primary">Name Numerology</Link>
              <Link to="/dasha" className="text-sm text-muted-foreground transition-colors hover:text-primary">Dasha Calculator</Link>
              <Link to="/match" className="text-sm text-muted-foreground transition-colors hover:text-primary">Divine Match</Link>
              <Link to="/eclipse" className="text-sm text-muted-foreground transition-colors hover:text-primary">Eclipse Calculator</Link>
              <Link to="/nadi-shodhana" className="text-sm text-muted-foreground transition-colors hover:text-primary">Nadi Shodhana Timer</Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-display text-base font-semibold text-foreground">Resources</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/about" className="text-sm text-muted-foreground transition-colors hover:text-primary">About Us</Link>
              <Link to="/blog" className="text-sm text-muted-foreground transition-colors hover:text-primary">Blog</Link>
              <Link to="/contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">Contact Us</Link>
              <Link to="/sade-sati" className="text-sm text-muted-foreground transition-colors hover:text-primary">Sade Sati Calculator</Link>
              <a href={siteConfig.youtubeUrl} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground transition-colors hover:text-primary">Watch Daily on YouTube</a>
              <Link to="/terms" className="text-sm text-muted-foreground transition-colors hover:text-primary">Terms of Service</Link>
              <Link to="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-primary">Privacy Policy</Link>
              <Link to="/refund" className="text-sm text-muted-foreground transition-colors hover:text-primary">Refund Policy</Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-display text-base font-semibold text-foreground">Sacred Presence</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Sacred Digital Space</span>
              </div>
              <a href={`mailto:${siteConfig.contactEmail}`} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                {siteConfig.contactEmail}
              </a>
              {!hasInstagram && (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Instagram can be added here as soon as the final handle is ready.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-[#d8bc7a]/30 bg-[linear-gradient(135deg,rgba(11,23,48,0.06),rgba(181,148,73,0.08))] px-6 py-8 md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-sm">
              <h4 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                Free 2026 Vedic Forecast
              </h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Get your free yearly forecast with auspicious dates, planetary transits, and lucky periods — delivered to your inbox.
              </p>
            </div>
            {newsletterStatus === "success" ? (
              <p className="text-sm font-medium text-primary">{newsletterMessage}</p>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex w-full max-w-md gap-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterStatus("idle"); }}
                  placeholder="your@email.com"
                  className="flex-1 rounded-xl border border-[#d8bc7a]/30 bg-white/80 px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-[#b59449] focus:ring-0"
                />
                <Button
                  type="submit"
                  disabled={newsletterStatus === "loading"}
                  className="rounded-xl bg-[#0b1730] px-5 text-sm font-semibold text-[#d8bc7a] hover:bg-[#1a2d4a] disabled:opacity-70"
                >
                  {newsletterStatus === "loading" ? "..." : "Subscribe"}
                </Button>
              </form>
            )}
          </div>
          {newsletterStatus === "error" && (
            <p className="mt-3 text-xs text-red-500">{newsletterMessage}</p>
          )}
        </div>

        <div className="mt-8 border-t border-[#d8bc7a]/18 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              Copyright 2026 Divine Panchang. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/refund" className="hover:text-primary transition-colors">Refunds</Link>
              <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </div>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              Made with <Heart className="h-3.5 w-3.5 fill-primary text-primary" /> for spiritual seekers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
