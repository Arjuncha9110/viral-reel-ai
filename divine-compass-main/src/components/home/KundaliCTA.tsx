import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollText, ArrowRight, Calendar, Star, Zap, Shield } from "lucide-react";

export const KundaliCTA = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-[#d4651a]/20 bg-gradient-to-br from-[#fffaf4] via-[#fff8f0] to-[#fef5e8] px-8 py-12 text-center md:px-16 shadow-[0_8px_40px_rgba(212,101,26,0.08)]"
        >
          {/* Warm glow + decorative elements */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(212,101,26,0.07),transparent)]" />
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#d4651a]/50 to-transparent" />
          {/* Decorative glyphs */}
          <div className="pointer-events-none absolute -right-4 -top-4 text-[200px] leading-none opacity-[0.04] select-none font-serif text-[#d4651a]">☿</div>
          <div className="pointer-events-none absolute -left-2 bottom-0 text-[140px] leading-none opacity-[0.04] select-none font-serif text-[#d4651a]">ॐ</div>

          <div className="relative z-10 space-y-5">
            {/* Eyebrow */}
            <div className="flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#d4651a]/40" />
              <span className="text-[10px] font-extrabold tracking-[0.35em] uppercase text-[#a84810]">
                Free Vedic Birth Chart
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#d4651a]/40" />
            </div>

            <h2 className="font-display text-3xl font-bold text-[#1a0c04] md:text-4xl leading-tight">
              Discover What the Stars Reveal<br />
              <span className="bg-gradient-to-r from-[#d4651a] via-[#c25510] to-[#a84410] bg-clip-text text-transparent">
                About Your Life Path
              </span>
            </h2>

            <p className="mx-auto max-w-xl text-[#5c3d1e]/70 leading-relaxed">
              Generate your complete Janam Kundali with accurate planetary positions, house analysis, and Dasha periods — entirely free, instantly.
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {[
                { icon: Zap, label: "Instant results" },
                { icon: Star, label: "Vedic precision" },
                { icon: Shield, label: "No signup needed" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#d4651a]/20 bg-[#d4651a]/8 px-3 py-1 text-[11px] font-semibold text-[#a84810]"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/kundali"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-[#d4651a] via-[#c25510] to-[#a84410] px-7 py-3.5 text-[13.5px] font-bold text-white shadow-[0_4px_20px_rgba(212,101,26,0.35)] border border-[#f09050]/20 transition-all hover:brightness-110 hover:shadow-[0_6px_28px_rgba(212,101,26,0.50)]"
              >
                <ScrollText className="h-4 w-4" />
                Generate My Free Kundali
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/panchang"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#d4651a]/25 bg-white/70 px-7 py-3.5 text-sm font-semibold text-[#a84810] transition-all hover:border-[#d4651a]/50 hover:bg-white"
              >
                <Calendar className="h-4 w-4" />
                View Today's Panchang
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
