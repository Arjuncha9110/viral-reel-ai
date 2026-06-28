import { useMemo, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bot, CalendarDays, ChevronRight, HeartHandshake, MessageCircleQuestion, MoonStar, ScrollText, ShieldCheck, Sparkles, Target } from "lucide-react";

import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { SeoHead } from "@/components/shared/SeoHead";
import { BirthDatePicker } from "@/components/shared/BirthDatePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DivineAiGoal,
  generateDivineAiGuidance,
  type DivineAiProfile,
  type DivineAiGuidance,
} from "@/lib/divineAiGuidance";

const goalOptions: { value: DivineAiGoal; label: string }[] = [
  { value: "career", label: "Career" },
  { value: "marriage", label: "Marriage" },
  { value: "money", label: "Money" },
  { value: "peace", label: "Peace" },
  { value: "health", label: "Health" },
  { value: "family", label: "Family" },
];

const sourceCopy: Record<string, { title: string; subtitle: string; prompts: string[] }> = {
  panchang: {
    title: "Ask Divine AI about today's Panchang",
    subtitle: "Use the day’s timing as a practical planning signal.",
    prompts: [
      "What should I focus on today?",
      "What should I avoid during the heavy hours?",
      "Give me one mantra and one action step.",
    ],
  },
  kundali: {
    title: "Ask Divine AI about your Kundali",
    subtitle: "Turn chart data into calmer, simpler guidance.",
    prompts: [
      "Explain my chart in simple words.",
      "What does my current phase want from me?",
      "Create my 30-day spiritual plan.",
    ],
  },
  "sade-sati": {
    title: "Ask Divine AI about your Saturn phase",
    subtitle: "Frame Sade Sati as discipline and clarity, not fear.",
    prompts: [
      "How should I handle my current Saturn phase?",
      "Give me one grounded Saturday discipline.",
      "What emotional pattern should I watch this week?",
    ],
  },
  match: {
    title: "Ask Divine AI about compatibility",
    subtitle: "Translate relationship astrology into practical language.",
    prompts: [
      "Explain this compatibility in practical terms.",
      "Where will communication need more patience?",
      "What should both partners consciously build?",
    ],
  },
  default: {
    title: "Ask Divine AI Guru",
    subtitle: "Your personal Vedic companion for daily clarity and reflection.",
    prompts: [
      "What should I focus on today?",
      "Give me one calm remedy and one action step.",
      "How do I create more discipline this week?",
    ],
  },
};

const sourceIcons: Record<string, typeof CalendarDays> = {
  panchang: CalendarDays,
  kundali: ScrollText,
  "sade-sati": MoonStar,
  match: HeartHandshake,
  default: Bot,
};

const DivineAiGuruPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const source = params.get("source") ?? "default";
  const sourceMeta = sourceCopy[source] ?? sourceCopy.default;
  const SourceIcon = sourceIcons[source] ?? sourceIcons.default;

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("07:00");
  const [goal, setGoal] = useState<DivineAiGoal>("peace");
  const [question, setQuestion] = useState(sourceMeta.prompts[0]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [guidance, setGuidance] = useState<DivineAiGuidance | null>(null);
  const resultRef = useRef<HTMLElement>(null);

  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState("");
  
  useEffect(() => {
    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
  }, []);

  const isCaptchaValid = parseInt(captchaInput) === captchaNum1 + captchaNum2;

  const profile: DivineAiProfile = useMemo(
    () => ({
      name: name.trim() || "Friend",
      birthDate,
      birthTime,
      goal,
      question,
      source,
    }),
    [birthDate, birthTime, goal, name, question, source],
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg("");
    setIsFallback(false);

    try {
      const response = await fetch("/api/ai/divine-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("Failed to generate guidance. Please try again.");
      }

      const data = await response.json();
      if (data.status === "fallback") {
        setIsFallback(true);
      }
      setGuidance(data.guidance);
      setHasGenerated(true);

      // Scroll to result after a short delay to allow render
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <SeoHead
        title="Divine AI Guru | Personal Vedic Guidance Companion"
        description="Ask Divine AI Guru about Panchang, Kundali, Sade Sati, daily guidance, remedies, reflection, and spiritual discipline."
        path="/divine-ai"
        type="website"
        keywords="AI astrology guide, vedic ai companion, daily spiritual guidance, ask divine ai"
      />

      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Divine AI Guru"
          subtitle="A calm Vedic companion built on your existing Panchang and astrology tools."
          icon={<Bot className="h-8 w-8" />}
        />

        <section className="mb-8 overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-[#fffaf3] via-[#fff7ef] to-[#fff1e1] shadow-[0_18px_48px_rgba(212,101,26,0.08)]">
          <div className="grid gap-8 px-6 py-8 md:px-8 md:py-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                <SourceIcon className="h-3.5 w-3.5" />
                {sourceMeta.title}
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-4xl font-bold leading-tight text-[#1a1440] md:text-5xl">
                  Guidance + reflection + daily discipline
                </h2>
                <p className="max-w-2xl text-lg leading-relaxed text-[#4a3818]/70">{sourceMeta.subtitle}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {sourceMeta.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setQuestion(prompt)}
                    className="rounded-2xl border border-primary/10 bg-white/85 px-4 py-4 text-left text-sm leading-relaxed text-foreground/80 shadow-sm transition hover:border-primary/30 hover:bg-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <SpiritualCard hover={false} className="border-primary/10 bg-white/85">
              <div className="space-y-5">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Free MVP</p>
                  <h3 className="font-display text-2xl font-semibold text-foreground">Generate today&apos;s Divine Guidance</h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="ai-name">Name</Label>
                    <Input id="ai-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Arun Sharma" />
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <BirthDatePicker value={birthDate} onChange={setBirthDate} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ai-birth-time">Birth Time</Label>
                    <Input id="ai-birth-time" type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Primary Goal</Label>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {goalOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGoal(option.value)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                          goal === option.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-foreground/75 hover:border-primary/30"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-question">Ask Divine AI</Label>
                  <Textarea
                    id="ai-question"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="What should I focus on today?"
                    className="min-h-[110px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-captcha">Human Verification: What is {captchaNum1} + {captchaNum2}?</Label>
                  <Input 
                    id="ai-captcha"
                    value={captchaInput} 
                    onChange={(e) => setCaptchaInput(e.target.value)} 
                    placeholder="Enter sum to continue" 
                    type="number"
                  />
                </div>

                <Button onClick={handleGenerate} disabled={isGenerating || !isCaptchaValid} variant="saffron" size="lg" className="w-full">
                  {isGenerating ? "Aligning Stars..." : "Generate My Divine Guidance"}
                  {!isGenerating && <ChevronRight className="h-4 w-4" />}
                </Button>
                {errorMsg && (
                  <p className="mt-2 text-center text-sm font-medium text-destructive">{errorMsg}</p>
                )}
              </div>
            </SpiritualCard>
          </div>
        </section>

        <section ref={resultRef} className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <SpiritualCard hover={false} className="border-primary/15 bg-gradient-to-br from-white to-[#fff8f0]">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Today&apos;s preview</p>
                    {isFallback && (
                      <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Preview Mode (Live Offline)
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-3xl font-semibold text-foreground">
                    {hasGenerated && guidance ? guidance.salutation : "Generate a personal preview"}
                  </h3>
                </div>
                <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary md:flex">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-primary/10 bg-white/90 p-5 shadow-sm">
                <h4 className="font-display text-2xl font-semibold text-[#1a1440]">
                  {guidance ? guidance.focusTitle : "Your guidance awaits..."}
                </h4>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {guidance ? guidance.summary : "Fill in the details above and click generate to receive your personalized Vedic guidance and reflection."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800">
                    <Target className="h-4 w-4" />
                    Do Today
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80">{guidance ? guidance.doToday : "..."}</p>
                </div>

                <div className="rounded-2xl border border-secondary/10 bg-secondary/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-secondary">
                    <ShieldCheck className="h-4 w-4" />
                    Avoid Today
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80">{guidance ? guidance.avoidToday : "..."}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-primary/10 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Mantra of the Day</p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{guidance ? guidance.mantra : "..."}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{guidance ? guidance.reflection : "..."}</p>
                </div>

                <div className="rounded-2xl border border-primary/10 bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Journal Prompt</p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80">{guidance ? guidance.journalPrompt : "..."}</p>
                </div>
              </div>
            </div>
          </SpiritualCard>

          <div className="space-y-6">
            <SpiritualCard hover={false} className="border-primary/12">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <MessageCircleQuestion className="h-5 w-5" />
                  <h3 className="font-display text-2xl font-semibold text-foreground">Suggested follow-up questions</h3>
                </div>

                <div className="space-y-3">
                  {(guidance?.followUpPrompts || sourceMeta.prompts).map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={isGenerating}
                      onClick={() => {
                        setQuestion(prompt);
                        // We do not auto-generate here, we let the user edit the prompt if they want
                        // setHasGenerated(true);
                      }}
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm leading-relaxed text-foreground/80 transition hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </SpiritualCard>

            <SpiritualCard hover={false} className="border-[#11213b]/10 bg-[#11213b] text-white">
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f08040]">Next monetization layer</p>
                <h3 className="font-display text-3xl font-semibold">Unlock a 30-day Divine Plan</h3>
                <p className="text-sm leading-relaxed text-white/65">
                  The natural upgrade path is a saved profile, daily guidance dashboard, 3 free AI questions per day,
                  and a paid monthly plan or one-time 30-day PDF.
                </p>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-relaxed text-white/75">
                  Keep astrology calculations separate from AI explanations. The AI should explain structured chart and
                  Panchang data, not invent planetary facts.
                </div>

                <Button asChild variant="saffron" size="lg" className="w-full">
                  <Link to="/register">
                    Save My Divine Profile
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </SpiritualCard>
          </div>
        </section>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          {guidance ? guidance.disclaimer : "Divine AI Guru offers spiritual reflection and practical Vedic framing. It does not replace medical, legal, financial, or mental health advice."}
        </p>
      </div>
    </Layout>
  );
};

export default DivineAiGuruPage;
