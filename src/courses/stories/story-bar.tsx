import { useState } from "react";
import type { InterestId } from "../prefs";
import type { Story } from "./sources";
import { StoryAvatar, StoryViewer } from "./story-viewer";
import { useStories } from "./use-stories";

const ROW = "no-scrollbar -mx-4 flex gap-3.5 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0";

/** Daily facts from public APIs, one bubble per sector. Watched bubbles turn grey and move to the end. */
export const StoryBar = ({ interests }: { interests: InterestId[] }) => {
  const { stories, seen, isDone } = useStories(interests);
  const [open, setOpen] = useState<{ list: Story[]; start: number } | null>(null);

  if (!stories) {
    return (
      <div className={ROW} aria-label="Loading stories">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex w-[76px] shrink-0 animate-pulse flex-col items-center gap-1.5">
            <span className="h-[70px] w-[70px] rounded-full bg-white/[0.07]" />
            <span className="h-2.5 w-12 rounded-full bg-white/[0.07]" />
          </div>
        ))}
      </div>
    );
  }
  if (!stories.length) return null;

  return (
    <>
      <div className={ROW}>
        {stories.map((story, i) => {
          const done = isDone(story);
          return (
            <button
              key={story.id}
              type="button"
              onClick={() => setOpen({ list: stories, start: i })}
              aria-label={`${story.label} story${done ? ", watched" : ""}`}
              className="group flex w-[76px] shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className="rounded-full p-[2.5px] transition-transform group-hover:scale-105 group-active:scale-95"
                style={{ boxShadow: `0 0 0 2px ${done ? "rgba(255,255,255,0.16)" : story.color}` }}
              >
                <StoryAvatar story={story} className={`h-16 w-16 rounded-full text-xl transition-opacity ${done ? "opacity-55" : ""}`} />
              </span>
              <span className={`w-full truncate text-center text-xs ${done ? "text-(--muted)" : "font-semibold text-(--fg)"}`}>{story.label}</span>
            </button>
          );
        })}
      </div>
      {open && <StoryViewer stories={open.list} start={open.start} seen={seen} onClose={() => setOpen(null)} />}
    </>
  );
};
