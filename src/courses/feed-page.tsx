import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { OfftrckMark } from "../icons/OfftrckMark";
import { ChapterCover } from "./chapter-cover";
import { GamepadIcon, HeartIcon, HomeIcon, MonitorIcon, SparkIcon } from "./feed-icons";
import { ChapterPost, GamePost } from "./feed-post";
import { GameView, GamesGrid } from "./games/games-section";
import { GAMES, gameHash, isGameId, type GameMeta } from "./games/games";
import { GEMS, useGem, type Gem } from "./gems";
import { networkingCourse, type CourseChapter } from "./networking";
import Onboarding from "./onboarding";
import { INTERESTS, PACES, STYLES, usePrefs, type InterestId, type Prefs } from "./prefs";

type View = { kind: "feed" } | { kind: "games" } | { kind: "game"; id: string } | { kind: "start" };

const parseView = (route: string): View => {
  const [, , section, id] = route.split("/");
  if (section === "games") return id ? { kind: "game", id } : { kind: "games" };
  if (section === "start") return { kind: "start" };
  return { kind: "feed" };
};

type FeedItem = { kind: "chapter"; chapter: CourseChapter; reason?: string } | { kind: "game"; game: GameMeta; reason?: string };

const interestLabel = (id: InterestId) => INTERESTS.find(i => i.id === id)?.label ?? id;

/** Why a post is in your feed: the first interest it shares with you */
const reasonFor = (tags: InterestId[], interests: InterestId[]) => {
  const match = tags.find(t => interests.includes(t));
  return match ? `because you're into ${interestLabel(match)}` : undefined;
};

const overlap = (tags: InterestId[], interests: InterestId[]) => tags.filter(t => interests.includes(t)).length;

/** Chapters ranked by interest overlap, with games mixed in based on how the user likes to learn */
const buildFeed = (prefs: Prefs, filter: InterestId | null): FeedItem[] => {
  const matches = (tags: InterestId[]) => !filter || tags.includes(filter);
  const chapters = networkingCourse.chapters
    .filter(c => matches(c.tags))
    .sort((a, b) => overlap(b.tags, prefs.interests) - overlap(a.tags, prefs.interests) || a.number - b.number);
  const gameQueue = GAMES.filter(g => matches(g.tags)).sort((a, b) => overlap(b.tags, prefs.interests) - overlap(a.tags, prefs.interests));

  const loves = (id: string) => prefs.styles.some(s => s === id);
  const gameEvery = loves("games") ? 2 : loves("quiz") ? 3 : 4;
  if (loves("quiz") && !loves("games")) {
    gameQueue.sort((a, b) => Number(b.id === "port-rush") - Number(a.id === "port-rush"));
  }

  const items: FeedItem[] = [];
  chapters.forEach((chapter, i) => {
    items.push({ kind: "chapter", chapter, reason: reasonFor(chapter.tags, prefs.interests) });
    if ((i + 1) % gameEvery === 0 && gameQueue.length) {
      const game = gameQueue.shift()!;
      items.push({ kind: "game", game, reason: loves("games") ? "because you learn by playing" : reasonFor(game.tags, prefs.interests) });
    }
  });
  return items;
};

const NAV = [
  { href: "#/feed", label: "feed", kind: "feed", Icon: HomeIcon },
  { href: "#/feed/games", label: "games", kind: "games", Icon: GamepadIcon },
  { href: "#/feed/start", label: "my vibe", kind: "start", Icon: SparkIcon },
] as const;

const isActive = (kind: string, view: View) => view.kind === kind || (kind === "games" && view.kind === "game");

const SideNav = ({ view, username, onLogout }: { view: View; username: string; onLogout: () => void }) => (
    <aside className="sticky top-0 hidden h-screen w-20 shrink-0 flex-col border-r border-(--line) px-3 py-6 md:flex xl:w-64 xl:px-5">
    <a href="#/feed" className="flex items-center gap-2.5 px-3 font-display text-lg font-bold tracking-tight">
      <OfftrckMark className="h-6 w-6 shrink-0 text-(--gem)" />
      <span className="hidden xl:inline">offtrck</span>
    </a>
    <nav className="mt-10 flex flex-col gap-1.5">
      {NAV.map(({ href, label, kind, Icon }) => {
        const active = isActive(kind, view);
        return (
          <a
            key={kind}
            href={href}
            title={label}
            className={`flex items-center gap-4 rounded-2xl px-3 py-3 text-[15px] transition-colors hover:bg-white/5 ${
              active ? "font-bold" : "text-(--muted) hover:text-(--fg)"
            }`}
          >
            <Icon filled={active} className={`h-6 w-6 shrink-0 ${active ? "text-(--gem)" : ""}`} />
            <span className="hidden xl:inline">{label}</span>
          </a>
        );
      })}
      <a
        href="#/"
        title="desktop (classic)"
        className="flex items-center gap-4 rounded-2xl px-3 py-3 text-[15px] text-(--muted) transition-colors hover:bg-white/5 hover:text-(--fg)"
      >
        <MonitorIcon className="h-6 w-6 shrink-0" />
        <span className="hidden xl:inline">desktop (classic)</span>
      </a>
    </nav>

    <div className="mt-auto flex items-center gap-3 rounded-2xl px-2 py-2 xl:border xl:border-(--line) xl:bg-(--panel)">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 font-display text-sm font-bold uppercase">
        {username[0]}
      </span>
      <div className="hidden min-w-0 flex-1 xl:block">
        <p className="truncate text-sm font-semibold">{username}</p>
        <button type="button" onClick={onLogout} className="text-xs text-(--muted) hover:text-(--fg)">
          log out
        </button>
      </div>
    </div>
  </aside>
);

