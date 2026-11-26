import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { InterestId } from "../prefs";
import { sourcesFor, type LivePost, type Source } from "./live-sources";

const CACHE_KEY = "offtrck.live.cache";
const SEEN_KEY = "offtrck.live.seen";
/** Some free APIs only allow a few hundred calls a day, so each source is reused for a while */
const FRESH_MS = 20 * 60 * 1000;
/** While the feed is open, check for new posts this often */
const AUTO_REFRESH_MS = 10 * 60 * 1000;
const MAX_SEEN = 600;

type Cache = Record<string, { at: number; posts: LivePost[] }>;

const readCache = (): Cache => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}") as Cache;
  } catch {
    return {};
  }
};

const writeSource = (id: string, posts: LivePost[]) => {
  const cache = readCache();
  cache[id] = { at: Date.now(), posts };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* storage full: the posts still show, they just aren't kept */
  }
};

const cachedPosts = (sources: Source[]) => {
  const cache = readCache();
  return sources.flatMap(s => cache[s.id]?.posts ?? []);
};

const isFresh = (source: Source) => {
  const entry = readCache()[source.id];
  return !!entry && Date.now() - entry.at < FRESH_MS;
};

const readSeen = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
};

export const markLiveSeen = (id: string) => {
  const seen = readSeen();
  if (seen.includes(id)) return;
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, id].slice(-MAX_SEEN)));
};

/** Loads one source and caches it; a broken API just gives nothing */
const loadSource = async (source: Source, signal: AbortSignal) => {
  try {
    const posts = await source.load(signal);
    if (posts.length) writeSource(source.id, posts);
    return posts;
  } catch {
    return [];
  }
};

/**
 * Unseen posts first, the sources you care about most leading, and sources taking turns
 * so two posts from the same place never sit next to each other.
 */
export const orderLive = (posts: LivePost[], interests: InterestId[], seed = 0): LivePost[] => {
  const seen = new Set(readSeen());
  const unique = [...new Map(posts.map(p => [p.id, p])).values()];
  const affinity = (p: LivePost) => p.tags.filter(t => interests.includes(t)).length;
  const jitter = (id: string) => {
    let h = seed;
    for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h % 1000;
  };

  const groups = [false, true].map(wasSeen => {
    const bySource = new Map<string, LivePost[]>();
    unique
      .filter(p => seen.has(p.id) === wasSeen)
      .forEach(p => bySource.set(p.sourceId, [...(bySource.get(p.sourceId) ?? []), p]));
    const queues = [...bySource.values()].sort((a, b) => affinity(b[0]) - affinity(a[0]) || jitter(a[0].sourceId) - jitter(b[0].sourceId));
    const out: LivePost[] = [];
    while (queues.some(q => q.length)) for (const q of queues) if (q.length) out.push(q.shift()!);
    return out;
  });
  return [...groups[0], ...groups[1]];
};

/** For the terminal: cached posts, topped up from any source that's gone stale */
export const getLivePosts = async (interests: InterestId[], force = false) => {
  const sources = sourcesFor(interests);
  const controller = new AbortController();
  await Promise.all(sources.filter(s => force || !isFresh(s)).map(s => loadSource(s, controller.signal)));
  return orderLive(cachedPosts(sources), interests, force ? Math.floor(Math.random() * 1e6) : 0);
};

/** Live posts for the given interests. Shows cached ones straight away, then refreshes in the background. */
export const useLivePosts = (interests: InterestId[]) => {
  const key = interests.join(",");
  const sources = useMemo(() => sourcesFor(key ? (key.split(",") as InterestId[]) : []), [key]);
  /** Bumped whenever the shown posts should be re-read from the cache */
  const [version, setVersion] = useState(0);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 1e6));
  const [refreshing, setRefreshing] = useState(false);
  /** The interests whose first load has finished */
  const [settled, setSettled] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  /** Posts fetched in the background, waiting for a tap so the feed doesn't jump while you read */
  const [waiting, setWaiting] = useState({ key, count: 0 });

  // eslint-disable-next-line react-hooks/exhaustive-deps -- version is how a re-read of the cache is asked for
  const posts = useMemo(() => cachedPosts(sources), [sources, version]);
  const staleOnOpen = useMemo(() => sources.some(s => !isFresh(s)), [sources]);
  const shown = useRef(posts);
  useEffect(() => {
    shown.current = posts;
  }, [posts]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const bump = () => !signal.aborted && setVersion(v => v + 1);
    Promise.all(sources.filter(s => !isFresh(s)).map(s => loadSource(s, signal).then(bump))).then(() => {
      if (signal.aborted) return;
      setSettled(key);
      setUpdatedAt(Date.now());
    });
    const timer = window.setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      await Promise.all(sources.filter(s => !isFresh(s)).map(s => loadSource(s, signal)));
      if (signal.aborted) return;
      const ids = new Set(shown.current.map(p => p.id));
      setWaiting({ key, count: cachedPosts(sources).filter(p => !ids.has(p.id)).length });
    }, AUTO_REFRESH_MS);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [sources, key]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setSeed(Math.floor(Math.random() * 1e6));
    setWaiting({ key, count: 0 });
    const signal = new AbortController().signal;
    await Promise.all(sources.map(s => loadSource(s, signal).then(() => setVersion(v => v + 1))));
    setRefreshing(false);
    setUpdatedAt(Date.now());
  }, [sources, key]);

  /** Shows what the background refresh already fetched, without asking the APIs again */
  const showWaiting = useCallback(() => {
    setSeed(Math.floor(Math.random() * 1e6));
    setVersion(v => v + 1);
    setWaiting({ key, count: 0 });
    setUpdatedAt(Date.now());
  }, [key]);

  const ordered = useMemo(() => orderLive(posts, key ? (key.split(",") as InterestId[]) : [], seed), [posts, key, seed]);
  return {
    posts: ordered,
    loading: refreshing || (staleOnOpen && settled !== key),
    refresh,
    updatedAt,
    waiting: waiting.key === key ? waiting.count : 0,
    showWaiting,
  };
};
