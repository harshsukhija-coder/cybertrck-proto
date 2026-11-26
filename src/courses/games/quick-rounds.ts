import { emojiRound, type ChoiceRound } from "./fun-rounds";
import {
  ASSET_LIABILITY_CARDS,
  DEBIT_CREDIT_CARDS,
  EMOJI_ROUNDS,
  MYTH_CARDS,
  PASSWORD_CARDS,
  PHISH_CARDS,
  SCAM_CARDS,
  TCP_UDP_CARDS,
  type GameId,
  type SwipeCard,
} from "./games";

const swipe = (cards: SwipeCard[], left: string, right: string, kicker: string) => () =>
  cards.map((c): ChoiceRound => ({ kicker, prompt: c.prompt, options: [left, right], answer: c.side === "left" ? left : right, why: c.why }));

/** Games that can be played one round at a time, right inside a feed post */
export const QUICK_DECKS: Partial<Record<GameId, () => ChoiceRound[]>> = {
  /** Fixed options, so a round number always means the same question (the terminal relies on it) */
  "emoji-decode": () =>
    EMOJI_ROUNDS.map((r, i) => ({
      ...emojiRound(r),
      options: [r, ...[5, 10, 15].map(k => EMOJI_ROUNDS[(i + k) % EMOJI_ROUNDS.length])].map(o => o.answer).sort(),
    })),
  "myth-or-fact": swipe(MYTH_CARDS, "myth", "fact", "myth or fact?"),
  "crack-it": swipe(PASSWORD_CARDS, "weak", "strong", "would a hacker crack this?"),
  "real-or-phish": swipe(PHISH_CARDS, "phish", "real", "would you click it?"),
  "scam-or-legit": swipe(SCAM_CARDS, "scam", "legit", "scam or legit?"),
  "tcp-or-udp": swipe(TCP_UDP_CARDS, "tcp", "udp", "which protocol?"),
  "debit-or-credit": swipe(DEBIT_CREDIT_CARDS, "debit", "credit", "debit or credit?"),
  "asset-or-liability": swipe(ASSET_LIABILITY_CARDS, "asset", "liability", "asset or liability?"),
};

export const hasQuickDeck = (id: GameId) => id in QUICK_DECKS;
