import { useCallback, useEffect, useMemo, useState } from "react";
import { useAcademy } from "../academy/academy-progress";
import { LAB_PASS } from "../academy/types";
import { COURSES } from "../data";
import { GAMES_EVENT, readBest } from "../games/game-utils";
import { GAMES } from "../games/games";
import { useProgress } from "../progress";
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

export const useBadges = () => {
  const { doneIn, totalDone, daysLearned } = useProgress();
  const academy = useAcademy();
  const games = useStored(readGameStats, [GAMES_EVENT, SEEN_EVENT]);
  const earned = useStored(loadEarned, [CHANGE_EVENT]);

  const stats: BadgeStats = {
    totalDone,
    daysLearned,
    doneByCourse: Object.fromEntries(COURSES.map(c => [c.id, doneIn(c)])),
    ...games,
    labsPassed: Object.values(academy.progress.labs).filter(l => l.score >= LAB_PASS).length,
    perfectQuiz: Object.values(academy.progress.quiz).some(score => score >= 100),
    examPassed: academy.examPassed,
  };
  const statsKey = JSON.stringify(stats);

  const list = useMemo<BadgeState[]>(
    () =>
      BADGES.map(badge => {
        const [value, goal] = badge.progress(stats);
        return { badge, value: Math.min(value, goal), goal, earnedAt: earned[badge.id] ?? (value >= goal ? "today" : undefined) };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statsKey, earned],
  );

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
