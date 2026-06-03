import { motion } from "framer-motion";
import { Star, RefreshCw, HelpCircle, BookOpen } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SeoHead } from "@/components/shared/SeoHead";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { Link } from "react-router-dom";

// Helper function to calculate the current weekly range starting from the most recent Tuesday
function getWeeklyDateRange(): { start: Date; end: Date; label: string } {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, etc.
  const daysToSubtract = (currentDay - 2 + 7) % 7; 
  const start = new Date(today);
  start.setDate(today.getDate() - daysToSubtract);
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  const optionsStart: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
  const optionsEnd: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  
  let label = "";
  if (start.getFullYear() !== end.getFullYear()) {
    label = `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} – ${end.toLocaleDateString('en-US', optionsEnd)}`;
  } else if (start.getMonth() !== end.getMonth()) {
    label = `${start.toLocaleDateString('en-US', optionsStart)} – ${end.toLocaleDateString('en-US', optionsEnd)}`;
  } else {
    label = `${start.toLocaleDateString('en-US', optionsStart)} – ${end.getDate()}, ${start.getFullYear()}`;
  }
  
  return { start, end, label };
}

const signs = [
  {
    sign: "Aries", sanskrit: "Mesha", symbol: "♈", element: "Fire",
    theme: "Patience with momentum",
    guidance: "Mars, your ruler, pushes you toward fast decisions this week — but Mercury's position rewards careful communication over impulse. Focus on one priority, not five.",
    muhurat: "Tuesday and Thursday are strong action days.",
    caution: "Avoid financial commitments made in haste before Wednesday.",
  },
  {
    sign: "Taurus", sanskrit: "Vrishabha", symbol: "♉", element: "Earth",
    theme: "Stability over speed",
    guidance: "Venus brings clarity to relationships and creative work. This is a week for deepening what already exists rather than starting new ventures. Home and family deserve attention.",
    muhurat: "Friday is particularly auspicious for important conversations.",
    caution: "Resist the urge to overspend on comfort or aesthetics mid-week.",
  },
  {
    sign: "Gemini", sanskrit: "Mithuna", symbol: "♊", element: "Air",
    theme: "Communication is your currency",
    guidance: "Mercury in a supportive position amplifies your natural gift for words. Writing, speaking, networking, and learning all carry positive energy. A delayed response is not rejection.",
    muhurat: "Wednesday is your peak day — schedule important calls or meetings.",
    caution: "Scattered energy is the main risk. Choose two goals, not ten.",
  },
  {
    sign: "Cancer", sanskrit: "Karka", symbol: "♋", element: "Water",
    theme: "Protect your inner world",
    guidance: "The Moon's influence brings heightened sensitivity this week. Your intuition is accurate — trust it on personal matters. Avoid environments that drain rather than restore.",
    muhurat: "Monday and the early part of Thursday support inner work and rest.",
    caution: "Don't make major decisions when emotionally reactive. Wait 24 hours.",
  },
  {
    sign: "Leo", sanskrit: "Simha", symbol: "♌", element: "Fire",
    theme: "Lead without ego",
    guidance: "The Sun strengthens your natural leadership, but Jupiter nudges you toward generosity over recognition. Acts of genuine service this week return tenfold in goodwill.",
    muhurat: "Sunday opens the week with strong Leo energy — use it for bold intentions.",
    caution: "Pride in small disputes wastes energy better spent on bigger goals.",
  },
  {
    sign: "Virgo", sanskrit: "Kanya", symbol: "♍", element: "Earth",
    theme: "Detail work pays off",
    guidance: "Your analytical nature finds its best expression this week. Practical tasks — health routines, financial organization, skill-building — carry above-average results. A careful plan beats a bold guess.",
    muhurat: "Wednesday and Friday mornings are ideal for precision work.",
    caution: "Perfectionism can stall progress. Done is better than perfect.",
  },
  {
    sign: "Libra", sanskrit: "Tula", symbol: "♎", element: "Air",
    theme: "Choose your balance point",
    guidance: "Venus highlights partnerships — romantic, creative, or professional. A conversation you've been avoiding becomes easier to have. Harmony is possible if you lead with honesty rather than pleasing.",
    muhurat: "Friday is your most auspicious day for relationship matters.",
    caution: "Indecision has a cost this week. Trust your first calm instinct.",
  },
  {
    sign: "Scorpio", sanskrit: "Vrishchika", symbol: "♏", element: "Water",
    theme: "Depth over surface",
    guidance: "Mars and Ketu together bring strong transformative energy. Research, investigation, shadow work, and anything requiring focus and intensity are well-supported. Avoid surface-level engagements.",
    muhurat: "Tuesday evenings carry strong Scorpio energy for deep work.",
    caution: "Intensity directed at others becomes conflict. Direct it inward.",
  },
  {
    sign: "Sagittarius", sanskrit: "Dhanu", symbol: "♐", element: "Fire",
    theme: "Expand, but stay grounded",
    guidance: "Jupiter's optimism is strong — ideas feel big and possible. Channel this into learning, travel planning, or philosophical exploration. Avoid making promises wider than your current capacity.",
    muhurat: "Thursday is your best day — Jupiter's day, your planet's day.",
    caution: "Over-commitment is the week's main risk. Say yes thoughtfully.",
  },
  {
    sign: "Capricorn", sanskrit: "Makara", symbol: "♑", element: "Earth",
    theme: "Steady action compounds",
    guidance: "Saturn rewards consistency. Whatever you've been building slowly is gaining momentum behind the scenes. Professional matters, long-term goals, and reputation all benefit from patient effort this week.",
    muhurat: "Saturday is Saturn's day and your strongest day for structure-building.",
    caution: "Isolation as a coping mechanism slows your growth. Stay connected.",
  },
  {
    sign: "Aquarius", sanskrit: "Kumbha", symbol: "♒", element: "Air",
    theme: "Innovation with intention",
    guidance: "Rahu amplifies your forward-thinking nature. New ideas around technology, community, or social change deserve attention. A collaboration that seemed unlikely becomes possible mid-week.",
    muhurat: "Saturday and Sunday carry helpful energy for unconventional approaches.",
    caution: "Detachment from emotion can read as coldness to those close to you.",
  },
  {
    sign: "Pisces", sanskrit: "Meena", symbol: "♓", element: "Water",
    theme: "Spiritual renewal",
    guidance: "Jupiter and Neptune blend Pisces energy into something deeply intuitive this week. Meditation, creative work, music, and prayer are especially rewarding. A dream or sudden insight carries a real message.",
    muhurat: "Thursday and Monday mornings support spiritual and creative work.",
    caution: "Boundaries are still needed. Compassion doesn't require self-sacrifice.",
  },
];

