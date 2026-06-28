import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Pause, Play, Volume2, X, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const OM_GLYPH = "\u0950";

const omBenefits = [
  {
    title: "A five-minute reset",
    description: "Use a short Om session to settle the breath, reduce mental clutter, and begin the day with steadier attention.",
  },
  {
    title: "A calm layer while you work",
    description: "Let the chant continue softly in the background while you read, journal, or move through your regular tasks.",
  },
  {
    title: "A gentle spiritual anchor",
    description: "Many listeners use the repeated sound as a simple cue to return to presence, gratitude, and intentional living.",
  },
];

const omRitualSteps = [
  "Open the chant and take one long, unhurried breath.",
  "Let it play softly for five minutes or keep it on while you work.",
  "Close the panel anytime. The chant can continue in the background.",
];

type OmChantContextValue = {
  isDialogOpen: boolean;
  isPlaying: boolean;
  openOmExperience: () => Promise<void>;
  setIsDialogOpen: (open: boolean) => void;
};

const OmChantContext = createContext<OmChantContextValue | null>(null);

export const useOmChant = () => {
  const context = useContext(OmChantContext);

  if (!context) {
    throw new Error("useOmChant must be used within OmChantProvider");
  }

  return context;
};

export const OmChantProvider = ({ children }: { children: ReactNode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFloatingPlayerDismissed, setIsFloatingPlayerDismissed] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const location = useLocation();

  const getAudioElement = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/om-chant.mp3");
      audioRef.current.loop = true;
      audioRef.current.volume = 0.55;
      audioRef.current.preload = "metadata";
    }

    return audioRef.current;
  };

  const startPlayback = async () => {
    const audio = getAudioElement();
    setPlaybackError(null);

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Audio playback failed:", err);
      setIsPlaying(false);
      setPlaybackError("Press play once in this panel if your browser blocks the chant on first open.");
    }
  };

  const pausePlayback = () => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();
    setIsPlaying(false);
  };

  const stopPlayback = () => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setIsFloatingPlayerDismissed(false);
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      pausePlayback();
      return;
    }

    await startPlayback();
  };

  const openOmExperience = async () => {
    setIsDialogOpen(true);
    setIsFloatingPlayerDismissed(false);

    if (!isPlaying) {
      await startPlayback();
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Fix: release body scroll lock on mobile when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      document.body.style.overflow = "";
      document.body.style.overflowX = "";
      document.body.style.paddingRight = "";
      document.documentElement.style.overflow = "";
    }
  }, [isDialogOpen]);

  const showFloatingPlayer = isPlaying && location.pathname !== "/";

  return (
    <OmChantContext.Provider value={{ isDialogOpen, isPlaying, openOmExperience, setIsDialogOpen }}>
      {children}

      {showFloatingPlayer && isFloatingPlayerDismissed ? (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setIsFloatingPlayerDismissed(false)}
          className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-3 rounded-full border border-[#d4651a]/25 bg-[rgba(255,248,238,0.96)] px-4 py-3 text-left shadow-[0_18px_45px_rgba(66,28,8,0.16)] backdrop-blur-sm transition hover:border-[#d4651a]/45 hover:bg-white"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#211b48] text-lg text-[#ffb27a]">
            {OM_GLYPH}
          </span>
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#b04c10]">Om chant active</span>
            <span className="block text-sm text-[#4a3818]/78">Tap to reopen the player</span>
          </span>
        </motion.button>
      ) : null}

      {showFloatingPlayer && !isFloatingPlayerDismissed ? (
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-5 right-5 z-[60] w-[min(360px,calc(100vw-2rem))] rounded-[1.6rem] border border-[#d4651a]/20 bg-[rgba(255,248,238,0.96)] p-4 shadow-[0_24px_55px_rgba(66,28,8,0.18)] backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#211b48] text-xl text-[#ffb27a] shadow-[0_0_0_8px_rgba(33,27,72,0.08)]">
                {OM_GLYPH}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b04c10]">Om chant active</p>
                <p className="mt-1 text-sm leading-relaxed text-[#4a3818]/78">
                  The chant will continue while you move through this website.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsFloatingPlayerDismissed(true)}
              className="rounded-full border border-[#d4651a]/15 bg-white/80 p-2 text-[#8a3c10] transition hover:border-[#d4651a]/35 hover:bg-white"
              aria-label="Hide Om chant player"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={openOmExperience}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d4651a]/20 bg-white px-4 py-3 text-sm font-semibold text-[#8a3c10] transition hover:border-[#d4651a]/40 hover:bg-[#fff8f2]"
            >
              <Volume2 className="h-4 w-4" />
              Open player
            </button>
            <button
              type="button"
              onClick={togglePlayback}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#211b48] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#171235]"
            >
              <Pause className="h-4 w-4" />
              Pause chant
            </button>
          </div>
        </motion.div>
      ) : null}

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          // Force-release body scroll lock on all mobile browsers
          setTimeout(() => {
            document.body.style.overflow = "";
            document.body.style.overflowX = "";
            document.body.style.paddingRight = "";
            document.documentElement.style.overflow = "";
          }, 50);
        }
      }}>
        <DialogContent
          className="max-w-4xl border-none bg-transparent p-0 shadow-none sm:rounded-[2rem] max-h-[90vh] overflow-y-auto"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // Allow closing but prevent focus issues on mobile
            setIsDialogOpen(false);
            e.preventDefault();
          }}
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-[#e7c7a0] bg-[linear-gradient(145deg,rgba(255,248,239,0.98),rgba(252,239,220,0.96))] p-6 shadow-[0_34px_120px_rgba(66,28,8,0.18)] md:p-8">
            
            {/* Custom Close Button for Mobile Accessibility */}
            <button
              type="button"
              onClick={() => setIsDialogOpen(false)}
              className="absolute right-4 top-4 z-[70] rounded-full border border-[#d4651a]/25 bg-white/70 p-2 text-[#8a3c10] transition hover:border-[#d4651a]/45 hover:bg-white"
              aria-label="Close player"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,101,26,0.16),transparent_40%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(33,27,72,0.12),transparent_42%)]" />
            <div className="pointer-events-none absolute right-[-2rem] top-[-2rem] text-[12rem] leading-none text-[#d4651a]/[0.07] md:text-[16rem]">
              {OM_GLYPH}
            </div>

            <div className="relative z-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="space-y-5">
                <DialogHeader className="space-y-3 text-left">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#d4651a]/25 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-[#b04c10]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Sacred listening ritual
                  </div>
                  <DialogTitle className="font-display text-4xl leading-tight text-[#1a1440] md:text-5xl">
                    Eternal Om Chant
                  </DialogTitle>
                  <DialogDescription className="max-w-2xl text-base leading-relaxed text-[#4a3818]/78">
                    Let the divine chant create a calm spiritual backdrop for five minutes a day, or keep it playing softly while you work.
                    Many people use Om chanting to begin with steadier focus, slower breath, and a more grounded inner pace.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-3 md:grid-cols-3">
                  {omBenefits.map((benefit) => (
                    <div
                      key={benefit.title}
                      className="rounded-[1.5rem] border border-[#d4651a]/15 bg-white/75 p-4 shadow-[0_18px_40px_rgba(156,67,16,0.06)]"
                    >
                      <p className="text-sm font-semibold text-[#8a3c10]">{benefit.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-[#4a3818]/72">{benefit.description}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.75rem] border border-[#211b48]/10 bg-[#211b48] px-5 py-5 text-white shadow-[0_24px_50px_rgba(23,19,48,0.18)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ffb27a]">Simple daily ritual</p>
                  <div className="mt-4 space-y-3">
                    {omRitualSteps.map((step, index) => (
                      <div key={step} className="flex gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#ffb27a]/35 bg-white/10 text-xs font-semibold text-[#ffb27a]">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed text-white/78">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-5 rounded-[1.9rem] border border-[#d4651a]/20 bg-white/72 p-5 shadow-[0_20px_55px_rgba(156,67,16,0.08)] backdrop-blur-sm md:p-6">
                <div className="space-y-4">
                  <div className="rounded-[1.6rem] bg-gradient-to-br from-[#201941] via-[#1b2348] to-[#0d1733] p-5 text-white shadow-[0_25px_60px_rgba(18,16,42,0.32)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ffb27a]">Now playing</p>
                        <h3 className="mt-2 text-2xl font-semibold">Divine Om Chant</h3>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#ffb27a]/25 bg-white/10 text-3xl text-[#ffb27a] shadow-[0_0_0_10px_rgba(255,178,122,0.06)]">
                        {OM_GLYPH}
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between text-sm text-white/75">
                        <span>Soft background volume</span>
                        <span>{isPlaying ? "Active" : "Ready"}</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={cn(
                            "h-full rounded-full bg-gradient-to-r from-[#ffb27a] via-[#ff8b4b] to-[#d4651a] transition-all duration-500",
                            isPlaying ? "w-[72%]" : "w-[38%]"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-[#d4651a]/12 bg-[#fffaf4] p-4 text-sm leading-relaxed text-[#4a3818]/75">
                    This is spiritual wellness content, not medical advice. The focus is calm presence, breath awareness, and mindful rhythm.
                  </div>

                  {playbackError ? (
                    <div className="rounded-[1.4rem] border border-[#d4651a]/20 bg-[#fff2e6] p-4 text-sm text-[#9c4310]">
                      {playbackError}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={togglePlayback}
                    className={cn(
                      "flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all duration-200",
                      isPlaying
                        ? "bg-[#211b48] text-white shadow-[0_16px_45px_rgba(33,27,72,0.25)] hover:bg-[#171235]"
                        : "bg-gradient-to-r from-[#d4651a] to-[#a84810] text-white shadow-[0_18px_42px_rgba(212,101,26,0.24)] hover:brightness-105"
                    )}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? "Pause chant" : "Play chant"}
                  </button>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setIsDialogOpen(false)}
                      className="rounded-2xl border border-[#d4651a]/20 bg-white px-4 py-3 text-sm font-semibold text-[#8a3c10] transition hover:border-[#d4651a]/40 hover:bg-[#fff8f2]"
                    >
                      Keep playing in background
                    </button>
                    <button
                      type="button"
                      onClick={stopPlayback}
                      className="rounded-2xl border border-[#211b48]/12 bg-[#211b48]/[0.04] px-4 py-3 text-sm font-semibold text-[#211b48] transition hover:bg-[#211b48]/[0.08]"
                    >
                      Stop and reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </OmChantContext.Provider>
  );
};
