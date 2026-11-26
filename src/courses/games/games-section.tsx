import { useState } from "react";
import { Rich } from "../academy/academy-ui";
import { ChapterCover } from "../chapter-cover";
import { COURSES, chapterHash, findCourse } from "../data";
import { BalanceIt } from "./balance-it";
import { BinaryBlitz } from "./binary-blitz";
import { ChoiceGame } from "./choice-game";
import { emojiHeadline, moneyHeadline, newEmojiGame, newMoneyGame } from "./fun-rounds";
import { LagTest } from "./lag-test";
import { readBest } from "./game-utils";
import { HigherLower } from "./higher-lower";
import { PacketPuzzle } from "./packet-puzzle";
import { PortRush } from "./port-rush";
import { QueryBuilder } from "./query-builder";
import { SwipeGame } from "./swipe-game";
import {
  ASSET_LIABILITY_CARDS,
  DEBIT_CREDIT_CARDS,
  GAMES,
  MYTH_CARDS,
  PASSWORD_CARDS,
  PHISH_CARDS,
  SCAM_CARDS,
  TCP_UDP_CARDS,
  gameHash,
  type GameId,
  type GameMeta,
} from "./games";

const formatPlays = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

const GameBody = ({ id }: { id: GameId }) => {
  switch (id) {
    case "tcp-or-udp":
      return (
        <SwipeGame
          gameId={id}
          cards={TCP_UDP_CARDS}
          left={{ label: "tcp", color: "#4cc9f0" }}
          right={{ label: "udp", color: "#ffd166" }}
        />
      );
    case "real-or-phish":
      return (
        <SwipeGame
          gameId={id}
          cards={PHISH_CARDS}
          left={{ label: "phish", color: "#ff4d6d" }}
          right={{ label: "real", color: "#2ee6a6" }}
          promptClass="font-jetbrains"
        />
      );
    case "port-rush":
      return <PortRush />;
    case "packet-puzzle":
      return <PacketPuzzle />;
    case "higher-lower":
      return <HigherLower />;
    case "query-builder":
      return <QueryBuilder />;
    case "scam-or-legit":
      return (
        <SwipeGame
          gameId={id}
          cards={SCAM_CARDS}
          left={{ label: "scam", color: "#ff4d6d" }}
          right={{ label: "legit", color: "#4ade80" }}
        />
      );
    case "debit-or-credit":
      return (
        <SwipeGame
          gameId={id}
          cards={DEBIT_CREDIT_CARDS}
          left={{ label: "debit", color: "#ffb547" }}
          right={{ label: "credit", color: "#4cc9f0" }}
        />
      );
    case "asset-or-liability":
      return (
        <SwipeGame
          gameId={id}
          cards={ASSET_LIABILITY_CARDS}
          left={{ label: "asset", color: "#2ee6a6" }}
          right={{ label: "liability", color: "#ff8a3d" }}
        />
      );
    case "balance-it":
      return <BalanceIt />;
    case "myth-or-fact":
      return <SwipeGame gameId={id} cards={MYTH_CARDS} left={{ label: "myth", color: "#ff8a3d" }} right={{ label: "fact", color: "#8fb4ff" }} />;
    case "crack-it":
      return (
        <SwipeGame
          gameId={id}
          cards={PASSWORD_CARDS}
          left={{ label: "weak", color: "#ff4d6d" }}
          right={{ label: "strong", color: "#2ee6a6" }}
          promptClass="font-jetbrains"
        />
      );
    case "emoji-decode":
      return <ChoiceGame gameId={id} newGame={newEmojiGame} headline={emojiHeadline} right="decoded! " />;
    case "lag-test":
      return <LagTest />;
    case "binary-blitz":
      return <BinaryBlitz />;
    case "money-machine":
      return <ChoiceGame gameId={id} newGame={newMoneyGame} headline={moneyHeadline} right="spot on! " />;
  }
};

export const GameCard = ({ game, featured = false }: { game: GameMeta; featured?: boolean }) => (
  <a
    href={gameHash(game.id)}
    className={`group flex flex-col rounded-3xl border border-(--line) bg-(--panel) p-2 backdrop-blur-sm transition-[translate,border-color,background-color] duration-300 hover:-translate-y-1 hover:border-(--gem)/40 hover:bg-white/[0.05] ${
      featured ? "sm:col-span-2" : ""
    }`}
  >
    <ChapterCover
      chapter={game}
      wordClass={featured ? "text-7xl sm:text-8xl" : "text-6xl"}
      className={`rounded-2xl ${featured ? "aspect-[16/9]" : "aspect-[4/3]"}`}
    />
    <div className="flex items-end justify-between gap-3 px-2 pb-1.5 pt-3">
      <div className="min-w-0">
        <p className="font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">
          {formatPlays(game.plays)} plays · {game.how}
        </p>
        <h3 className="mt-1 font-semibold leading-snug">{game.tagline}</h3>
      </div>
      <span className="shrink-0 rounded-full bg-(--gem) px-4 py-2 text-sm font-bold text-black transition-transform group-hover:scale-105">
        play
      </span>
    </div>
  </a>
);

