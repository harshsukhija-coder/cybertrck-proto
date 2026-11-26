import { useState } from "react";
import type { GameMeta } from "./games";
import { QUICK_DECKS } from "./quick-rounds";

/** State for one quick-play question, with "another one" cycling through the deck */
export const useQuickRound = (game: GameMeta, round: number) => {
  const [deck] = useState(() => QUICK_DECKS[game.id]?.() ?? []);
  const [index, setIndex] = useState(round % Math.max(1, deck.length));
  const [picked, setPicked] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const r = deck[index];

  const pick = (option: string) => {
    if (picked !== null || !r) return;
    setPicked(option);
    setStreak(s => (option === r.answer ? s + 1 : 0));
  };

  const another = () => {
    setPicked(null);
    setIndex(i => (i + 1) % deck.length);
  };

  return { r, index, picked, correct: !!r && picked === r.answer, streak, pick, another };
};
