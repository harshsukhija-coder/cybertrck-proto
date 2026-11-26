import { useEffect, useRef, useState } from "react";
import { EARLY_PENALTY, LAG_TRIES, lagDetail, lagHeadline } from "./fun-rounds";
import { GameOver, Hud } from "./game-kit";
import { useBest } from "./game-utils";

type Phase = "ready" | "waiting" | "go" | "result" | "early" | "over";

const average = (times: number[]) => Math.round(times.reduce((a, b) => a + b, 0) / Math.max(1, times.length));

export const LagTest = () => {
  const [phase, setPhase] = useState<Phase>("ready");
  const [times, setTimes] = useState<number[]>([]);
  const [newBest, setNewBest] = useState(false);
  const goAt = useRef(0);
  const { best, submit } = useBest("lag-test", true);

  useEffect(() => {
    if (phase !== "waiting") return;
    const timer = window.setTimeout(() => {
      goAt.current = performance.now();
      setPhase("go");
    }, 1200 + Math.random() * 2300);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const record = (ms: number) => {
    const next = [...times, ms];
    setTimes(next);
    if (next.length < LAG_TRIES) return;
    setNewBest(submit(average(next)));
    setPhase("over");
  };

  const tap = () => {
    if (phase === "ready" || phase === "result" || phase === "early") return setPhase("waiting");
    if (phase === "waiting") {
      setPhase("early");
      return record(EARLY_PENALTY);
    }
    if (phase === "go") {
      setPhase("result");
      record(Math.round(performance.now() - goAt.current));
    }
  };

  const restart = () => {
    setTimes([]);
    setNewBest(false);
    setPhase("ready");
  };

  if (phase === "over") {
    const avg = average(times);
    return (
      <GameOver headline={lagHeadline(avg)} score={`${avg}ms`} detail={lagDetail(avg)} newBest={newBest} onAgain={restart}>
        {best !== null && <p className="mt-2 font-jetbrains text-xs uppercase text-(--muted)">best: {best} ms (lower is better)</p>}
      </GameOver>
    );
  }

  const last = times.at(-1);
  const pad = {
    ready: { tone: "bg-[#111318] border-white/10", big: "tap to start", small: `${LAG_TRIES} tries. wait for green, then tap as fast as you can.` },
    waiting: { tone: "bg-rose-500/80 border-rose-300/40", big: "wait…", small: "don't tap yet" },
    go: { tone: "bg-emerald-400 border-emerald-200 text-black", big: "TAP!", small: "" },
    result: { tone: "bg-[#111318] border-white/10", big: `${last} ms`, small: "tap for the next one" },
    early: { tone: "bg-amber-400/90 border-amber-200 text-black", big: "too soon!", small: `that try counts as ${EARLY_PENALTY} ms. tap to go again.` },
  }[phase];

  return (
    <div className="flex flex-col gap-5">
      <Hud
        items={[
          { label: "try", value: `${Math.min(times.length + 1, LAG_TRIES)}/${LAG_TRIES}` },
          { label: "last", value: last !== undefined ? `${last}ms` : "–" },
          { label: "average", value: times.length ? `${average(times)}ms` : "–" },
        ]}
      />
      <button
        type="button"
        onPointerDown={tap}
        className={`flex h-72 select-none flex-col items-center justify-center rounded-3xl border px-6 text-center transition-colors duration-75 ${pad.tone}`}
      >
        <span className="font-poster text-6xl uppercase leading-none">{pad.big}</span>
        {pad.small && <span className="mt-3 max-w-xs text-sm opacity-80">{pad.small}</span>}
      </button>
    </div>
  );
};
