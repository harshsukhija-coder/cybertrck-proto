import { useCallback, useState } from "react";
import type { GameId } from "./games";

export const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

/** Best score per game, saved in the browser. `lowerWins` is for time-based games. */
export const useBest = (id: GameId, lowerWins = false) => {
  const key = `offtrck.games.best.${id}`;
  const [best, setBest] = useState<number | null>(() => {
    const saved = localStorage.getItem(key);
    return saved === null ? null : Number(saved);
  });

  const submit = useCallback(
    (score: number) => {
      const isBest = best === null || (lowerWins ? score < best : score > best);
      if (isBest) {
        setBest(score);
        localStorage.setItem(key, String(score));
      }
      return isBest;
    },
    [best, key, lowerWins],
  );

  return { best, submit };
};
