import { useEffect, useState } from "react";
import { GameOver, Hud } from "./game-kit";
import { shuffle, useBest } from "./game-utils";
import { QUERY_ROUNDS } from "./games";

const MISTAKE_PENALTY = 3;
const ROUND_PAUSE_MS = 900;

const scramble = (round: number) => shuffle([...QUERY_ROUNDS[round].tiles, QUERY_ROUNDS[round].decoy]);

type Phase = "ready" | "playing" | "over";

export const QueryBuilder = () => {
  const [phase, setPhase] = useState<Phase>("ready");
  const [round, setRound] = useState(0);
  const [tiles, setTiles] = useState(() => scramble(0));
  const [placed, setPlaced] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [shaking, setShaking] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const { best, submit } = useBest("query-builder", true);

  const target = QUERY_ROUNDS[round].tiles;
  const roundDone = placed === target.length;

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 100);
    return () => window.clearInterval(timer);
  }, [phase, startedAt]);

  const start = () => {
    setRound(0);
    setTiles(scramble(0));
    setPlaced(0);
    setMistakes(0);
    setElapsed(0);
    setNewBest(false);
    setStartedAt(Date.now());
    setPhase("playing");
  };

  const finishRound = (totalMistakes: number) => {
    window.setTimeout(() => {
      const next = round + 1;
      if (next < QUERY_ROUNDS.length) {
        setRound(next);
        setTiles(scramble(next));
        setPlaced(0);
        return;
      }
      const total = Math.round(((Date.now() - startedAt) / 1000 + totalMistakes * MISTAKE_PENALTY) * 10) / 10;
      setFinalScore(total);
      setNewBest(submit(total));
      setPhase("over");
    }, ROUND_PAUSE_MS);
  };

  const tap = (tile: string) => {
    if (roundDone) return;
    if (tile === target[placed]) {
      setPlaced(placed + 1);
      if (placed + 1 === target.length) finishRound(mistakes);
      return;
    }
    setMistakes(m => m + 1);
    setShaking(tile);
    window.setTimeout(() => setShaking(null), 380);
  };

  if (phase === "ready") {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <p className="font-poster text-7xl uppercase text-(--gem)">select</p>
        <p className="mt-4 max-w-xs text-(--muted)">
          5 questions. tap the SQL tiles in the right order to build each query. one tile is always a trap. wrong taps add 3 seconds.
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-8 rounded-full bg-(--gem) px-8 py-3.5 font-semibold text-black transition-transform hover:-translate-y-0.5"
        >
          open the database
        </button>
        {best !== null && <p className="mt-4 font-jetbrains text-xs uppercase text-(--muted)">best: {best}s</p>}
      </div>
    );
  }

  if (phase === "over") {
    return (
      <GameOver
        headline={finalScore < 40 ? "official database whisperer" : finalScore < 70 ? "query runs fine" : "it compiled. eventually."}
        score={`${finalScore}s`}
        detail={`${mistakes} wrong ${mistakes === 1 ? "tile" : "tiles"}${best !== null ? ` · your best: ${best}s` : ""}`}
        newBest={newBest}
        onAgain={start}
      />
    );
  }

  const used = new Set(target.slice(0, placed));

  return (
    <div className="flex flex-col gap-5">
      <Hud
        items={[
          { label: "query", value: `${round + 1}/${QUERY_ROUNDS.length}` },
          { label: "time", value: `${elapsed.toFixed(1)}s` },
          { label: "oops", value: mistakes },
        ]}
      />

      <div className="rounded-3xl border border-(--line) bg-(--panel) px-5 py-4">
        <p className="font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">the boss wants</p>
        <p className="mt-1 font-accent text-[1.7rem] italic leading-tight">"{QUERY_ROUNDS[round].ask}"</p>
      </div>

      <div
        className={`flex min-h-20 flex-wrap content-center items-center gap-2 rounded-3xl border px-4 py-4 font-jetbrains transition-colors ${
          roundDone ? "border-emerald-400/50 bg-emerald-400/10" : "border-white/10 bg-[#111318]"
        }`}
      >
        <span className="text-(--muted)">&gt;</span>
        {target.slice(0, placed).map(tile => (
          <span key={tile} className="animate-like-pop rounded-lg bg-white/10 px-2 py-1 text-sm font-bold">
            {tile}
          </span>
        ))}
        {roundDone ? (
          <span className="text-sm font-bold text-emerald-300">;  ✓ query ok</span>
        ) : (
          <span className="animate-blink inline-block h-5 w-2 bg-(--gem)" />
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2.5">
        {tiles.map(tile => {
          const isUsed = used.has(tile);
          return (
            <button
              key={`${round}-${tile}`}
              type="button"
              disabled={isUsed}
              onClick={() => tap(tile)}
              className={`rounded-2xl border px-4 py-3 font-jetbrains text-base font-bold transition-all active:scale-95 ${
                isUsed
                  ? "scale-95 border-transparent bg-white/[0.02] opacity-20"
                  : shaking === tile
                    ? "animate-shake border-rose-400/60 bg-rose-500/15"
                    : "border-[#22d3ee]/30 bg-[#22d3ee]/10 hover:-translate-y-0.5 hover:border-[#22d3ee]/70"
              }`}
            >
              {tile}
            </button>
          );
        })}
      </div>
    </div>
  );
};