const MobileTopBar = () => (
  <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-(--line) bg-black/50 px-4 backdrop-blur-xl md:hidden">
    <a href="#/feed" className="flex items-center gap-2 font-display text-base font-bold tracking-tight">
      <OfftrckMark className="h-5 w-5 text-(--gem)" />
      offtrck
    </a>
    <div className="flex items-center gap-1">
      <button type="button" aria-label="Notifications" className="relative rounded-full p-2">
        <HeartIcon className="h-6 w-6" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ff3b5c]" />
      </button>
    </div>
  </header>
);

const MobileTabBar = ({ view }: { view: View }) => (
  <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-(--line) bg-black/70 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
    {[...NAV, { href: "#/", label: "desktop", kind: "desktop", Icon: MonitorIcon } as const].map(({ href, label, kind, Icon }) => {
      const active = isActive(kind, view);
      return (
        <a key={kind} href={href} className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] ${active ? "text-(--fg)" : "text-(--muted)"}`}>
          <Icon filled={active} className={`h-6 w-6 ${active ? "text-(--gem)" : ""}`} />
          {label}
        </a>
      );
    })}
  </nav>
);

const Stories = ({ items }: { items: FeedItem[] }) => (
  <div className="no-scrollbar -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
    {items.map(item => {
      const art = item.kind === "chapter" ? item.chapter : item.game;
      const id = item.kind === "chapter" ? item.chapter.id : item.game.id;
      const label = item.kind === "chapter" ? item.chapter.word : `▶ ${item.game.title}`;
      return (
        <button
          key={id}
          type="button"
          onClick={() => document.getElementById(`post-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="group flex w-[72px] shrink-0 flex-col items-center gap-1.5"
        >
          <span className="rounded-full p-[2.5px] ring-2 ring-(--gem) transition-transform group-hover:scale-105 group-active:scale-95">
            <ChapterCover chapter={{ ...art, word: "", number: undefined }} className="h-16 w-16 rounded-full" />
          </span>
          <span className="w-full truncate text-center text-xs text-(--muted)">{label}</span>
        </button>
      );
    })}
  </div>
);