export const GamesGrid = () => (
  <div className="animate-tile-in">
    <h1 className="font-display text-3xl font-bold lowercase tracking-[-0.03em] sm:text-4xl">
      learn by <span className="font-accent text-[1.3em] font-normal italic tracking-normal text-(--gem)">playing</span>
    </h1>
    <p className="mt-2 text-(--muted)">tiny games for every course. each one starts with a 30-second refresher, so you're never lost.</p>
    {COURSES.map(course => {
      const games = GAMES.filter(g => g.course === course.id);
      if (!games.length) return null;
      return (
        <section key={course.id} className="mt-9">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold lowercase">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: course.color }} />
              {course.title}
            </h2>
            <a href={`#/feed/courses/${course.id}`} className="font-jetbrains text-[11px] uppercase tracking-wider text-(--muted) hover:text-(--fg)">
              the course →
            </a>
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {games.map((game, i) => (
              <GameCard key={game.id} game={game} featured={games.length % 2 === 1 && i === 0} />
            ))}
          </div>
        </section>
      );
    })}
  </div>
);

const Primer = ({ game, onPlay }: { game: GameMeta; onPlay: () => void }) => {
  const course = findCourse(game.primer.course);
  const chapter = course?.chapters.find(ch => ch.id === game.primer.chapter);
  return (
    <div className="animate-tile-in">
      <p className="font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em] text-(--gem)">before you play · 30 sec read</p>
      <ol className="mt-4 space-y-3">
        {game.primer.points.map((point, i) => (
          <li key={point} className="flex gap-3">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 font-jetbrains text-[11px] font-bold">{i + 1}</span>
            <p className="text-[15px] leading-relaxed text-(--fg)/90 [--accent:var(--gem)]">
              <Rich text={point} />
            </p>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={onPlay}
        className="mt-6 w-full rounded-full bg-(--gem) py-3.5 font-semibold text-black transition-transform hover:-translate-y-0.5"
      >
        got it, let's play
      </button>

      {course && chapter && (
        <a
          href={chapterHash(course, chapter)}
          className="group mt-4 flex items-center gap-3 rounded-2xl border border-(--line) p-2 pr-4 transition hover:bg-white/[0.05]"
        >
          <ChapterCover chapter={{ ...chapter, word: "", number: undefined }} className="h-14 w-14 shrink-0 rounded-xl" />
          <span className="min-w-0 flex-1">
            <span className="block font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">
              want the full story? · {chapter.minutes} min
            </span>
            <span className="mt-0.5 block truncate font-semibold">learn {chapter.title} properly</span>
          </span>
          <span className="text-(--muted) transition-transform group-hover:translate-x-0.5">→</span>
        </a>
      )}
    </div>
  );
};

const GameScreen = ({ game }: { game: GameMeta }) => {
  const [stage, setStage] = useState<"primer" | "play">(() => (readBest(game.id) === null ? "primer" : "play"));

  return (
    <div className="mx-auto max-w-md animate-tile-in">
      <a href="#/feed/games" className="font-jetbrains text-xs uppercase tracking-wider text-(--muted) hover:text-(--fg)">
        ← all games
      </a>
      <div className="mt-4 flex items-center gap-4">
        <ChapterCover chapter={{ ...game, word: "" }} className="h-16 w-16 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold lowercase tracking-[-0.03em]">{game.title}</h1>
          <p className="text-sm text-(--muted)">{game.tagline}</p>
        </div>
      </div>
      <div className="mt-6 rounded-[28px] border border-(--line) bg-(--panel) p-4 backdrop-blur-sm sm:p-6">
        {stage === "primer" ? <Primer game={game} onPlay={() => setStage("play")} /> : <GameBody id={game.id} />}
      </div>
      {stage === "play" && (
        <button
          type="button"
          onClick={() => setStage("primer")}
          className="mx-auto mt-4 block rounded-full border border-(--line) px-4 py-2 text-sm text-(--muted) transition hover:text-(--fg)"
        >
          📖 quick refresher
        </button>
      )}
    </div>
  );
};

export const GameView = ({ id }: { id: GameId }) => {
  const game = GAMES.find(g => g.id === id);
  if (!game) return <GamesGrid />;
  return <GameScreen key={id} game={game} />;
};
