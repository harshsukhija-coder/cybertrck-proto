import { useCallback, useState } from "react";
import type { GameId } from "./games";

/** Fired after every finished game, so badges can update */
export const GAMES_EVENT = "offtrck-games";

const bestKey = (id: GameId) => `offtrck.games.best.${id}`;

export const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const readBest = (id: GameId) => {
  const saved = localStorage.getItem(bestKey(id));
  return saved === null ? null : Number(saved);
};

/** Saves the score if it beats the best one. Returns true for a new best. */
export const submitBest = (id: GameId, score: number, lowerWins = false) => {
  const best = readBest(id);
  const isBest = best === null || (lowerWins ? score < best : score > best);
  if (isBest) localStorage.setItem(bestKey(id), String(score));
  window.dispatchEvent(new Event(GAMES_EVENT));
  return isBest;
};

/** Best score per game, saved in the browser. `lowerWins` is for time-based games. */
export const useBest = (id: GameId, lowerWins = false) => {
  const [best, setBest] = useState<number | null>(() => readBest(id));

  const submit = useCallback(
    (score: number) => {
      const isBest = submitBest(id, score, lowerWins);
      if (isBest) setBest(score);
      return isBest;
    },
    [id, lowerWins],
  );

  return { best, submit };
};
