import { useState } from "react";
import type { ChoiceRound } from "./fun-rounds";
import { GameOver, Hud } from "./game-kit";
import { useBest } from "./game-utils";
import type { GameId } from "./games";

type Props = {
  gameId: GameId;
  newGame: () => ChoiceRound[];
  headline: (score: number) => string;
  right?: string;
};

/** Multiple-choice rounds with a reveal after every pick */
export const ChoiceGame = ({ gameId, newGame, headline, right = "nailed it! " }: Props) => {
  const [rounds, setRounds] = useState(newGame);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const { best, submit } = useBest(gameId);

  const round = rounds[index];
  const correct = picked !== null && picked === round?.answer;

  const pick = (option: string) => {
    if (picked !== null) return;
    setPicked(option);
    setScore(s => s + (option === round.answer ? 1 : 0));
    setStreak(s => (option === round.answer ? s + 1 : 0));
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
        headline={headline(score)}
        score={`${score}/${rounds.length}`}
        detail={best !== null ? `your best: ${best}/${rounds.length}` : ""}
        newBest={newBest}
        onAgain={restart}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Hud
        items={[
          { label: "round", value: `${index + 1}/${rounds.length}` },
          { label: "score", value: score },
          { label: "streak", value: streak > 1 ? `${streak}🔥` : streak },
        ]}
      />

      <div key={index} className="animate-tile-in rounded-3xl border border-white/10 bg-[#111318] p-5 text-center">
        <p className="font-jetbrains text-[10px] uppercase tracking-wider text-(--gem)">{round.kicker}</p>
        <p className={round.big ? "mt-3 animate-like-pop text-7xl leading-none" : "mt-2 font-display text-xl font-bold leading-snug"}>{round.prompt}</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {round.options.map(option => {
          const tone =
            picked === null
              ? "border-(--line) bg-(--panel) hover:border-white/40"
              : option === round.answer
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
              className={`rounded-2xl border px-3 py-3.5 font-semibold tabular-nums transition active:scale-95 ${tone}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="min-h-16">
        {picked !== null && (
          <div className={`flex animate-tile-in items-center gap-3 rounded-2xl px-4 py-3 text-sm ${correct ? "bg-emerald-400/10" : "bg-rose-500/10"}`}>
            <p className="min-w-0 flex-1">
              <span className={`font-bold ${correct ? "text-emerald-300" : "text-rose-300"}`}>{correct ? right : `it's ${round.answer}. `}</span>
              <span className="text-(--muted)">{round.why}</span>
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
