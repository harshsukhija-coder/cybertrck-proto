import { useState } from "react";
import { ChapterCover } from "../chapter-cover";
import { GamepadIcon } from "../feed-icons";
import { PostFrame } from "../feed-post";
import { gameHash, type GameMeta } from "./games";
import { useQuickRound } from "./use-quick-round";

const CAPTIONS = ["one question. no pressure. (some pressure.)", "most people get this wrong. do you?", "10 seconds. go 👇", "answer, then flex in the comments"];

/** One round of a game, playable right in the feed */
export const QuickPlayPost = ({ game, round, reason, seed }: { game: GameMeta; round: number; reason?: string; seed: number }) => {
  const [liked, setLiked] = useState(false);
  const { r, index, picked, correct, streak, pick, another } = useQuickRound(game, round);
  if (!r) return null;
  const color = game.duo[1];

  return (
    <PostFrame
      id={`post-quick-${game.id}-${round}`}
      avatar={<GamepadIcon className="h-5 w-5" />}
      accent={color}
      name="offtrck.games"
      meta={`quick play · ${game.title}`}
      reason={reason}
      media={
        <div className="flex flex-col" style={{ background: `${color}12` }}>
          <div className="relative">
            <ChapterCover chapter={{ ...game, word: "" }} className="aspect-[3/1] w-full" />
            <span className="absolute left-4 top-4 rounded-full bg-black/70 px-2.5 py-1 font-jetbrains text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
              quick play{streak > 1 ? ` · ${streak}🔥` : ""}
            </span>
          </div>
          <div className="p-5 sm:p-7">
            <p className="font-jetbrains text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
              {r.kicker}
            </p>
            <p
              key={index}
              className={
                r.big
                  ? "mt-3 animate-like-pop text-center text-7xl leading-none"
                  : "mt-2 animate-tile-in font-display text-[clamp(1.3rem,5.5vw,1.7rem)] font-bold leading-[1.15] tracking-[-0.02em] [overflow-wrap:anywhere]"
              }
            >
              {r.prompt}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {r.options.map(option => {
                const tone =
                  picked === null
                    ? "border-(--line) bg-white/[0.04] hover:border-white/30"
                    : option === r.answer
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
                    className={`rounded-2xl border px-3 py-3.5 text-[15px] font-semibold transition active:scale-95 ${tone}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <div className="mt-4 animate-tile-in">
                <p className="text-sm">
                  <span className={`font-bold ${correct ? "text-emerald-300" : "text-rose-300"}`}>{correct ? "you got it! " : `it's ${r.answer}. `}</span>
                  <span className="text-(--muted)">{r.why}</span>
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={another} className="rounded-full border border-(--line) px-4 py-2 text-sm font-semibold transition hover:bg-white/[0.06]">
                    another one ↻
                  </button>
                  <a href={gameHash(game.id)} className="rounded-full px-4 py-2 text-sm font-bold text-black transition-transform hover:scale-105" style={{ background: color }}>
                    play the full game →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      }
      liked={liked}
      onToggleLike={() => setLiked(l => !l)}
      likes={Math.round(game.plays / 5) + seed * 7}
      caption={CAPTIONS[seed % CAPTIONS.length]}
      tags={game.tags}
      comments={Math.round(game.plays / 120)}
      age={`${seed + 2}h ago`}
      seed={seed}
    />
  );
};
