import { useState } from "react";
import { GameOver, Hud } from "./game-kit";
import { BALANCE_EXPLAIN as EXPLAIN, BALANCE_QUESTION as QUESTION, BALANCE_ROUNDS as ROUNDS, balanceHeadline, newBalanceGame as newGame, rupees } from "./balance-rounds";
import { useBest } from "./game-utils";

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
        headline={balanceHeadline(score)}
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
