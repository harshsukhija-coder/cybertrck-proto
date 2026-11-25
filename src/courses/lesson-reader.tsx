import { useEffect, useState, type MouseEvent } from "react";
import { ChapterCover } from "./chapter-cover";
import { COURSES, chapterHash, findCourse } from "./data";
import { markDone } from "./progress";
import type { Course, CourseChapter, LessonSlide } from "./types";

const close = () => {
  if (window.history.length > 1) window.history.back();
  else window.location.hash = "#/courses";
};

const nextChapter = (course: Course, chapter: CourseChapter) => {
  const i = course.chapters.indexOf(chapter);
  if (i < course.chapters.length - 1) return { course, chapter: course.chapters[i + 1] };
  const nextCourse = COURSES[(COURSES.indexOf(course) + 1) % COURSES.length];
  return { course: nextCourse, chapter: nextCourse.chapters[0] };
};

const stop = (event: MouseEvent) => event.stopPropagation();

const Intro = ({ course, chapter }: { course: Course; chapter: CourseChapter }) => (
  <div className="absolute inset-0 flex flex-col">
    <ChapterCover chapter={{ ...chapter, number: undefined }} wordClass="text-[clamp(4rem,22vw,7rem)]" className="min-h-0 flex-1" />
    <div className="p-6 pb-10" style={{ background: chapter.duo[0] }}>
      <p className="font-jetbrains text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: chapter.duo[1] }}>
        {course.title} · chapter {chapter.number}
      </p>
      <h1 className="mt-3 font-accent text-[2.1rem] italic leading-[1.05] text-white">{chapter.hook}</h1>
      <p className="mt-5 flex items-center gap-3 font-vibe text-sm text-white/60">
        <span>{chapter.minutes} min</span>
        <span className="h-1 w-1 rounded-full bg-white/40" />
        <span>{chapter.lesson.length} cards</span>
        <span className="ml-auto font-semibold text-white animate-soft-bounce">tap to start →</span>
      </p>
    </div>
  </div>
);

type QuizState = { picked?: number };

