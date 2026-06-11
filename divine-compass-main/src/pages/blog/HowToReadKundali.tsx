import { motion } from "framer-motion";
import { Clock, Tag, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/shared/SeoHead";
import { RelatedLinks } from "@/components/shared/RelatedLinks";
import { siteConfig } from "@/lib/siteConfig";

const HowToReadKundali = () => {
  return (
    <Layout>
      <SeoHead
        title="How to Read Your Kundali: A Beginner's Guide | Divine Panchang"
        description="Learn how to read your Kundali birth chart. Understand the 12 houses, 9 planets, zodiac signs, and what each placement means in Vedic astrology."
        path="/blog/how-to-read-kundali"
        type="article"
        keywords="how to read kundali, kundali birth chart, janam kundali, vedic astrology houses, planets in astrology, kundali guide"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "How to Read Your Kundali: A Beginner's Guide to the Birth Chart",
          description:
            "A step-by-step guide to understanding your Vedic birth chart — the 12 houses, 9 planets, ascendant, and what each placement reveals about your life.",
          author: { "@type": "Organization", name: "Divine Panchang" },
          publisher: { "@type": "Organization", name: "Divine Panchang", url: siteConfig.websiteUrl },
          url: siteConfig.websiteUrl + "/blog/how-to-read-kundali",
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
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border bg-rose-50 text-rose-700 border-rose-200">
              <Tag className="w-3 h-3" /> Kundali
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" /> 8 min read
            </span>
            <span className="text-xs text-muted-foreground">June 4, 2026</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            How to Read Your Kundali: A Beginner's Guide to the Birth Chart
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your Kundali is a snapshot of the sky at the exact moment you were born. Each planet, each house, each sign carries a message — and reading it doesn't have to be complicated.
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
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">What Is a Kundali?</h2>
            <p>
              A <strong>Kundali</strong> (also called Janam Kundali, birth chart, or horoscope) is a diagrammatic representation of the positions of the nine planets (Navagraha) in the twelve houses of the zodiac at the precise time and place of your birth. It is the foundational document of Vedic astrology.
            </p>
            <p className="mt-3">
              The Kundali does not predict a fixed fate. Instead, it maps your karmic tendencies — the inclinations, gifts, challenges, and life themes that your soul has chosen to work with in this lifetime. Think of it as a personalised cosmic blueprint, not a prison sentence.
            </p>
            <p className="mt-3">
              To generate your Kundali, you need three things: your date of birth, time of birth (as accurate as possible), and place of birth. The time is crucial — even a difference of a few minutes can shift the Ascendant and alter the reading significantly.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">The Ascendant (Lagna) — Your Chart's Foundation</h2>
            <p>
              The most important starting point in any Kundali is the <strong>Ascendant</strong>, or <em>Lagna</em>. This is the zodiac sign rising on the eastern horizon at the moment of your birth. It becomes the first house of your chart and sets the sequence of all twelve houses.
            </p>
            <p className="mt-3">
              Your Ascendant sign heavily colours your personality, physical appearance, and the general approach you take to life. Unlike your Sun sign (which is the same for everyone born in the same month), your Ascendant changes every two hours — making it far more personal and precise.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">The 12 Houses — Life's Key Domains</h2>
            <p>The twelve houses of the Kundali each govern a specific area of life. Here is a concise guide:</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { house: "1st House", name: "Lagna", rules: "Self, personality, physical body, early life" },
                { house: "2nd House", name: "Dhana", rules: "Wealth, family, speech, food, accumulated assets" },
                { house: "3rd House", name: "Sahaja", rules: "Courage, siblings, communication, short journeys" },
                { house: "4th House", name: "Sukha", rules: "Home, mother, comfort, property, inner peace" },
                { house: "5th House", name: "Putra", rules: "Children, creativity, intelligence, romance, past-life merit" },
                { house: "6th House", name: "Ari", rules: "Enemies, disease, debt, daily routines, service" },
                { house: "7th House", name: "Kalatra", rules: "Marriage, partnerships, business relationships, the public" },
                { house: "8th House", name: "Ayur", rules: "Longevity, transformation, inheritance, the occult, sudden events" },
                { house: "9th House", name: "Dharma", rules: "Fortune, father, spirituality, higher learning, long journeys" },
                { house: "10th House", name: "Karma", rules: "Career, social status, public reputation, authority" },
                { house: "11th House", name: "Labha", rules: "Gains, income, social networks, elder siblings, aspirations" },
                { house: "12th House", name: "Vyaya", rules: "Losses, liberation, foreign lands, sleep, spiritual retreat" },
              ].map((h) => (
                <div key={h.house} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-xs font-bold text-primary">{h.house} — {h.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{h.rules}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">The 9 Planets and Their Meanings</h2>
            <p>Vedic astrology uses nine celestial bodies — the seven classical planets plus two lunar nodes:</p>

            <div className="mt-4 space-y-2">
              {[
                { planet: "Sun (Surya)", meaning: "Soul, authority, father, ego, government, vitality" },
                { planet: "Moon (Chandra)", meaning: "Mind, emotions, mother, instinct, public image" },
                { planet: "Mars (Mangal)", meaning: "Energy, courage, ambition, brothers, property, conflict" },
                { planet: "Mercury (Budha)", meaning: "Intelligence, communication, business, skin, nervous system" },
                { planet: "Jupiter (Guru)", meaning: "Wisdom, wealth, children, spirituality, expansion, teaching" },
                { planet: "Venus (Shukra)", meaning: "Love, beauty, luxury, arts, marriage, sensual pleasure" },
                { planet: "Saturn (Shani)", meaning: "Karma, discipline, longevity, delay, the masses, justice" },
                { planet: "Rahu (North Node)", meaning: "Desire, obsession, foreign influence, unconventional path, illusion" },
                { planet: "Ketu (South Node)", meaning: "Spiritual liberation, detachment, past-life wisdom, isolation" },
              ].map((p) => (
                <div key={p.planet} className="flex gap-3 rounded-lg border border-border bg-card px-4 py-3">
                  <span className="text-sm font-semibold text-foreground min-w-[120px]">{p.planet}</span>
                  <span className="text-sm text-muted-foreground">{p.meaning}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">How to Read a Placement</h2>
            <p>
              A planet's meaning is shaped by three factors acting together: the <strong>planet itself</strong>, the <strong>house it occupies</strong>, and the <strong>sign it is in</strong>. Reading a Kundali means combining these three layers.
            </p>
            <p className="mt-3">
              For example: <strong>Jupiter in the 5th house in Sagittarius</strong> would suggest exceptional creativity, love for children, strong philosophical intelligence, and potential for spiritual teaching — because Jupiter (wisdom, expansion) is in the house of creativity and intelligence (5th), in its own sign (Sagittarius), where it is at its most powerful.
            </p>
            <p className="mt-3">
              Contrast that with <strong>Saturn in the 5th house in Aries</strong> — here, Saturn (discipline, delay) in the creativity house in a sign where it is debilitated (Aries) might indicate delays in having children, difficulty with creative expression in early life, but potentially deep artistic mastery achieved through sustained effort over time.
            </p>
            <p className="mt-3">
              Context always matters. No single placement defines a life. The entire chart is a conversation between all twelve houses and nine planets.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Three Things to Look at First</h2>
            <p>When looking at any Kundali for the first time, start here:</p>
            <ol className="mt-3 space-y-3 list-none pl-0">
              <li className="flex gap-3">
                <span className="text-primary font-bold text-lg leading-tight">1.</span>
                <div>
                  <strong>Your Ascendant sign</strong> — This tells you which sign rules each house. Knowing this restructures everything else in the chart.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold text-lg leading-tight">2.</span>
                <div>
                  <strong>Your Moon sign</strong> — The Moon is your mind. Your Moon sign reveals your emotional nature, how you respond instinctively, and what you need to feel secure.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold text-lg leading-tight">3.</span>
                <div>
                  <strong>Your chart ruler</strong> — The planet that rules your Ascendant sign is called the chart ruler (or Lagna Lord). Its placement in your chart is of paramount importance — it indicates the overall direction and theme of your life.
                </div>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Beyond the Basics</h2>
            <p>
              Once you're comfortable with houses, planets, and signs, the next layers of Kundali reading include:
            </p>
            <ul className="mt-3 space-y-2 list-none pl-0">
              <li className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Aspects (Drishti):</strong> Planets cast "glances" on other houses and planets, influencing them from a distance. Saturn's 3rd, 7th, and 10th aspects are particularly significant.</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Yogas:</strong> Special planetary combinations that produce distinctive results — Raja Yogas for power and success, Dhana Yogas for wealth, Viparita Raja Yogas for unexpected reversals of fortune.</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Dasha system:</strong> The Vimshottari Dasha system divides life into planetary periods, each ruled by a planet. The running Dasha tells you which planet is "speaking" most loudly right now.</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Divisional charts (Varga):</strong> Secondary charts that zoom into specific life areas — the Navamsha (D-9) for marriage and dharma, the Dashamsha (D-10) for career.</span></li>
            </ul>
          </section>

          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6 mt-8">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Generate Your Free Kundali</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get your complete Vedic birth chart with planetary positions, house analysis, and Dasha periods — free and instant.
            </p>
            <Link
              to="/kundali"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Create My Kundali <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </motion.article>

        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
          <Link to="/blog/sade-sati-guide" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Sade Sati Guide
          </Link>
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            All articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>

      <RelatedLinks
        heading="Put this guide into practice"
        links={[
          {
            to: "/kundali",
            title: "Free Janam Kundali",
            description: "Generate your Vedic birth chart with accurate planetary positions.",
          },
          {
            to: "/match",
            title: "Kundali Matching",
            description: "Check Vedic compatibility with Ashtakoota guna matching.",
          },
          {
            to: "/dasha",
            title: "Vimshottari Dasha Calculator",
            description: "Explore the planetary periods shaping each chapter of life.",
          },
          {
            to: "/blog/what-is-panchang",
            title: "What is Panchang?",
            description: "The five limbs of Vedic timekeeping, explained for beginners.",
          },
        ]}
      />
    </Layout>
  );
};

export default HowToReadKundali;