const RightRail = ({ prefs, gem, onPickGem }: { prefs: Prefs; gem: Gem; onPickGem: (id: string) => void }) => {
  const pace = PACES.find(p => p.id === prefs.pace) ?? PACES[1];
  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 flex-col gap-4 overflow-y-auto py-8 pr-6 lg:flex">
      <section className="rounded-3xl border border-(--line) bg-(--panel) p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold lowercase">your vibe</h2>
          <a href="#/feed/start" className="text-xs font-semibold text-(--gem) hover:underline">
            edit
          </a>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {prefs.interests.map(id => {
            const interest = INTERESTS.find(i => i.id === id);
            return (
              <span key={id} className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: `${interest?.color}22`, color: interest?.color }}>
                {interest?.label}
              </span>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-(--muted)">
          learns by: {prefs.styles.map(s => STYLES.find(x => x.id === s)?.word).join(", ")}
        </p>
      </section>

      <section className="rounded-3xl border border-(--line) bg-(--panel) p-5 backdrop-blur-sm">
        <h2 className="font-display text-sm font-bold lowercase">today's goal</h2>
        <p className="mt-2 font-poster text-5xl leading-none">
          0<span className="text-(--muted)">/{pace.minutes} min</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[6%] rounded-full bg-(--gem)" />
        </div>
        <p className="mt-2 text-xs text-(--muted)">open any chapter to start your streak 🔥</p>
      </section>

      <section className="rounded-3xl border border-(--line) bg-(--panel) p-5 backdrop-blur-sm">
        <h2 className="font-display text-sm font-bold lowercase">quick games</h2>
        <ul className="mt-3 space-y-2.5">
          {GAMES.map(game => (
            <li key={game.id}>
              <a href={gameHash(game.id)} className="group flex items-center gap-3">
                <ChapterCover chapter={{ ...game, word: "" }} className="h-11 w-11 shrink-0 rounded-xl" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold group-hover:text-(--gem)">{game.title}</span>
                  <span className="block truncate text-xs text-(--muted)">{game.how}</span>
                </span>
                <span className="text-xs font-bold text-(--gem)">play</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex items-center gap-2 px-2" role="group" aria-label="Accent colour">
        <span className="mr-1 font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">accent</span>
        {GEMS.map(g => (
          <button
            key={g.id}
            type="button"
            aria-label={`${g.name} accent`}
            aria-pressed={g.id === gem.id}
            onClick={() => onPickGem(g.id)}
            className={`h-4 w-4 rounded-full transition-all hover:scale-125 ${
              g.id === gem.id ? "ring-2 ring-white/80 ring-offset-2 ring-offset-black" : "opacity-50 hover:opacity-100"
            }`}
            style={{ background: g.color }}
          />
        ))}
      </div>
    </aside>
  );
};

const Feed = ({ prefs, username }: { prefs: Prefs; username: string }) => {
  const [filter, setFilter] = useState<InterestId | null>(null);
  const items = buildFeed(prefs, filter);

  const chip = (label: ReactNode, value: InterestId | null) => (
    <button
      key={value ?? "all"}
      type="button"
      onClick={() => setFilter(value)}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        filter === value ? "bg-(--fg) text-black" : "border border-(--line) bg-(--panel) text-(--muted) hover:text-(--fg)"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="px-4 sm:px-0">
        <p className="font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">hey {username}</p>
        <h1 className="font-display text-2xl font-bold lowercase tracking-[-0.03em]">
          your <span className="font-accent text-[1.3em] font-normal italic tracking-normal text-(--gem)">feed</span>
        </h1>
      </div>
      <div className="px-4 sm:px-0">
        <Stories items={items} />
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 sm:px-0">
        {chip("✦ for you", null)}
        {prefs.interests.map(id => chip(interestLabel(id), id))}
      </div>

      <div className="flex flex-col gap-6">
        {items.map((item, i) =>
          item.kind === "chapter" ? (
            <ChapterPost key={item.chapter.id} chapter={item.chapter} reason={item.reason} seed={i} />
          ) : (
            <GamePost key={item.game.id} game={item.game} reason={item.reason} seed={i} />
          ),
        )}
      </div>

      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-(--gem) font-display text-xl text-(--gem)">✓</span>
        <p className="font-display font-bold lowercase">you're all caught up</p>
        <p className="text-sm text-(--muted)">
          new chapters drop soon. till then,{" "}
          <a href="#/feed/games" className="font-semibold text-(--gem) hover:underline">
            go play something
          </a>
          .
        </p>
      </div>
    </div>
  );
};

type Props = { route: string; username: string; onLogout: () => void };

const FeedApp = ({ route, username, onLogout }: Props) => {
  const view = parseView(route);
  const { gem, setGem } = useGem();
  const { prefs, setPrefs } = usePrefs();
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [route]);

  if (!prefs || view.kind === "start") {
    return (
      <Onboarding
        username={username}
        gem={gem}
        initial={prefs}
        onDone={next => {
          setPrefs(next);
          window.location.hash = "#/feed";
        }}
      />
    );
  }

  return (
    <div
      ref={scroller}
      style={{ "--gem": gem.color } as CSSProperties}
      className="cv-root relative h-full overflow-y-auto overflow-x-hidden font-vibe"
    >
      <div className="cv-grid pointer-events-none fixed inset-x-0 top-0 h-[700px]" aria-hidden />
      <div
        className="pointer-events-none fixed left-1/2 top-[-320px] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-(--gem) opacity-[0.1] blur-[140px]"
        aria-hidden
      />

      <div className="relative flex min-h-full">
        <SideNav view={view} username={username} onLogout={onLogout} />

        <div className="min-w-0 flex-1">
          <MobileTopBar />
          <main
            className={`mx-auto w-full pb-28 pt-4 sm:px-4 sm:pt-8 md:pb-12 ${view.kind === "games" ? "max-w-3xl" : "max-w-[520px]"}`}
          >
            {view.kind === "feed" && <Feed prefs={prefs} username={username} />}
            {view.kind === "games" && (
              <div className="px-4 sm:px-0">
                <GamesGrid />
              </div>
            )}
            {view.kind === "game" && (
              <div className="px-4 sm:px-0">{isGameId(view.id) ? <GameView id={view.id} /> : <GamesGrid />}</div>
            )}
          </main>
        </div>

        <RightRail prefs={prefs} gem={gem} onPickGem={setGem} />
      </div>

      <MobileTabBar view={view} />
    </div>
  );
};

export default FeedApp;
