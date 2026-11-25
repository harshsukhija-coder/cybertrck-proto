import type { ReactNode } from "react";

export const Hud = ({ items }: { items: { label: string; value: ReactNode }[] }) => (
  <div className="flex items-center justify-between gap-3">
    {items.map(item => (
      <div key={item.label} className="min-w-0">
        <p className="font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">{item.label}</p>
        <p className="font-display text-xl font-bold tabular-nums">{item.value}</p>
      </div>
    ))}
  </div>
);

type GameOverProps = {
  headline: string;
  score: ReactNode;
  detail: string;
  newBest: boolean;
  onAgain: () => void;
  children?: ReactNode;
};

export const GameOver = ({ headline, score, detail, newBest, onAgain, children }: GameOverProps) => (
  <div className="flex animate-tile-in flex-col items-center py-6 text-center">
    {newBest && (
      <span className="rounded-full bg-(--gem) px-3 py-1 font-jetbrains text-[10px] font-bold uppercase tracking-wider text-black">
        new best
      </span>
    )}
    <p className="mt-4 font-poster text-8xl uppercase leading-none text-(--gem)">{score}</p>
    <h3 className="mt-3 font-display text-2xl font-bold lowercase tracking-tight">{headline}</h3>
    <p className="mt-2 max-w-xs text-(--muted)">{detail}</p>
    {children}
    <div className="mt-7 flex gap-3">
      <button
        type="button"
        onClick={onAgain}
        className="rounded-full bg-(--gem) px-6 py-3 font-semibold text-black transition-transform hover:-translate-y-0.5"
      >
        play again
      </button>
      <a
        href="#/feed/games"
        className="rounded-full border border-(--line) bg-(--panel) px-6 py-3 font-medium text-(--muted) transition-colors hover:text-(--fg)"
      >
        more games
      </a>
    </div>
  </div>
);
