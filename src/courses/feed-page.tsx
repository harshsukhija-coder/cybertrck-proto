import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { OfftrckMark } from "../icons/OfftrckMark";
import { ChapterCover } from "./chapter-cover";
import { AcademyPost } from "./academy/academy-promo";
import { CourseCatalog } from "./course-catalog";
import { COURSES, chapterHash } from "./data";
import { FACTS, POLLS, type Fact, type Poll } from "./feed-extras";
import { BookIcon, GamepadIcon, HomeIcon, MonitorIcon, SparkIcon } from "./feed-icons";
import { ChapterPost, CoursesPost, FactPost, GamePost, PollPost } from "./feed-post";
import { GameView, GamesGrid } from "./games/games-section";
import { GAMES, gameHash, isGameId, type GameMeta } from "./games/games";
import { GEMS, useGem, type Gem } from "./gems";
import Onboarding from "./onboarding";
import { INTERESTS, PACES, STYLES, usePrefs, type InterestId, type Prefs } from "./prefs";
import { useProgress } from "./progress";
import type { Course, CourseChapter } from "./types";

type View =
  | { kind: "feed" }
  | { kind: "courses"; id?: string }
  | { kind: "games" }
  | { kind: "game"; id: string }
  | { kind: "start" };

const parseView = (route: string): View => {
  const [, , section, id] = route.split("/");
  if (section === "games") return id ? { kind: "game", id } : { kind: "games" };
  if (section === "courses") return { kind: "courses", id };
  if (section === "start") return { kind: "start" };
  return { kind: "feed" };
};

type FeedItem =
  | { kind: "chapter"; course: Course; chapter: CourseChapter; reason?: string }
  | { kind: "game"; game: GameMeta; reason?: string }
  | { kind: "poll"; poll: Poll; reason?: string }
  | { kind: "fact"; fact: Fact; reason?: string }
  | { kind: "courses" }
  | { kind: "academy" };

type ExtraKind = "game" | "poll" | "fact";

const interestLabel = (id: InterestId) => INTERESTS.find(i => i.id === id)?.label ?? id;

/** Why a post is in your feed: the first interest it shares with you */
const reasonFor = (tags: InterestId[], interests: InterestId[]) => {
  const match = tags.find(t => interests.includes(t));
  return match ? `because you're into ${interestLabel(match)}` : undefined;
};

const overlap = (tags: InterestId[], interests: InterestId[]) => tags.filter(t => interests.includes(t)).length;

/**
 * Chapters from every course, taken in turns so neighbours are never from the same course,
 * with games, polls and fun facts mixed in based on how the user likes to learn.
 */
const buildFeed = (prefs: Prefs, filter: InterestId | null): FeedItem[] => {
  const matches = (tags: InterestId[]) => !filter || tags.includes(filter);
  const score = (tags: InterestId[]) => overlap(tags, prefs.interests);
  const byScore = <T extends { tags: InterestId[] }>(list: T[]) => list.filter(x => matches(x.tags)).sort((a, b) => score(b.tags) - score(a.tags));

  const queues = COURSES.map(course => {
    const chapters = course.chapters.filter(c => matches(c.tags));
    return {
      course,
      chapters: chapters.sort((a, b) => score(b.tags) - score(a.tags) || a.number - b.number),
      affinity: chapters.reduce((sum, c) => sum + score(c.tags), 0),
    };
  })
    .filter(q => q.chapters.length)
    .sort((a, b) => b.affinity - a.affinity);

  const chapters: { course: Course; chapter: CourseChapter }[] = [];
  while (queues.some(q => q.chapters.length)) {
    for (const q of queues) {
      const chapter = q.chapters.shift();
      if (chapter) chapters.push({ course: q.course, chapter });
    }
  }

  const loves = (id: string) => prefs.styles.some(s => s === id);
  const extras = { game: byScore(GAMES), poll: byScore(POLLS), fact: byScore(FACTS) };
  const cycle: ExtraKind[] = [
    ...(loves("games") ? (["game"] as const) : []),
    ...(loves("quiz") ? (["poll"] as const) : []),
    ...(loves("stories") ? (["fact"] as const) : []),
    "poll",
    "game",
    "fact",
  ];
  const every = loves("deep") && !loves("games") ? 2 : 1;

  let turn = 0;
  const nextExtra = (avoidCourse: string): FeedItem | null => {
    for (let tries = 0; tries < cycle.length; tries++) {
      const kind = cycle[turn++ % cycle.length];
      if (kind === "game" && extras.game.length) {
        const game = extras.game.shift()!;
        return { kind, game, reason: loves("games") ? "because you learn by playing" : reasonFor(game.tags, prefs.interests) };
      }
      if (kind === "poll" || kind === "fact") {
        const queue: (Poll | Fact)[] = extras[kind];
        if (!queue.length) continue;
        const index = Math.max(0, queue.findIndex(x => x.courseId !== avoidCourse));
        const [picked] = queue.splice(index, 1);
        const reason = reasonFor(picked.tags, prefs.interests);
        return kind === "poll" ? { kind, poll: picked as Poll, reason } : { kind, fact: picked as Fact, reason };
      }
    }
    return null;
  };

  const items: FeedItem[] = [];
  chapters.forEach(({ course, chapter }, i) => {
    items.push({ kind: "chapter", course, chapter, reason: reasonFor(chapter.tags, prefs.interests) });
    if (i === 3 && !filter) items.push({ kind: "courses" });
    if (i === 1 && (!filter || filter === "internet" || filter === "home")) items.push({ kind: "academy" });
    if ((i + 1) % every === 0) {
      const extra = nextExtra(course.id);
      if (extra) items.push(extra);
    }
  });
  return items;
};

