import { ChapterCover } from "../chapter-cover";
import { PacketPuzzle } from "./packet-puzzle";
import { PortRush } from "./port-rush";
import { SwipeGame } from "./swipe-game";
import { GAMES, PHISH_CARDS, TCP_UDP_CARDS, gameHash, type GameId, type GameMeta } from "./games";

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
    <p className="mt-2 text-(--muted)">tiny games. real networking. beat your own best score.</p>
    <div className="mt-7 grid gap-4 sm:grid-cols-2">
      {GAMES.map((game, i) => (
        <GameCard key={game.id} game={game} featured={i === 0 || i === GAMES.length - 1} />
      ))}
    </div>
  </div>
);

export const GameView = ({ id }: { id: GameId }) => {
  const game = GAMES.find(g => g.id === id);
  if (!game) return <GamesGrid />;

  return (
    <div className="mx-auto max-w-md animate-tile-in">
      <a href="#/feed/games" className="font-jetbrains text-xs uppercase tracking-wider text-(--muted) hover:text-(--fg)">
        ← all games
      </a>
      <div className="mt-4 flex items-center gap-4">
        <ChapterCover chapter={{ ...game, word: "" }} className="h-16 w-16 shrink-0 rounded-2xl" />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold lowercase tracking-[-0.03em]">{game.title}</h1>
          <p className="text-sm text-(--muted)">{game.tagline}</p>
        </div>
      </div>
      <div className="mt-6 rounded-[28px] border border-(--line) bg-(--panel) p-4 backdrop-blur-sm sm:p-6">
        <GameBody key={id} id={id} />
      </div>
    </div>
  );
};