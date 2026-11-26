import { useAcademy } from "./academy/academy-progress";
import { COUNTS, MODULES } from "./academy/content";
import { ChapterCover } from "./chapter-cover";
import { CourseCatalog } from "./course-catalog";
import { COURSES, chapterHash, findCourse } from "./data";
import { GAMES } from "./games/games";
import { useProgress } from "./progress";
import type { Course } from "./types";

const NEW_COURSES = new Set(["accounting"]);

const CourseCard = ({ course }: { course: Course }) => {
  const { doneIn } = useProgress();
  const done = doneIn(course);
  const total = course.chapters.length;
  const minutes = course.chapters.reduce((sum, c) => sum + c.minutes, 0);
  const games = GAMES.filter(g => g.course === course.id).length;
  return (
    <a
      href={`#/feed/courses/${course.id}`}
      className="group flex flex-col rounded-3xl border border-(--line) bg-(--panel) p-2 transition-[translate,border-color] duration-300 hover:-translate-y-1 hover:border-white/25"
    >
      <div className="relative">
        <ChapterCover chapter={{ ...course.chapters[0], word: course.label, number: undefined }} wordClass="text-6xl" className="aspect-[16/10] rounded-2xl" />
        {NEW_COURSES.has(course.id) && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 font-jetbrains text-[10px] font-bold uppercase tracking-wider text-black">new</span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pb-2 pt-3">
        <p className="font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">
          {total} chapters · {minutes} min{games ? ` · ${games} game${games > 1 ? "s" : ""}` : ""}
        </p>
        <h3 className="mt-1 font-display text-lg font-bold lowercase leading-tight">{course.title}</h3>
        <p className="mt-0.5 text-sm text-(--muted)">{course.tagline}</p>
        <div className="mt-auto flex items-center gap-2 pt-4">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full" style={{ width: `${(done / total) * 100}%`, background: course.color }} />
          </div>
          <span className="font-jetbrains text-[10px] text-(--muted)">
            {done}/{total}
          </span>
        </div>
      </div>
    </a>
  );
};

const AcademyCard = () => {
  const { done, total, examPassed } = useAcademy();
  return (
    <a
      href="#/academy"
      className="group flex flex-col justify-between gap-5 rounded-3xl border border-[#4f8cff]/30 bg-[#4f8cff]/[0.06] p-5 transition hover:-translate-y-1 hover:bg-[#4f8cff]/10"
    >
      <div className="min-w-0">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#4f8cff] text-2xl">🛰️</span>
        <p className="mt-4 font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em] text-[#4f8cff]">networking academy · the deep version</p>
        <h3 className="mt-1.5 font-display text-xl font-bold lowercase leading-tight">build real networks in cisco packet tracer</h3>
        <p className="mt-1 text-sm text-(--muted)">
          {MODULES.length} modules, {COUNTS.labs} graded labs and a final challenge that unlocks the <b className="text-(--fg)">network pro</b> badge.
          {done > 0 && ` you're ${Math.round((done / total) * 100)}% through.`}
        </p>
      </div>
      <span className="shrink-0 self-start rounded-full bg-[#4f8cff] px-5 py-2.5 text-sm font-semibold text-black">
        {examPassed ? "review →" : done ? "continue →" : "open academy →"}
      </span>
    </a>
  );
};

const ContinueCard = () => {
  const { lastDone, doneIn, nextIn } = useProgress();
  const course = lastDone ? findCourse(lastDone.split("/")[0]) : undefined;
  if (!course || doneIn(course) === course.chapters.length) return null;
  const next = nextIn(course);
  return (
    <a
      href={chapterHash(course, next)}
      className="group mt-6 flex items-center gap-3 rounded-3xl border border-(--line) bg-(--panel) p-2 pr-5 transition hover:border-white/25"
    >
      <ChapterCover chapter={{ ...next, word: "", number: undefined }} className="h-16 w-16 shrink-0 rounded-2xl" />
      <span className="min-w-0 flex-1">
        <span className="block font-jetbrains text-[10px] font-bold uppercase tracking-wider" style={{ color: course.color }}>
          pick up where you left off · {course.label}
        </span>
        <span className="mt-0.5 block truncate font-semibold">
          {next.number}. {next.title}
        </span>
      </span>
      <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
    </a>
  );
};

export const LearnHub = () => (
  <div className="animate-tile-in px-4 sm:px-0">
    <h1 className="font-display text-3xl font-bold lowercase tracking-[-0.03em] sm:text-4xl">
      pick a <span className="font-accent text-[1.3em] font-normal italic tracking-normal text-(--gem)">rabbit hole</span>
    </h1>
    <p className="mt-2 text-(--muted)">every chapter is a 5–10 minute story with examples and a quiz. games help you practise.</p>
    <ContinueCard />
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {COURSES.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
      <AcademyCard />
    </div>
  </div>
);

export const CourseView = ({ courseId }: { courseId: string }) => (
  <div className="animate-tile-in px-4 sm:px-0">
    <a href="#/feed/courses" className="font-jetbrains text-xs uppercase tracking-wider text-(--muted) hover:text-(--fg)">
      ← all courses
    </a>
    <div className="mt-4">
      <CourseCatalog courseId={courseId} base="#/feed/courses" />
    </div>
  </div>
);
