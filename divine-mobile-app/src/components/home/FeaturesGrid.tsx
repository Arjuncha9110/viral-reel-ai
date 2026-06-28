import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { features } from "@/data/homeData";

export const FeaturesGrid = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-primary/70">
            Sacred Vedic Tools
          </p>
          <h2 className="mb-4 font-display text-3xl font-bold text-foreground md:text-4xl">
            Everything You Need for Your
            <span className="text-gradient-saffron"> Spiritual Journey</span>
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground leading-relaxed">
            From daily timing to lifetime chart analysis — all tools are free, accurate, and grounded in authentic Vedic texts.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <Link
                to={feature.path}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Glyph watermark */}
                <div className="pointer-events-none absolute right-4 top-2 text-6xl font-serif leading-none text-foreground/[0.04] select-none transition-all duration-300 group-hover:text-primary/10">
                  {feature.glyph}
                </div>

                {/* Icon + badge row */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 transition-colors group-hover:bg-primary/15">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="rounded-full border border-border/70 bg-background px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="mb-2 font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>

                <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:gap-2">
                  Explore now <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
