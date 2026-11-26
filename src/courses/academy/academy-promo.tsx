import type { CSSProperties } from "react";
import { OfftrckMark } from "../../icons/OfftrckMark";
import { useAcademy } from "./academy-progress";
import { COUNTS, MODULES } from "./content";
import { TopologyDiagram } from "./topology";
import type { Lab } from "./types";

const DEMO_LAB = MODULES.find(m => m.id === "routing")!.lessons.find((l): l is Lab => l.kind === "lab")!;

const Progress = () => {
  const { done, total, finished } = useAcademy();
  if (finished) return <span className="font-jetbrains text-[11px] text-emerald-300">🛰️ network pro</span>;
  if (!done) return null;
  return (
    <span className="font-jetbrains text-[11px] text-(--muted)">
      {Math.round((done / total) * 100)}% done
    </span>
  );
};

/** Shown under the networking course in the catalog */
export const AcademyBanner = () => (
  <a
    href="#/academy"
    className="group mt-4 flex flex-col gap-4 rounded-3xl border border-(--gem)/30 bg-(--gem)/[0.06] p-5 transition hover:bg-(--gem)/10 @2xl:flex-row @2xl:items-center @2xl:p-6"
  >
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-(--gem) text-2xl">🛰️</span>
    <span className="min-w-0 flex-1">
      <span className="flex items-center gap-2 font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em] text-(--gem)">
        full course + network pro badge <Progress />
      </span>
      <span className="mt-1.5 block font-display text-xl font-bold lowercase leading-tight tracking-[-0.02em]">ready to go deeper? build real networks.</span>
      <span className="mt-1 block text-sm text-(--muted)">
        {COUNTS.articles} blogs, {COUNTS.quizzes} quizzes and {COUNTS.labs} Cisco Packet Tracer labs, graded the moment you upload. Pass the final challenge to unlock the network pro badge.
      </span>
    </span>
    <span className="shrink-0 self-start rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition group-hover:-translate-y-0.5 @2xl:self-center">
      open academy →
    </span>
  </a>
);

/** A feed post that advertises the academy */
export const AcademyPost = () => (
  <article
    style={{ "--accent": "#ff4d6d" } as CSSProperties}
    className="animate-tile-in border-b border-(--line) py-4 sm:rounded-[28px] sm:border sm:bg-(--panel) sm:p-5 sm:backdrop-blur-sm"
  >
    <div className="flex items-center gap-2 px-4 sm:px-0">
      <OfftrckMark className="h-5 w-5 text-(--gem)" />
      <p className="font-display text-sm font-bold lowercase">offtrck academy</p>
      <span className="rounded-full bg-(--gem)/15 px-2 py-0.5 font-jetbrains text-[10px] font-bold uppercase tracking-wider text-(--gem)">new</span>
      <span className="ml-auto">
        <Progress />
      </span>
    </div>
    <a href="#/academy" className="group mt-3 block">
      <div className="keep-white relative overflow-hidden bg-[#0c0f16] p-4 sm:rounded-2xl sm:ring-1 sm:ring-white/10">
        <TopologyDiagram topology={DEMO_LAB.topology} />
        <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rotate-6 rounded-lg bg-[#0c0f16] border-2 border-emerald-300 px-2.5 py-0.5 font-poster text-2xl uppercase text-emerald-300 transition-transform group-hover:rotate-0">
          pass ✓
        </span>
      </div>
      <div className="px-4 pt-3.5 sm:px-0">
        <p className="font-display text-lg font-bold lowercase leading-tight">build it in packet tracer. upload it. get graded in 2 seconds.</p>
        <p className="mt-1 text-sm text-(--muted)">
          the full networking course: {MODULES.length} modules, {COUNTS.labs} hands-on labs and a network pro badge you can share.
        </p>
        <span className="mt-3 inline-flex rounded-full bg-(--gem) px-4 py-2 text-sm font-semibold text-black transition group-hover:-translate-y-0.5">start for free →</span>
      </div>
    </a>
  </article>
);
