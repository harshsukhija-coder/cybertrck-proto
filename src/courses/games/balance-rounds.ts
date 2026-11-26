import { shuffle } from "./game-utils";

export type Part = "assets" | "liabilities" | "equity";

export type BalanceRound = {
  business: string;
  values: Record<Part, number>;
  missing: Part;
  options: number[];
};

export const BALANCE_ROUNDS = 8;
const STEP = 5000;
const BUSINESSES = ["riya's chai stall", "a corner bakery", "a phone repair shop", "a tuition centre", "a t-shirt brand", "a food truck", "a cycle shop", "a small café"];

export const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const randomSteps = (min: number, max: number) => (min + Math.floor(Math.random() * (max - min + 1))) * STEP;

export const BALANCE_QUESTION: Record<Part, (v: Record<Part, number>) => string> = {
  equity: v => `owns ${rupees(v.assets)} of stuff and owes ${rupees(v.liabilities)}. how much is the owner's?`,
  liabilities: v => `owns ${rupees(v.assets)} of stuff. the owner put in ${rupees(v.equity)}. how much does it owe?`,
  assets: v => `owes ${rupees(v.liabilities)} and the owner's share is ${rupees(v.equity)}. what does it own?`,
};

export const BALANCE_EXPLAIN: Record<Part, (v: Record<Part, number>) => string> = {
  equity: v => `equity = assets − liabilities = ${rupees(v.assets)} − ${rupees(v.liabilities)}.`,
  liabilities: v => `liabilities = assets − equity = ${rupees(v.assets)} − ${rupees(v.equity)}.`,
  assets: v => `assets = liabilities + equity = ${rupees(v.liabilities)} + ${rupees(v.equity)}.`,
};

const makeRound = (business: string): BalanceRound => {
  const liabilities = randomSteps(2, 16);
  const equity = randomSteps(2, 16);
  const values = { assets: liabilities + equity, liabilities, equity };
  const missing = (["assets", "liabilities", "equity"] as const)[Math.floor(Math.random() * 3)];
  const answer = values[missing];
  /** The classic mistake: adding when you should subtract, and the other way round */
  const trap = missing === "assets" ? Math.abs(liabilities - equity) || answer + 2 * STEP : values.assets + (missing === "equity" ? liabilities : equity);
  const wrong = new Set<number>([trap]);
  while (wrong.size < 2 || wrong.has(answer)) {
    wrong.delete(answer);
    wrong.add(Math.max(STEP, answer + (Math.random() < 0.5 ? -1 : 1) * randomSteps(1, 3)));
  }
  return { business, values, missing, options: shuffle([answer, ...[...wrong].slice(0, 2)]) };
};

export const newBalanceGame = () => shuffle(BUSINESSES).slice(0, BALANCE_ROUNDS).map(makeRound);

export const balanceHeadline = (score: number) =>
  score === BALANCE_ROUNDS ? "the books balance. hire this person." : score >= 6 ? "solid accountant energy" : "the auditor is not impressed";
