import { useEffect, useRef, useState, type ReactNode } from "react";
import AcademyPage from "./academy/academy-page";
import { AcademyPost } from "./academy/academy-promo";
import { AppShell, type Section } from "./app-shell";
import { BadgeMedal } from "./badges/badge-medal";
import { badgeHash } from "./badges/badges";
import { BadgesPage } from "./badges/badges-page";
import { useBadges } from "./badges/use-badges";
import { ChapterCover } from "./chapter-cover";
import { COURSES } from "./data";
import { FACTS, POLLS, type Fact, type Poll } from "./feed-extras";
import { ChapterPost, CoursesPost, FactPost, GamePost, PollPost } from "./feed-post";
import { layoutsFor, type ChapterLayout } from "./post-layouts";
import { GameView, GamesGrid } from "./games/games-section";
import { GAMES, gameHash, isGameId, type GameMeta } from "./games/games";
import { GEMS, useGem, type Gem } from "./gems";
import Onboarding from "./onboarding";
import { CourseView, LearnHub } from "./learn-hub";
import { INTERESTS, PACES, usePrefs, type InterestId, type Prefs } from "./prefs";
import { useProgress } from "./progress";
import { StoryBar } from "./stories/story-bar";
import type { Course, CourseChapter } from "./types";

type View =
  | { kind: "feed" }
  | { kind: "courses" }
  | { kind: "course"; id: string }
  | { kind: "academy"; route: string }
  | { kind: "games" }
  | { kind: "game"; id: string }
  | { kind: "badges"; id?: string }
  | { kind: "start" };

const parseView = (route: string): View => {
  if (route.startsWith("#/academy")) return { kind: "academy", route };
  const [, , section, id] = route.split("/");
  if (section === "games") return id ? { kind: "game", id } : { kind: "games" };
  if (section === "courses") return id ? { kind: "course", id } : { kind: "courses" };
  if (section === "badges") return { kind: "badges", id };
  if (section === "start") return { kind: "start" };
  return { kind: "feed" };
};

type FeedItem =
  | { kind: "chapter"; course: Course; chapter: CourseChapter; layout: ChapterLayout; reason?: string }
  | { kind: "game"; game: GameMeta; reason?: string }
  | { kind: "poll"; poll: Poll; reason?: string }
  | { kind: "fact"; fact: Fact; reason?: string }
  | { kind: "courses" }
  | { kind: "academy" }
  | { kind: "badge" };

type ExtraKind = "game" | "poll" | "fact";

/** Order chapter layouts rotate through, so neighbouring posts never look the same */
const LAYOUT_CYCLE: ChapterLayout[] = ["carousel", "story", "quiz", "poster", "split", "notes"];

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
  let previous: ChapterLayout | undefined;
  chapters.forEach(({ course, chapter }, i) => {
    const options = layoutsFor(chapter);
    const layout = LAYOUT_CYCLE.map((_, k) => LAYOUT_CYCLE[(i + k) % LAYOUT_CYCLE.length]).find(l => l !== previous && options.includes(l)) ?? "carousel";
    previous = layout;
    items.push({ kind: "chapter", course, chapter, layout, reason: reasonFor(chapter.tags, prefs.interests) });
    if (i === 3 && !filter) items.push({ kind: "courses" });
    if (i === 6 && !filter) items.push({ kind: "badge" });
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
    case "badge":
      return "badge";
  }
};

/** The locked badge you're closest to, so there's always a next goal */
const NextBadge = () => {
  const { list } = useBadges();
  const next = list.filter(b => !b.earnedAt).sort((a, b) => b.value / b.goal - a.value / a.goal)[0];
  if (!next) return null;
  return (
    <a href={badgeHash(next.badge.id)} className="group flex items-center gap-4 rounded-3xl border border-(--line) bg-(--panel) p-4 backdrop-blur-sm transition hover:border-white/25">
      <BadgeMedal badge={next.badge} earned={false} className="w-14" />
      <span className="min-w-0 flex-1">
        <span className="block font-jetbrains text-[10px] font-bold uppercase tracking-wider text-(--muted)">next badge</span>
        <span className="block font-display text-sm font-bold lowercase">{next.badge.name}</span>
        <span className="mt-0.5 block text-xs text-(--muted)">{next.badge.how}</span>
        <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full rounded-full" style={{ width: `${Math.max(4, (next.value / next.goal) * 100)}%`, background: next.badge.color }} />
        </span>
      </span>
    </a>
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

      <NextBadge />

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
      return <ChapterPost course={item.course} chapter={item.chapter} layout={item.layout} reason={item.reason} seed={seed} />;
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
    case "badge":
      return (
        <div className="px-4 sm:px-0">
          <NextBadge />
        </div>
      );
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
        <StoryBar interests={prefs.interests} />
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

const SECTION: Record<View["kind"], Section | undefined> = {
  feed: "feed",
  courses: "learn",
  course: "learn",
  academy: "learn",
  games: "games",
  game: "games",
  badges: "badges",
  start: undefined,
};

const FeedApp = ({ route, username, onLogout }: Props) => {
  const view = parseView(route);
  const { gem, setGem } = useGem();
  const { prefs, setPrefs } = usePrefs();
  const scroller = useRef<HTMLDivElement>(null);
  const page = view.kind === "academy" ? view.kind : `${view.kind}/${"id" in view ? view.id : ""}`;

  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [page]);

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
    <AppShell
      ref={scroller}
      active={SECTION[view.kind]}
      username={username}
      onLogout={onLogout}
      gemColor={gem.color}
      width={view.kind === "feed" ? "narrow" : view.kind === "academy" ? "full" : "wide"}
      rail={view.kind === "feed" && <RightRail prefs={prefs} gem={gem} onPickGem={setGem} />}
    >
      {view.kind === "feed" && <Feed prefs={prefs} username={username} />}
      {view.kind === "courses" && <LearnHub />}
      {view.kind === "course" && <CourseView courseId={view.id} />}
      {view.kind === "academy" && <AcademyPage route={view.route} embedded />}
      {view.kind === "games" && (
        <div className="px-4 sm:px-0">
          <GamesGrid />
        </div>
      )}
      {view.kind === "game" && <div className="px-4 sm:px-0">{isGameId(view.id) ? <GameView id={view.id} /> : <GamesGrid />}</div>}
      {view.kind === "badges" && <BadgesPage badgeId={view.id} username={username} prefs={prefs} />}
    </AppShell>
  );
};

export default FeedApp;
