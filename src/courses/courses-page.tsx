import type { CSSProperties } from "react";
import { OfftrckMark } from "../icons/OfftrckMark";
import { ChapterCover } from "./chapter-cover";
import { CourseCatalog } from "./course-catalog";
import { ALL_CHAPTERS, COURSES, chapterHash } from "./data";
import { GEMS, useGem, type Gem } from "./gems";
import { useProgress } from "./progress";

const totalChapters = ALL_CHAPTERS.length;

/** One cover from each of three courses, fanned out next to the headline */
const FAN = [
  { pick: ALL_CHAPTERS.find(c => c.chapter.id === "compound-interest")!, rest: "-translate-x-28 rotate-[-10deg]", spread: "group-hover/fan:-translate-x-44 group-hover/fan:rotate-[-14deg]" },
  { pick: ALL_CHAPTERS.find(c => c.chapter.id === "hooks")!, rest: "translate-x-28 rotate-[10deg]", spread: "group-hover/fan:translate-x-44 group-hover/fan:rotate-[14deg]" },
  { pick: ALL_CHAPTERS.find(c => c.chapter.id === "what-is-a-network")!, rest: "-translate-y-2", spread: "group-hover/fan:-translate-y-5" },
];

const TopBar = ({ gem, onPick }: { gem: Gem; onPick: (id: string) => void }) => (
  <header className="sticky top-3 z-30 mx-auto max-w-7xl px-3 sm:top-4 sm:px-8">
    <div className="flex h-14 items-center gap-4 rounded-2xl border border-(--line) bg-black/50 px-4 backdrop-blur-xl">
      <a href="#/courses" className="flex items-center gap-2 font-display text-base font-bold tracking-tight">
        <OfftrckMark className="h-5 w-5 text-(--gem)" />
        offtrck
      </a>
      <span className="hidden text-sm text-(--muted) sm:inline">/ courses</span>

      <div className="ml-auto flex items-center gap-4 sm:gap-5">
        <div className="hidden items-center gap-2 sm:flex" role="group" aria-label="Accent colour">
          {GEMS.map(g => (
            <button
              key={g.id}
              type="button"
              title={g.name}
              aria-label={`${g.name} accent`}
              aria-pressed={g.id === gem.id}
              onClick={() => onPick(g.id)}
              className={`h-3.5 w-3.5 rounded-full transition-all hover:scale-125 ${
                g.id === gem.id ? "ring-2 ring-white/80 ring-offset-2 ring-offset-black" : "opacity-50 hover:opacity-100"
              }`}
              style={{ background: g.color }}
            />
          ))}
        </div>
        <a href="#/feed" className="rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-black transition hover:bg-white/85">
          open feed
        </a>
      </div>
    </div>
  </header>
);

const CoverFan = () => (
  <div className="group/fan relative hidden h-[440px] items-center justify-center lg:flex">
    {FAN.map(({ pick, rest, spread }) => (
      <a
        key={pick.chapter.id}
        href={chapterHash(pick.course, pick.chapter)}
        aria-label={pick.chapter.title}
        className={`group absolute w-60 transition-transform duration-500 ease-out ${rest} ${spread}`}
      >
        <ChapterCover
          chapter={pick.chapter}
          wordClass="text-5xl"
          className="aspect-[4/5] rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10"
        />
      </a>
    ))}
  </div>
);

/** Small cover strip that replaces the fan on phones */
const CoverStrip = () => (
  <div className="no-scrollbar -mx-5 mt-9 flex gap-3 overflow-x-auto px-5 lg:hidden">
    {COURSES.map(course => (
      <a key={course.id} href={`#/courses/${course.id}`} className="w-32 shrink-0">
        <ChapterCover chapter={{ ...course.chapters[0], number: undefined }} wordClass="text-2xl" className="aspect-[4/5] rounded-2xl" />
        <span className="mt-2 block truncate text-sm font-semibold">{course.title}</span>
      </a>
    ))}
  </div>
);

const Hero = () => {
  const { nextIn, totalDone } = useProgress();
  const course = COURSES[0];

  return (
    <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-24 lg:grid-cols-[1.1fr_1fr]">
      <div className="min-w-0">
        <span className="inline-flex items-center gap-2 rounded-full border border-(--line) bg-(--panel) px-3.5 py-1.5 font-jetbrains text-[11px] uppercase tracking-wider text-(--muted) backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--gem)" />
          {COURSES.length} courses · {totalChapters} chapters
        </span>
        <h1 className="mt-6 font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold lowercase leading-[1.02] tracking-[-0.04em]">
          learn the stuff school{" "}
          <span className="font-accent text-[1.25em] font-normal italic tracking-normal text-(--gem)">never</span> taught you.
        </h1>
        <p className="mt-5 max-w-md text-lg text-(--muted)">
          the internet, databases, money and marketing. tiny chapters, real answers, zero boring lectures.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href={chapterHash(course, nextIn(course))}
            className="group inline-flex items-center gap-2 rounded-full bg-(--gem) px-6 py-3 font-semibold text-black transition-transform hover:-translate-y-0.5"
          >
            {totalDone > 0 ? "keep going" : "start learning"}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
          <a
            href="#/academy"
            className="rounded-full border border-(--line) bg-(--panel) px-5 py-3 text-sm font-medium text-(--muted) backdrop-blur transition hover:text-(--fg)"
          >
            🛰️ networking academy: real labs
          </a>
        </div>
        <CoverStrip />
      </div>

      <CoverFan />
    </section>
  );
};

const CoursesPage = ({ route }: { route: string }) => {
  const { gem, setGem } = useGem();
  const courseId = route.split("/")[2];

  return (
    <div style={{ "--gem": gem.color } as CSSProperties} className="cv-root relative h-full overflow-y-auto overflow-x-hidden font-vibe">
      <div className="cv-grid pointer-events-none absolute inset-x-0 top-0 h-[900px]" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-[-260px] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-(--gem) opacity-[0.13] blur-[140px] transition-colors duration-700"
        aria-hidden
      />

      <div className="relative">
        <TopBar gem={gem} onPick={setGem} />
        <Hero />

        <section id="catalog" className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
          <h2 className="mb-5 font-display text-2xl font-bold lowercase tracking-[-0.03em] sm:text-3xl">
            pick a <span className="font-accent text-[1.3em] font-normal italic tracking-normal text-(--gem)">rabbit hole</span>
          </h2>
          <CourseCatalog courseId={courseId} base="#/courses" />
        </section>
      </div>
    </div>
  );
};

export default CoursesPage;
