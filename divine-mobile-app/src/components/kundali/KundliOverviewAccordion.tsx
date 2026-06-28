import { Lock, User, Calendar, Star, ScrollText, ShieldAlert, Sparkles, BookOpen } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { BirthMetadata } from "@/lib/astro/birthMetadata";

const PreviewBlock = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-3 rounded-xl bg-[#fcf7ec]/60 border border-[#e4cfa0]/30 p-4">
    <Lock className="h-5 w-5 text-[#d4651a] shrink-0 mt-0.5" />
    <div>
      <p className="font-semibold text-[#1c1408] flex items-center gap-2">
        Available in Full Report
        <span className="rounded-full bg-[#d4651a]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#a84810]">
          Preview
        </span>
      </p>
      <p className="mt-1 text-[#5a4025]/80">{children}</p>
    </div>
  </div>
);

export const KundliOverviewAccordion = ({ metadata }: { metadata: BirthMetadata | null }) => {
  return (
    <div className="rounded-2xl border border-[#e4cfa0]/60 bg-[#fffdf8] shadow-[0_8px_32px_rgba(181,148,73,0.06)] overflow-hidden">
      <div className="bg-gradient-to-r from-[#fdfbf6] via-[#f9f3e5] to-[#fdfbf6] p-5 border-b border-[#e4cfa0]/40">
        <h3 className="font-display text-xl font-bold text-[#1c1408] flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-[#d4651a]" /> Kundli Overview — Table of Predictions
        </h3>
        <p className="text-sm text-[#5a4025]/70 mt-1">
          Chapter-by-chapter map of your birth chart. Calculated details are shown live; deep predictive readings are part of the full report.
        </p>
      </div>
      <div className="px-5 pb-2">
        <Accordion type="single" collapsible defaultValue="profile" className="w-full">
          {/* Chapter 1 — Birth Profile (REAL) */}
          <AccordionItem value="profile" className="border-b border-[#e4cfa0]/30 py-1">
            <AccordionTrigger className="hover:no-underline hover:bg-transparent data-[state=open]:text-[#d4651a] transition-colors">
              <div className="flex items-center gap-3 font-semibold text-[15px]">
                <BookOpen className="h-4 w-4" /> Your Birth Profile
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Live
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed pt-2 pb-5">
              {metadata ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    ["Lagna (Ascendant)", metadata.lagna],
                    ["Lagna Lord", metadata.lagnaLord],
                    ["Birth Rasi (Moon)", metadata.moonSign],
                    ["Rasi Lord", metadata.moonSignLord],
                    ["Birth Star", `${metadata.nakshatra} (Pada ${metadata.pada})`],
                    ["Sun Sign", metadata.sunSign],
                    ["Tithi", metadata.tithi],
                    ["Nitya Yoga", metadata.yoga],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3 rounded-lg bg-[#fcf7ec]/50 border border-[#e4cfa0]/25 px-3 py-2">
                      <span className="text-[#5a4025]/75">{label}</span>
                      <span className="font-semibold text-[#1c1408] text-right">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#5a4025]/70">Generate your chart to see your live birth profile here.</p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Chapter 2 — Characteristics (PREVIEW) */}
          <AccordionItem value="characteristics" className="border-b border-[#e4cfa0]/30 py-1">
            <AccordionTrigger className="hover:no-underline hover:bg-transparent data-[state=open]:text-[#d4651a] transition-colors">
              <div className="flex items-center gap-3 font-semibold text-[15px]">
                <User className="h-4 w-4" /> Your Characteristics & Behaviour
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed pt-2 pb-5">
              <PreviewBlock>
                A detailed reading of your core personality, psychological patterns, and behavioural tendencies — interpreted from your Lagna, Moon, and planetary placements — is part of the premium report.
              </PreviewBlock>
            </AccordionContent>
          </AccordionItem>

          {/* Chapter 3 — Influences (PREVIEW) */}
          <AccordionItem value="influences" className="border-b border-[#e4cfa0]/30 py-1">
            <AccordionTrigger className="hover:no-underline hover:bg-transparent data-[state=open]:text-[#d4651a] transition-colors">
              <div className="flex items-center gap-3 font-semibold text-[15px]">
                <Star className="h-4 w-4" /> Influences on Your Life
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed pt-2 pb-5">
              <PreviewBlock>
                The planetary influences shaping your destiny — including karmic lessons and major life themes from your chart's geometry — are covered in the full report.
              </PreviewBlock>
            </AccordionContent>
          </AccordionItem>

          {/* Chapter 4 — Favourable Periods (PREVIEW) */}
          <AccordionItem value="favourable" className="border-b border-[#e4cfa0]/30 py-1">
            <AccordionTrigger className="hover:no-underline hover:bg-transparent data-[state=open]:text-[#d4651a] transition-colors">
              <div className="flex items-center gap-3 font-semibold text-[15px]">
                <Calendar className="h-4 w-4" /> Favourable Periods
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed pt-2 pb-5">
              <PreviewBlock>
                Your most auspicious windows for marriage, career moves, and major decisions — based on Vimshottari Dasha and transits — are unlocked in the full report.
              </PreviewBlock>
            </AccordionContent>
          </AccordionItem>

          {/* Chapter 5 — Prediction Summary (PREVIEW) */}
          <AccordionItem value="summary" className="border-b border-[#e4cfa0]/30 py-1">
            <AccordionTrigger className="hover:no-underline hover:bg-transparent data-[state=open]:text-[#d4651a] transition-colors">
              <div className="flex items-center gap-3 font-semibold text-[15px]">
                <Sparkles className="h-4 w-4" /> Prediction Summary
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed pt-2 pb-5">
              <PreviewBlock>
                A consolidated life-prediction summary across health, wealth, relationships, and career is generated in the full personalised report.
              </PreviewBlock>
            </AccordionContent>
          </AccordionItem>

          {/* Chapter 6 — Remedies / Dosha / Yoga (MIXED: real dosha line + preview) */}
          <AccordionItem value="remedies" className="py-1 border-none">
            <AccordionTrigger className="hover:no-underline hover:bg-transparent data-[state=open]:text-[#d4651a] transition-colors">
              <div className="flex items-center gap-3 font-semibold text-[15px]">
                <ShieldAlert className="h-4 w-4" /> Remedies, Dosha & Yoga
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed pt-2 pb-5 space-y-3">
              {metadata?.mangalDosha !== null && metadata?.mangalDosha !== undefined && (
                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                  <p className="font-semibold text-[#1c1408] flex items-center gap-2">
                    Mangal Dosha
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Live
                    </span>
                  </p>
                  <p className="mt-1 text-[#5a4025]/80">
                    {metadata.mangalDosha ? "Present" : "Not present"} — {metadata.mangalDoshaNote}
                  </p>
                </div>
              )}
              <PreviewBlock>
                Personalised remedies (gemstones, mantras, charities), full dosha analysis, and the complete list of yogas formed in your chart are part of the full report.
              </PreviewBlock>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};
