import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, FileDown, Star } from "lucide-react";

export const SadeSatiPromo = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-[#d4651a]/40" />
            <span className="text-[10px] font-extrabold tracking-[0.35em] uppercase text-[#a84810]">
              Premium Report
            </span>
            <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-[#d4651a]/40" />
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[#d4651a]/20 bg-gradient-to-br from-[#1e0e04] via-[#2a1508] to-[#1a0c04] shadow-[0_12px_60px_rgba(30,14,4,0.30)]">
            {/* Warm glow overlays */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_100%_0%,rgba(212,101,26,0.12),transparent)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_60%_at_0%_100%,rgba(212,101,26,0.07),transparent)]" />
            {/* Top accent line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4651a]/60 to-transparent" />
            {/* Decorative Saturn */}
            <div className="pointer-events-none absolute -right-6 -top-6 text-[260px] leading-none opacity-[0.05] select-none font-serif text-[#d4651a]">♄</div>
            <div className="pointer-events-none absolute -left-4 bottom-0 text-[160px] leading-none opacity-[0.04] select-none font-serif text-[#f09050]">ॐ</div>

            <div className="relative z-10 grid lg:grid-cols-[1fr_260px]">
              {/* Left content */}
              <div className="p-8 md:p-12 space-y-7">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d4651a]/40 bg-[#d4651a]/12 px-3.5 py-1 text-xs font-bold text-[#f09050] tracking-wide">
                    🪐 Vedic Premium Report
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold text-white/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d4651a] animate-pulse" />
                    14 Pages · Instant PDF
                  </span>
                </div>

                <div>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-white leading-tight">
                    Shani Sade Sati<br />
                    <span className="bg-gradient-to-r from-[#f09050] via-[#e07030] to-[#c85010] bg-clip-text text-transparent">
                      Premium Report
                    </span>
                  </h2>
                  <p className="mt-3 text-white/50 text-[15px] leading-relaxed max-w-lg">
                    A deeply personalised Saturn transit analysis — exact life predictions, challenges, remedies, and a phase-by-phase action plan tailored to your Moon sign.
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    "Rashi-specific life challenges",
                    "Career, health & finance forecast",
                    "Phase-by-phase action plan",
                    "All 3 lifetime Saturn cycles",
                    "Gemstone & Rudraksha remedies",
                    "Inspiring transformation stories",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#d4651a] shrink-0 mt-0.5" />
                      <span className="text-[12.5px] text-white/65 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Price + CTA */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-1">
                  <div>
                    <p className="text-xs text-white/25 line-through">₹799</p>
                    <p className="font-display text-4xl font-black text-white leading-none">₹399</p>
                    <p className="text-[11px] text-[#f09050] font-semibold mt-1">50% launch offer · One-time payment</p>
                  </div>
                  <Link
                    to="/sade-sati"
                    className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#d4651a] via-[#c25510] to-[#a84410] px-7 py-3.5 text-[13.5px] font-bold text-white shadow-[0_4px_20px_rgba(212,101,26,0.40)] border border-[#f09050]/20 transition-all hover:brightness-110 hover:shadow-[0_6px_28px_rgba(212,101,26,0.55)]"
                  >
                    <FileDown className="h-4 w-4" />
                    Get My Sade Sati Report
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* Right — decorative PDF preview */}
              <div className="hidden lg:flex items-center justify-center p-8">
                <div className="relative w-48 rounded-2xl overflow-hidden border border-[#d4651a]/25 shadow-[0_8px_32px_rgba(212,101,26,0.15)]">
                  <div className="bg-gradient-to-b from-[#2a1508] to-[#180c04] p-5 text-center">
                    <div className="text-5xl mb-3 font-serif text-[#f09050]">♄</div>
                    <p className="text-[#f09050] font-serif font-bold text-sm">Sade Sati</p>
                    <p className="text-white/30 text-[10px] mt-0.5">Premium Report</p>
                    <div className="mt-4 space-y-1.5">
                      {["Phase Analysis", "Life Predictions", "Remedies", "Action Plan"].map((l) => (
                        <div key={l} className="text-[10px] text-white/40 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5">{l}</div>
                      ))}
                    </div>
                    <div className="mt-4 rounded-xl bg-gradient-to-r from-[#d4651a]/80 to-[#a84410]/80 py-2 text-[10px] font-bold text-white flex items-center justify-center gap-1.5">
                      <Star className="h-3 w-3 fill-white" /> 14 Pages · PDF
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
