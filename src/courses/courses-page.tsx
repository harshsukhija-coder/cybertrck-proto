import type { CSSProperties } from "react";
import { OfftrckMark } from "../icons/OfftrckMark";
import { ChapterCover } from "./chapter-cover";
import { GEMS, useGem, type Gem } from "./gems";
import { networkingCourse, type CourseChapter, type TileShape } from "./networking";

const course = networkingCourse;
const totalHours = Math.round(course.chapters.reduce((sum, c) => sum + c.minutes, 0) / 6) / 10;

const SHAPE_CLASS: Record<TileShape, string> = {
  hero: "sm:col-span-2 sm:row-span-2 lg:col-span-7",
  side: "lg:col-span-5",
  tall: "lg:col-span-4 lg:row-span-2",
  wide: "lg:col-span-8",
  stack: "lg:col-span-4",
  boss: "sm:col-span-2 lg:col-span-12",
};

const BIG_SHAPES = new Set<TileShape>(["hero", "tall", "boss"]);

/** Covers fanned out next to the headline, with their resting and spread-out positions */
const FAN = [
  { index: 5, rest: "-translate-x-28 rotate-[-10deg]", spread: "group-hover/fan:-translate-x-44 group-hover/fan:rotate-[-14deg]" },
  { index: 6, rest: "translate-x-28 rotate-[10deg]", spread: "group-hover/fan:translate-x-44 group-hover/fan:rotate-[14deg]" },
  { index: 0, rest: "-translate-y-2", spread: "group-hover/fan:-translate-y-5" },
];

const chapterHash = (chapter: CourseChapter) => `#/courses/${course.id}/${chapter.id}`;

const TopBar = ({ gem, onPick }: { gem: Gem; onPick: (id: string) => void }) => (
  <header className="sticky top-4 z-30 mx-auto max-w-7xl px-4 sm:px-8">
    <div className="flex h-14 items-center gap-4 rounded-2xl border border-(--line) bg-black/40 px-4 backdrop-blur-xl">
      <a href="#/courses" className="flex items-center gap-2 font-display text-base font-bold tracking-tight">
        <OfftrckMark className="h-5 w-5 text-(--gem)" />
        offtrck
      </a>
      <span className="hidden text-sm text-(--muted) sm:inline">/ courses</span>

      <div className="ml-auto flex items-center gap-5">
        <div className="flex items-center gap-2" role="group" aria-label="Accent colour">
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
        <a href="#/" className="text-sm font-medium text-(--muted) transition-colors hover:text-(--fg)">
          ← desktop
        </a>
      </div>
    </div>
  </header>
);

const CoverFan = () => (
  <div className="group/fan relative hidden h-[440px] items-center justify-center lg:flex">
    {FAN.map(({ index, rest, spread }) => {
      const chapter = course.chapters[index];
      return (
        <a
          key={chapter.id}
          href={chapterHash(chapter)}
          aria-label={chapter.title}
          className={`group absolute w-60 transition-transform duration-500 ease-out ${rest} ${spread}`}
        >
          <ChapterCover
            chapter={chapter}
            wordClass="text-5xl"
            className="aspect-[4/5] rounded-2xl shadow-2xl shadow-black/60 ring-1 ring-white/10"
          />
        </a>
      );
    })}
  </div>
);

const Hero = () => (
  <section className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.1fr_1fr]">
    <div>
      <span className="inline-flex items-center gap-2 rounded-full border border-(--line) bg-(--panel) px-3.5 py-1.5 font-jetbrains text-[11px] uppercase tracking-wider text-(--muted) backdrop-blur">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--gem)" />
        new course · {course.title}
      </span>
      <h1 className="mt-6 font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold lowercase leading-[1.02] tracking-[-0.04em]">
        how does the{" "}
        <span className="font-accent text-[1.25em] font-normal italic tracking-normal text-(--gem)">internet</span>{" "}
        actually work?
      </h1>
      <p className="mt-5 max-w-md text-lg text-(--muted)">8 tiny chapters. real answers to questions you never thought to ask.</p>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <a
          href={chapterHash(course.chapters[0])}
          className="group inline-flex items-center gap-2 rounded-full bg-(--gem) px-6 py-3 font-semibold text-black transition-transform hover:-translate-y-0.5"
        >
          start chapter 1
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
        <span className="rounded-full border border-(--line) bg-(--panel) px-5 py-3 text-sm font-medium text-(--muted) backdrop-blur">
          {course.chapters.length} chapters · {totalHours}h
        </span>
      </div>
    </div>

    <CoverFan />
  </section>
);