const faqs = [
  {
    q: "Is this weekly zodiac guidance based on Vedic or Western astrology?",
    a: "Divine Panchang follows the Vedic (Jyotish) system, which uses the sidereal zodiac. Your Vedic sun sign may differ by one sign from your Western sign. For accurate Vedic analysis, your moon sign (Chandra Rashi) is equally important.",
  },
  {
    q: "How often is the weekly zodiac guidance updated?",
    a: "Guidance is updated each week to reflect current planetary positions, nakshatra transitions, and panchang quality. Check back every Monday for the new week's guidance.",
  },
  {
    q: "How is this different from a personalised reading?",
    a: "Weekly guidance covers general trends for each sign. A personalised reading considers your exact birth time, place, rising sign, current dasha period, and natal chart. Use our Janam Kundali and Dasha Calculator for deeper personal insight.",
  },
  {
    q: "What is the difference between Sun sign and Moon sign in Vedic astrology?",
    a: "In Vedic astrology, the Moon sign (Chandra Rashi) is considered more important than the Sun sign for daily and weekly guidance, as the Moon reflects the mind and emotions. Your Moon sign is determined by the Moon's position at the time of your birth.",
  },
];

export default function WeeklyZodiacPage() {
  const weeklyRange = getWeeklyDateRange();

  return (
    <Layout>
      <SeoHead
        title={`Weekly Zodiac Guidance | Vedic Horoscope ${weeklyRange.label}`}
        description={`Read this week's Vedic zodiac guidance for all 12 signs, with calm timing cues and practical astrology-based reflection for ${weeklyRange.label}.`}
        path="/weekly-zodiac"
        type="article"
        keywords="weekly zodiac guidance, vedic weekly horoscope, this week astrology all signs, weekly rashi guidance"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Weekly Zodiac Guidance",
            description: `Vedic astrology guidance for all 12 signs for ${weeklyRange.label}.`,
            author: {
              "@type": "Organization",
              name: "Divine Panchang Editorial Team",
            },
            publisher: {
              "@type": "Organization",
              name: "Divine Panchang",
            },
            mainEntityOfPage: "https://www.divinepanchang.space/weekly-zodiac",
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          },
        ]}
      />
      <div className="container mx-auto px-4 pb-16">
        <PageHeader
          title="Weekly Zodiac Guidance"
          subtitle={`Vedic astrology insights for all 12 signs — ${weeklyRange.label}`}
          icon={<Star className="h-8 w-8 animate-pulse text-primary" />}
        />

        {/* Trust bar */}
        <div className="mb-8 rounded-2xl border border-border/50 bg-muted/30 px-6 py-4 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-center sm:text-left leading-relaxed">
            Prepared by the <strong className="text-foreground">Divine Panchang Editorial Team</strong> based on current planetary positions and Vedic Jyotish principles. Offered as spiritual reflection — not deterministic prediction.
          </p>
          <span className="inline-flex items-center gap-1.5 text-primary bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0">
            <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" /> Updated weekly · Last updated {weeklyRange.start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Sign cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {signs.map((s, i) => (
            <motion.div
              key={s.sign}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <SpiritualCard className="h-full">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{s.symbol}</span>
                        <div>
                          <h3 className="font-display text-lg font-bold text-foreground">{s.sign}</h3>
                          <p className="text-xs text-muted-foreground">{s.sanskrit} · {s.element}</p>
                          <p className="text-[10px] text-primary/70 font-semibold mt-1">Valid: {weeklyRange.label}</p>
                        </div>
                      </div>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{s.theme}</span>
                  </div>

                  {/* Guidance */}
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.guidance}</p>

                  {/* Muhurat & Caution */}
                  <div className="space-y-2">
                    <div className="rounded-xl bg-muted/30 px-3 py-2 text-xs">
                      <span className="font-semibold text-foreground">✨ Best timing: </span>
                      <span className="text-muted-foreground">{s.muhurat}</span>
                    </div>
                    <div className="rounded-xl bg-muted/20 border border-border/40 px-3 py-2 text-xs">
                      <span className="font-semibold text-foreground">⚠ Watch: </span>
                      <span className="text-muted-foreground">{s.caution}</span>
                    </div>
                  </div>
                </div>
              </SpiritualCard>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <SpiritualCard className="mb-6">
          <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-5">
            {faqs.map((faq, i) => (
              <div key={i} className="border-b border-border/50 pb-5 last:border-0 last:pb-0">
                <p className="font-semibold text-foreground mb-2">{faq.q}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </SpiritualCard>

        {/* Internal links */}
        <SpiritualCard className="mb-6">
          <h2 className="font-display text-xl font-bold text-foreground mb-4">Go Deeper with Your Chart</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Daily Panchang", path: "/panchang", desc: "Today's tithi & muhurat" },
              { label: "Janam Kundali", path: "/kundali", desc: "Personal birth chart" },
              { label: "Dasha Calculator", path: "/dasha", desc: "Your planetary periods" },
              { label: "Ekadashi Guide", path: "/ekadashi", desc: "Fasting & observance" },
            ].map((link) => (
              <Link key={link.path} to={link.path} className="group rounded-xl border border-border/60 bg-muted/20 p-4 hover:border-primary/40 hover:bg-primary/5 transition-colors">
                <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{link.label}</p>
                <p className="text-muted-foreground text-xs mt-1">{link.desc}</p>
              </Link>
            ))}
          </div>
        </SpiritualCard>

        {/* CTA */}
        <div className="rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 p-8 text-center mb-8">
          <h2 className="font-display text-2xl font-bold text-foreground mb-3">Explore Your Full Birth Chart</h2>
          <p className="text-muted-foreground text-sm mb-5 max-w-md mx-auto">
            Get a detailed Janma Kundali with planetary positions, dasha periods, and personalised interpretations.
          </p>
          <Link to="/kundali">
            <button className="rounded-xl bg-primary text-primary-foreground font-bold px-6 py-3 text-sm hover:brightness-110 transition">
              Generate My Kundali &rarr;
            </button>
          </Link>
        </div>

      </div>
    </Layout>
  );
}