const Slide = ({
  slide,
  chapter,
  quiz,
  onPick,
}: {
  slide: LessonSlide;
  chapter: CourseChapter;
  quiz: QuizState;
  onPick: (i: number) => void;
}) => {
  const [shadow, highlight] = chapter.duo;

  if (slide.kind === "stat") {
    return (
      <div className="flex h-full flex-col justify-center px-7">
        <p className="font-jetbrains text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">fun fact</p>
        <p className="mt-2 break-words font-poster text-[clamp(5.5rem,30vw,9rem)] uppercase leading-[0.9]" style={{ color: highlight }}>
          {slide.big}
        </p>
        <p className="mt-6 max-w-sm font-vibe text-xl leading-snug text-white/90">{slide.body}</p>
      </div>
    );
  }

  if (slide.kind === "quiz") {
    const answered = quiz.picked !== undefined;
    const right = quiz.picked === slide.answer;
    return (
      <div className="flex h-full flex-col justify-center px-6">
        <p className="font-jetbrains text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: highlight }}>
          quick check
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-white">{slide.q}</h2>
        <div className="mt-6 grid gap-2.5" onClick={stop}>
          {slide.options.map((option, i) => {
            const isAnswer = i === slide.answer;
            const isPicked = i === quiz.picked;
            const tone = !answered
              ? "border-white/15 bg-white/5 hover:border-white/40 hover:bg-white/10"
              : isAnswer
                ? "border-emerald-400 bg-emerald-400/15"
                : isPicked
                  ? "border-rose-400 bg-rose-400/15 animate-shake"
                  : "border-white/10 opacity-40";
            return (
              <button
                key={option}
                type="button"
                disabled={answered}
                onClick={() => onPick(i)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left font-vibe text-base text-white transition ${tone}`}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/20 font-jetbrains text-xs">
                  {answered && isAnswer ? "✓" : answered && isPicked ? "✕" : String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="mt-5 animate-pop rounded-2xl p-4" style={{ background: highlight, color: shadow }}>
            <p className="font-display text-sm font-bold">{right ? "nailed it 🎉" : "not quite —"}</p>
            <p className="mt-1 font-vibe text-[15px] leading-snug">{slide.why}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col justify-center px-7">
      <span
        className="pointer-events-none absolute -bottom-6 left-4 whitespace-nowrap font-poster text-[11rem] uppercase leading-none opacity-[0.07]"
        style={{ color: highlight }}
        aria-hidden
      >
        {chapter.word}
      </span>
      <span className="mb-5 h-1.5 w-12 rounded-full" style={{ background: highlight }} />
      <h2 className="font-display text-[1.75rem] font-bold leading-[1.1] text-white">{slide.title}</h2>
      <p className="mt-5 font-vibe text-xl leading-relaxed text-white/80">{slide.body}</p>
    </div>
  );
};

const Done = ({ course, chapter }: { course: Course; chapter: CourseChapter }) => {
  const next = nextChapter(course, chapter);
  return (
    <div className="flex h-full flex-col justify-center px-6" onClick={stop}>
      <p className="font-poster text-[5.5rem] uppercase leading-none" style={{ color: chapter.duo[1] }}>
        done ✓
      </p>
      <p className="mt-3 font-vibe text-lg text-white/80">
        +{chapter.minutes} min learned. you now know more about <b className="text-white">{chapter.title}</b> than most people.
      </p>

      <p className="mt-9 font-jetbrains text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">up next</p>
      <a
        href={chapterHash(next.course, next.chapter)}
        className="group mt-3 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-2.5 pr-4 transition hover:bg-white/10"
      >
        <ChapterCover chapter={{ ...next.chapter, word: "", number: undefined }} className="h-20 w-20 shrink-0 rounded-xl" />
        <span className="min-w-0">
          <span className="block font-jetbrains text-[10px] uppercase tracking-widest text-white/50">{next.course.title}</span>
          <span className="mt-1 block font-accent text-xl italic leading-tight text-white">{next.chapter.hook}</span>
        </span>
      </a>

      <button
        type="button"
        onClick={close}
        className="mt-4 rounded-full border border-white/15 py-3 font-vibe text-sm font-semibold text-white/80 transition hover:bg-white/10"
      >
        back to where i was
      </button>
    </div>
  );
};

type Props = { courseId: string; chapterId: string };

export const LessonReader = ({ courseId, chapterId }: Props) => {
  const course = findCourse(courseId);
  const chapter = course?.chapters.find(ch => ch.id === chapterId);
  const [index, setIndex] = useState(0);
  const [quiz, setQuiz] = useState<Record<number, QuizState>>({});

  const total = (chapter?.lesson.length ?? 0) + 2;
  const lessonSlide = chapter && index > 0 && index <= chapter.lesson.length ? chapter.lesson[index - 1] : undefined;
  const blocked = lessonSlide?.kind === "quiz" && quiz[index]?.picked === undefined;
  const isDone = index === total - 1;

  const go = (delta: number) => {
    if (delta > 0 && blocked) return;
    setIndex(i => Math.min(total - 1, Math.max(0, i + delta)));
  };

  useEffect(() => {
    if (isDone && course && chapter) markDone(course.id, chapter.id, chapter.minutes);
  }, [isDone, course, chapter]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === " ") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!course || !chapter) {
    return (
      <div className="cv-root grid h-full place-items-center p-6 text-center">
        <div>
          <p className="font-poster text-6xl uppercase">lost?</p>
          <p className="mt-2 font-vibe text-white/60">that lesson doesn't exist.</p>
          <a href="#/courses" className="mt-6 inline-block rounded-full bg-white px-5 py-2.5 font-vibe font-semibold text-black">
            see all courses
          </a>
        </div>
      </div>
    );
  }

  const onTap = (event: MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    go(event.clientX - box.left < box.width * 0.3 ? -1 : 1);
  };

  return (
    <div className="cv-root relative flex h-full items-center justify-center overflow-hidden">
      <div className="cv-grid pointer-events-none absolute inset-0 max-sm:hidden" />
      <div
        className="relative h-full w-full select-none overflow-hidden sm:h-[min(860px,94vh)] sm:w-[430px] sm:rounded-[2rem] sm:border sm:border-white/10 sm:shadow-2xl"
        style={{ background: chapter.duo[0] }}
      >
        <div className="absolute inset-x-0 top-0 z-20 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]">
          <div className="flex gap-1">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
                <span className={`block h-full bg-white transition-all duration-300 ${i <= index ? "w-full" : "w-0"}`} />
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-full font-poster text-sm text-black" style={{ background: course.color }}>
              {course.label[0].toUpperCase()}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-vibe text-sm font-semibold text-white">{course.handle}</span>
              <span className="block truncate font-jetbrains text-[10px] text-white/60">{chapter.title}</span>
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="close lesson"
              className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-black/25 text-lg text-white backdrop-blur transition hover:bg-black/40"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="absolute inset-0 cursor-pointer" onClick={onTap}>
          <div key={index} className="h-full animate-pop pb-20 pt-24">
            {index === 0 ? (
              <Intro course={course} chapter={chapter} />
            ) : isDone ? (
              <Done course={course} chapter={chapter} />
            ) : (
              lessonSlide && (
                <Slide
                  slide={lessonSlide}
                  chapter={chapter}
                  quiz={quiz[index] ?? {}}
                  onPick={picked => setQuiz(q => ({ ...q, [index]: { picked } }))}
                />
              )
            )}
          </div>
        </div>

        {index > 0 && !isDone && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] font-jetbrains text-[11px] uppercase tracking-widest text-white/45">
            <span>← tap left</span>
            <span>{blocked ? "pick an answer" : "tap right →"}</span>
          </div>
        )}
      </div>
    </div>
  );
};