const ChapterTile = ({ chapter, index }: { chapter: CourseChapter; index: number }) => {
  const big = BIG_SHAPES.has(chapter.shape);

  return (
    <a
      href={chapterHash(chapter)}
      style={{ animationDelay: `${index * 60}ms` } as CSSProperties}
      className={`group flex animate-tile-in flex-col rounded-3xl border border-(--line) bg-(--panel) p-2.5 backdrop-blur-sm transition-[translate,background-color,border-color] duration-300 hover:-translate-y-1 hover:border-(--gem)/40 hover:bg-white/[0.05] focus-visible:border-(--gem) focus-visible:outline-none ${
        SHAPE_CLASS[chapter.shape]
      }`}
    >
      <ChapterCover
        chapter={chapter}
        wordClass={
          chapter.shape === "tall"
            ? "text-7xl sm:text-8xl"
            : big
              ? "text-8xl lg:text-9xl"
              : "text-6xl sm:text-7xl"
        }
        className="min-h-0 flex-1 rounded-2xl"
      />

      <div className="px-2 pb-1.5 pt-3.5">
        <p className="flex justify-between font-jetbrains text-[11px] uppercase tracking-wider text-(--muted)">
          <span>{chapter.title}</span>
          <span>{chapter.minutes} min</span>
        </p>
        <h3 className={`mt-1.5 font-semibold lowercase leading-tight tracking-[-0.02em] ${big ? "text-2xl" : "text-lg"}`}>
          {chapter.hook}
        </h3>
        <p className="mt-1 font-accent text-lg italic text-(--gem) opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          {chapter.tease}
        </p>
      </div>
    </a>
  );
};

const CoursesPage = () => {
  const { gem, setGem } = useGem();

  return (
    <div
      style={{ "--gem": gem.color } as CSSProperties}
      className="cv-root relative h-full overflow-y-auto overflow-x-hidden font-vibe"
    >
      <div className="cv-grid pointer-events-none absolute inset-x-0 top-0 h-[900px]" aria-hidden />
      <div
        className="pointer-events-none absolute left-1/2 top-[-260px] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-(--gem) opacity-[0.13] blur-[140px] transition-colors duration-700"
        aria-hidden
      />

      <div className="relative">
        <TopBar gem={gem} onPick={setGem} />
        <Hero />

        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-8">
          <div className="flex items-end justify-between border-b border-(--line) pb-4">
            <h2 className="font-display text-2xl font-bold lowercase tracking-[-0.03em] sm:text-3xl">
              pick a <span className="font-accent text-[1.3em] font-normal italic tracking-normal text-(--gem)">rabbit hole</span>
            </h2>
            <span className="font-jetbrains text-xs uppercase tracking-wider text-(--muted)">{course.chapters.length} chapters</span>
          </div>

          <div className="mt-8 grid auto-rows-[380px] grid-cols-1 gap-4 sm:auto-rows-[340px] sm:grid-cols-2 lg:auto-rows-[320px] lg:grid-cols-12 lg:gap-5">
            {course.chapters.map((chapter, i) => (
              <ChapterTile key={chapter.id} chapter={chapter} index={i} />
            ))}
          </div>

          <p className="mt-20 text-center font-accent text-2xl italic text-(--muted)">more courses soon.</p>
        </section>
      </div>
    </div>
  );
};

export default CoursesPage;
