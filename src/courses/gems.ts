import { useEffect, useState } from "react";

export type Gem = { id: string; name: string; color: string };

export const GEMS: Gem[] = [
  { id: "sapphire", name: "Sapphire", color: "#4f8cff" },
  { id: "ruby", name: "Ruby", color: "#ff4d6d" },
  { id: "amber", name: "Amber", color: "#ffb020" },
  { id: "emerald", name: "Emerald", color: "#2ee6a6" },
  { id: "amethyst", name: "Amethyst", color: "#b36bff" },
];

const STORAGE_KEY = "offtrck.courses.gem";

const load = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return GEMS.find(g => g.id === saved) ?? GEMS[0];
};

export const useGem = () => {
  const [gem, setGem] = useState(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, gem.id);
  }, [gem]);

  return { gem, setGem: (id: string) => setGem(GEMS.find(g => g.id === id) ?? GEMS[0]) };
};
