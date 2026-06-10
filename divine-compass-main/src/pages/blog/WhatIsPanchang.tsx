import { motion } from "framer-motion";
import { Clock, Tag, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/shared/SeoHead";
import { siteConfig } from "@/lib/siteConfig";

const WhatIsPanchang = () => {
  return (
    <Layout>
      <SeoHead
        title="What is Panchang? A Complete Guide to the Hindu Calendar | Divine Panchang"
        description="Learn what Panchang is, its five sacred elements (Tithi, Vara, Nakshatra, Yoga, Karana), and how to use it for auspicious timing in daily life."
        path="/blog/what-is-panchang"
        type="article"
        keywords="what is panchang, panchang meaning, tithi vara nakshatra yoga karana, hindu calendar, vedic calendar, auspicious timing"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "What is Panchang? A Complete Guide to the Hindu Calendar",
          description:
            "Panchang is a Vedic almanac that tracks five sacred elements of time — Tithi, Vara, Nakshatra, Yoga, and Karana — helping you align daily actions with cosmic rhythms.",
          author: { "@type": "Organization", name: "Divine Panchang" },
          publisher: { "@type": "Organization", name: "Divine Panchang", url: siteConfig.websiteUrl },
          url: siteConfig.websiteUrl + "/blog/what-is-panchang",
          datePublished: "2026-06-04",
          dateModified: "2026-06-04",
        }}
      />

      <div className="container mx-auto px-4 py-10 max-w-3xl">

        {/* Back link */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
              <Tag className="w-3 h-3" /> Vedic Wisdom
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" /> 7 min read
            </span>
            <span className="text-xs text-muted-foreground">June 4, 2026</span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            What is Panchang? A Complete Guide to the Hindu Calendar
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Panchang is far more than a calendar. It is a living map of time — rooted in astronomy, refined over millennia, and designed to help you move through each day in alignment with natural rhythms.
          </p>

          <div className="mt-6 flex items-center gap-2">
            <span className="h-px w-12 bg-gradient-to-r from-primary to-accent rounded-full" />
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="h-px w-12 bg-gradient-to-l from-primary to-accent rounded-full" />
          </div>
        </motion.div>

        {/* Article body */}
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none text-foreground/85 leading-relaxed space-y-8"
        >

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">The Meaning of the Word</h2>
            <p>
              The word <strong>Panchang</strong> comes from Sanskrit: <em>Pancha</em> means five, and <em>Anga</em> means limb or element. A Panchang, therefore, is a fivefold almanac — a document that records five fundamental dimensions of time as understood by Vedic astronomy and astrology.
            </p>
            <p className="mt-3">
              Unlike a standard Western calendar, which tracks only the solar day, the Panchang weaves together the movements of the Sun, Moon, and planets into a coherent daily picture. It has been used across India for thousands of years to determine the best times for everything from starting a business to performing a wedding, from planting crops to beginning a journey.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">The Five Limbs of Panchang</h2>
            <p>Each of the five elements of Panchang tracks a different quality of time:</p>

            <div className="mt-5 space-y-5">

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">1. Tithi — The Lunar Day</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tithi is determined by the angular relationship between the Sun and Moon. Each Tithi spans the time it takes the Moon to move 12° ahead of the Sun. There are 30 Tithis in a lunar month — 15 in the waxing phase (Shukla Paksha) and 15 in the waning phase (Krishna Paksha). Each Tithi has its own energy and is considered auspicious or inauspicious for specific activities. For example, the Ekadashi Tithi (11th lunar day) is sacred for fasting and spiritual practice.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">2. Vara — The Day of the Week</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Vara is the day of the week, each ruled by a planet. Sunday (Ravivar) is ruled by the Sun, Monday (Somvar) by the Moon, Tuesday (Mangalvar) by Mars, Wednesday (Budhvar) by Mercury, Thursday (Guruvar) by Jupiter, Friday (Shukravar) by Venus, and Saturday (Shanivar) by Saturn. The ruling planet of a Vara influences the general quality of that day, making certain activities more naturally aligned — Thursday, for instance, is ideal for beginning education, as Jupiter governs wisdom.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">3. Nakshatra — The Lunar Mansion</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The zodiac is divided into 27 Nakshatras (lunar mansions), each spanning 13°20' of the ecliptic. The Nakshatra of a given day is determined by which of these star clusters the Moon occupies. Each Nakshatra has a distinct deity, ruling planet, and quality — some are fixed and good for stable activities like construction, others are moveable and good for travel, and some are sharp and suited for confrontation or surgery. Knowing the daily Nakshatra helps you tailor your actions to the day's deepest character.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">4. Yoga — The Luni-Solar Combination</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Yoga is calculated by adding the longitudes of the Sun and Moon and dividing by 13°20'. This produces 27 Yogas, ranging from highly auspicious (like Siddhi, Amrita, and Shubha) to inauspicious ones (like Vishkambha, Atiganda, and Vyaghata). Each Yoga is said to impart a particular flavour to the day's activities. Panchang-aware practitioners avoid major new beginnings during challenging Yogas and schedule important events on auspicious ones.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-1">5. Karana — The Half-Tithi</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A Karana is half of a Tithi — approximately 6 hours long. There are 11 Karanas in total (4 fixed, 7 repeating), and two occur each day. Each Karana has its own ruling deity and characteristics. Karana provides a fine-grained look at the energy of a specific time window within the day. Bava Karana, for example, is excellent for starting new work, while Vishti (Bhadra) Karana is traditionally avoided for auspicious events.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Why Does Panchang Matter Today?</h2>
            <p>
              In an age of digital calendars and atomic clocks, the Panchang offers something these tools cannot: a qualitative understanding of time. Modern timekeeping tells you <em>when</em>; the Panchang tells you <em>what kind of when</em>.
            </p>
            <p className="mt-3">
              This is why millions of families across India — and increasingly around the world — still consult the Panchang before fixing a date for a wedding, naming a child, moving into a new home, or launching a business. It is not superstition. It is a sophisticated system that treats time as alive, dynamic, and full of varying potential.
            </p>
            <p className="mt-3">
              Modern research in chronobiology has confirmed that the Moon's cycles affect human sleep, mood, and even surgical outcomes. The tidal forces that pull at the oceans also act — subtly — on the water in our bodies. The Panchang, developed by careful astronomical observation long before such research existed, had already mapped these rhythms and built a practical framework around them.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Special Times in the Panchang</h2>
            <p>Beyond the five limbs, the daily Panchang also notes several important time windows:</p>
            <ul className="mt-3 space-y-2 list-none pl-0">
              <li className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Brahma Muhurta</strong> — approximately 1.5 hours before sunrise, considered the most powerful time for meditation, study, and spiritual practice.</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Abhijit Muhurta</strong> — around solar noon, universally auspicious for starting any new venture.</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Rahu Kaal</strong> — an inauspicious period each day ruled by Rahu, traditionally avoided for new beginnings.</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Gulika Kaal</strong> — another inauspicious window, particularly avoided for travel and new ventures.</span></li>
              <li className="flex gap-2"><span className="text-primary font-bold">•</span><span><strong>Yamaganda</strong> — a period governed by Yama (the deity of death), avoided for important new undertakings.</span></li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">How to Use the Panchang Daily</h2>
            <p>
              You don't need to be an astrologer to benefit from the Panchang. Begin with these simple practices:
            </p>
            <ol className="mt-3 space-y-2 list-none pl-0 counter-reset-none">
              <li className="flex gap-2"><span className="text-primary font-semibold">1.</span><span>Check the <strong>Tithi</strong> each morning. Ekadashi and Purnima (full moon) are powerful days for fasting and prayer. Amavasya (new moon) is for ancestral remembrance.</span></li>
              <li className="flex gap-2"><span className="text-primary font-semibold">2.</span><span>Avoid <strong>Rahu Kaal</strong> for launching new projects, signing contracts, or important meetings. The timing varies daily by city.</span></li>
              <li className="flex gap-2"><span className="text-primary font-semibold">3.</span><span>Note the <strong>Nakshatra</strong> for the day. If the Moon is in Rohini or Pushya, it's an especially favourable day for new beginnings and nurturing relationships.</span></li>
              <li className="flex gap-2"><span className="text-primary font-semibold">4.</span><span>Use <strong>Abhijit Muhurta</strong> (roughly 11:48 AM to 12:36 PM solar time) for any important first step — a phone call, a proposal, a decision.</span></li>
            </ol>
            <p className="mt-4">
              Over time, living with the Panchang becomes natural — not a burden of superstition, but a gentle awareness of the tides of time. It shifts the relationship to daily life from reactive to intentional.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Panchang and the Larger Vedic System</h2>
            <p>
              The Panchang does not stand alone. It is part of the larger Jyotisha (Vedic astrology) tradition, which includes the birth chart (Kundali), planetary transits (Gochar), Dasha systems, and more. But if Jyotisha is a vast ocean, the daily Panchang is your entrance into it — immediate, practical, and universally accessible.
            </p>
            <p className="mt-3">
              For those new to Vedic wisdom, the Panchang is the perfect starting point. It requires no special knowledge of your birth chart. It simply asks you to pay attention to the sky, to time, and to the natural intelligence woven into each passing day.
            </p>
          </section>

          {/* CTA */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6 mt-8">
            <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Check Today's Panchang</h3>
            <p className="text-sm text-muted-foreground mb-4">
              See today's Tithi, Nakshatra, Yoga, Karana, Rahu Kaal, and auspicious timings — calculated precisely for your location.
            </p>
            <Link
              to="/panchang"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              View Today's Panchang <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </motion.article>

        {/* Footer nav */}
        <div className="mt-12 pt-8 border-t border-border flex items-center justify-between">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> All articles
          </Link>
          <Link to="/blog/sade-sati-guide" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
            Next: Sade Sati Guide <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </Layout>
  );
};

export default WhatIsPanchang;
