import { motion } from "framer-motion";
import { ArrowRight, Calendar, Info, Moon, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SeoHead } from "@/components/shared/SeoHead";
import { AdSenseBanner } from "@/components/shared/AdSenseBanner";
import { EKADASHI_DATA } from "@/lib/data/ekadashi";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What is Ekadashi?",
    a: "Ekadashi is the eleventh lunar day of both waxing and waning fortnights. It is traditionally observed as a day of restraint, simplicity, prayer, and Vishnu devotion.",
  },
  {
    q: "How many Ekadashis are there in a year?",
    a: "Most years contain 24 Ekadashis. A leap month year can include two additional observances such as Padmini and Parama Ekadashi.",
  },
  {
    q: "Can beginners observe Ekadashi?",
    a: "Yes. A gentle grain-free sattvic fast with prayer and mental discipline is a valid way to begin. Devotion matters more than austerity.",
  },
  {
    q: "When should the fast be broken?",
    a: "Parana is observed on Dwadashi during a specific morning window. The exact timing varies by location and sunrise, so users should verify it against the daily Panchang for their city.",
  },
];

const getZonedDateString = (date: Date, timeZone = "Asia/Kolkata") => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${map.year}-${map.month}-${map.day}`;
};

const formatDisplayDate = (value: string, timeZone = "Asia/Kolkata") =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));

export default function EkadashiPage() {
  const todayStr = getZonedDateString(new Date());

  const todaysEkadashi = EKADASHI_DATA.find((entry) => entry.date === todayStr) ?? null;
  const todaysParana = EKADASHI_DATA.find((entry) => entry.paranaDate === todayStr) ?? null;
  const nextUpcomingEkadashi =
    EKADASHI_DATA.find((entry) => entry.date > todayStr) ?? EKADASHI_DATA[EKADASHI_DATA.length - 1];

  const featuredEkadashi = todaysEkadashi ?? nextUpcomingEkadashi;
  const diffDays = Math.round(
    (new Date(`${featuredEkadashi.date}T00:00:00`).getTime() - new Date(`${todayStr}T00:00:00`).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const countdownText =
    diffDays === 0 ? "Today!" : diffDays === 1 ? "Tomorrow!" : `Coming in ${diffDays} days`;
  const heroBadgeText = todaysEkadashi ? "TODAY'S OBSERVANCE" : "UPCOMING OBSERVANCE";
  const intentionText = todaysEkadashi
    ? "I resolve to clean my thoughts, speak gently, and fast according to my physical capacity today to invite peace and Vishnu's light into my life."
    : "I prepare calmly, simplify my schedule, and hold space for a cleaner, more devotional Ekadashi observance.";

  const upcomingEkadashis = EKADASHI_DATA.filter((entry) => entry.date >= todayStr).slice(0, 6);

  return (
    <Layout>
      <SeoHead
        title="Ekadashi Calendar 2026 | Fasting Dates, Timings & Vrata Levels"
        description="Plan your Ekadashi vrata with a reliable 2026 calendar, upcoming dates, parana windows, and beginner-friendly fasting guidance."
        path="/ekadashi"
        type="article"
        keywords="ekadashi calendar 2026, ekadashi dates, parana time, ekadashi fast guide, upcoming ekadashi"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Ekadashi Calendar 2026",
            description:
              "A practical Ekadashi guide with upcoming fasting dates, parana windows, and simple observance guidance.",
            author: {
              "@type": "Organization",
              name: "Divine Panchang Editorial Team",
            },
            publisher: {
              "@type": "Organization",
              name: "Divine Panchang",
            },
            mainEntityOfPage: "https://www.divinepanchang.space/ekadashi",
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

      <div className="container mx-auto max-w-6xl px-4 pb-16">
        <PageHeader
          title="Ekadashi Calendar & Spiritual Guide"
          subtitle="A cleaner, auto-updating Ekadashi companion for fasting dates, parana timing context, and the next observance."
          icon={<Moon className="h-8 w-8 text-primary" />}
        />

        <div className="mb-8 flex flex-col items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:text-sm">
          <div className="flex items-center gap-2.5">
            <Info className="h-5 w-5 flex-shrink-0 text-primary" />
            <span>
              <strong>Note on Accuracy:</strong> Ekadashi and Dwadashi Parana times vary by timezone and sunrise.
              Use our{" "}
              <Link
                to="/panchang"
                className="font-semibold text-primary underline underline-offset-2 hover:text-primary-dark"
              >
                Daily Panchang
              </Link>{" "}
              for exact tithi timings in your city.
            </span>
          </div>
          <Link
            to="/panchang"
            className="hidden items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:underline sm:inline-flex"
          >
            Check Panchang <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="relative overflow-hidden rounded-3xl border-2 border-sacred-amber/30 bg-gradient-to-br from-sacred-cream/40 via-card to-sacred-amber/10 p-6 shadow-glow-saffron md:p-8">
            <div className="absolute right-0 top-0 -z-10 h-40 w-40 rounded-full bg-sacred-amber/5 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 -z-10 h-48 w-48 rounded-full bg-primary/5 blur-2xl" />

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {heroBadgeText}
              </div>
              <span className="font-display text-lg font-bold tracking-wider text-sacred-amber">⏳ {countdownText}</span>
            </div>

            <div className="grid items-center gap-6 md:grid-cols-12">
              <div className="space-y-4 md:col-span-8">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-widest text-muted-foreground">
                    {featuredEkadashi.hinduMonth} Month · {featuredEkadashi.paksha} Paksha
                  </p>
                  <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                    {featuredEkadashi.name}
                  </h2>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                  {featuredEkadashi.shortMeaning}
                </p>

                <div className="grid gap-3 rounded-2xl border border-border/50 bg-card/60 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <span className="block text-xs text-muted-foreground">Fasting Date</span>
                    <strong className="text-foreground">
                      {featuredEkadashi.date} ({featuredEkadashi.weekday})
                    </strong>
                  </div>
                  <div>
                    <span className="block text-xs text-muted-foreground">Suggested Parana Window</span>
                    <strong className="text-foreground">
                      {featuredEkadashi.paranaTime} on {featuredEkadashi.paranaDate}
                    </strong>
                  </div>
                </div>

                {todaysParana && !todaysEkadashi && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
                    <strong className="mr-1">Parana today:</strong>
                    Break the fast for <span className="font-semibold">{todaysParana.name}</span> during{" "}
                    <span className="font-semibold">{todaysParana.paranaTime}</span>.
                  </div>
                )}

                <div className="space-y-1.5 border-l-2 border-primary/40 pl-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Suggested Sankalp (Intention)
                  </p>
                  <p className="text-sm italic text-foreground">"{intentionText}"</p>
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3 md:col-span-4">
                <div className="space-y-2 rounded-2xl border border-primary/10 bg-primary/5 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Today's Mantra
                  </p>
                  <p className="break-words font-display text-sm font-bold text-primary">
                    {featuredEkadashi.mantra}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Link to="/panchang" className="w-full">
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow transition hover:bg-primary-dark sm:text-sm">
                      <Calendar className="h-4 w-4" /> View Today's Panchang
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      const element = document.getElementById("vrata-guide");
                      element?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full rounded-xl border border-border bg-card py-3 text-xs font-bold text-foreground transition hover:bg-muted/30 sm:text-sm"
                  >
                    Prepare for Ekadashi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-10 rounded-3xl border border-border/70 bg-card/80 p-5 shadow-soft">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8a6a2f]">
                Upcoming Dates
              </p>
              <h3 className="mt-1 font-display text-2xl font-semibold text-foreground">
                Auto-updated Ekadashi schedule
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing from <span className="font-medium text-foreground">{formatDisplayDate(todayStr)}</span>
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcomingEkadashis.map((ekadashi, index) => {
              const isFeatured = ekadashi.id === featuredEkadashi.id;
              const isParanaToday = ekadashi.paranaDate === todayStr;

              return (
                <div
                  key={ekadashi.id}
                  className={cn(
                    "rounded-2xl border p-4 transition-colors",
                    isFeatured ? "border-primary/30 bg-primary/5" : "border-border/70 bg-background/80",
                  )}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {ekadashi.hinduMonth} · {ekadashi.paksha}
                      </p>
                      <h4 className="mt-1 font-display text-lg font-semibold text-foreground">
                        {ekadashi.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      {isFeatured ? (
                        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                          {todaysEkadashi ? "Today" : "Next"}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">{ekadashi.shortMeaning}</p>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Fasting date</span>
                      <span className="font-medium text-foreground">{formatDisplayDate(ekadashi.date)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Parana</span>
                      <span className="font-medium text-foreground">{formatDisplayDate(ekadashi.paranaDate)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Window</span>
                      <span className="font-medium text-foreground">{ekadashi.paranaTime}</span>
                    </div>
                  </div>

                  {isParanaToday && (
                    <div className="mt-4 rounded-xl border border-sacred-amber/30 bg-sacred-amber/10 px-3 py-2 text-xs font-medium text-foreground">
                      Parana for this Ekadashi is due today.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <AdSenseBanner adSlot="ekadashi_top_banner" adFormat="horizontal" />

        <div id="vrata-guide" className="mb-14 scroll-mt-6">
          <div className="mb-8 text-center">
            <h2 className="mb-3 font-display text-2xl font-bold text-foreground sm:text-3xl">
              Ekadashi Vrata Levels
            </h2>
            <p className="mx-auto max-w-xl text-sm text-muted-foreground">
              Choose the fasting level that aligns with your health, devotion, and life stage. All levels are spiritually valid.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                level: "Level 1 — Satvic",
                emoji: "🌿",
                desc: "Avoid grains, lentils, and non-veg. Eat fruits, nuts, milk, sabudana, and sendha namak. Ideal for beginners and families.",
                tag: "Beginner-Friendly",
              },
              {
                level: "Level 2 — Phalahar",
                emoji: "🍎",
                desc: "Consume only fresh fruits and water through the day. No cooked food. It supports mental clarity and devotional steadiness.",
                tag: "Intermediate",
              },
              {
                level: "Level 3 — Nirjala",
                emoji: "✨",
                desc: "Complete fast without food or water from sunrise to sunrise. This is a strict observance for healthy adults under guidance.",
                tag: "Advanced",
              },
            ].map((item) => (
              <div key={item.level} className="space-y-3 rounded-2xl border border-border bg-card p-5">
                <div className="text-3xl">{item.emoji}</div>
                <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {item.tag}
                </span>
                <h3 className="font-display text-base font-bold text-foreground">{item.level}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-14">
          <h2 className="mb-6 text-center font-display text-2xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-2 text-sm font-bold text-foreground">{faq.q}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <AdSenseBanner adSlot="ekadashi_bottom" adFormat="horizontal" />
      </div>
    </Layout>
  );
}
