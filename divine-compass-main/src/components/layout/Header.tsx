import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BookOpen,
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  Hash,
  Home,
  Menu,
  Moon,
  Orbit,
  Sparkles,
  Star,
  Sun,
  X,
  Grid3x3,
  Heart,
  Wind,
  Timer
} from "lucide-react";

const primaryLinks = [
  { name: "Home", path: "/", icon: Home },
  { name: "Panchang", path: "/panchang", icon: Calendar },
  { name: "Janam Kundli", path: "/janam-kundli", icon: Moon },
  { name: "Kundli Report", path: "/kundali-report", icon: FileText },
  { name: "Sade Sati", path: "/sade-sati", icon: Orbit },
  { name: "About", path: "/about", icon: BookOpen },
];

const secondaryLinks = [
  { name: "Daily Guidance", path: "/daily-guidance", icon: Sparkles, desc: "Vedic insights for today" },
  { name: "Choghadiya", path: "/choghadiya", icon: Timer, desc: "Auspicious timing windows" },
  { name: "Weekly Zodiac", path: "/weekly-zodiac", icon: Sun, desc: "Rashi forecast this week" },
  { name: "Ekadashi", path: "/ekadashi", icon: Calendar, desc: "Sacred fasting calendar" },
  { name: "Dasha", path: "/dasha", icon: Clock, desc: "Planetary period analysis" },
  { name: "Name Number", path: "/numerology/name", icon: Hash, desc: "Numerology by name" },
  { name: "Vehicle Number", path: "/numerology/name#vehicle-numerology", icon: Hash, desc: "Lucky vehicle numerology" },
  { name: "Eclipse (Grahan)", path: "/eclipse", icon: Moon, desc: "Solar & Lunar Eclipses" },
  { name: "Divine Match", path: "/match", icon: Heart, desc: "Ashtakoot Kundali Milan" },
  { name: "Nadi Shodhana", path: "/nadi-shodhana", icon: Wind, desc: "Meditation Timer" },
  { name: "Moon Cycle", path: "/moon-cycle", icon: Moon, desc: "Lunar phases & Vedic Tithis" },
];

