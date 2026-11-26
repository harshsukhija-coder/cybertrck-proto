import { useSyncExternalStore } from "react";

export type ThemeId = "auto" | "midnight" | "ocean" | "mocha" | "oled" | "paper";

/** `swatch` is [page, card, text], for the little previews in the picker */
export const THEMES: { id: ThemeId; label: string; about: string; swatch: [string, string, string] }[] = [
  { id: "auto", label: "auto", about: "follows your phone or computer", swatch: ["#07080c", "#f4f2ec", "#888"] },
  { id: "midnight", label: "midnight", about: "the classic dark", swatch: ["#07080c", "#111318", "#eef0f6"] },
  { id: "ocean", label: "ocean", about: "deep blue night", swatch: ["#050d1a", "#0e1c31", "#eaf2ff"] },
  { id: "mocha", label: "mocha", about: "warm and cosy", swatch: ["#110c09", "#211813", "#f6ece3"] },
  { id: "oled", label: "oled", about: "pure black, easy on battery", swatch: ["#000000", "#0f0f0f", "#f5f5f5"] },
  { id: "paper", label: "paper", about: "light mode", swatch: ["#f4f2ec", "#ffffff", "#15171c"] },
];

const STORAGE_KEY = "offtrck.theme";
const listeners = new Set<() => void>();
const darkQuery = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)") : null;

const read = (): ThemeId => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return THEMES.some(t => t.id === saved) ? (saved as ThemeId) : "auto";
};

let current = read();

export const currentTheme = () => current;

/** The theme actually shown: "auto" becomes midnight or paper */
export const resolveTheme = (id: ThemeId) => (id === "auto" ? (darkQuery?.matches === false ? "paper" : "midnight") : id);

/** Puts the theme on <html> and tints the phone's status bar to match */
export const applyTheme = () => {
  const shown = resolveTheme(current);
  document.documentElement.dataset.theme = shown;
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = THEMES.find(t => t.id === shown)!.swatch[0];
};

export const setTheme = (id: ThemeId) => {
  current = id;
  localStorage.setItem(STORAGE_KEY, id);
  applyTheme();
  listeners.forEach(l => l());
};

darkQuery?.addEventListener("change", () => {
  if (current !== "auto") return;
  applyTheme();
  listeners.forEach(l => l());
});

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, () => current);
  return { theme, shown: resolveTheme(theme), setTheme };
};
