import { useEffect, useState } from "react";
import type { InterestId } from "../prefs";
import { loadStories, type Story } from "./sources";

const CACHE_KEY = "offtrck.stories.cache";
const SEEN_KEY = "offtrck.stories.seen";
export const SEEN_EVENT = "offtrck-stories-seen";
/** Several of the free APIs allow only a few calls per hour */
const FRESH_MS = 30 * 60 * 1000;
const MAX_SEEN = 500;

type Cache = { at: number; stories: Story[] };

const readCache = (): Cache | null => {
  try {
    const saved = localStorage.getItem(CACHE_KEY);
    return saved ? (JSON.parse(saved) as Cache) : null;
  } catch {
    return null;
  }
};

export const readSeen = (): string[] => {
  try {
    const saved = localStorage.getItem(SEEN_KEY);
    return saved ? (JSON.parse(saved) as string[]) : [];
  } catch {
    return [];
  }
};

export const markSeen = (slideId: string) => {
  const seen = readSeen();
  if (seen.includes(slideId)) return;
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, slideId].slice(-MAX_SEEN)));
  window.dispatchEvent(new Event(SEEN_EVENT));
};

/** Cached stories if they're fresh, otherwise new ones from the APIs */
export const getStories = async (): Promise<Story[]> => {
  const cache = readCache();
  if (cache && Date.now() - cache.at < FRESH_MS) return cache.stories;
  try {
    const fresh = await loadStories(new AbortController().signal);
    if (fresh.length) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), stories: fresh } satisfies Cache));
      return fresh;
    }
  } catch {
    /* fall back to whatever is cached */
  }
  return cache?.stories ?? [];
};

export const useStories = (interests: InterestId[]) => {
  const [cache] = useState(readCache);
  const [stories, setStories] = useState<Story[] | null>(cache?.stories ?? null);
  const [seen, setSeen] = useState(() => new Set(readSeen()));

  useEffect(() => {
    if (cache && Date.now() - cache.at < FRESH_MS) return;
    const controller = new AbortController();
    loadStories(controller.signal)
      .then(fresh => {
        if (!fresh.length) {
          setStories(previous => previous ?? []);
          return;
        }
        setStories(fresh);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), stories: fresh } satisfies Cache));
      })
      .catch(() => {
        if (!controller.signal.aborted) setStories(previous => previous ?? []);
      });
    return () => controller.abort();
  }, [cache]);

  useEffect(() => {
    const refresh = () => setSeen(new Set(readSeen()));
    window.addEventListener(SEEN_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(SEEN_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const isDone = (story: Story) => story.slides.every(slide => seen.has(slide.id));
  const affinity = (story: Story) => story.interests.filter(id => interests.includes(id)).length;

  /** Like Instagram: unwatched stories first (your interests leading), watched ones at the end */
  const ordered = stories
    ? stories
        .map((story, index) => ({ story, index }))
        .sort((a, b) => Number(isDone(a.story)) - Number(isDone(b.story)) || affinity(b.story) - affinity(a.story) || a.index - b.index)
        .map(({ story }) => story)
    : null;

  return { stories: ordered, seen, isDone };
};