const itemKey = (item: FeedItem) => {
  switch (item.kind) {
    case "chapter":
      return `${item.course.id}-${item.chapter.id}`;
    case "game":
      return item.game.id;
    case "poll":
      return item.poll.id;
    case "fact":
      return item.fact.id;
    case "courses":
      return "courses";
    case "academy":
      return "academy";
  }
};

const NAV = [
  { href: "#/feed", label: "feed", kind: "feed", Icon: HomeIcon },
  { href: "#/feed/courses", label: "learn", kind: "courses", Icon: BookIcon },
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
              active ? "bg-white/[0.06] font-bold" : "text-(--muted) hover:text-(--fg)"
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

const MobileTopBar = ({ username, onLogout }: { username: string; onLogout: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-(--line) bg-black/60 px-4 backdrop-blur-xl md:hidden">
      <a href="#/feed" className="flex items-center gap-2 font-display text-base font-bold tracking-tight">
        <OfftrckMark className="h-5 w-5 text-(--gem)" />
        offtrck
      </a>
      <div className="relative flex items-center gap-1">
        <a href="#/" aria-label="Classic desktop" className="rounded-full p-2 text-(--muted) hover:text-(--fg)">
          <MonitorIcon className="h-6 w-6" />
        </a>
        <button
          type="button"
          aria-label="Account"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-display text-xs font-bold uppercase"
        >
          {username[0]}
        </button>
        {open && (
          <div className="absolute right-0 top-11 w-44 animate-pop rounded-2xl border border-(--line) bg-[#0d0f14] p-1.5 shadow-2xl">
            <p className="truncate px-3 py-2 text-xs text-(--muted)">signed in as {username}</p>
            <button type="button" onClick={onLogout} className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-white/5">
              log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

const MobileTabBar = ({ view }: { view: View }) => (
  <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-(--line) bg-black/75 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
    {NAV.map(({ href, label, kind, Icon }) => {
      const active = isActive(kind, view);
      return (
        <a
          key={kind}
          href={href}
          className={`relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${active ? "text-(--fg)" : "text-(--muted)"}`}
        >
          {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-(--gem)" />}
          <Icon filled={active} className={`h-6 w-6 ${active ? "text-(--gem)" : ""}`} />
          {label}
        </a>
      );
    })}
  </nav>
);

/** One story bubble per course; tapping opens the next unfinished chapter */
const Stories = () => {
  const { nextIn, doneIn } = useProgress();
  return (
    <div className="no-scrollbar -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {COURSES.map(course => {
        const next = nextIn(course);
        const finished = doneIn(course) === course.chapters.length;
        return (
          <a key={course.id} href={chapterHash(course, next)} className="group flex w-[76px] shrink-0 flex-col items-center gap-1.5">
            <span
              className="rounded-full p-[2.5px] transition-transform group-hover:scale-105 group-active:scale-95"
              style={{ boxShadow: `0 0 0 2px ${finished ? "rgba(255,255,255,0.2)" : course.color}` }}
            >
              <ChapterCover chapter={{ ...next, word: "", number: undefined }} className="h-16 w-16 rounded-full" />
            </span>
            <span className="w-full truncate text-center text-xs text-(--muted)">{course.label}</span>
          </a>
        );
      })}
      {GAMES.slice(0, 3).map(game => (
        <a key={game.id} href={gameHash(game.id)} className="group flex w-[76px] shrink-0 flex-col items-center gap-1.5">
          <span className="relative rounded-full p-[2.5px] ring-2 ring-white/25 transition-transform group-hover:scale-105 group-active:scale-95">
            <ChapterCover chapter={{ ...game, word: "" }} className="h-16 w-16 rounded-full" />
            <span className="absolute inset-0 grid place-items-center text-lg text-white drop-shadow">▶</span>
          </span>
          <span className="w-full truncate text-center text-xs text-(--muted)">{game.title}</span>
        </a>
      ))}
    </div>
  );
};

const RightRail = ({ prefs, gem, onPickGem }: { prefs: Prefs; gem: Gem; onPickGem: (id: string) => void }) => {
  const pace = PACES.find(p => p.id === prefs.pace) ?? PACES[1];
  const { minutesToday, totalDone } = useProgress();
  const pct = Math.min(100, Math.round((minutesToday / pace.minutes) * 100));
  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 flex-col gap-4 overflow-y-auto py-8 pr-6 lg:flex">
      <section className="rounded-3xl border border-(--line) bg-(--panel) p-5 backdrop-blur-sm">
        <h2 className="font-display text-sm font-bold lowercase">today's goal</h2>
        <p className="mt-2 font-poster text-5xl leading-none">
          {minutesToday}
          <span className="text-(--muted)">/{pace.minutes} min</span>
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-(--gem) transition-all duration-700" style={{ width: `${Math.max(pct, 4)}%` }} />
        </div>
        <p className="mt-2 text-xs text-(--muted)">
          {pct >= 100
            ? "goal smashed. you're on fire 🔥"
            : totalDone
              ? `${totalDone} chapters done so far. keep going!`
              : "finish any chapter to start your streak 🔥"}
        </p>
      </section>

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
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold lowercase">quick games</h2>
          <a href="#/feed/games" className="text-xs font-semibold text-(--gem) hover:underline">
            all {GAMES.length}
          </a>
        </div>
        <ul className="mt-3 space-y-2.5">
          {GAMES.slice(-4).map(game => (
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

const FeedPost = ({ item, seed }: { item: FeedItem; seed: number }) => {
  switch (item.kind) {
    case "chapter":
      return <ChapterPost course={item.course} chapter={item.chapter} reason={item.reason} seed={seed} />;
    case "game":
      return <GamePost game={item.game} reason={item.reason} seed={seed} />;
    case "poll":
      return <PollPost poll={item.poll} reason={item.reason} seed={seed} />;
    case "fact":
      return <FactPost fact={item.fact} reason={item.reason} seed={seed} />;
    case "courses":
      return <CoursesPost base="#/feed/courses" />;
    case "academy":
      return <AcademyPost />;
  }
};

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 5 ? "up late" : hour < 12 ? "good morning" : hour < 18 ? "good afternoon" : "good evening";
};

const Feed = ({ prefs, username }: { prefs: Prefs; username: string }) => {
  const [filter, setFilter] = useState<InterestId | null>(null);
  const items = buildFeed(prefs, filter);
  const chips: InterestId[] = [...prefs.interests, ...INTERESTS.map(i => i.id).filter(id => !prefs.interests.includes(id))];

  const chip = (label: ReactNode, value: InterestId | null, color?: string) => {
    const active = filter === value;
    return (
      <button
        key={value ?? "all"}
        type="button"
        onClick={() => setFilter(value)}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
          active ? "text-black" : "border border-(--line) bg-(--panel) text-(--muted) hover:text-(--fg)"
        }`}
        style={active ? { background: color ?? "var(--fg)" } : undefined}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="px-4 sm:px-0">
        <p className="font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">
          {greeting()}, {username}
        </p>
        <h1 className="font-display text-2xl font-bold lowercase tracking-[-0.03em]">
          your <span className="font-accent text-[1.3em] font-normal italic tracking-normal text-(--gem)">feed</span>
        </h1>
      </div>
      <div className="px-4 sm:px-0">
        <Stories />
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 sm:px-0">
        {chip("✦ for you", null)}
        {chips.map(id => chip(interestLabel(id), id, INTERESTS.find(i => i.id === id)?.color))}
      </div>

      <div className="flex flex-col gap-6">
        {items.map((item, i) => (
          <FeedPost key={itemKey(item)} item={item} seed={i} />
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-(--gem) font-display text-xl text-(--gem)">✓</span>
        <p className="font-display font-bold lowercase">you're all caught up</p>
        <p className="text-sm text-(--muted)">
          {items.length} posts done. now{" "}
          <a href="#/feed/courses" className="font-semibold text-(--gem) hover:underline">
            finish a chapter
          </a>{" "}
          or{" "}
          <a href="#/feed/games" className="font-semibold text-(--gem) hover:underline">
            play something
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
  const section = view.kind;

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [section]);

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

  const wide = view.kind === "games" || view.kind === "courses";

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
          <MobileTopBar username={username} onLogout={onLogout} />
          <main className={`mx-auto w-full pb-28 pt-4 sm:px-4 sm:pt-8 md:pb-12 ${wide ? "max-w-3xl" : "max-w-[520px]"}`}>
            {view.kind === "feed" && <Feed prefs={prefs} username={username} />}
            {view.kind === "courses" && (
              <div className="animate-tile-in px-4 sm:px-0">
                <h1 className="mb-5 font-display text-3xl font-bold lowercase tracking-[-0.03em] sm:text-4xl">
                  pick a <span className="font-accent text-[1.3em] font-normal italic tracking-normal text-(--gem)">rabbit hole</span>
                </h1>
                <CourseCatalog courseId={view.id} base="#/feed/courses" />
              </div>
            )}
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
