import { useEffect, useRef, useState, type PointerEvent } from "react";
import { GameOver, Hud } from "./game-kit";
import { shuffle, useBest } from "./game-utils";
import type { GameId, SwipeCard } from "./games";

type Side = { label: string; color: string };

type Props = {
  gameId: GameId;
  cards: SwipeCard[];
  left: Side;
  right: Side;
  /** Font for the card prompt, e.g. mono for links */
  promptClass?: string;
};

const SWIPE_DISTANCE = 90;
const FLY_MS = 260;

type Result = { card: SwipeCard; correct: boolean };

export const SwipeGame = ({ gameId, cards, left, right, promptClass = "font-display" }: Props) => {
  const [deck, setDeck] = useState(() => shuffle(cards));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [dragX, setDragX] = useState(0);
  const [flying, setFlying] = useState<"left" | "right" | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<number | null>(null);
  const { best, submit } = useBest(gameId);

  const card = deck[index];
  const nextCard = deck[index + 1];
  const score = results.filter(r => r.correct).length;
  let streak = 0;
  for (let i = results.length - 1; i >= 0 && results[i].correct; i--) streak++;
  const last = results.at(-1);
  const done = index >= deck.length;

  const answer = (side: "left" | "right") => {
    if (!card || flying) return;
    setFlying(side);
    window.setTimeout(() => {
      const nextResults = [...results, { card, correct: card.side === side }];
      setResults(nextResults);
      setIndex(i => i + 1);
      setFlying(null);
      setDragX(0);
      if (nextResults.length === deck.length) {
        setNewBest(submit(nextResults.filter(r => r.correct).length));
      }
    }, FLY_MS);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") answer("left");
      if (event.key === "ArrowRight") answer("right");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const restart = () => {
    setDeck(shuffle(cards));
    setIndex(0);
    setResults([]);
    setNewBest(false);
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragStart.current = event.clientX;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current !== null) setDragX(event.clientX - dragStart.current);
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const dx = event.clientX - dragStart.current;
    dragStart.current = null;
    setDragging(false);
    if (Math.abs(dx) > SWIPE_DISTANCE) {
      setDragX(dx);
      answer(dx < 0 ? "left" : "right");
    } else {
      setDragX(0);
    }
  };

  if (done) {
    const missed = results.filter(r => !r.correct);
    return (
      <GameOver
        headline={score === deck.length ? "flawless. actual genius." : score >= deck.length * 0.7 ? "big brain energy" : "the internet tricked you"}
        score={`${score}/${deck.length}`}
        detail={best !== null ? `your best: ${best}/${deck.length}` : ""}
        newBest={newBest}
        onAgain={restart}
      >
        {missed.length > 0 && (
          <ul className="mt-6 w-full space-y-2 text-left">
            {missed.map(({ card: c }) => (
              <li key={c.prompt} className="rounded-2xl border border-(--line) bg-(--panel) px-4 py-3 text-sm">
                <span className={`${promptClass} font-semibold`}>{c.prompt}</span>
                <span className="text-(--muted)"> → {c.side === "left" ? left.label : right.label}. {c.why}</span>
              </li>
            ))}
          </ul>
        )}
      </GameOver>
    );
  }

  const x = flying === "left" ? -520 : flying === "right" ? 520 : dragX;
  const lean = Math.max(-1, Math.min(1, x / SWIPE_DISTANCE));

  return (
    <div className="flex flex-col gap-5">
      <Hud
        items={[
          { label: "card", value: `${index + 1}/${deck.length}` },
          { label: "score", value: score },
          { label: "streak", value: streak > 1 ? `${streak}🔥` : streak },
        ]}
      />

      <div className="relative h-72 select-none sm:h-80">
        {nextCard && (
          <div className="absolute inset-0 scale-[0.94] rounded-3xl border border-(--line) bg-white/[0.04] translate-y-3" />
        )}
        <div
          key={index}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute inset-0 flex cursor-grab touch-none flex-col items-center justify-center rounded-3xl border border-white/10 bg-[#111318] p-8 text-center shadow-2xl shadow-black/50 active:cursor-grabbing"
          style={{
            transform: `translateX(${x}px) rotate(${x / 16}deg)`,
            transition: dragging ? "none" : `transform ${FLY_MS}ms ease-out`,
          }}
        >
          <span
            className="absolute left-5 top-5 -rotate-12 rounded-lg border-2 px-2 py-0.5 font-poster text-2xl uppercase"
            style={{ color: left.color, borderColor: left.color, opacity: Math.max(0, -lean) }}
          >
            {left.label}
          </span>
          <span
            className="absolute right-5 top-5 rotate-12 rounded-lg border-2 px-2 py-0.5 font-poster text-2xl uppercase"
            style={{ color: right.color, borderColor: right.color, opacity: Math.max(0, lean) }}
          >
            {right.label}
          </span>
          <p className={`${promptClass} text-2xl [overflow-wrap:anywhere] font-bold leading-snug sm:text-3xl`}>{card.prompt}</p>
          <p className="mt-4 font-jetbrains text-[11px] uppercase tracking-wider text-(--muted)">drag me</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {([["left", left], ["right", right]] as const).map(([side, s]) => (
          <button
            key={side}
            type="button"
            onClick={() => answer(side)}
            className="rounded-2xl border-2 py-3.5 font-poster text-2xl uppercase transition-transform hover:-translate-y-0.5 active:scale-95"
            style={{ color: s.color, borderColor: `${s.color}66`, background: `${s.color}14` }}
          >
            {side === "left" ? "← " : ""}
            {s.label}
            {side === "right" ? " →" : ""}
          </button>
        ))}
      </div>

      <div className="min-h-16">
        {last && (
          <p key={results.length} className={`animate-tile-in rounded-2xl px-4 py-3 text-sm ${last.correct ? "bg-emerald-400/10" : "bg-rose-500/10"}`}>
            <span className={`font-bold ${last.correct ? "text-emerald-300" : "text-rose-300"}`}>
              {last.correct ? "correct! " : "nope. "}
            </span>
            <span className="text-(--muted)">
              {last.card.prompt} → {last.card.side === "left" ? left.label : right.label}. {last.card.why}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
