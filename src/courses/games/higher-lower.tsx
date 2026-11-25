import { useState } from "react";
import { GameOver, Hud } from "./game-kit";
import { shuffle, useBest } from "./game-utils";
import { AUDIENCES } from "./games";

type App = (typeof AUDIENCES)[number];
type Reveal = { picked: "left" | "right"; correct: boolean } | null;

const REVEAL_MS = 1100;

const freshDeck = (exclude?: App) => shuffle(AUDIENCES.filter(a => a !== exclude));

const AppCard = ({
  app,
  showUsers,
  state,
  onPick,
}: {
  app: App;
  showUsers: boolean;
  state: "idle" | "right" | "wrong";
  onPick: () => void;
}) => (
  <button
    type="button"
    onClick={onPick}
    className={`group relative flex min-h-36 flex-col items-center justify-center overflow-hidden rounded-3xl border-2 p-5 text-center transition-transform active:scale-[0.97] sm:min-h-56 ${
      state === "right" ? "border-emerald-400" : state === "wrong" ? "animate-shake border-rose-400" : "border-transparent hover:-translate-y-1"
    }`}
    style={{ background: `${app.color}1f` }}
  >
    <span className="font-poster text-[clamp(2.5rem,11vw,3.75rem)] uppercase leading-none" style={{ color: app.color }}>
      {app.name}
    </span>
    <span className="mt-3 font-display text-2xl font-bold tabular-nums">
      {showUsers ? `${app.users}B` : <span className="text-(--muted)">? users</span>}
    </span>
    {!showUsers && <span className="mt-1 font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">tap if bigger</span>}
  </button>
);

export const HigherLower = () => {
  const [deck, setDeck] = useState(() => freshDeck());
  const [streak, setStreak] = useState(0);
  const [reveal, setReveal] = useState<Reveal>(null);
  const [over, setOver] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const { best, submit } = useBest("higher-lower");

  const [left, right] = deck;

  const pick = (side: "left" | "right") => {
    if (reveal) return;
    const [mine, other] = side === "left" ? [left, right] : [right, left];
    const correct = mine.users >= other.users;
    setReveal({ picked: side, correct });

    window.setTimeout(() => {
      setReveal(null);
      if (!correct) {
        setNewBest(submit(streak));
        setOver(true);
        return;
      }
      setStreak(s => s + 1);
      setDeck(d => (d.length > 2 ? d.slice(1) : [d[1], ...freshDeck(d[1])]));
    }, REVEAL_MS);
  };

  const restart = () => {
    setDeck(freshDeck());
    setStreak(0);
    setOver(false);
    setNewBest(false);
  };

  if (over) {
    return (
      <GameOver
        headline={streak >= 8 ? "you are the algorithm" : streak >= 4 ? "solid marketer instincts" : "the numbers are wild, right?"}
        score={streak}
        detail={`${left.name} has ~${left.users}B users, ${right.name} has ~${right.users}B.${best !== null ? ` your best streak: ${best}` : ""}`}
        newBest={newBest}
        onAgain={restart}
      />
    );
  }

  const stateFor = (side: "left" | "right") => {
    if (!reveal || reveal.picked !== side) return "idle";
    return reveal.correct ? "right" : "wrong";
  };

  return (
    <div className="flex flex-col gap-5">
      <Hud
        items={[
          { label: "streak", value: streak > 2 ? `${streak}🔥` : streak },
          { label: "best", value: best ?? "–" },
          { label: "question", value: "more users?" },
        ]}
      />
      <div className="relative grid gap-3 sm:grid-cols-2">
        <AppCard key={`l-${left.name}`} app={left} showUsers={!!reveal} state={stateFor("left")} onPick={() => pick("left")} />
        <span className="pointer-events-none absolute left-1/2 top-1/2 z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-(--line) bg-[#07080c] font-poster text-lg uppercase">
          vs
        </span>
        <AppCard key={`r-${right.name}`} app={right} showUsers={!!reveal} state={stateFor("right")} onPick={() => pick("right")} />
      </div>
      <p className="text-center text-sm text-(--muted)">monthly active users, roughly. a tie counts as a win.</p>
    </div>
  );
};
