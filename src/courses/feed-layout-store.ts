import { useState } from "react";

/** stream: the classic post feed · glass: see-through cards over real photos · bento: a grid of small tiles */
export type FeedLayout = "stream" | "glass" | "bento";

export const FEED_LAYOUTS: { id: FeedLayout; label: string; about: string }[] = [
  { id: "stream", label: "stream", about: "one post at a time" },
  { id: "glass", label: "glass", about: "see-through cards over photos" },
  { id: "bento", label: "bento", about: "a grid of small tiles" },
];

const KEY = "offtrck.layout";

const read = (): FeedLayout => {
  const saved = localStorage.getItem(KEY);
  return FEED_LAYOUTS.some(l => l.id === saved) ? (saved as FeedLayout) : "stream";
};

export const useFeedLayout = () => {
  const [layout, setState] = useState<FeedLayout>(read);
  const setLayout = (next: FeedLayout) => {
    localStorage.setItem(KEY, next);
    setState(next);
  };
  return { layout, setLayout };
};
