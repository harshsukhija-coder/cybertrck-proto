import { COURSES } from "./data";
import { FACTS, POLLS, type Fact, type Poll } from "./feed-extras";
import { GAMES, type GameMeta } from "./games/games";
import { hasQuickDeck } from "./games/quick-rounds";
import { pathsFor, type LearningPath } from "./guide/paths";
import type { LivePost } from "./live/live-sources";
import { layoutsFor, type ChapterLayout } from "./post-layouts";
import { INTERESTS, type InterestId, type Prefs } from "./prefs";
import type { Course, CourseChapter } from "./types";

export type FeedItem =
  | { kind: "chapter"; course: Course; chapter: CourseChapter; layout: ChapterLayout; reason?: string }
  | { kind: "game"; game: GameMeta; reason?: string }
  /** One round of a game, answered right in the post */
  | { kind: "quick"; game: GameMeta; round: number; reason?: string }
  | { kind: "poll"; poll: Poll; reason?: string }
  | { kind: "fact"; fact: Fact; reason?: string }
  | { kind: "live"; post: LivePost; reason?: string }
  /** A skill check, or your roadmap once you've taken it */
  | { kind: "guide"; path: LearningPath; reason?: string }
  | { kind: "courses" }
  | { kind: "academy" }
  | { kind: "badge" };

type ExtraKind = "game" | "poll" | "fact";

/** Chapters after which a roadmap post shows up */
const GUIDE_SLOTS = [0, 4, 9, 15, 22, 30];

/** Order chapter layouts rotate through, so neighbouring posts never look the same */
const LAYOUT_CYCLE: ChapterLayout[] = ["carousel", "story", "quiz", "poster", "split", "notes"];

/** New every visit, so games land in different spots, but the feed doesn't jump around while you scroll */
const SESSION_SEED = Math.floor(Math.random() * 2 ** 31);

/** Small seeded random number generator (mulberry32) */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
  return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
};

export const interestLabel = (id: InterestId) => INTERESTS.find(i => i.id === id)?.label ?? id;

/** Why a post is in your feed: the first interest it shares with you */
const reasonFor = (tags: InterestId[], interests: InterestId[]) => {
  const match = tags.find(t => interests.includes(t));
  return match ? `because you're into ${interestLabel(match)}` : undefined;
};

const overlap = (tags: InterestId[], interests: InterestId[]) => tags.filter(t => interests.includes(t)).length;

/**
 * Chapters from every course, taken in turns so neighbours are never from the same course,
 * with games, polls and fun facts mixed in based on how the user likes to learn,
 * and live posts from the web (already ordered) woven in between.
 */
export const buildFeed = (prefs: Prefs, filter: InterestId | null, live: LivePost[] = []): FeedItem[] => {
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
  const random = seeded(SESSION_SEED);
  /** Interest matches still tend to come first, but the order is different every visit */
  const games = GAMES.filter(g => matches(g.tags))
    .map(game => ({ game, rank: score(game.tags) + random() * 2 }))
    .sort((a, b) => b.rank - a.rank)
    .map(g => g.game);
  const extras = { game: [...games], poll: byScore(POLLS), fact: byScore(FACTS) };
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
  const liveQueue = live.filter(p => matches(p.tags));
  const pushLive = () => {
    const post = liveQueue.shift();
    if (post) items.push({ kind: "live", post, reason: reasonFor(post.tags, prefs.interests) });
  };

  const guideQueue = pathsFor(filter ? [filter] : prefs.interests);
  const pushGuide = () => {
    const path = guideQueue.shift();
    if (path) items.push({ kind: "guide", path, reason: reasonFor(path.interests, prefs.interests) });
    return !!path;
  };

  // Surprise game drops: a full game or a one-question quick play, at random gaps
  const quickGames = games.filter(g => hasQuickDeck(g.id));
  const quickRounds = new Map<string, number>();
  const dropChance = loves("games") ? 0.45 : 0.28;
  let quickTurn = 0;
  const pushDrop = () => {
    const [roll, kindRoll, roundRoll] = [random(), random(), random()];
    const last = items.at(-1)?.kind;
    if (last === "game" || last === "quick" || roll > dropChance) return;
    if (quickGames.length && (kindRoll < 0.6 || !extras.game.length)) {
      const recent = items.slice(-12).flatMap(item => (item.kind === "game" ? [item.game.id] : []));
      const offset = quickGames.findIndex((_, k) => !recent.includes(quickGames[(quickTurn + k) % quickGames.length].id));
      quickTurn += Math.max(0, offset);
      const game = quickGames[quickTurn++ % quickGames.length];
      const round = quickRounds.get(game.id) ?? Math.floor(roundRoll * 1000);
      quickRounds.set(game.id, round + 1);
      items.push({ kind: "quick", game, round, reason: reasonFor(game.tags, prefs.interests) ?? "a quick one, just for fun" });
    } else if (extras.game.length) {
      const game = extras.game.shift()!;
      items.push({ kind: "game", game, reason: reasonFor(game.tags, prefs.interests) ?? "a game, just for fun" });
    }
  };

  let previous: ChapterLayout | undefined;
  chapters.forEach(({ course, chapter }, i) => {
    const options = layoutsFor(chapter);
    const layout = LAYOUT_CYCLE.map((_, k) => LAYOUT_CYCLE[(i + k) % LAYOUT_CYCLE.length]).find(l => l !== previous && options.includes(l)) ?? "carousel";
    previous = layout;
    items.push({ kind: "chapter", course, chapter, layout, reason: reasonFor(chapter.tags, prefs.interests) });
    pushLive();
    if (GUIDE_SLOTS.includes(i)) pushGuide();
    if (i === 3 && !filter) items.push({ kind: "courses" });
    if (i === 6 && !filter) items.push({ kind: "badge" });
    if (i === 1 && (!filter || filter === "internet" || filter === "home")) items.push({ kind: "academy" });
    if ((i + 1) % every === 0) {
      const extra = nextExtra(course.id);
      if (extra) {
        items.push(extra);
        pushLive();
      }
    }
    pushDrop();
  });

  // Once our chapters run out, keep going with the web, still with one of ours every few posts
  let sinceOurs = 0;
  while (liveQueue.length) {
    pushLive();
    pushDrop();
    if (++sinceOurs < 2) continue;
    sinceOurs = 0;
    if (pushGuide()) continue;
    const extra = nextExtra("");
    if (extra) items.push(extra);
  }
  while (guideQueue.length) pushGuide();
  return items;
};
