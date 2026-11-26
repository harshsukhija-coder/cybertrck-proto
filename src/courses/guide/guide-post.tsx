import { useState } from "react";
import { PostFrame } from "../feed-post";
import { shareGuide } from "../share/post-share";
import { useGuide } from "./guide-store";
import { PathSummary, SkillCheck } from "./guide-ui";
import type { LearningPath } from "./paths";

const CHECK_CAPTIONS = [
  "be honest. it only changes which steps we show you.",
  "1 minute. no sign-up, no score shown to anyone.",
  "skip what you already know. start where it gets interesting.",
];
const ROADMAP_CAPTIONS = [
  "one small step today. that's the whole trick.",
  "you don't need the whole map. just the next step.",
  "every pro started at stage 1. you're further than that.",
];

/** A skill check until you've taken it, then your roadmap with the next steps */
export const GuidePost = ({ path, reason, seed }: { path: LearningPath; reason?: string; seed: number }) => {
  const [liked, setLiked] = useState(false);
  const { statusOf } = useGuide();
  const status = statusOf(path);
  const [checking, setChecking] = useState(!status.checked);

  return (
    <PostFrame
      id={`post-guide-${path.id}`}
      avatar={<span className="font-display text-base font-bold">{path.glyph}</span>}
      accent={path.color}
      name="offtrck.guide"
      meta={checking ? `skill check · ${path.title}` : `your roadmap · ${path.title} · ${status.stepsDone}/${status.stepsTotal} steps`}
      reason={reason}
      media={
        <div className="flex flex-col gap-4 p-5 sm:p-7" style={{ background: `${path.color}12` }}>
          <span className="w-fit rounded-full px-2.5 py-1 font-jetbrains text-[10px] font-bold uppercase tracking-widest text-black" style={{ background: path.color }}>
            {checking ? "where are you?" : "your roadmap"}
          </span>
          {checking ? (
            <SkillCheck path={path} onFinish={() => setChecking(false)} />
          ) : (
            <>
              <PathSummary path={path} status={status} />
              <button type="button" onClick={() => setChecking(true)} className="self-start text-xs text-(--muted) hover:text-(--fg)">
                retake the skill check
              </button>
            </>
          )}
        </div>
      }
      liked={liked}
      onToggleLike={() => setLiked(l => !l)}
      likes={1200 + seed * 91}
      caption={(checking ? CHECK_CAPTIONS : ROADMAP_CAPTIONS)[seed % 3]}
      tags={path.interests}
      share={() => shareGuide(path)}
      age={`${seed + 1}h ago`}
      seed={seed}
    />
  );
};
