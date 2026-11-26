import { useState } from "react";
import { GameOver, Hud } from "./game-kit";
import { shuffle, useBest } from "./game-utils";

type Part = "assets" | "liabilities" | "equity";

type Round = {
  business: string;
  values: Record<Part, number>;
  missing: Part;
  options: number[];
};

const ROUNDS = 8;
const STEP = 5000;
const BUSINESSES = ["riya's chai stall", "a corner bakery", "a phone repair shop", "a tuition centre", "a t-shirt brand", "a food truck", "a cycle shop", "a small café"];

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const randomSteps = (min: number, max: number) => (min + Math.floor(Math.random() * (max - min + 1))) * STEP;

const QUESTION: Record<Part, (v: Record<Part, number>) => string> = {
  equity: v => `owns ${rupees(v.assets)} of stuff and owes ${rupees(v.liabilities)}. how much is the owner's?`,
  liabilities: v => `owns ${rupees(v.assets)} of stuff. the owner put in ${rupees(v.equity)}. how much does it owe?`,
  assets: v => `owes ${rupees(v.liabilities)} and the owner's share is ${rupees(v.equity)}. what does it own?`,
};

const EXPLAIN: Record<Part, (v: Record<Part, number>) => string> = {
  equity: v => `equity = assets − liabilities = ${rupees(v.assets)} − ${rupees(v.liabilities)}.`,
  liabilities: v => `liabilities = assets − equity = ${rupees(v.assets)} − ${rupees(v.equity)}.`,
  assets: v => `assets = liabilities + equity = ${rupees(v.liabilities)} + ${rupees(v.equity)}.`,
};

const makeRound = (business: string): Round => {
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

const newGame = () => shuffle(BUSINESSES).slice(0, ROUNDS).map(makeRound);

const Box = ({ label, value, hidden }: { label: string; value: number; hidden: boolean }) => (
  <div className={`min-w-0 flex-1 rounded-2xl border px-2 py-3 text-center ${hidden ? "border-(--gem) bg-(--gem)/10" : "border-(--line) bg-white/[0.03]"}`}>
    <p className="font-jetbrains text-[9px] uppercase tracking-wider text-(--muted)">{label}</p>
    <p className={`mt-1 truncate font-display text-base font-bold tabular-nums sm:text-lg ${hidden ? "text-(--gem)" : ""}`}>{hidden ? "?" : rupees(value)}</p>
  </div>
);

export const BalanceIt = () => {
  const [rounds, setRounds] = useState(newGame);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const { best, submit } = useBest("balance-it");

  const round = rounds[index];
  const answer = round ? round.values[round.missing] : 0;

  const pick = (value: number) => {
    if (picked !== null) return;
    setPicked(value);
    const right = value === answer;
    setScore(s => s + (right ? 1 : 0));
    setStreak(s => (right ? s + 1 : 0));
  };

  const next = () => {
    setPicked(null);
    if (index + 1 === rounds.length) setNewBest(submit(score));
    setIndex(i => i + 1);
  };

  const restart = () => {
    setRounds(newGame());
    setIndex(0);
    setPicked(null);
    setScore(0);
    setStreak(0);
    setNewBest(false);
  };

  if (!round) {
    return (
      <GameOver
        headline={score === ROUNDS ? "the books balance. hire this person." : score >= 6 ? "solid accountant energy" : "the auditor is not impressed"}
        score={`${score}/${ROUNDS}`}
        detail={best !== null ? `your best: ${best}/${ROUNDS}` : ""}
        newBest={newBest}
        onAgain={restart}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Hud
        items={[
          { label: "round", value: `${index + 1}/${ROUNDS}` },
          { label: "score", value: score },
          { label: "streak", value: streak > 1 ? `${streak}🔥` : streak },
        ]}
      />

      <div key={index} className="animate-tile-in rounded-3xl border border-white/10 bg-[#111318] p-5">
        <p className="font-jetbrains text-[10px] uppercase tracking-wider text-(--gem)">{round.business}</p>
        <p className="mt-2 font-display text-xl font-bold leading-snug">{QUESTION[round.missing](round.values)}</p>
        <div className="mt-5 flex items-center gap-1.5">
          <Box label="assets" value={round.values.assets} hidden={round.missing === "assets" && picked === null} />
          <span className="font-display text-lg text-(--muted)">=</span>
          <Box label="liabilities" value={round.values.liabilities} hidden={round.missing === "liabilities" && picked === null} />
          <span className="font-display text-lg text-(--muted)">+</span>
          <Box label="equity" value={round.values.equity} hidden={round.missing === "equity" && picked === null} />
        </div>
      </div>

      <div className="grid gap-2.5">
        {round.options.map(option => {
          const tone =
            picked === null
              ? "border-(--line) bg-(--panel) hover:border-white/40"
              : option === answer
                ? "border-emerald-400 bg-emerald-400/15"
                : option === picked
                  ? "border-rose-400 bg-rose-400/15 animate-shake"
                  : "border-(--line) opacity-40";
          return (
            <button
              key={option}
              type="button"
              disabled={picked !== null}
              onClick={() => pick(option)}
              className={`rounded-2xl border px-4 py-3.5 font-display text-xl font-bold tabular-nums transition ${tone}`}
            >
              {rupees(option)}
            </button>
          );
        })}
      </div>

      <div className="min-h-16">
        {picked !== null && (
          <div className={`flex animate-tile-in items-center gap-3 rounded-2xl px-4 py-3 text-sm ${picked === answer ? "bg-emerald-400/10" : "bg-rose-500/10"}`}>
            <p className="min-w-0 flex-1">
              <span className={`font-bold ${picked === answer ? "text-emerald-300" : "text-rose-300"}`}>{picked === answer ? "balanced! " : "nope. "}</span>
              <span className="text-(--muted)">{EXPLAIN[round.missing](round.values)}</span>
            </p>
            <button type="button" onClick={next} className="shrink-0 rounded-full bg-(--gem) px-4 py-2 font-semibold text-black">
              {index + 1 === rounds.length ? "finish" : "next →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
