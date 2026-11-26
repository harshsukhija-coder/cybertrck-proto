import { useEffect, useState } from "react";
import { readProgress } from "../progress";
import type { LearningPath, Step } from "./paths";

const STORAGE_KEY = "offtrck.guide";
const CHANGE_EVENT = "offtrck-guide";
const PROGRESS_EVENT = "offtrck-progress";

export type GuideState = {
  /** Result of the skill check per path: how many stages you already know */
  checks: Record<string, { level: number; at: number }>;
  /** Steps you ticked yourself (chapters tick themselves) */
  done: string[];
};

export const readGuide = (): GuideState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as GuideState;
  } catch {
    /* fall through to an empty guide */
  }
  return { checks: {}, done: [] };
};

const write = (state: GuideState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const saveCheck = (pathId: string, level: number) => {
  const state = readGuide();
  write({ ...state, checks: { ...state.checks, [pathId]: { level, at: Date.now() } } });
};

export const toggleStep = (stepId: string) => {
  const state = readGuide();
  write({ ...state, done: state.done.includes(stepId) ? state.done.filter(id => id !== stepId) : [...state.done, stepId] });
};

export const isStepDone = (step: Step, state: GuideState, finished = readProgress().done) =>
  step.kind === "chapter" ? finished.includes(`${step.course}/${step.chapter}`) : state.done.includes(step.id);

export type PathStatus = {
  checked: boolean;
  /** Stages the skill check says you already know */
  known: number;
  /** The stage you're on now (stages.length when the whole path is done) */
  stage: number;
  next: Step[];
  stepsDone: number;
  stepsTotal: number;
};

/** Where you are on a path: the check skips what you know, finished steps move you along */
export const pathStatus = (path: LearningPath, state: GuideState, finished = readProgress().done): PathStatus => {
  const check = state.checks[path.id];
  const known = check?.level ?? 0;
  const done = (step: Step) => isStepDone(step, state, finished);
  const current = path.stages.findIndex((s, i) => i >= known && s.steps.some(step => !done(step)));
  const stage = current < 0 ? path.stages.length : current;
  const ticks = path.stages.flatMap((s, i) => s.steps.map(step => i < known || done(step)));
  return {
    checked: !!check,
    known,
    stage,
    next: path.stages
      .slice(stage)
      .flatMap(s => s.steps)
      .filter(step => !done(step))
      .slice(0, 3),
    stepsDone: ticks.filter(Boolean).length,
    stepsTotal: ticks.length,
  };
};

/** Live guide state plus finished chapters, so paths update the moment you tick or finish something */
export const useGuide = () => {
  const [state, setState] = useState(readGuide);
  const [finished, setFinished] = useState(() => readProgress().done);

  useEffect(() => {
    const refresh = () => {
      setState(readGuide());
      setFinished(readProgress().done);
    };
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener(PROGRESS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener(PROGRESS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return { state, finished, statusOf: (path: LearningPath) => pathStatus(path, state, finished) };
};

// ---------- the skill check ----------

/** "How much do you know?" answers and the stage each one starts the questions at */
export const SELF_RATINGS = [
  { label: "never heard of it", start: 0 },
  { label: "i know a little", start: 1 },
  { label: "i use it sometimes", start: 2 },
  { label: "i could teach it", start: 3 },
] as const;

export type Answer = { stage: number; right: boolean };

/**
 * Adaptive: start where you rated yourself. Right answers climb to harder stages,
 * a wrong first answer steps down to easier ones. Stops as soon as we know where you are.
 */
export const nextCheckStage = (start: number, answers: Answer[], stages: number): number | null => {
  if (!answers.length) return start;
  const first = answers[0];
  const last = answers[answers.length - 1];
  if (first.right) return last.right && last.stage + 1 < stages ? last.stage + 1 : null;
  return !last.right && last.stage > 0 ? last.stage - 1 : null;
};

/** Stages you know: everything up to the hardest one you got right */
export const levelFrom = (answers: Answer[]) => answers.reduce((level, a) => (a.right ? Math.max(level, a.stage + 1) : level), 0);
