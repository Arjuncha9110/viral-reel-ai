import { motion } from "framer-motion";
import { BookOpen, Globe, Heart, Instagram, MapPin, PlayCircle, Star, Users } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SeoHead } from "@/components/shared/SeoHead";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { Button } from "@/components/ui/button";
import { hasInstagram, siteConfig } from "@/lib/siteConfig";

const AboutPage = () => {
  return (
    <Layout>
      <SeoHead
        title="About Divine Panchang | Vedic Guidance, Panchang & Numerology"
        description="Learn about Divine Panchang, our approach to daily panchang, numerology, Vedic tools, and calm spiritual guidance without fear-based claims."
        path="/about"
        type="website"
        keywords="about divine panchang, vedic astrology website, panchang guidance, numerology, spiritual guidance"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About Divine Panchang",
          url: siteConfig.websiteUrl + "/about",
          description:
            "About Divine Panchang and our approach to practical panchang, numerology, and spiritual guidance.",
        }}
      />
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="About Divine Panchang"
          subtitle="A practical spiritual platform for daily panchang guidance, numerology, and calm reflective content."
          icon={<Heart className="h-8 w-8" />}
        />

        <div className="mx-auto max-w-4xl space-y-12">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <SpiritualCard hover={false}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    Our Mission
                  </h2>
                </div>
                <p className="leading-relaxed text-muted-foreground">
                  Divine Panchang was built to make Vedic wisdom easier to return to every day.
                  Instead of overwhelming people with dense spiritual language, we focus on practical panchang guidance,
                  numerology, and steady reflection that fits modern routines.
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  The goal is simple: help visitors check timing, understand patterns, and build small spiritual habits
                  without fear-based claims or manipulative certainty.
                </p>
              </div>
            </SpiritualCard>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="mb-6 text-center font-display text-2xl font-semibold text-foreground">
              What We Offer
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <SpiritualCard delay={0.1}>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sacred-amber">
                    <BookOpen className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                      Daily Panchang
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Accurate Tithi, Nakshatra, Yoga, Karana, and muhurat timings based on traditional Vedic calculations.
                    </p>
                  </div>
                </div>
              </SpiritualCard>

              <SpiritualCard delay={0.15}>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-light">
                    <span className="font-display text-xl font-bold text-foreground">#</span>
                  </div>
                  <div>
                    <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                      Numerology Analysis
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Name and birth-date numerology designed to surface identity, life-path, and reflection prompts.
                    </p>
                  </div>
                </div>
              </SpiritualCard>

              <SpiritualCard delay={0.2}>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-maroon-light">
                    <Star className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                      Dasha Calculator
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Explore Vimshottari Dasha periods to understand long-term cycles and changing planetary influences.
                    </p>
                  </div>
                </div>
              </SpiritualCard>

              <SpiritualCard delay={0.25}>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                      Daily Guidance
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Short-form spiritual guidance built around daily timing, one practical action, and one calm remedy.
                    </p>
                  </div>
                </div>
              </SpiritualCard>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SpiritualCard hover={false}>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    Connect With Divine Panchang
                  </h2>
                </div>

                <p className="text-muted-foreground">
                  The easiest way to stay connected is through the daily short-form channels and the tools built into the site itself.
                  Use these links while direct contact and community workflows continue to evolve.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Button asChild variant="outline" size="lg">
                    <a href={siteConfig.youtubeUrl} target="_blank" rel="noreferrer">
                      <PlayCircle className="h-4 w-4" />
                      Watch Daily on YouTube
                    </a>
                  </Button>
                  {hasInstagram ? (
                    <Button asChild variant="outline" size="lg">
                      <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">
                        <Instagram className="h-4 w-4" />
                        Follow on Instagram
                      </a>
                    </Button>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                      Instagram link can be added here once the final handle is ready.
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>Sacred Digital Space, India</span>
                    </div>
                  </div>
                </div>
              </div>
            </SpiritualCard>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="rounded-2xl border border-border bg-muted/30 p-6">
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                Disclaimer
              </h3>
              <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
                Divine Panchang offers spiritual and reflective guidance for personal use.
                It does not replace medical, legal, financial, or mental health advice,
                and it avoids fear-based promises or guaranteed outcomes.
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
