import { useEffect, useState } from "react";
import { GameOver, Hud } from "./game-kit";
import { shuffle, useBest } from "./game-utils";
import { PUZZLE_MESSAGES } from "./games";

const MISTAKE_PENALTY = 2;
const ROUND_PAUSE_MS = 800;

type Packet = { seq: number; word: string };

/** Splits a message into word packets, numbered by byte offset like real TCP sequence numbers */
const packetize = (message: string): Packet[] => {
  let offset = 0;
  return message.split(" ").map(word => {
    const packet = { seq: offset, word };
    offset += word.length + 1;
    return packet;
  });
};

const makeRound = (round: number) => {
  const packets = packetize(PUZZLE_MESSAGES[round]);
  return { packets, scrambled: shuffle(packets) };
};

type Phase = "ready" | "playing" | "over";

export const PacketPuzzle = () => {
  const [phase, setPhase] = useState<Phase>("ready");
  const [round, setRound] = useState(0);
  const [{ packets, scrambled }, setPuzzle] = useState(() => makeRound(0));
  const [placed, setPlaced] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [shaking, setShaking] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const { best, submit } = useBest("packet-puzzle", true);

  const roundDone = placed === packets.length;

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 100);
    return () => window.clearInterval(timer);
  }, [phase, startedAt]);

  useEffect(() => {
    if (phase !== "playing" || !roundDone) return;
    const timer = window.setTimeout(() => {
      const next = round + 1;
      if (next < PUZZLE_MESSAGES.length) {
        setRound(next);
        setPuzzle(makeRound(next));
        setPlaced(0);
        return;
      }
      const total = Math.round(((Date.now() - startedAt) / 1000 + mistakes * MISTAKE_PENALTY) * 10) / 10;
      setFinalScore(total);
      setNewBest(submit(total));
      setPhase("over");
    }, ROUND_PAUSE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, roundDone, round, startedAt, mistakes, submit]);

  const start = () => {
    setRound(0);
    setPuzzle(makeRound(0));
    setPlaced(0);
    setMistakes(0);
    setElapsed(0);
    setNewBest(false);
    setStartedAt(Date.now());
    setPhase("playing");
  };

  const tap = (packet: Packet) => {
    if (roundDone) return;
    if (packet.seq === packets[placed].seq) {
      setPlaced(p => p + 1);
      return;
    }
    setMistakes(m => m + 1);
    setShaking(packet.seq);
    window.setTimeout(() => setShaking(null), 380);
  };

  if (phase === "ready") {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <p className="font-poster text-7xl uppercase text-(--gem)">seq?</p>
        <p className="mt-4 max-w-xs text-(--muted)">
          5 messages got chopped into packets and arrived scrambled. tap them in order of their{" "}
          <span className="font-jetbrains text-(--fg)">seq</span> number to rebuild each one. wrong taps add 2 seconds.
        </p>
        <button
          type="button"
          onClick={start}
          className="mt-8 rounded-full bg-(--gem) px-8 py-3.5 font-semibold text-black transition-transform hover:-translate-y-0.5"
        >
          start receiving
        </button>
        {best !== null && <p className="mt-4 font-jetbrains text-xs uppercase text-(--muted)">best: {best}s</p>}
      </div>
    );
  }

  if (phase === "over") {
    return (
      <GameOver
        headline={finalScore < 30 ? "faster than fibre" : finalScore < 50 ? "smooth connection" : "a bit laggy, but delivered"}
        score={`${finalScore}s`}
        detail={`${mistakes} wrong ${mistakes === 1 ? "tap" : "taps"}${best !== null ? ` · your best: ${best}s` : ""}`}
        newBest={newBest}
        onAgain={start}
      />
    );
  }

  const placedSeqs = new Set(packets.slice(0, placed).map(p => p.seq));

  return (
    <div className="flex flex-col gap-5">
      <Hud
        items={[
          { label: "message", value: `${round + 1}/${PUZZLE_MESSAGES.length}` },
          { label: "time", value: `${elapsed.toFixed(1)}s` },
          { label: "oops", value: mistakes },
        ]}
      />

      <div
        className={`flex min-h-24 flex-wrap content-center items-center gap-x-2 gap-y-1 rounded-3xl border px-5 py-4 transition-colors ${
          roundDone ? "border-emerald-400/50 bg-emerald-400/10" : "border-white/10 bg-[#111318]"
        }`}
      >
        <span className="w-full font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">
          {roundDone ? "delivered ✓" : "reassembled message"}
        </span>
        {packets.slice(0, placed).map(p => (
          <span key={p.seq} className="animate-like-pop font-display text-xl font-bold">
            {p.word}
          </span>
        ))}
        {!roundDone && <span className="animate-blink inline-block h-5 w-2 bg-(--gem)" />}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {scrambled.map(packet => {
          const used = placedSeqs.has(packet.seq);
          return (
            <button
              key={`${round}-${packet.seq}`}
              type="button"
              disabled={used}
              onClick={() => tap(packet)}
              className={`flex flex-col items-start rounded-2xl border px-3.5 py-3 text-left transition-all active:scale-95 ${
                used
                  ? "scale-95 border-transparent bg-white/[0.02] opacity-25"
                  : shaking === packet.seq
                    ? "animate-shake border-rose-400/60 bg-rose-500/15"
                    : "border-[#ff8a3d]/30 bg-[#ff8a3d]/10 hover:-translate-y-0.5 hover:border-[#ff8a3d]/70"
              }`}
            >
              <span className="font-jetbrains text-[10px] uppercase tracking-wider text-[#ffb37a]">seq {packet.seq}</span>
              <span className="mt-0.5 font-display text-lg font-bold">{packet.word}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
