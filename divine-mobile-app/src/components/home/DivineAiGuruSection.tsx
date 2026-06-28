import { Link } from "react-router-dom";
import { Bot, BrainCircuit, CalendarClock, ChevronRight, ScrollText, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

const featureCards = [
  {
    icon: CalendarClock,
    title: "Daily Divine Guidance",
    description: "See today's Panchang signal, one practical action, one calm remedy, and one reflection question.",
  },
  {
    icon: ScrollText,
    title: "Explain My Kundali",
    description: "Turn charts, dashas, and yogas into simple language a normal user can actually apply.",
  },
  {
    icon: BrainCircuit,
    title: "Ask Divine AI",
    description: "Ask about timing, discipline, relationships, Saturn phases, journaling, and spiritual habits.",
  },
];

export const DivineAiGuruSection = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,101,26,0.09),transparent_38%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(15,26,48,0.07),transparent_38%)]" />

      <div className="container relative mx-auto px-4">
        <div className="overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-[#fffaf3] via-[#fff7ee] to-[#fff1e2] shadow-[0_24px_60px_rgba(212,101,26,0.08)]">
          <div className="grid gap-10 px-6 py-8 md:px-10 md:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                <Bot className="h-3.5 w-3.5" />
                Next Big Upgrade
              </div>

              <div className="space-y-4">
                <h2 className="font-display text-4xl font-bold leading-tight text-[#1a1440] md:text-5xl">
                  Meet <span className="text-gradient-saffron">Divine AI Guru</span>
                </h2>
                <p className="max-w-2xl text-lg leading-relaxed text-[#4a3818]/70">
                  Turn Divine Panchang from a calculator website into a daily spiritual companion. Ask about your
                  Panchang, Kundali, Sade Sati, relationships, and journaling in one calm, practical flow.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {featureCards.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="rounded-2xl border border-primary/10 bg-white/85 p-4 shadow-sm">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-sacred-amber text-primary-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#11213b]/10 bg-[#11213b] p-6 text-white shadow-[0_30px_80px_rgba(12,22,40,0.22)] md:p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f08040]">Preview</p>
                    <h3 className="mt-2 font-display text-3xl font-semibold leading-tight">Your personal Vedic AI companion</h3>
                  </div>
                  <div className="hidden h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 md:flex">
                    <Sparkles className="h-6 w-6 text-[#f08040]" />
                  </div>
                </div>

                <div className="space-y-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-sm text-white/65">Good morning, Arun.</p>
                  <p className="text-base leading-relaxed text-white/85">
                    Today&apos;s Panchang shows a reflective energy. Your guidance is to choose patient action over emotional urgency.
                    Complete one pending task before starting a new one.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#f08040]">Mantra</p>
                      <p className="mt-2 text-sm text-white/85">Om Namah Shivaya</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-[#f08040]">Journal Prompt</p>
                      <p className="mt-2 text-sm text-white/85">What responsibility am I avoiding today?</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="saffron" size="lg" className="sm:flex-1">
                    <Link to="/divine-ai">
                      Ask Divine AI Free
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="spiritual" size="lg" className="border-white/15 bg-white/5 text-white hover:bg-white/10 sm:flex-1">
                    <Link to="/janam-kundli">Use with my Kundali</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
