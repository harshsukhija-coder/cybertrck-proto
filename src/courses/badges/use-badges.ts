import { useCallback, useEffect, useMemo, useState } from "react";
import { readAcademy, summarizeAcademy, useAcademy } from "../academy/academy-progress";
import { LAB_PASS } from "../academy/types";
import { COURSES } from "../data";
import { GAMES_EVENT, readBest } from "../games/game-utils";
import { GAMES } from "../games/games";
import { readProgress, summarizeProgress, useProgress } from "../progress";
import { SEEN_EVENT, readSeen } from "../stories/use-stories";
import { BADGES, type Badge, type BadgeStats } from "./badges";

const STORAGE_KEY = "offtrck.badges";
const CHANGE_EVENT = "offtrck-badges";

/** Badge id → date it was earned (yyyy-mm-dd) */
type Earned = Record<string, string>;

const loadEarned = (): Earned => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Earned) : {};
  } catch {
    return {};
  }
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const readGameStats = () => ({
  gamesPlayed: GAMES.filter(g => readBest(g.id) !== null).length,
  debitCreditBest: readBest("debit-or-credit") ?? 0,
  storiesSeen: readSeen().length,
});

/** Re-reads browser storage whenever any of the given events fire */
const useStored = <T,>(read: () => T, events: string[]) => {
  const [value, setValue] = useState(read);
  useEffect(() => {
    const refresh = () => setValue(read());
    for (const e of [...events, "storage"]) window.addEventListener(e, refresh);
    return () => {
      for (const e of [...events, "storage"]) window.removeEventListener(e, refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return value;
};

export type BadgeState = { badge: Badge; value: number; goal: number; earnedAt?: string };

type Learning = Pick<ReturnType<typeof summarizeProgress>, "doneIn" | "totalDone" | "daysLearned">;

const buildStats = (learning: Learning, academy: ReturnType<typeof summarizeAcademy>, games: ReturnType<typeof readGameStats>): BadgeStats => ({
  totalDone: learning.totalDone,
  daysLearned: learning.daysLearned,
  doneByCourse: Object.fromEntries(COURSES.map(c => [c.id, learning.doneIn(c)])),
  ...games,
  labsPassed: Object.values(academy.progress.labs).filter(l => l.score >= LAB_PASS).length,
  perfectQuiz: Object.values(academy.progress.quiz).some(score => score >= 100),
  examPassed: academy.examPassed,
});

const buildList = (stats: BadgeStats, earned: Earned): BadgeState[] =>
  BADGES.map(badge => {
    const [value, goal] = badge.progress(stats);
    return { badge, value: Math.min(value, goal), goal, earnedAt: earned[badge.id] ?? (value >= goal ? "today" : undefined) };
  });

/** Badge list straight from browser storage, for code that isn't a React component */
export const readBadges = () => buildList(buildStats(summarizeProgress(readProgress()), summarizeAcademy(readAcademy()), readGameStats()), loadEarned());

/** Saves the date of any badge that's unlocked but not saved yet, and returns those badges */
export const saveUnlocked = () => {
  const saved = loadEarned();
  const fresh = readBadges().filter(b => b.value >= b.goal && !saved[b.badge.id]);
  if (!fresh.length) return [];
  const today = todayIso();
  for (const b of fresh) saved[b.badge.id] = today;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return fresh.map(b => b.badge);
};

export const useBadges = () => {
  const learning = useProgress();
  const academy = useAcademy();
  const games = useStored(readGameStats, [GAMES_EVENT, SEEN_EVENT]);
  const earned = useStored(loadEarned, [CHANGE_EVENT]);

  const stats = buildStats(learning, academy, games);
  const statsKey = JSON.stringify(stats);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const list = useMemo(() => buildList(stats, earned), [statsKey, earned]);

  return { list, earnedCount: list.filter(b => b.earnedAt).length };
};

/**
 * Saves the date of newly unlocked badges and returns the ones unlocked during this visit,
 * so the app can celebrate. Mounted once, in the app shell.
 */
export const useBadgeWatcher = () => {
  const { list } = useBadges();
  const [knownAtStart] = useState(loadEarned);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const unlocked = list.filter(b => b.value >= b.goal).map(b => b.badge.id);
  const fresh = unlocked.filter(id => !knownAtStart[id] && !dismissed.includes(id));

  useEffect(() => {
    const saved = loadEarned();
    const unsaved = unlocked.filter(id => !saved[id]);
    if (!unsaved.length) return;
    const today = todayIso();
    for (const id of unsaved) saved[id] = today;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, [unlocked.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  const freshKey = fresh.join();
  const dismiss = useCallback(() => setDismissed(d => [...d, ...freshKey.split(",")]), [freshKey]);
  return { fresh, dismiss };
};
