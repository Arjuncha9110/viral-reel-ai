import { useState, useRef, useCallback, useEffect, MutableRefObject } from "react";
import { BreathingPhase } from "../../data/breathingRoutines";

export interface PhaseState {
  index: number;
  round: number;
  isStarted: boolean;
  isPaused: boolean;
  isComplete: boolean;
}

export interface EngineRefs {
  arcRef:        MutableRefObject<SVGCircleElement | null>;
  orbGroupRef:   MutableRefObject<SVGGElement | null>;
  overallBarRef: MutableRefObject<HTMLDivElement | null>;
}

export interface BreathingSessionEngine {
  phaseState:       PhaseState;
  currentPhase:     BreathingPhase;
  totalRounds:      number;
  displayedSeconds: number;
  refs:             EngineRefs;
  start:            () => void;
  pause:            () => void;
  resume:           () => void;
  restart:          () => void;
  end:              () => void;
  applyConfig:      (phases: BreathingPhase[], rounds: number) => void;
}

// Arc circumference for r=100 (must match BreathingOrb SVG)
const CIRC = 2 * Math.PI * 100;

function getOrbScale(action: string, progress: number): number {
  if (action === "INHALE" || action === "INHALE_L" || action === "INHALE_R") {
    return 0.82 + 0.28 * progress; // expands 0.82 → 1.10
  }
  if (action === "EXHALE" || action === "EXHALE_L" || action === "EXHALE_R") {
    return 1.10 - 0.28 * progress; // contracts 1.10 → 0.82
  }
  if (action === "HOLD") return 1.10; // stays expanded
  return 0.82; // REST
}

