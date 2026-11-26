import { useEffect, useState } from "react";
import { GameOver, Hud } from "./game-kit";
import { shuffle, useBest } from "./game-utils";
import { PORTS } from "./games";

const ROUND_SECONDS = 30;
const WRONG_PENALTY = 3;

const makeQuestion = (avoid?: number) => {
  const pool = PORTS.filter(p => p.port !== avoid);
  const target = pool[Math.floor(Math.random() * pool.length)];
  const decoys = shuffle(PORTS.filter(p => p.port !== target.port)).slice(0, 3);
  return { target, options: shuffle([target, ...decoys]).map(p => p.service) };
};

type Phase = "ready" | "playing" | "over";

export const PortRush = () => {
  const [phase, setPhase] = useState<Phase>("ready");
  const [question, setQuestion] = useState(() => makeQuestion());
  const [endsAt, setEndsAt] = useState(0);
  const [now, setNow] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [newBest, setNewBest] = useState(false);
  const { best, submit } = useBest("port-rush");

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

  const timeLeft = Math.max(0, (endsAt - now) / 1000);

  const start = () => {
    const startAt = Date.now();
    setQuestion(makeQuestion());
    setNow(startAt);
    setEndsAt(startAt + ROUND_SECONDS * 1000);
    setScore(0);
    setStreak(0);
    setWrong(null);
    setNewBest(false);
    setPhase("playing");
  };

  const pick = (service: string) => {
    if (service === question.target.service) {
      const nextStreak = streak + 1;
      setScore(s => s + (nextStreak >= 3 ? 2 : 1));
      setStreak(nextStreak);
      setWrong(null);
      setQuestion(makeQuestion(question.target.port));
    } else {
      setStreak(0);
      setWrong(service);
      setEndsAt(e => e - WRONG_PENALTY * 1000);
    }
  };

  if (phase === "ready") {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <p className="font-poster text-7xl uppercase text-(--gem)">30s</p>
        <p className="mt-4 max-w-xs text-(--muted)">
          you'll see a port number. tap the service that lives there. 3 in a row = double points. wrong answers cost 3 seconds.
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-8 rounded-full bg-(--gem) px-8 py-3.5 font-semibold text-black transition-transform hover:-translate-y-0.5"
        >
          start the clock
        </button>
        {best !== null && <p className="mt-4 font-jetbrains text-xs uppercase text-(--muted)">best: {best}</p>}
      </div>
    );
  }

  if (phase === "over") {
    return (
      <GameOver
        headline={score >= 15 ? "legendary port sniffer" : score >= 8 ? "not bad, netadmin" : "the doors won this time"}
        score={score}
        detail={best !== null ? `your best: ${best}` : ""}
        newBest={newBest}
        onAgain={start}
      />
    );
  }

  const urgent = timeLeft < 8;

  return (
    <div className="flex flex-col gap-5">
      <Hud
        items={[
          { label: "time", value: <span className={urgent ? "text-rose-400" : ""}>{timeLeft.toFixed(1)}</span> },
          { label: "score", value: score },
          { label: "streak", value: streak >= 3 ? `${streak}🔥 ×2` : streak },
        ]}
      />
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-100 ease-linear ${urgent ? "bg-rose-400" : "bg-(--gem)"}`}
          style={{ width: `${(timeLeft / ROUND_SECONDS) * 100}%` }}
        />
      </div>

      <div className="flex h-52 flex-col items-center justify-center rounded-3xl border border-white/10 bg-(--card)">
        <p className="font-jetbrains text-[11px] uppercase tracking-wider text-(--muted)">port</p>
        <p key={question.target.port} className="animate-like-pop font-poster text-8xl leading-none">
          {question.target.port}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {question.options.map(option => (
          <button
            key={`${question.target.port}-${option}`}
            type="button"
            onClick={() => pick(option)}
            className={`rounded-2xl border px-3 py-4 font-semibold transition-all active:scale-95 ${
              wrong === option
                ? "animate-shake border-rose-400/60 bg-rose-500/15 text-rose-200"
                : "border-(--line) bg-(--panel) hover:border-(--gem)/50 hover:bg-white/[0.06]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
