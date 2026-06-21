import { useMemo, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bot, CalendarDays, ChevronRight, HeartHandshake, MessageCircleQuestion, MoonStar, ScrollText, ShieldCheck, Sparkles, Target, Clock, BookOpen, User, MapPin } from "lucide-react";

import { Layout } from "@/components/layout/Layout";
import { PageHeader } from "@/components/shared/PageHeader";
import { SpiritualCard } from "@/components/shared/SpiritualCard";
import { SeoHead } from "@/components/shared/SeoHead";
import { BirthDatePicker } from "@/components/shared/BirthDatePicker";
import { LocationSelector, type LocationData } from "@/components/LocationSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DivineAiGoal,
  generateDivineAiGuidance,
  buildSourcePrompts,
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

const sourceCopy: Record<string, { title: string; subtitle: string }> = {
  panchang: {
    title: "Ask Divine AI about today's Panchang",
    subtitle: "Use the day’s timing as a practical planning signal.",
  },
  kundali: {
    title: "Ask Divine AI about your Kundali",
    subtitle: "Turn chart data into calmer, simpler guidance.",
  },
  "sade-sati": {
    title: "Ask Divine AI about your Saturn phase",
    subtitle: "Frame Sade Sati as discipline and clarity, not fear.",
  },
  match: {
    title: "Ask Divine AI about compatibility",
    subtitle: "Translate relationship astrology into practical language.",
  },
  default: {
    title: "Ask Divine AI Guru",
    subtitle: "Your personal Vedic companion for daily clarity and reflection.",
  },
};

const sourceIcons: Record<string, typeof CalendarDays> = {
  panchang: CalendarDays,
  kundali: ScrollText,
  "sade-sati": MoonStar,
  match: HeartHandshake,
  default: Bot,
};

const renderSafe = (val: any) => {
  if (!val) return "";
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.text || val.title || val.meaning || JSON.stringify(val);
  return String(val);
};

const renderMantraField = (val: any, field: 'title' | 'text' | 'meaning') => {
  if (!val) return "";
  if (typeof val === 'string') {
    if (field === 'title') return "Mantra";
    if (field === 'text') return val;
    return "";
  }
  if (typeof val === 'object') {
    return val[field] || "";
  }
  return "";
};

const DivineAiGuruPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const source = params.get("source") ?? "default";
  const sourceMeta = sourceCopy[source] ?? sourceCopy.default;
  const SourceIcon = sourceIcons[source] ?? sourceIcons.default;
  const initialPrompts = useMemo(() => buildSourcePrompts(source), [source]);

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("07:00");
  const [birthLocation, setBirthLocation] = useState<LocationData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [goal, setGoal] = useState<DivineAiGoal>("peace");
  const [question, setQuestion] = useState(initialPrompts[0]);
  
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [guidance, setGuidance] = useState<DivineAiGuidance | null>(null);
  const resultRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);

  const [captchaNum1, setCaptchaNum1] = useState(0);
  const [captchaNum2, setCaptchaNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [saveEmail, setSaveEmail] = useState("");
  const [savePhone, setSavePhone] = useState("");
  const [saveConsent, setSaveConsent] = useState(false);
  const [saveToast, setSaveToast] = useState("");

  useEffect(() => {
    const savedProfileStr = localStorage.getItem("divineAiProfile");
    if (savedProfileStr) {
      try {
        const saved = JSON.parse(savedProfileStr);
        if (saved.name) setName(saved.name);
        if (saved.birthDate) setBirthDate(saved.birthDate);
        if (saved.birthTime) setBirthTime(saved.birthTime);
        if (saved.birthLocation) setBirthLocation(saved.birthLocation);
        if (saved.currentLocation) setCurrentLocation(saved.currentLocation);
        if (saved.goal) setGoal(saved.goal);
        if (saved.email) setSaveEmail(saved.email);
        if (saved.phone) setSavePhone(saved.phone);
      } catch (e) {
        console.error("Failed to parse saved profile", e);
      }
    }
    
    const savedGuidanceStr = localStorage.getItem("divineAiLastGuidance");
    if (savedGuidanceStr) {
      try {
        setGuidance(JSON.parse(savedGuidanceStr));
        setHasGenerated(true);
      } catch (e) {
        console.error("Failed to parse saved guidance", e);
      }
    }

    setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
    setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
  }, []);

  const isCaptchaValid = parseInt(captchaInput) === captchaNum1 + captchaNum2;

  const profile: DivineAiProfile = useMemo(
    () => ({
      name: name.trim() || "Friend",
      birthDate,
      birthTime,
      birthPlace: birthLocation?.name,
      currentLocation: currentLocation?.name,
      goal,
      question,
      source,
      astrologyContext: {
        isFallback: true 
      }
    }),
    [birthDate, birthTime, birthLocation, currentLocation, goal, name, question, source],
  );

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Name is required.";
    if (!birthDate) errors.birthDate = "Date of Birth is required.";
    if (!birthTime) errors.birthTime = "Birth Time is required.";
    if (!birthLocation) errors.birthLocation = "Birth Place is required.";
    if (!currentLocation) errors.currentLocation = "Current Location is required.";
    if (!goal) errors.goal = "Primary goal is required.";
    if (!question.trim()) errors.question = "Question is required.";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerate = async () => {
    if (!validateForm()) {
      setErrorMsg("Please fill in all required fields.");
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    setIsGenerating(true);
    setErrorMsg("");
    setIsFallback(false);
    setFormErrors({});

    try {
      const response = await fetch("/api/ai/divine-guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("Failed to generate guidance.");
      }

      const data = await response.json();
      if (data.status === "fallback") {
        setIsFallback(true);
      }
      setGuidance(data.guidance);
      setHasGenerated(true);
      
      localStorage.setItem("divineAiProfile", JSON.stringify({
        name, birthDate, birthTime, birthLocation, currentLocation, goal, email: saveEmail, phone: savePhone
      }));
      localStorage.setItem("divineAiLastGuidance", JSON.stringify(data.guidance));

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      console.warn("API failed, using local deterministic fallback");
      const fallback = generateDivineAiGuidance(profile);
      setGuidance(fallback);
      setHasGenerated(true);
      setIsFallback(true);
      localStorage.setItem("divineAiLastGuidance", JSON.stringify(fallback));
      
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } finally {
      setIsGenerating(false);
      setCaptchaNum1(Math.floor(Math.random() * 10) + 1);
      setCaptchaNum2(Math.floor(Math.random() * 10) + 1);
      setCaptchaInput("");
    }
  };

  const handleSaveProfile = () => {
    if (!saveEmail || !saveConsent) {
      setSaveToast("Please provide your email and agree to receive updates.");
      return;
    }
    
    const saved = JSON.parse(localStorage.getItem("divineAiProfile") || "{}");
    saved.email = saveEmail;
    saved.phone = savePhone;
    localStorage.setItem("divineAiProfile", JSON.stringify(saved));
    
    setSaveToast("Your Divine Profile has been saved successfully!");
    setTimeout(() => {
      setSaveToast("");
      setModalOpen(false);
    }, 2000);
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

        <section ref={formRef} className="mb-8 overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-[#fffaf3] via-[#fff7ef] to-[#fff1e1] shadow-[0_18px_48px_rgba(212,101,26,0.08)]">
          <div className="grid gap-8 px-4 py-8 md:px-8 md:py-10 lg:grid-cols-[1.05fr_0.95fr]">
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

              <div className="grid gap-3 sm:grid-cols-2">
                {initialPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setQuestion(prompt);
                      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                    className="rounded-2xl border border-primary/10 bg-white/85 px-4 py-4 text-left text-sm leading-relaxed text-foreground/80 shadow-sm transition hover:border-primary/30 hover:bg-white active:scale-[0.98]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <SpiritualCard hover={false} className="border-primary/10 bg-white/85 p-5 md:p-8">
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Free MVP</p>
                  <h3 className="font-display text-2xl font-semibold text-foreground">Generate today's Divine Guidance</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-name" className={formErrors.name ? "text-destructive" : ""}>Name *</Label>
                    <Input id="ai-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Arun Sharma" className={formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""} />
                    {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className={formErrors.birthDate ? "text-destructive" : ""}>Date of Birth *</Label>
                      <BirthDatePicker value={birthDate} onChange={setBirthDate} />
                      {formErrors.birthDate && <p className="text-xs text-destructive">{formErrors.birthDate}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ai-birth-time" className={formErrors.birthTime ? "text-destructive" : ""}>Birth Time *</Label>
                      <Input id="ai-birth-time" type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} className={formErrors.birthTime ? "border-destructive focus-visible:ring-destructive" : ""} />
                      {formErrors.birthTime && <p className="text-xs text-destructive">{formErrors.birthTime}</p>}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-border pt-4">
                    <Label className={formErrors.birthLocation ? "text-destructive font-semibold" : "font-semibold"}>Birth Place *</Label>
                    <div className="rounded-xl bg-background p-3 border border-border">
                      <LocationSelector onLocationSelect={setBirthLocation} initialCity={birthLocation?.name} />
                    </div>
                    {formErrors.birthLocation && <p className="text-xs text-destructive">{formErrors.birthLocation}</p>}
                  </div>

                  <div className="space-y-2 border-t border-border pt-4">
                    <Label className={formErrors.currentLocation ? "text-destructive font-semibold" : "font-semibold"}>Current Location (for Panchang) *</Label>
                    <div className="rounded-xl bg-background p-3 border border-border">
                      <LocationSelector onLocationSelect={setCurrentLocation} initialCity={currentLocation?.name} />
                    </div>
                    {formErrors.currentLocation && <p className="text-xs text-destructive">{formErrors.currentLocation}</p>}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-border">
                  <Label className={formErrors.goal ? "text-destructive" : ""}>Primary Goal *</Label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {goalOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGoal(option.value)}
                        className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${goal === option.value ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground hover:border-primary/50"}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {formErrors.goal && <p className="text-xs text-destructive">{formErrors.goal}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-question" className={formErrors.question ? "text-destructive" : ""}>Ask Divine AI *</Label>
                  <Textarea
                    id="ai-question"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    placeholder="What should I focus on today?"
                    className={`min-h-[90px] ${formErrors.question ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {formErrors.question && <p className="text-xs text-destructive">{formErrors.question}</p>}
                </div>

                <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border">
                  <Label htmlFor="ai-captcha">Human Verification: What is {captchaNum1} + {captchaNum2}?</Label>
                  <Input 
                    id="ai-captcha"
                    value={captchaInput} 
                    onChange={(e) => setCaptchaInput(e.target.value)} 
                    placeholder="Enter sum to continue" 
                    type="number"
                  />
                </div>

                {errorMsg && (
                  <div className="rounded-xl bg-destructive/10 p-3 text-sm font-medium text-destructive border border-destructive/20">
                    {errorMsg}
                  </div>
                )}

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !isCaptchaValid} 
                  variant="saffron" 
                  size="lg" 
                  className="w-full text-base font-bold shadow-md"
                >
                  {isGenerating ? "Generating Divine Guidance..." : "Generate My Divine Guidance"}
                  {!isGenerating && <ChevronRight className="ml-2 h-5 w-5" />}
                </Button>
              </div>
            </SpiritualCard>
          </div>
        </section>

        <section ref={resultRef} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SpiritualCard hover={false} className="border-primary/15 bg-gradient-to-br from-white to-[#fff8f0] shadow-sm">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Today's Guidance</p>
                    {isFallback && (
                      <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-800">
                        Fallback Mode
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-3xl font-semibold text-[#1a1440]">
                    {hasGenerated && guidance ? guidance.salutation : "Your guidance awaits..."}
                  </h3>
                </div>
                <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm md:flex flex-shrink-0">
                  <Sparkles className="h-6 w-6" />
                </div>
              </div>

              {!hasGenerated ? (
                <div className="rounded-2xl border border-dashed border-primary/20 bg-white/50 p-8 text-center text-muted-foreground">
                  <Bot className="mx-auto h-10 w-10 text-primary/30 mb-3" />
                  <p className="text-sm">Fill your details above and generate your personalized Vedic guidance.</p>
                </div>
              ) : (
                <>
                  <div className="rounded-2xl border border-primary/15 bg-white p-5 shadow-sm">
                    <h4 className="font-display text-xl font-bold text-[#1a1440]">
                      {renderSafe(guidance?.title)}
                    </h4>
                    <p className="mt-3 text-[15px] leading-relaxed text-foreground/80">
                      {renderSafe(guidance?.summary)}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm">
                      <div className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-emerald-800">
                        <Target className="h-4 w-4" /> Do Today
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/80">{renderSafe(guidance?.doToday)}</p>
                    </div>

                    <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-5 shadow-sm">
                      <div className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-secondary">
                        <ShieldCheck className="h-4 w-4" /> Avoid Today
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/80">{renderSafe(guidance?.avoidToday)}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5 shadow-sm">
                    <div className="mb-2 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-primary">
                      <ScrollText className="h-4 w-4" /> Mantra of the Day: {renderMantraField(guidance?.mantra, 'title')}
                    </div>
                    <p className="mt-3 text-xl font-bold text-[#1a1440] text-center font-display py-2">{renderMantraField(guidance?.mantra, 'text')}</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-center border-t border-primary/10 pt-3">{renderMantraField(guidance?.mantra, 'meaning')}</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                      <div className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-stone-600">
                        <BookOpen className="h-4 w-4" /> Journal Prompt
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/80 italic">"{renderSafe(guidance?.journalPrompt)}"</p>
                    </div>

                    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                      <div className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-stone-600">
                        <User className="h-4 w-4" /> Spiritual Action
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/80">{renderSafe(guidance?.spiritualAction)}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-white p-5 shadow-sm flex items-start gap-4">
                    <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-bold uppercase tracking-wider text-stone-600 mb-1">Best Time Window</p>
                      <p className="text-sm leading-relaxed text-foreground/80">{renderSafe(guidance?.bestTimeWindow)}</p>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-primary/10 bg-primary/5 p-4 text-center">
                    <p className="text-sm font-medium text-primary italic">{renderSafe(guidance?.gentleReminder)}</p>
                  </div>
                </>
              )}
            </div>
          </SpiritualCard>

          <div className="space-y-6">
            <SpiritualCard hover={false} className="border-[#11213b]/10 bg-[#11213b] text-white shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Bot className="w-48 h-48" />
              </div>
              <div className="space-y-5 relative z-10">
                <div className="inline-block rounded-full border border-[#f08040]/30 bg-[#f08040]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f08040]">
                  Next Step
                </div>
                <h3 className="font-display text-3xl font-bold leading-tight">Unlock Your 30-Day Divine Plan</h3>
                <p className="text-[15px] leading-relaxed text-white/70">
                  Turn today's guidance into a complete 30-day spiritual routine with daily actions, mantras, journaling prompts, and goal-based guidance.
                </p>

                <ul className="space-y-3 text-sm text-white/80 py-2 border-t border-white/10">
                  <li className="flex items-center gap-2"><Target className="h-4 w-4 text-[#f08040]" /> Personalized 30-day guidance</li>
                  <li className="flex items-center gap-2"><ScrollText className="h-4 w-4 text-[#f08040]" /> Daily mantra and reflection</li>
                  <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#f08040]" /> Goal-based spiritual action plan</li>
                  <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#f08040]" /> 3 free AI questions per day</li>
                </ul>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/70">
                  <span className="font-bold text-white/90">Note:</span> {renderSafe(guidance?.upgradeHook) || "Keep your spiritual momentum alive and track your progress daily."}
                </div>

                {!hasGenerated ? (
                  <Button 
                    variant="saffron" 
                    size="lg" 
                    className="w-full font-bold shadow-md"
                    onClick={() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                  >
                    Generate My Free Guidance First
                  </Button>
                ) : (
                  <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="saffron" size="lg" className="w-full font-bold shadow-md">
                        Save My Divine Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md border-primary/20 bg-[#fffaf3]">
                      <DialogHeader>
                        <DialogTitle className="font-display text-2xl text-[#1a1440]">Save Your Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        {saveToast && (
                          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-sm font-medium border border-emerald-200">
                            {saveToast}
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input value={name} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="save-email">Email Address *</Label>
                          <Input id="save-email" type="email" value={saveEmail} onChange={(e) => setSaveEmail(e.target.value)} placeholder="your@email.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="save-phone">WhatsApp Number (Optional)</Label>
                          <Input id="save-phone" type="tel" value={savePhone} onChange={(e) => setSavePhone(e.target.value)} placeholder="+1 234 567 8900" />
                        </div>
                        <div className="flex items-start gap-3 pt-2">
                          <input 
                            type="checkbox" 
                            id="save-consent" 
                            checked={saveConsent}
                            onChange={(e) => setSaveConsent(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-primary text-primary focus:ring-primary"
                          />
                          <Label htmlFor="save-consent" className="text-xs leading-relaxed text-muted-foreground font-normal">
                            I agree to receive my Divine guidance and updates from Divine Panchang.
                          </Label>
                        </div>
                        <div className="pt-4 grid gap-3">
                          <Button onClick={handleSaveProfile} className="w-full" size="lg">Save Free Profile</Button>
                          <Button variant="outline" className="w-full border-primary/20" size="lg" onClick={() => alert("Payment Integration Pending")}>Unlock 30-Day Plan</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </SpiritualCard>
          </div>
        </section>

        <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground max-w-3xl mx-auto border-t border-border pt-6">
          {guidance?.disclaimer || "Divine AI Guru offers spiritual reflection and practical Vedic framing. It does not replace medical, legal, financial, or mental health advice. For serious concerns, please consult a qualified professional."}
        </p>
      </div>
    </Layout>
  );
};

export default DivineAiGuruPage;