const allLinks = [...primaryLinks, ...secondaryLinks];

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;
  const isSecondaryActive = secondaryLinks.some((link) => isActive(link.path));

  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[rgba(253,249,242,0.96)] backdrop-blur-2xl border-b border-[#e4cfa0]/40 shadow-[0_4px_32px_rgba(100,72,30,0.08)]">
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4651a]/60 to-transparent" />

      <div className="container mx-auto flex h-[68px] items-center justify-between gap-6 px-4">

        {/* ── Logo ── */}
        <Link to="/" className="flex shrink-0 items-center gap-3 group">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d8bc7a]/50 bg-gradient-to-b from-[#fffdf8] to-[#f5e8cc] p-1 shadow-[0_6px_20px_rgba(120,86,32,0.14)] transition-shadow group-hover:shadow-[0_8px_24px_rgba(120,86,32,0.22)]">
            <img
              src="/logo-srichakra.png?v=6"
              alt="Divine Panchang"
              className="h-full w-full rounded-xl object-cover pointer-events-none select-none"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>
          <div>
            <div className="font-display text-[15px] font-bold leading-none text-[#2c1a08] tracking-tight">
              Divine Panchang
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-[#c39a4a]/90 font-medium">
              Vedic Wisdom
            </div>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className="hidden items-center lg:flex">
          {/* Thin left separator */}
          <div className="mr-4 h-5 w-px bg-[#d8bc7a]/30" />

          {primaryLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={[
                  "relative mx-0.5 px-3.5 py-2 text-[13.5px] font-medium transition-all duration-150 rounded-lg",
                  active
                    ? "text-[#a84810] bg-[#d4651a]/08"
                    : "text-[#4a3320] hover:text-[#a84810] hover:bg-[#d4651a]/06",
                ].join(" ")}
              >
                {link.name}
                {/* Active underline */}
                {active && (
                  <span className="absolute bottom-1 left-3.5 right-3.5 h-[2px] rounded-full bg-gradient-to-r from-[#d4651a]/60 via-[#d4651a] to-[#d4651a]/60" />
                )}
              </Link>
            );
          })}

          {/* Thin separator before More */}
          <div className="mx-3 h-5 w-px bg-[#d8bc7a]/30" />

          {/* ── More Dropdown ── */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((v) => !v)}
              className={[
                "inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[13.5px] font-semibold transition-all duration-150",
                isSecondaryActive || isDropdownOpen
                  ? "border-[#d4651a]/40 bg-[#d4651a]/10 text-[#a84810] shadow-[0_2px_12px_rgba(212,101,26,0.15)]"
                  : "border-[#d8bc7a]/50 bg-gradient-to-b from-white/80 to-[#fdf3e0]/80 text-[#5a3a18] hover:border-[#d4651a]/40 hover:text-[#a84810] hover:bg-[#d4651a]/06 hover:shadow-[0_2px_10px_rgba(212,101,26,0.12)]",
              ].join(" ")}
            >
              <Grid3x3 className="h-3.5 w-3.5 opacity-70" />
              <span>Explore</span>
              <ChevronDown
                className={[
                  "h-3.5 w-3.5 opacity-60 transition-transform duration-200",
                  isDropdownOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 top-full mt-2.5 w-80 overflow-hidden rounded-2xl border border-[#e4cfa0]/60 bg-[rgba(255,252,245,0.99)] shadow-[0_20px_60px_rgba(80,50,16,0.16),0_4px_16px_rgba(80,50,16,0.08)] backdrop-blur-xl"
                >
                  {/* Header */}
                  <div className="border-b border-[#e4cfa0]/50 bg-gradient-to-b from-[#fdf6e8] to-[#faf2de] px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-[#c39a4a]" />
                      <p className="text-[10.5px] font-bold uppercase tracking-[0.30em] text-[#c39a4a]">
                        More Tools
                      </p>
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-[#7a5c36]/80">
                      Rituals, zodiac, numerology & more
                    </p>
                  </div>

                  {/* Links — 2 column grid */}
                  <div className="grid grid-cols-2 gap-px bg-[#e4cfa0]/20 p-0">
                    {secondaryLinks.map((link) => {
                      const Icon = link.icon;
                      const active = isActive(link.path);
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={[
                            "flex flex-col gap-1 px-4 py-3.5 transition-colors duration-100",
                            active
                              ? "bg-[#fdf0d8] text-[#a84810]"
                              : "bg-[rgba(255,252,245,0.99)] text-[#3f2c18] hover:bg-[#fef8ee]",
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-2">
                            <span className={[
                              "flex h-6 w-6 items-center justify-center rounded-lg",
                              active ? "bg-[#d4651a]/15 text-[#d4651a]" : "bg-[#d8bc7a]/15 text-[#b59449]"
                            ].join(" ")}>
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <span className="text-[13px] font-semibold leading-none">{link.name}</span>
                          </div>
                          <p className="pl-8 text-[11px] text-[#7a6048]/70 leading-snug">{link.desc}</p>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* ── Live Panchang CTA ── */}
        <div className="hidden items-center lg:flex">
          <Link
            to="/panchang-live"
            className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-br from-[#d4651a] via-[#c25510] to-[#a84410] px-5 py-2.5 text-[13.5px] font-bold text-white shadow-[0_4px_18px_rgba(212,101,26,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-200 hover:shadow-[0_6px_24px_rgba(212,101,26,0.50)] hover:brightness-110"
          >
            {/* Live dot */}
            <span className="flex h-2 w-2 shrink-0 items-center justify-center">
              <span className="absolute h-2 w-2 animate-ping rounded-full bg-white/60" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            Live Panchang
            <Activity className="h-3.5 w-3.5 opacity-80 group-hover:scale-110 transition-transform" />
          </Link>
        </div>

        {/* ── Mobile Menu Toggle ── */}
        <button
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#d8bc7a]/30 bg-white/70 text-[#3e2b18] transition hover:bg-white lg:hidden"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-[#e4cfa0]/40 bg-[linear-gradient(180deg,#fffdf8,#f8f0e0)] lg:hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-1">
              {allLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={[
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-[#fdf0d8] text-[#a84810] border border-[#d4651a]/20"
                        : "text-[#3f2c18] hover:bg-white/80 border border-transparent",
                    ].join(" ")}
                  >
                    <span className={[
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      active ? "bg-[#d4651a]/12 text-[#d4651a]" : "bg-[#d8bc7a]/12 text-[#b59449]"
                    ].join(" ")}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{link.name}</span>
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#d4651a]" />}
                  </Link>
                );
              })}

              <div className="pt-3">
                <Link
                  to="/panchang-live"
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#d4651a] to-[#a84810] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(212,101,26,0.30)]"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute h-2 w-2 animate-ping rounded-full bg-white/60" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                  Open Live Panchang
                  <Activity className="h-4 w-4 opacity-80" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
