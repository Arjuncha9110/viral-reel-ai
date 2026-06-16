import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Moon, ScrollText, Sparkles, Sun, Volume2 } from "lucide-react";

import { useOmChant } from "@/components/om/OmChantProvider";
import { trustSignals } from "@/data/homeData";
import { cn } from "@/lib/utils";

const OM_GLYPH = "\u0950";

export const Hero = () => {
  const { isPlaying, openOmExperience } = useOmChant();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#fdf8ef] via-[#fdf2e4] to-[#faeada]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_25%_-5%,rgba(214,110,40,0.10),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_95%_100%,rgba(200,90,30,0.07),transparent)]" />

      <div className="pointer-events-none absolute right-[-6%] top-[-4%] select-none font-serif text-[480px] leading-none text-[#d4651a] opacity-[0.05]">
        {OM_GLYPH}
      </div>

      <div className="pointer-events-none absolute left-10 top-1/3 h-2 w-2 rounded-full bg-[#d4651a]/20" />
      <div className="pointer-events-none absolute left-24 top-1/4 h-1 w-1 rounded-full bg-[#d4651a]/15" />
      <div className="pointer-events-none absolute bottom-1/3 left-14 h-1.5 w-1.5 rounded-full bg-[#d4651a]/15" />

      <div className="container relative mx-auto px-4 py-20 md:py-28 lg:py-36">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-7 text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#d4651a]/35 bg-[#d4651a]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#b04c10]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Ancient Vedic Wisdom · Free for All
            </motion.div>

            <h1 className="font-display text-4xl font-bold leading-[1.12] tracking-tight text-[#1a1440] md:text-5xl lg:text-6xl xl:text-7xl">
              Your{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-[#c55810] via-[#e07030] to-[#b04010] bg-clip-text text-transparent">
                  Daily Panchang
                </span>
                <span className="absolute inset-x-0 bottom-1 h-[3px] rounded-full bg-gradient-to-r from-[#d4651a]/0 via-[#e87838]/70 to-[#d4651a]/0" />
              </span>
              <br />
              &amp; Vedic Guidance
            </h1>

            <p className="mx-auto max-w-xl text-lg leading-relaxed text-[#3a2c10]/60 lg:mx-0">
              Check today's panchang — tithi, nakshatra, rahu kaal, and auspicious muhurat for your city — then go
              deeper with your free Janam Kundali, dasha timeline, and numerology.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-col items-center gap-3 sm:flex-row lg:items-start"
            >
              <Link
                to="/panchang"
                className="group inline-flex items-center gap-2 rounded-2xl border border-[#d4651a]/40 bg-white/70 px-7 py-3.5 text-sm font-bold text-[#8a3c10] backdrop-blur-sm transition-all duration-200 hover:border-[#d4651a]/55 hover:bg-white/90 hover:text-[#6a2808]"
              >
                <Sun className="h-4 w-4" />
                Today's Panchang
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/panchang-live"
                className="group inline-flex items-center gap-2 rounded-2xl border border-[#e87838]/40 bg-gradient-to-r from-[#d4651a] to-[#a84810] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#d4651a]/30 transition-all duration-200 hover:brightness-110 hover:shadow-xl hover:shadow-[#d4651a]/45"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                </span>
                Live Panchang
              </Link>

              <Link
                to="/kundali"
                className="group inline-flex items-center gap-2 rounded-2xl border border-[#d4651a]/30 bg-white/70 px-7 py-3.5 text-sm font-bold text-[#8a3c10] backdrop-blur-sm transition-all duration-200 hover:border-[#d4651a]/55 hover:bg-white/90 hover:text-[#6a2808]"
              >
                <Moon className="h-4 w-4" />
                Free Janam Kundali
              </Link>


            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className={cn(
                "max-w-xl rounded-[1.75rem] border px-5 py-4 text-left shadow-[0_18px_50px_rgba(212,101,26,0.08)] transition-all duration-300",
                isPlaying ? "border-[#d4651a]/30 bg-white/85" : "border-[#d4651a]/18 bg-white/65"
              )}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#b04c10]">Eternal Om Chant</p>
                  <p className="text-sm leading-relaxed text-[#4a3818]/75">
                    A gentle five-minute ritual you can keep playing while you work, reflect, or browse your daily guidance.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openOmExperience}
                  className="inline-flex items-center gap-2 self-start rounded-full border border-[#d4651a]/25 bg-[#fff7ef] px-4 py-2 text-xs font-semibold text-[#9c4310] transition hover:border-[#d4651a]/45 hover:bg-white"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  {isPlaying ? "Open player" : "Open chant"}
                </button>
              </div>

              {isPlaying ? (
                <div className="mt-3 flex items-center gap-2 text-xs text-[#8a3c10]">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#d4651a] shadow-[0_0_0_5px_rgba(212,101,26,0.12)]" />
                  Chant is playing softly in the background.
                </div>
              ) : null}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex flex-wrap items-center justify-center gap-5 pt-2 lg:justify-start"
            >
              {trustSignals.map((signal) => (
                <div key={signal.label} className="flex items-center gap-1.5 text-xs text-[#3a2c10]/45">
                  <signal.icon className="h-3.5 w-3.5 text-[#d4651a]/65" />
                  {signal.label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mx-auto w-full max-w-md"
          >
            <div className="relative">
              <div className="absolute inset-8 rounded-[2rem] bg-[#d4651a]/18 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-[#e07838]/30 bg-gradient-to-br from-[#1a2848] via-[#152038] to-[#0f1a30] p-8 shadow-[0_32px_80px_rgba(0,0,0,0.22),0_0_0_1px_rgba(212,101,26,0.12)] md:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,101,26,0.13),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(180,72,16,0.06),transparent_50%)]" />

                <div className="pointer-events-none absolute right-4 top-4 h-28 w-28 rounded-full border border-white/[0.06]" />
                <div className="pointer-events-none absolute bottom-4 left-4 h-36 w-36 rounded-full border border-[#e07838]/10" />

                <div className="relative z-10 space-y-7">
                  <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-[#e07838]/40 bg-[#0d1535]/80 p-2.5 shadow-[0_0_0_8px_rgba(212,101,26,0.09),0_0_0_16px_rgba(212,101,26,0.04)] md:h-36 md:w-36">
                    <img
                      src="/logo-srichakra.png?v=6"
                      alt="Divine Panchang Sri Chakra"
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>

                  <div className="space-y-2 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#f08040]">Divine Panchang</p>
                    <h2 className="font-display text-2xl font-semibold leading-snug text-white md:text-3xl">
                      A daily sacred ritual,
                      <br />
                      not just another app
                    </h2>
                    <p className="mx-auto max-w-xs text-sm leading-relaxed text-white/45">
                      Panchang, kundali, and numerology tools built on authentic Vedic texts, presented with calm, premium design.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "Free", label: "Always" },
                      { value: "14+", label: "Tools" },
                      { value: "Vedic", label: "Authentic" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-white/8 bg-white/[0.05] p-3 text-center">
                        <p className="text-base font-bold text-[#f08040]">{stat.value}</p>
                        <p className="mt-0.5 text-[10px] text-white/40">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/kundali"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e07030]/30 bg-[#e07030]/12 py-3 text-sm font-semibold text-[#f08040] transition hover:bg-[#e07030]/22"
                  >
                    <ScrollText className="h-4 w-4" />
                    Generate My Free Kundali
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#fdf8ef] to-transparent" />
    </section>
  );
};
