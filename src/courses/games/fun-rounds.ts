import { rupees } from "./balance-rounds";
import { shuffle } from "./game-utils";
import { BITS, EMOJI_ROUNDS } from "./games";

/** One multiple-choice round, shared by the app and the terminal */
export type ChoiceRound = { kicker: string; prompt: string; big?: boolean; options: string[]; answer: string; why: string };

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

// ---------- emoji decode ----------

export const EMOJI_COUNT = 10;

export const emojiRound = (r: (typeof EMOJI_ROUNDS)[number]): ChoiceRound => ({
  kicker: "what does this mean?",
  prompt: r.emoji,
  big: true,
  answer: r.answer,
  why: r.why,
  options: shuffle([r.answer, ...shuffle(EMOJI_ROUNDS.filter(o => o.answer !== r.answer)).slice(0, 3).map(o => o.answer)]),
});

export const newEmojiGame = () => shuffle(EMOJI_ROUNDS).slice(0, EMOJI_COUNT).map(emojiRound);

export const emojiHeadline = (score: number) =>
  score === EMOJI_COUNT ? "fluent in emoji AND tech 🏆" : score >= 7 ? "you speak internet" : score >= 4 ? "half decoded 🔍" : "🤔❓ try again";

// ---------- money time machine ----------

export const MONEY_COUNT = 8;

/** Rounds to 3 significant figures, so amounts read like real estimates */
const nice = (n: number) => {
  const step = 10 ** Math.max(0, Math.floor(Math.log10(n)) - 2);
  return Math.round(n / step) * step;
};

export const newMoneyRound = (): ChoiceRound => {
  let rate = 0;
  let years = 0;
  while (rate * years < 60) {
    rate = pick([6, 8, 10, 12, 15]);
    years = pick([5, 10, 15, 20, 25, 30]);
  }
  const amount = pick([5000, 10000, 25000, 50000, 100000]);
  const answer = nice(amount * (1 + rate / 100) ** years);
  const simple = nice(amount * (1 + (rate * years) / 100));
  const options = [...new Set([answer, simple, nice(answer * 0.7), nice(answer * 1.6)])];
  return {
    kicker: `${rate}% a year · ${years} years`,
    prompt: `you invest ${rupees(amount)}. what does it grow to?`,
    answer: rupees(answer),
    options: shuffle(options).map(rupees),
    why: `money at ${rate}% doubles about every ${Math.round(72 / rate)} years (rule of 72). without compounding you'd only have ${rupees(simple)}.`,
  };
};

export const newMoneyGame = () => Array.from({ length: MONEY_COUNT }, newMoneyRound);

export const moneyHeadline = (score: number) =>
  score === MONEY_COUNT ? "warren buffett is taking notes" : score >= 6 ? "your future self says thanks" : score >= 3 ? "compounding is sneaky, right?" : "your gut guessed too low. maths wins";

// ---------- binary blitz ----------

export const BLITZ_SECONDS = 45;
export const SKIP_PENALTY = 3;

export const newTarget = (avoid?: number) => {
  let n: number;
  do n = 1 + Math.floor(Math.random() * 255);
  while (n === avoid);
  return n;
};

export const bitsValue = (bits: boolean[]) => bits.reduce((sum, on, i) => sum + (on ? BITS[i] : 0), 0);

export const blitzHeadline = (score: number) =>
  score >= 12 ? "you think in binary now 🤖" : score >= 7 ? "fast flipper" : score >= 3 ? "getting the hang of it" : "01110100 01110010 01111001 (try) again";

// ---------- lag test ----------

export const LAG_TRIES = 5;
export const EARLY_PENALTY = 500;

export const lagHeadline = (ms: number) =>
  ms < 200 ? "pro gamer reflexes ⚡" : ms < 260 ? "faster than most people" : ms < 330 ? "a normal human. respect." : "is it lag, or is it you? 😄";

export const lagDetail = (ms: number) =>
  `that's like playing on ${ms} ms ping. most online games feel smooth under 50 ms, so your brain adds more delay than good wifi does.`;
