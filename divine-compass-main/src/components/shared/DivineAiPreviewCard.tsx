import { Link } from "react-router-dom";
import { Bot, ChevronRight, MessageCircleQuestion } from "lucide-react";

import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { Button } from "@/components/ui/button";

interface DivineAiPreviewCardProps {
  title: string;
  description: string;
  source?: string;
  prompts: string[];
  ctaLabel?: string;
}

export const DivineAiPreviewCard = ({
  title,
  description,
  source = "default",
  prompts,
  ctaLabel = "Ask Divine AI Free",
}: DivineAiPreviewCardProps) => {
  const query = new URLSearchParams({ source }).toString();

  return (
    <SpiritualCard hover={false} className="overflow-hidden border-primary/15 bg-gradient-to-br from-white via-[#fff9f1] to-[#fff4e7]">
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              <Bot className="h-3.5 w-3.5" />
              Divine AI Guru
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground">{title}</h3>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>

          <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-white/80 text-primary md:flex">
            <MessageCircleQuestion className="h-6 w-6" />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {prompts.map((prompt) => (
            <div
              key={prompt}
              className="rounded-2xl border border-primary/10 bg-white/85 px-4 py-3 text-sm leading-relaxed text-foreground/80 shadow-sm"
            >
              {prompt}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Guidance stays practical, calm, and non-fear-based. Astrology data should inform the answer, not be invented by it.
          </p>

          <Button asChild variant="saffron" size="lg">
            <Link to={`/divine-ai?${query}`}>
              {ctaLabel}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </SpiritualCard>
  );
};
