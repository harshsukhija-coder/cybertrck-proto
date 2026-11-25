import { useEffect, useRef, type CSSProperties } from "react";
import { AcademyBanner } from "./academy/academy-promo";
import { ChapterCover } from "./chapter-cover";
import { COURSES, chapterHash, findCourse } from "./data";
import { useProgress } from "./progress";
import type { Course, CourseChapter, TileShape } from "./types";

/** Container-query sizes, so the grid fits both the full page and the narrower feed column */
const SHAPE_CLASS: Record<TileShape, string> = {
  hero: "@md:col-span-2 @md:row-span-2 @4xl:col-span-7",
  side: "@4xl:col-span-5",
  tall: "@4xl:col-span-4 @4xl:row-span-2",
  wide: "@4xl:col-span-8",
  stack: "@4xl:col-span-4",
  boss: "@md:col-span-2 @4xl:col-span-12",
};

const BIG_SHAPES = new Set<TileShape>(["hero", "tall", "boss"]);

const ChapterTile = ({ course, chapter, index, done }: { course: Course; chapter: CourseChapter; index: number; done: boolean }) => {
  const big = BIG_SHAPES.has(chapter.shape);

  return (
    <a
      href={chapterHash(course, chapter)}
      style={{ animationDelay: `${index * 60}ms` }}
      className={`group relative flex animate-tile-in flex-col rounded-3xl border border-(--line) bg-(--panel) p-2.5 backdrop-blur-sm transition-[translate,background-color,border-color] duration-300 hover:-translate-y-1 hover:border-(--gem)/40 hover:bg-white/[0.05] focus-visible:border-(--gem) focus-visible:outline-none ${
        SHAPE_CLASS[chapter.shape]
      }`}
    >
      <ChapterCover
        chapter={chapter}
        wordClass={chapter.shape === "tall" ? "text-7xl" : big ? "text-7xl @md:text-8xl" : "text-6xl"}
        className="min-h-0 flex-1 rounded-2xl"
      />
      {done && (
        <span className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 font-jetbrains text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
          <span className="text-(--gem)">✓</span> done
        </span>
      )}

      <div className="px-2 pb-1.5 pt-3.5">
        <p className="flex justify-between font-jetbrains text-[11px] uppercase tracking-wider text-(--muted)">
          <span>
            {String(chapter.number).padStart(2, "0")} · {chapter.title}
          </span>
          <span>{chapter.minutes} min</span>
        </p>
        <h3 className={`mt-1.5 font-semibold lowercase leading-tight tracking-[-0.02em] ${big ? "text-2xl" : "text-lg"}`}>
          {chapter.hook}
        </h3>
        <p className="mt-1 font-accent text-lg italic text-(--gem) transition-opacity duration-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
          {chapter.tease}
        </p>
      </div>
    </a>
  );
};

type Props = {
  courseId?: string;
  /** Chip links go to `${base}/<course id>` */
  base: string;
};

export const CourseCatalog = ({ courseId, base }: Props) => {
  const course = (courseId && findCourse(courseId)) || COURSES[0];
  const { isDone, doneIn, nextIn } = useProgress();
  const done = doneIn(course);
  const next = nextIn(course);
  const minutes = course.chapters.reduce((sum, c) => sum + c.minutes, 0);
  const chipRow = useRef<HTMLElement>(null);

  useEffect(() => {
    const row = chipRow.current;
    const active = row?.querySelector<HTMLElement>("[aria-current]");
    if (row && active) row.scrollTo({ left: active.offsetLeft - (row.clientWidth - active.clientWidth) / 2, behavior: "smooth" });
  }, [course.id]);

  return (
    <div className="@container" style={{ "--gem": course.color } as CSSProperties}>
      <nav ref={chipRow} className="no-scrollbar relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Courses">
        {COURSES.map(c => {
          const active = c.id === course.id;
          return (
            <a
              key={c.id}
              href={`${base}/${c.id}`}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active ? "border-transparent text-black" : "border-(--line) bg-(--panel) text-(--muted) hover:text-(--fg)"
              }`}
              style={active ? { background: c.color } : undefined}
            >
              {!active && <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />}
              {c.label}
              <span className={`font-jetbrains text-[10px] ${active ? "text-black/60" : "text-(--muted)"}`}>
                {doneIn(c)}/{c.chapters.length}
              </span>
            </a>
          );
        })}
      </nav>

      <section className="mt-5 flex flex-col gap-5 rounded-3xl border border-(--line) bg-(--panel) p-5 @2xl:flex-row @2xl:items-center @2xl:p-7">
        <div className="min-w-0 flex-1">
          <p className="font-jetbrains text-[11px] uppercase tracking-[0.2em] text-(--muted)">
            {course.chapters.length} chapters · {minutes} min · {course.handle}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold lowercase leading-none tracking-[-0.04em] @lg:text-4xl">{course.title}</h2>
          <p className="mt-2 font-accent text-xl italic text-(--gem)">{course.tagline}</p>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-(--gem) transition-all duration-700" style={{ width: `${(done / course.chapters.length) * 100}%` }} />
            </div>
            <span className="font-jetbrains text-xs text-(--muted)">
              {done}/{course.chapters.length}
            </span>
          </div>
        </div>
        <a
          href={chapterHash(course, next)}
          className="group flex items-center gap-3 rounded-2xl bg-(--gem) p-2 pr-5 text-black transition-transform hover:-translate-y-0.5"
        >
          <ChapterCover chapter={{ ...next, word: "", number: undefined }} className="h-14 w-14 shrink-0 rounded-xl" />
          <span className="min-w-0">
            <span className="block font-jetbrains text-[10px] font-bold uppercase tracking-wider opacity-60">
              {done === 0 ? "start here" : done === course.chapters.length ? "replay" : "continue"}
            </span>
            <span className="block truncate font-semibold">
              {next.number}. {next.title}
            </span>
          </span>
          <span className="ml-auto text-xl transition-transform group-hover:translate-x-1">→</span>
        </a>
      </section>

      {course.id === "networking" && <AcademyBanner />}

      <div key={course.id} className="mt-5 grid auto-rows-[330px] grid-cols-1 gap-4 @md:auto-rows-[330px] @md:grid-cols-2 @4xl:auto-rows-[320px] @4xl:grid-cols-12 @4xl:gap-5">
        {course.chapters.map((chapter, i) => (
          <ChapterTile key={chapter.id} course={course} chapter={chapter} index={i} done={isDone(course.id, chapter.id)} />
        ))}
      </div>
    </div>
  );
};
