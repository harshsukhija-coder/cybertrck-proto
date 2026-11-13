import { useEffect, useState } from "react";

// Public feeds that allow browser requests (CORS) and need no API key
const ISC_API = "https://isc.sans.edu/api";
const NEWS_API = "https://hn.algolia.com/api/v1/search_by_date";
const REFRESH_MS = 10 * 60 * 1000;
const ATTACK_DAYS = 14;

const NEWS_WORDS = "security hack hacked hacker breach ransomware vulnerability exploit cve malware phishing cyber spyware leak backdoor botnet zero-day";
const NEWS_FILTER = /secur|hack|breach|ransom|vulnerab|exploit|\bcve\b|malware|phish|cyber|spyware|leak|backdoor|botnet|zero-day|0-day|attack/i;

export type Feed<T> = { data: T | null; error: boolean };

export type DailyAttacks = { date: string; records: number; sources: number };
export type TargetedPort = { port: number; records: number };
export type NewsItem = { id: string; title: string; url: string; points: number; createdAt: string };
export type ThreatLevel = "green" | "yellow" | "orange" | "red";

const dayString = (date: Date) => date.toISOString().slice(0, 10);

const fetchJson = async <T>(url: string, signal: AbortSignal): Promise<T> => {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.json() as Promise<T>;
};

// Today's numbers are still being collected, so the chart stops at yesterday
const loadAttacks = async (signal: AbortSignal) => {
  const end = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const start = new Date(end.getTime() - (ATTACK_DAYS - 1) * 24 * 60 * 60 * 1000);
  const rows = await fetchJson<DailyAttacks[]>(`${ISC_API}/dailysummary/${dayString(start)}/${dayString(end)}?json`, signal);
  return rows.map(({ date, records, sources }) => ({ date, records, sources }));
};

const loadPorts = async (signal: AbortSignal) => {
  const body = await fetchJson<Record<string, { targetport: number; records: number } | string | number>>(`${ISC_API}/topports/records/6?json`, signal);
  return Object.values(body)
    .filter((row): row is { targetport: number; records: number } => typeof row === "object")
    .map(row => ({ port: row.targetport, records: row.records }));
};

const loadThreatLevel = async (signal: AbortSignal) => {
  const body = await fetchJson<{ status: ThreatLevel }>(`${ISC_API}/infocon?json`, signal);
  return body.status;
};

const loadNews = async (signal: AbortSignal) => {
  const words = encodeURIComponent(NEWS_WORDS);
  const body = await fetchJson<{ hits: { objectID: string; title: string; url: string | null; points: number; created_at: string }[] }>(
    `${NEWS_API}?query=${words}&optionalWords=${words}&tags=story&restrictSearchableAttributes=title&numericFilters=points%3E5&hitsPerPage=60`,
    signal,
  );
  return body.hits
    .filter(hit => NEWS_FILTER.test(hit.title))
    .slice(0, 6)
    .map(hit => ({
      id: hit.objectID,
      title: hit.title,
      url: hit.url ?? `https://news.ycombinator.com/item?id=${hit.objectID}`,
      points: hit.points,
      createdAt: hit.created_at,
    }));
};

const useFeed = <T>(load: (signal: AbortSignal) => Promise<T>): Feed<T> => {
  const [feed, setFeed] = useState<Feed<T>>({ data: null, error: false });

  useEffect(() => {
    let controller = new AbortController();
    const run = () => {
      load(controller.signal)
        .then(data => setFeed({ data, error: false }))
        .catch(() => {
          if (!controller.signal.aborted) setFeed(previous => ({ ...previous, error: true }));
        });
    };
    run();
    const interval = window.setInterval(() => {
      controller.abort();
      controller = new AbortController();
      run();
    }, REFRESH_MS);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [load]);

  return feed;
};

export const useSecurityFeeds = () => ({
  attacks: useFeed(loadAttacks),
  ports: useFeed(loadPorts),
  threatLevel: useFeed(loadThreatLevel),
  news: useFeed(loadNews),
});
