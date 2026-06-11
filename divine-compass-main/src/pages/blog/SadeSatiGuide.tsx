import { motion } from "framer-motion";
import { Clock, Tag, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/shared/SeoHead";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { siteConfig } from "@/lib/siteConfig";

const SadeSatiGuide = () => {
  return (
    <Layout>
      <SeoHead
        title="Sade Sati: Saturn's 7.5-Year Journey Explained | Divine Panchang"
        description="What is Sade Sati? Learn about Saturn's 7.5-year transit, its three phases, effects on each zodiac sign, and powerful remedies to navigate this period."
        path="/blog/sade-sati-guide"
        type="article"
        keywords="sade sati, saturn transit, shani sade sati, sade sati effects, sade sati remedies, 7.5 years saturn"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "Sade Sati: Saturn's 7.5-Year Journey and What It Means for You",
          description:
            "A complete guide to Sade Sati — Saturn's transformative 7.5-year transit, its three phases, effects by sign, and practical remedies.",
          author: { "@type": "Organization", name: "Divine Panchang" },
          publisher: { "@type": "Organization", name: "Divine Panchang", url: siteConfig.websiteUrl },
          url: siteConfig.websiteUrl + "/blog/sade-sati-guide",
          datePublished: "2026-06-04",
          dateModified: "2026-06-04",
        }}
      />

      <div className="container mx-auto px-4 py-10 max-w-3xl">

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">
              <Tag className="w-3 h-3" /> Astrology
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" /> 9 min read
            </span>
            <span className="text-xs text-muted-foreground">June 4, 2026</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            Sade Sati: Saturn's 7.5-Year Journey and What It Really Means for You
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sade Sati is one of the most discussed periods in Vedic astrology. Often feared, rarely understood — here is everything you need to know about Saturn's transformative passage and how to navigate it wisely.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <span className="h-px w-12 bg-gradient-to-r from-primary to-accent rounded-full" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="h-px w-12 bg-gradient-to-l from-primary to-accent rounded-full" />
          </div>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none text-foreground/85 leading-relaxed space-y-8"
        >

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">What Is Sade Sati?</h2>
            <p>
              The term <strong>Sade Sati</strong> comes from Hindi — <em>Saadhe Saati</em> — meaning "seven and a half." It refers to the approximately 7.5-year period during which Saturn (Shani) transits through three consecutive zodiac signs: the sign before your Moon sign, your Moon sign itself, and the sign after it.
            </p>
            <p className="mt-3">
              Since Saturn spends roughly 2.5 years in each sign, its passage through these three signs totals 7.5 years. This period is considered one of the most significant astrological transits in a person's life — not because it is purely malefic, but because Saturn, as a planet of discipline, karma, and responsibility, tends to bring lessons, delays, and restructuring wherever it travels.
            </p>
            <p className="mt-3">
              Sade Sati occurs approximately three times in a human lifetime, roughly every 29.5 years. The first cycle (usually in childhood) is often mild. The second (in middle adulthood) tends to be the most intense. The third, in old age, is frequently one of spiritual deepening.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">The Three Phases of Sade Sati</h2>

            <div className="space-y-4 mt-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">Phase 1 — Rising (Dhaiya)</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Saturn enters the sign immediately before your Moon sign. During this phase, external challenges tend to surface — travel, change of residence, career uncertainty, or disturbances in the immediate environment. The effects are felt more in the outer world than the inner. Sleep may be disrupted; a sense of restlessness is common. This phase lasts approximately 2.5 years.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">Phase 2 — Peak (Janma Shani)</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Saturn moves directly over your natal Moon. This is considered the most intense phase. The Moon governs the mind, emotions, mother, and domestic life — and Saturn's pressure here can bring emotional heaviness, health challenges (particularly to the mother), financial strain, and a general feeling of burden. However, it is also the phase of greatest personal growth. Saturn sitting on the Moon demands emotional maturity, and those who meet that demand emerge significantly wiser.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">Phase 3 — Setting (Antya)</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Saturn moves into the sign following your Moon sign. The most acute pressure begins to lift. However, financial consequences of decisions made in earlier phases may still be felt. This phase often involves consolidation — tying up loose ends, accepting what has changed, and beginning to stabilise. By the end of this phase, most people feel a meaningful sense of relief and fresh direction.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">What Sade Sati Is Not</h2>
            <p>
              The popular imagination around Sade Sati is often catastrophic — a period of guaranteed suffering, loss, and bad luck. This is an oversimplification, and a harmful one.
            </p>
            <p className="mt-3">
              Saturn is not a malevolent planet. It is the planet of karma, effort, and justice. It rewards those who work diligently and with integrity, and it corrects those who have been avoiding responsibility. Sade Sati's challenges are, in most cases, course corrections — sometimes painful, but purposeful.
            </p>
            <p className="mt-3">
              The intensity of Sade Sati depends heavily on Saturn's placement in your natal chart, the strength of your Moon, the current Dasha period, and your own karmic state. Many people sail through Sade Sati with only minor disruptions. Some even experience career breakthroughs and deep spiritual growth during this period.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Effects by Moon Sign</h2>
            <p>
              The impact of Sade Sati varies based on your Moon sign (Rashi) and Saturn's relationship with it in your birth chart. Here is a brief overview:
            </p>
            <ul className="mt-3 space-y-2 list-none pl-0">
              <li className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Aries, Cancer, Leo, Scorpio:</strong> These signs tend to experience more friction with Saturn's energy. Health, relationships, and finances may require special attention.</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Taurus, Libra, Capricorn, Aquarius:</strong> Saturn is friendly to or rules these signs. Sade Sati may bring hard work but is more likely to yield tangible rewards.</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Gemini, Virgo, Sagittarius, Pisces:</strong> Mixed results. Spiritual growth and philosophical shift are common, even if outer circumstances become challenging.</span></li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground italic">
              Note: This is a general guide. Your individual birth chart should be consulted for accurate assessment. Use our Sade Sati calculator for a personalised report.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Powerful Remedies for Sade Sati</h2>
            <p>
              Vedic astrology offers a range of remedies (upayas) to reduce the friction of Sade Sati and align with Saturn's constructive energy:
            </p>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground text-sm mb-1">Worship Shani Dev on Saturdays</h3>
                <p className="text-xs text-muted-foreground">Light a sesame oil lamp, offer black sesame seeds, and recite the Shani Chalisa or Shani Stotra. Visiting a Shani temple on Saturday evenings is considered especially effective.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground text-sm mb-1">Hanuman Puja</h3>
                <p className="text-xs text-muted-foreground">Lord Hanuman is revered as the only deity capable of calming Saturn's influence. Reciting the Hanuman Chalisa — especially on Tuesdays and Saturdays — is one of the most widely recommended remedies.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground text-sm mb-1">Charitable Acts</h3>
                <p className="text-xs text-muted-foreground">Saturn governs the working class and the underprivileged. Donating to the needy — especially on Saturdays — is considered one of the most effective karmic remedies. Black sesame, mustard oil, iron, and dark-coloured blankets are traditional Shani donations.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground text-sm mb-1">Wear Blue Sapphire (Neelam) — With Caution</h3>
                <p className="text-xs text-muted-foreground">Blue sapphire is Saturn's gemstone and can be extraordinarily powerful — both positively and negatively. It should only be worn after consultation with a qualified Vedic astrologer who has analysed your complete birth chart.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground text-sm mb-1">Discipline and Integrity</h3>
                <p className="text-xs text-muted-foreground">The deepest remedy for Sade Sati is living righteously. Saturn rewards effort, honesty, and perseverance more than any ritual. Maintaining a disciplined routine, fulfilling obligations, and avoiding shortcuts all align you with Saturn's constructive frequency.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Approaching Sade Sati with the Right Mindset</h2>
            <p>
              The most important thing to understand about Sade Sati is this: it is not a punishment. It is a period of accelerated karmic processing. Saturn brings to the surface everything that needs to be dealt with — debts, unresolved relationships, unhealthy patterns, and unfulfilled duties. The discomfort is the medicine.
            </p>
            <p className="mt-3">
              Those who approach Sade Sati with awareness, humility, and willingness to do the necessary inner and outer work often look back on this period as one of the most meaningful of their lives. The challenges were real, but so was the growth.
            </p>
            <p className="mt-3">
              Knowing you are in Sade Sati — and understanding which phase you're in — is itself empowering. It transforms confusion into context, and anxiety into purposeful action.
            </p>
          </section>

          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6 mt-8">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Are You Currently in Sade Sati?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use our Sade Sati calculator to find out your current phase, affected life areas, and personalised remedies based on your Moon sign.
            </p>
            <Link
              to="/sade-sati"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Check My Sade Sati <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </motion.article>

        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
          <Link to="/blog/what-is-panchang" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> What is Panchang?
          </Link>
          <Link to="/blog/how-to-read-kundali" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            Next: How to Read Your Kundali <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      <RelatedLinks
        heading="Put this guide into practice"
        links={[
          {
            to: "/sade-sati",
            title: "Sade Sati Calculator",
            description: "Check your current Sade Sati phase from your birth details.",
          },
          {
            to: "/dasha",
            title: "Vimshottari Dasha Calculator",
            description: "See which planetary period governs this chapter of your life.",
          },
          {
            to: "/kundali",
            title: "Free Janam Kundali",
            description: "Generate your birth chart and find your Moon sign placement.",
          },
          {
            to: "/blog/how-to-read-kundali",
            title: "How to Read Your Kundali",
            description: "Houses, planets, and signs decoded in plain language.",
          },
        ]}
      />
    </Layout>
  );
};

export default SadeSatiGuide;
