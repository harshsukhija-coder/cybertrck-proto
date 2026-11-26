import { useEffect, useState } from "react";

export type InterestId =
  | "internet"
  | "gaming"
  | "security"
  | "privacy"
  | "home"
  | "web"
  | "streaming"
  | "data"
  | "money"
  | "business"
  | "marketing";
export type StyleId = "stories" | "games" | "quiz" | "deep";
export type PaceId = "snack" | "daily" | "deep";

export const INTERESTS: { id: InterestId; label: string; hint: string; color: string }[] = [
  { id: "internet", label: "how the internet works", hint: "the big picture", color: "#4f8cff" },
  { id: "money", label: "money & investing", hint: "make it grow", color: "#2ee6a6" },
  { id: "business", label: "accounting & business", hint: "where the money goes", color: "#ffb547" },
  { id: "marketing", label: "marketing & social media", hint: "why things go viral", color: "#ff5fa2" },
  { id: "data", label: "databases & data", hint: "where apps keep stuff", color: "#38bdf8" },
  { id: "gaming", label: "gaming & lag", hint: "why is my ping 300", color: "#4cc9f0" },
  { id: "security", label: "hacking & security", hint: "how attacks actually work", color: "#ff4d6d" },
  { id: "privacy", label: "privacy & tracking", hint: "who's watching", color: "#b49bff" },
  { id: "home", label: "wifi & home internet", hint: "fix your own router", color: "#5ff0b5" },
  { id: "web", label: "how websites load", hint: "from url to pixels", color: "#ffd166" },
  { id: "streaming", label: "streaming & video", hint: "netflix, twitch, calls", color: "#ff8a3d" },
];

export const STYLES: { id: StyleId; word: string; label: string; duo: [string, string] }[] = [
  { id: "stories", word: "swipe", label: "short stories i can swipe through", duo: ["#2a0845", "#ff5fa2"] },
  { id: "games", word: "play", label: "games. learning should feel like playing", duo: ["#00332f", "#5ff0b5"] },
  { id: "quiz", word: "quiz", label: "quick quizzes to test myself", duo: ["#0b1d51", "#ffd166"] },
  { id: "deep", word: "deep", label: "deep dives. give me everything", duo: ["#1a1446", "#b49bff"] },
];

export const PACES: { id: PaceId; label: string; minutes: number }[] = [
  { id: "snack", label: "5 min snack", minutes: 5 },
  { id: "daily", label: "15 min a day", minutes: 15 },
  { id: "deep", label: "30 min deep dive", minutes: 30 },
];

export type Prefs = { interests: InterestId[]; styles: StyleId[]; pace: PaceId };

const STORAGE_KEY = "offtrck.feed.prefs";

export const savePrefs = (prefs: Prefs) => localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));

export const readPrefs = (): Prefs | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Prefs) : null;
  } catch {
    return null;
  }
};

export const usePrefs = () => {
  const [prefs, setPrefs] = useState<Prefs | null>(readPrefs);

  useEffect(() => {
    if (prefs) savePrefs(prefs);
  }, [prefs]);

  return { prefs, setPrefs };
};