export function useBreathingSession(
  defaultPhases: BreathingPhase[],
  defaultRounds: number,
): BreathingSessionEngine {
  // Mutable config refs — updated by applyConfig without triggering re-renders
  const phasesRef      = useRef<BreathingPhase[]>(defaultPhases);
  const totalRoundsRef = useRef<number>(defaultRounds);

  // React state (low-frequency updates only)
  const [totalRoundsState, setTotalRoundsState] = useState(defaultRounds);
  const [displayedSeconds, setDisplayedSeconds] = useState(defaultPhases[0]?.seconds ?? 0);
  const [phaseState, setPhaseState] = useState<PhaseState>({
    index: 0, round: 1, isStarted: false, isPaused: false, isComplete: false,
  });

  // Timing refs (imperative, for accuracy — no React involvement)
  const phaseStartRef     = useRef<number>(0); // "virtual" start time adjusted for pauses
  const elapsedAtPauseRef = useRef<number>(0); // elapsed ms at pause moment
  const rafRef            = useRef<number>(0);
  const prevSecsRef       = useRef<number>(-1); // avoids redundant countdown re-renders

  // Snapshot ref so tick closure always reads fresh state
  const phaseStateRef = useRef(phaseState);
  phaseStateRef.current = phaseState;

  // DOM refs — NOT set as React props on elements, so React never overwrites them
  const arcRef        = useRef<SVGCircleElement | null>(null);
  const orbGroupRef   = useRef<SVGGElement | null>(null);
  const overallBarRef = useRef<HTMLDivElement | null>(null);

  // ── DOM updater: called every RAF frame (60 fps) ────────────────────────────
  const updateDOM = useCallback((
    progress: number,
    secsLeft: number,
    action: string,
    idx: number,
    round: number,
  ) => {
    const p = Math.min(Math.max(progress, 0), 1);

    // Progress arc — stroke-dasharray not in React JSX → safe to setAttribute
    if (arcRef.current) {
      arcRef.current.setAttribute(
        "stroke-dasharray",
        `${(CIRC * p).toFixed(2)} ${CIRC.toFixed(2)}`,
      );
    }

    // Orb group transform — not in React JSX → safe to setAttribute
    if (orbGroupRef.current) {
      const s = getOrbScale(action, p).toFixed(4);
      orbGroupRef.current.setAttribute(
        "transform",
        `translate(120,120) scale(${s}) translate(-120,-120)`,
      );
    }

    // Overall progress bar — style.width not a React prop → safe
    if (overallBarRef.current) {
      const total   = phasesRef.current.length * totalRoundsRef.current;
      const done    = (round - 1) * phasesRef.current.length + idx;
      const overall = Math.min((done + p) / total, 1);
      overallBarRef.current.style.width = `${(overall * 100).toFixed(2)}%`;
    }

    // Countdown via React state — at most once per second, no 60 fps re-renders
    const secs = Math.max(secsLeft, 0);
    if (secs !== prevSecsRef.current) {
      prevSecsRef.current = secs;
      setDisplayedSeconds(secs);
    }
  }, []);

  // ── Advance to next phase ───────────────────────────────────────────────────
  const advancePhase = useCallback(() => {
    // Reset timing refs BEFORE state update so RAF reads correct time immediately
    phaseStartRef.current     = performance.now();
    elapsedAtPauseRef.current = 0;
    prevSecsRef.current       = -1;

    setPhaseState(prev => {
      const numPhases = phasesRef.current.length;
      let nextIdx   = prev.index + 1;
      let nextRound = prev.round;

      if (nextIdx >= numPhases) {
        nextIdx   = 0;
        nextRound = prev.round + 1;
      }

      if (nextRound > totalRoundsRef.current) {
        return { ...prev, isComplete: true, isStarted: false, isPaused: false };
      }

      return { ...prev, index: nextIdx, round: nextRound };
    });
  }, []);

  // ── RAF tick ────────────────────────────────────────────────────────────────
  const tick = useCallback(() => {
    const st = phaseStateRef.current;
    if (!st.isStarted || st.isPaused || st.isComplete) return;

    const phase    = phasesRef.current[st.index];
    const now      = performance.now();
    const elapsed  = now - phaseStartRef.current;
    const durMs    = phase.seconds * 1000;
    const progress = elapsed / durMs;
    const secsLeft = Math.ceil((durMs - elapsed) / 1000);

    if (elapsed >= durMs) {
      // Snap to 100% then advance
      updateDOM(1, 0, phase.action, st.index, st.round);
      advancePhase();
      return; // useEffect will restart RAF after state update
    }

    updateDOM(progress, secsLeft, phase.action, st.index, st.round);
    rafRef.current = requestAnimationFrame(tick);
  }, [advancePhase, updateDOM]);

  // ── Effect 1: Reset DOM when phase index/round changes (not on pause/resume) ─
  useEffect(() => {
    if (phaseState.isComplete) return;
    const ph = phasesRef.current[phaseState.index];
    if (ph) {
      prevSecsRef.current = -1;
      updateDOM(0, ph.seconds, ph.action, phaseState.index, phaseState.round);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseState.index, phaseState.round]);

  // ── Effect 2: Start/stop RAF based on running state ─────────────────────────
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (phaseState.isStarted && !phaseState.isPaused && !phaseState.isComplete) {
      rafRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(rafRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    phaseState.isStarted, phaseState.isPaused, phaseState.isComplete,
    phaseState.index, phaseState.round, tick,
  ]);

  // Cleanup on unmount
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // ── Controls ────────────────────────────────────────────────────────────────
  const start = useCallback(() => {
    phaseStartRef.current     = performance.now();
    elapsedAtPauseRef.current = 0;
    prevSecsRef.current       = -1;
    setPhaseState(p => ({ ...p, isStarted: true, isPaused: false }));
  }, []);

  const pause = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    elapsedAtPauseRef.current = performance.now() - phaseStartRef.current;
    setPhaseState(p => ({ ...p, isPaused: true }));
  }, []);

  const resume = useCallback(() => {
    // Restore virtual start time to account for pause duration
    phaseStartRef.current = performance.now() - elapsedAtPauseRef.current;
    setPhaseState(p => ({ ...p, isPaused: false }));
  }, []);

  const restart = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    phaseStartRef.current     = 0;
    elapsedAtPauseRef.current = 0;
    prevSecsRef.current       = -1;
    const ph = phasesRef.current[0];
    setPhaseState({ index: 0, round: 1, isStarted: false, isPaused: false, isComplete: false });
    if (ph) updateDOM(0, ph.seconds, ph.action, 0, 1);
  }, [updateDOM]);

  const end = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setPhaseState(p => ({ ...p, isComplete: true, isStarted: false, isPaused: false }));
  }, []);

  const applyConfig = useCallback((phases: BreathingPhase[], rounds: number) => {
    cancelAnimationFrame(rafRef.current);
    phasesRef.current      = phases;
    totalRoundsRef.current = rounds;
    phaseStartRef.current     = 0;
    elapsedAtPauseRef.current = 0;
    prevSecsRef.current       = -1;
    setTotalRoundsState(rounds);
    setPhaseState({ index: 0, round: 1, isStarted: false, isPaused: false, isComplete: false });
    if (phases[0]) updateDOM(0, phases[0].seconds, phases[0].action, 0, 1);
  }, [updateDOM]);

  return {
    phaseState,
    currentPhase: phasesRef.current[phaseState.index] ?? phasesRef.current[0],
    totalRounds:  totalRoundsState,
    displayedSeconds,
    refs: { arcRef, orbGroupRef, overallBarRef },
    start, pause, resume, restart, end, applyConfig,
  };
}
