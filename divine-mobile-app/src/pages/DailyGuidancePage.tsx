import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Flame, PlayCircle, ShieldCheck, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { Button } from "@/components/ui/button";
import { hasInstagram, siteConfig } from "@/lib/siteConfig";
import { SeoHead } from "@/components/shared/SeoHead";

const DailyGuidancePage = () => {
  return (
    <Layout>
        <SeoHead
            title="Daily Vedic Guidance - Today's Outlook & Remedies"
            description="Practical daily guidance based on today's panchang: what the day favours, what to avoid, and simple Vedic remedies."
            path="/daily-guidance"
            type="website"
            keywords="daily vedic guidance, today astrology guidance, daily panchang guidance"
        />
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Daily Guidance"
          subtitle="A short spiritual check-in built around today&apos;s timing, one grounded action, and one calm remedy."
          icon={<Sparkles className="h-8 w-8" />}
        />

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-10"
        >
          <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/10 via-accent/10 to-background p-8 shadow-soft md:p-10">
            <div className="absolute inset-0 sacred-gradient opacity-40" />
            <div className="relative z-10 max-w-3xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-1.5 text-sm text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Return each day for clarity</span>
              </div>

              <h2 className="font-display text-3xl font-bold leading-tight text-foreground md:text-5xl">
                Move Through Today With <span className="text-gradient-saffron">Calm Intention</span>
              </h2>

              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Use this page as your daily habit loop: check the day&apos;s rhythm, take one practical step,
                and carry one simple spiritual practice with you.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild variant="saffron" size="xl">
                  <a href={siteConfig.youtubeUrl} target="_blank" rel="noreferrer">
                    Watch Today&apos;s Short
                    <PlayCircle className="h-5 w-5" />
                  </a>
                </Button>
                <Button asChild variant="spiritual" size="xl">
                  <Link to="/panchang">
                    View Today&apos;s Panchang
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mb-10 grid gap-6 md:grid-cols-3">
          <SpiritualCard delay={0.1}>
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-sacred-amber">
                <Calendar className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">Today&apos;s Panchang Signal</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The day feels better for intention-setting, completion, and thoughtful decisions than rushed reactions.
              </p>
            </div>
          </SpiritualCard>

          <SpiritualCard delay={0.15}>
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-gold-light">
                <ShieldCheck className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">One Practical Action</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Finish one pending task before sunset and avoid promising more than you can calmly complete.
              </p>
            </div>
          </SpiritualCard>

          <SpiritualCard delay={0.2}>
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-maroon-light">
                <Flame className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground">One Calm Remedy</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Light a diya, sit in silence for three minutes, or write one intention before the day gets noisy.
              </p>
            </div>
          </SpiritualCard>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <SpiritualCard hover={false}>
            <div className="space-y-5">
              <h3 className="font-display text-2xl font-semibold text-foreground">How this page should grow</h3>
              <ul className="list-inside list-disc space-y-3 text-sm leading-relaxed text-muted-foreground">
                <li>Date-specific panchang summaries and festival context</li>
                <li>Rashi-friendly micro guidance without fear hooks</li>
                <li>Embedded daily video or avatar clip</li>
                <li>Simple actions that encourage repeat visits and saves</li>
              </ul>
            </div>
          </SpiritualCard>

          <SpiritualCard hover={false}>
            <div className="space-y-5">
              <h3 className="font-display text-2xl font-semibold text-foreground">Follow the daily loop</h3>
              <div className="flex flex-col gap-3">
                <Button asChild variant="outline" size="lg">
                  <a href={siteConfig.youtubeUrl} target="_blank" rel="noreferrer">
                    Watch Daily on YouTube
                  </a>
                </Button>
                {hasInstagram ? (
                  <Button asChild variant="outline" size="lg">
                    <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer">
                      Follow on Instagram
                    </a>
                  </Button>
                ) : (
                  <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                    Instagram profile can be linked here once the final handle is ready.
                  </div>
                )}
                <Button asChild variant="outline" size="lg">
                  <a href={siteConfig.websiteUrl} target="_blank" rel="noreferrer">
                    Visit divinepanchang.space
                  </a>
                </Button>
              </div>
            </div>
          </SpiritualCard>
        </section>
      </div>
    </Layout>
  );
};

export default DailyGuidancePage;
