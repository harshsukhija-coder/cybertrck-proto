import { useSyncExternalStore } from "react";

export type Gem = { id: string; name: string; color: string };

export const GEMS: Gem[] = [
  { id: "sapphire", name: "Sapphire", color: "#4f8cff" },
  { id: "ruby", name: "Ruby", color: "#ff4d6d" },
  { id: "amber", name: "Amber", color: "#ffb020" },
  { id: "emerald", name: "Emerald", color: "#2ee6a6" },
  { id: "amethyst", name: "Amethyst", color: "#b36bff" },
];

const STORAGE_KEY = "offtrck.courses.gem";
const listeners = new Set<() => void>();

const load = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return GEMS.find(g => g.id === saved) ?? GEMS[0];
};

let current = load();

/** Changes the accent everywhere at once, including pages that are already open */
export const pickGem = (id: string) => {
  current = GEMS.find(g => g.id === id) ?? GEMS[0];
  localStorage.setItem(STORAGE_KEY, current.id);
  listeners.forEach(l => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useGem = () => {
  const gem = useSyncExternalStore(subscribe, () => current);
  return { gem, setGem: pickGem };
};
