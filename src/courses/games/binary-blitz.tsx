import { useEffect, useState } from "react";
import { BLITZ_SECONDS, SKIP_PENALTY, bitsValue, blitzHeadline, newTarget } from "./fun-rounds";
import { GameOver, Hud } from "./game-kit";
import { useBest } from "./game-utils";
import { BITS } from "./games";

type Phase = "ready" | "playing" | "over";

const OFF = BITS.map(() => false);

export const BinaryBlitz = () => {
  const [phase, setPhase] = useState<Phase>("ready");
  const [target, setTarget] = useState(() => newTarget());
  const [bits, setBits] = useState(OFF);
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(0);
  const [score, setScore] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const { best, submit } = useBest("binary-blitz");

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => {
      const tick = Date.now();
      setNow(tick);
      if (tick >= endsAt) {
        setPhase("over");
        setNewBest(submit(score));
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, endsAt, score, submit]);

  const start = () => {
    const at = Date.now();
    setTarget(newTarget());
    setBits(OFF);
    setNow(at);
    setEndsAt(at + BLITZ_SECONDS * 1000);
    setScore(0);
    setNewBest(false);
    setPhase("playing");
  };

  const flip = (i: number) => {
    const next = bits.map((on, j) => (j === i ? !on : on));
    if (bitsValue(next) !== target) return setBits(next);
    setScore(s => s + 1);
    setTarget(newTarget(target));
    setBits(OFF);
  };

  const skip = () => {
    setTarget(newTarget(target));
    setBits(OFF);
    setEndsAt(e => e - SKIP_PENALTY * 1000);
  };

  if (phase === "ready") {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <p className="font-poster text-7xl uppercase text-(--gem)">{BLITZ_SECONDS}s</p>
        <p className="mt-4 max-w-xs text-(--muted)">you'll see a number. flip the bits so they add up to it. every match = 1 point. skipping costs {SKIP_PENALTY} seconds.</p>
        <button type="button" onClick={start} className="mt-8 rounded-full bg-(--gem) px-8 py-3.5 font-semibold text-black transition-transform hover:-translate-y-0.5">
          start flipping
        </button>
        {best !== null && <p className="mt-4 font-jetbrains text-xs uppercase text-(--muted)">best: {best}</p>}
      </div>
    );
  }

  if (phase === "over") {
    return <GameOver headline={blitzHeadline(score)} score={score} detail={best !== null ? `your best: ${best}` : ""} newBest={newBest} onAgain={start} />;
  }

  const timeLeft = Math.max(0, (endsAt - now) / 1000);
  const urgent = timeLeft < 10;
  const value = bitsValue(bits);

  return (
    <div className="flex flex-col gap-5">
      <Hud
        items={[
          { label: "time", value: <span className={urgent ? "text-rose-400" : ""}>{timeLeft.toFixed(1)}</span> },
          { label: "score", value: score },
          { label: "you have", value: <span className={value > target ? "text-rose-400" : ""}>{value}</span> },
        ]}
      />
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-[width] duration-100 ease-linear ${urgent ? "bg-rose-400" : "bg-(--gem)"}`} style={{ width: `${(timeLeft / BLITZ_SECONDS) * 100}%` }} />
      </div>

      <div className="flex h-40 flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#111318]">
        <p className="font-jetbrains text-[11px] uppercase tracking-wider text-(--muted)">make</p>
        <p key={target} className="animate-like-pop font-poster text-8xl leading-none">
          {target}
        </p>
      </div>

      <div className="grid grid-cols-8 gap-1.5">
        {BITS.map((worth, i) => (
          <button
            key={worth}
            type="button"
            onClick={() => flip(i)}
            className={`flex flex-col items-center rounded-xl border py-3 transition active:scale-95 ${bits[i] ? "border-(--gem) bg-(--gem) text-black" : "border-(--line) bg-(--panel) hover:border-white/40"}`}
          >
            <span className="font-poster text-3xl leading-none">{bits[i] ? 1 : 0}</span>
            <span className={`mt-1 font-jetbrains text-[9px] ${bits[i] ? "text-black/70" : "text-(--muted)"}`}>{worth}</span>
          </button>
        ))}
      </div>

      <button type="button" onClick={skip} className="mx-auto rounded-full border border-(--line) px-4 py-2 text-sm text-(--muted) transition hover:text-(--fg)">
        skip this one (−{SKIP_PENALTY}s)
      </button>
    </div>
  );
};
