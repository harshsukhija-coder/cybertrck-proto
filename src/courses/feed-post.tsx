import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { OfftrckMark } from "../icons/OfftrckMark";
import { ChapterCover } from "./chapter-cover";
import { COURSES, chapterHash, findCourse } from "./data";
import type { Fact, Poll } from "./feed-extras";
import { BookmarkIcon, ChevronIcon, CommentIcon, DotsIcon, GamepadIcon, HeartIcon, ShareIcon, VerifiedIcon } from "./feed-icons";
import { gameHash, type GameMeta } from "./games/games";
import { slideOf, type ChapterLayout } from "./post-layouts";
import type { Course, CourseChapter, LessonSlide } from "./types";

const DOUBLE_TAP_MS = 300;
const LIKERS = ["packet_pal", "stonks.sid", "dns.diva", "brand.bae", "query.queen", "lagless.lena", "budget.boss", "subnet.sam"];

const FACT_CAPTIONS = [
  "save this for your next awkward silence 🧠",
  "drop this at dinner and watch everyone go quiet 🤯",
  "you can't unlearn this now. sorry 😌",
  "send this to the friend who thinks they know everything 👀",
];
const POLL_CAPTIONS = [
  "vote first, then see what everyone else said 👀",
  "no googling. gut answer only 🫣",
  "most people get this wrong. do you? 🤔",
];

const CourseAvatar = ({ course }: { course: Course }) => (
  <span className="font-poster text-lg uppercase leading-none">{course.label[0]}</span>
);

/** Likes + double-tap heart bursts, shared by chapter and game posts */
const useLike = () => {
  const [liked, setLiked] = useState(false);
  const [bursts, setBursts] = useState<number[]>([]);
  const lastTap = useRef(0);

  const burst = () => {
    const id = Date.now();
    setBursts(b => [...b, id]);
    window.setTimeout(() => setBursts(b => b.filter(x => x !== id)), 900);
  };

  /** Call on every tap of the media; returns true when it was a double tap */
  const onTap = () => {
    const now = Date.now();
    const isDouble = now - lastTap.current < DOUBLE_TAP_MS;
    lastTap.current = isDouble ? 0 : now;
    if (isDouble) {
      setLiked(true);
      burst();
    }
    return isDouble;
  };

  return { liked, toggle: () => setLiked(l => !l), bursts, onTap };
};

const HeartBursts = ({ bursts }: { bursts: number[] }) =>
  bursts.map(id => (
    <HeartIcon
      key={id}
      filled
      className="pointer-events-none absolute left-1/2 top-1/2 z-20 h-28 w-28 animate-heart-burst text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)]"
    />
  ));

/** Cover slide that tilts toward the mouse with a moving glare */
const TiltCover = ({ chapter }: { chapter: CourseChapter }) => {
  const [tilt, setTilt] = useState<{ x: number; y: number } | null>(null);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTilt({ x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height });
  };

  const rx = tilt ? (0.5 - tilt.y) * 10 : 0;
  const ry = tilt ? (tilt.x - 0.5) * 12 : 0;

  return (
    <div className="h-full w-full [perspective:900px]" onPointerMove={onMove} onPointerLeave={() => setTilt(null)}>
      <div
        className="relative h-full w-full transition-transform duration-300 ease-out"
        style={{ transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(${tilt ? 1.03 : 1})` }}
      >
        <ChapterCover chapter={chapter} wordClass="text-[clamp(4.5rem,22vw,7.5rem)]" className="h-full w-full" />
        <div
          className="pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-300"
          style={{
            opacity: tilt ? 1 : 0,
            background: tilt
              ? `radial-gradient(circle at ${tilt.x * 100}% ${tilt.y * 100}%, rgba(255,255,255,0.55), transparent 55%)`
              : undefined,
          }}
        />
      </div>
    </div>
  );
};

const QuestionSlide = ({ chapter }: { chapter: CourseChapter }) => {
  const [shadow, highlight] = chapter.duo;
  return (
    <div className="flex h-full w-full flex-col justify-between p-6 sm:p-8" style={{ background: highlight, color: shadow }}>
      <span className="font-jetbrains text-[11px] font-bold uppercase tracking-widest opacity-70">the question</span>
      <p className="font-display text-[clamp(1.75rem,7.5vw,2.6rem)] font-bold lowercase leading-[1.05] tracking-[-0.04em]">
        {chapter.hook}
      </p>
      <span className="font-jetbrains text-[11px] font-bold uppercase tracking-widest opacity-70">swipe for a spoiler →</span>
    </div>
  );
};

const SpoilerSlide = ({ course, chapter, revealed }: { course: Course; chapter: CourseChapter; revealed: boolean }) => {
  const [shadow, highlight] = chapter.duo;
  return (
    <div className="relative flex h-full w-full flex-col justify-between p-6 sm:p-8" style={{ background: shadow }}>
      <span className="font-jetbrains text-[11px] font-bold uppercase tracking-widest" style={{ color: highlight }}>
        spoiler
      </span>
      <p
        className={`font-accent text-[clamp(2rem,9vw,3rem)] italic leading-[1.05] text-white transition-[filter,opacity] duration-500 ${
          revealed ? "" : "select-none opacity-70 blur-md"
        }`}
      >
        {chapter.tease}
      </p>
      {revealed ? (
        <a
          href={chapterHash(course, chapter)}
          onClick={event => event.stopPropagation()}
          className="inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"
          style={{ background: highlight, color: shadow }}
        >
          get the full answer
          <ChevronIcon className="h-4 w-4" />
        </a>
      ) : (
        <span className="w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
          tap to reveal
        </span>
      )}
    </div>
  );
};

const Carousel = ({ course, chapter, onTap }: { course: Course; chapter: CourseChapter; onTap: () => boolean }) => {
  const scroller = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const slides = 3;

  const go = (index: number) => {
    const el = scroller.current;
    if (el) el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  const handleTap = () => {
    if (onTap()) return;
    if (slide === 2) setRevealed(true);
  };

  return (
    <div className="group/media relative">
      <div
        ref={scroller}
        onClick={handleTap}
        onScroll={event => setSlide(Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))}
        className="no-scrollbar flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
      >
        <div className="h-full w-full shrink-0 snap-center overflow-hidden">
          <TiltCover chapter={chapter} />
        </div>
        <div className="h-full w-full shrink-0 snap-center">
          <QuestionSlide chapter={chapter} />
        </div>
        <div className="h-full w-full shrink-0 snap-center">
          <SpoilerSlide course={course} chapter={chapter} revealed={revealed} />
        </div>
      </div>

      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 font-jetbrains text-[11px] text-white backdrop-blur">
        {slide + 1}/{slides}
      </span>

      {slide > 0 && (
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => go(slide - 1)}
          className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-black opacity-0 shadow-lg transition-opacity group-hover/media:opacity-100 sm:flex"
        >
          <ChevronIcon className="h-4 w-4 rotate-180" />
        </button>
      )}
      {slide < slides - 1 && (
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => go(slide + 1)}
          className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-black opacity-0 shadow-lg transition-opacity group-hover/media:opacity-100 sm:flex"
        >
          <ChevronIcon className="h-4 w-4" />
        </button>
      )}

      <div className="pointer-events-none absolute left-1/2 top-3.5 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2 py-1.5 backdrop-blur">
        {Array.from({ length: slides }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-4 bg-white" : "w-1.5 bg-white/40"}`}
          />
        ))}
      </div>
    </div>
  );
};

type FrameProps = {
  avatar: ReactNode;
  /** Avatar background; defaults to the accent colour */
  accent?: string;
  /** Extra button in the header, e.g. "start" */
  action?: ReactNode;
  name: string;
  meta: string;
  reason?: string;
  media: ReactNode;
  liked: boolean;
  onToggleLike: () => void;
  likes: number;
  caption: string;
  tags: string[];
  comments: number;
  age: string;
  seed: number;
  id: string;
};

const PostFrame = (props: FrameProps) => {
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const likers = [LIKERS[props.seed % LIKERS.length], LIKERS[(props.seed + 2) % LIKERS.length]];

  return (
    <article
      id={props.id}
      className="animate-tile-in scroll-mt-24 border-b border-(--line) pb-5 sm:rounded-[28px] sm:border sm:bg-(--panel) sm:p-2 sm:pb-5 sm:backdrop-blur-sm"
    >
      {props.reason && (
        <p className="flex items-center gap-1.5 px-4 pb-1 pt-3 font-jetbrains text-[10px] uppercase tracking-wider text-(--gem) sm:px-3 sm:pt-2">
          ✦ {props.reason}
        </p>
      )}
      <header className="flex items-center gap-3 px-4 py-3 sm:px-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--gem) text-black ring-2 ring-white/10 ring-offset-2 ring-offset-[#07080c]"
          style={props.accent ? { background: props.accent } : undefined}
        >
          {props.avatar}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="flex items-center gap-1 text-[15px] font-bold">
            <span className="truncate">{props.name}</span>
            <span className="shrink-0" style={{ color: props.accent ?? "var(--gem)" }}>
              <VerifiedIcon className="h-4 w-4" />
            </span>
          </p>
          <p className="truncate text-xs text-(--muted)">{props.meta}</p>
        </div>
        {props.action}
        <button type="button" aria-label="More options" className="rounded-full p-2 text-(--muted) hover:bg-white/5 hover:text-(--fg)">
          <DotsIcon className="h-5 w-5" />
        </button>
      </header>

      <div className="relative overflow-hidden sm:rounded-[22px]">{props.media}</div>

      <div className="mt-2 flex items-center gap-1 px-2.5 sm:px-1.5">
        <button
          type="button"
          aria-label={props.liked ? "Unlike" : "Like"}
          aria-pressed={props.liked}
          onClick={props.onToggleLike}
          className="rounded-full p-2 transition-colors hover:bg-white/5"
        >
          <HeartIcon
            key={String(props.liked)}
            filled={props.liked}
            className={`h-7 w-7 ${props.liked ? "animate-like-pop text-[#ff3b5c]" : ""}`}
          />
        </button>
        <button type="button" aria-label="Comment" className="rounded-full p-2 transition-colors hover:bg-white/5">
          <CommentIcon className="h-7 w-7" />
        </button>
        <button type="button" aria-label="Share" className="rounded-full p-2 transition-colors hover:bg-white/5">
          <ShareIcon className="h-[26px] w-[26px]" />
        </button>
        <button
          type="button"
          aria-label={saved ? "Unsave" : "Save"}
          aria-pressed={saved}
          onClick={() => setSaved(s => !s)}
          className="ml-auto rounded-full p-2 transition-colors hover:bg-white/5"
        >
          <BookmarkIcon key={String(saved)} filled={saved} className={`h-7 w-7 ${saved ? "animate-like-pop text-(--gem)" : ""}`} />
        </button>
      </div>

      <div className="space-y-1.5 px-4 sm:px-3">
        <p className="flex items-center gap-2 text-sm">
          <span className="flex -space-x-1.5">
            {likers.map(name => (
              <span
                key={name}
                className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#07080c] bg-white/20 text-[9px] font-bold uppercase"
              >
                {name[0]}
              </span>
            ))}
          </span>
          <span>
            liked by <b>{likers[0]}</b> and <b>{(props.likes - 1 + (props.liked ? 1 : 0)).toLocaleString()} others</b>
          </span>
        </p>
        <p className={`text-[15px] leading-snug ${expanded ? "" : "line-clamp-2"}`}>
          <b className="mr-1.5">{props.name}</b>
          {props.caption}{" "}
          <span className="text-(--gem)">{props.tags.map(t => `#${t}`).join(" ")}</span>
        </p>
        {!expanded && (
          <button type="button" onClick={() => setExpanded(true)} className="text-sm text-(--muted) hover:text-(--fg)">
            more
          </button>
        )}
        <p className="text-sm text-(--muted)">view all {props.comments} comments</p>
        <p className="font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">{props.age}</p>
      </div>
    </article>
  );
};

// ---------- chapter post layouts ----------

const CtaLink = ({ course, chapter, label, dark = false }: { course: Course; chapter: CourseChapter; label: string; dark?: boolean }) => {
  const [shadow, highlight] = chapter.duo;
  return (
    <a
      href={chapterHash(course, chapter)}
      onClick={event => event.stopPropagation()}
      className="inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
      style={dark ? { background: shadow, color: highlight } : { background: highlight, color: shadow }}
    >
      {label}
      <ChevronIcon className="h-4 w-4" />
    </a>
  );
};

/** Photo on top, a giant number breaking out of it */
const PosterMedia = ({ course, chapter, onTap }: { course: Course; chapter: CourseChapter; onTap: () => boolean }) => {
  const stat = slideOf(chapter, "stat")!;
  const [shadow, highlight] = chapter.duo;
  return (
    <div onClick={onTap} className="relative flex aspect-[4/5] flex-col" style={{ background: shadow }}>
      <ChapterCover chapter={{ ...chapter, word: "", number: undefined }} className="min-h-0 w-full flex-1" />
      <div className="relative px-6 pb-6 sm:px-7 sm:pb-7">
        <p
          className="-mt-[0.5em] break-words font-poster text-[clamp(4.5rem,24vw,8rem)] uppercase leading-[0.9] [text-shadow:0_6px_30px_rgba(0,0,0,0.5)]"
          style={{ color: highlight }}
        >
          {stat.big}
        </p>
        <p className="mt-3 font-vibe text-[17px] leading-snug text-white/90">{stat.body}</p>
        <div className="mt-4">
          <CtaLink course={course} chapter={chapter} label="find out why" />
        </div>
      </div>
    </div>
  );
};

/** A real question you can answer right in the feed */
const QuizMedia = ({ course, chapter }: { course: Course; chapter: CourseChapter }) => {
  const quiz = slideOf(chapter, "quiz")!;
  const [picked, setPicked] = useState<number | null>(null);
  const [shadow, highlight] = chapter.duo;
  const answered = picked !== null;
  return (
    <div className="relative">
      <div className="absolute inset-0">
        <ChapterCover chapter={{ ...chapter, word: "", number: undefined }} className="h-full w-full" />
      </div>
      <div className="absolute inset-0" style={{ background: `${shadow}cc` }} />
      <div className="relative flex flex-col p-5 sm:p-7">
        <span className="w-fit rounded-full px-2.5 py-1 font-jetbrains text-[10px] font-bold uppercase tracking-widest" style={{ background: highlight, color: shadow }}>
          can you answer this?
        </span>
        <p className="mt-4 font-display text-[clamp(1.35rem,5.8vw,1.8rem)] font-bold lowercase leading-[1.12] tracking-[-0.03em] text-white">{quiz.q}</p>
        <div className="mt-5 grid gap-2">
          {quiz.options.map((option, i) => {
            const tone = !answered
              ? "border-white/20 bg-black/30 hover:border-white/50"
              : i === quiz.answer
                ? "border-emerald-300 bg-emerald-400/25"
                : i === picked
                  ? "border-rose-300 bg-rose-500/25"
                  : "border-white/10 bg-black/20 opacity-50";
            return (
              <button
                key={option}
                type="button"
                disabled={answered}
                onClick={() => setPicked(i)}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] font-semibold text-white backdrop-blur-sm transition active:scale-[0.98] ${tone}`}
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/30 font-jetbrains text-[11px]">
                  {answered && i === quiz.answer ? "✓" : answered && i === picked ? "✕" : String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="mt-4 animate-tile-in">
            <p className="text-sm leading-snug text-white/85">
              <b className={picked === quiz.answer ? "text-emerald-300" : "text-rose-300"}>{picked === quiz.answer ? "correct! " : "not quite. "}</b>
              {quiz.why}
            </p>
            <div className="mt-4">
              <CtaLink course={course} chapter={chapter} label={`the full chapter · ${chapter.minutes} min`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/** Lesson cards you can swipe, like sticky notes on a desk */
const NotesMedia = ({ course, chapter }: { course: Course; chapter: CourseChapter }) => {
  const notes = chapter.lesson.filter((s): s is Extract<LessonSlide, { kind: "text" }> => s.kind === "text").slice(0, 3);
  const [shadow, highlight] = chapter.duo;
  const tilt = ["-rotate-2", "rotate-1", "-rotate-1"];
  return (
    <div className="py-5" style={{ background: `${highlight}12` }}>
      <p className="px-5 font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: highlight }}>
        {chapter.title} in {notes.length} notes · swipe →
      </p>
      <div className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 py-3">
        {notes.map((note, i) => (
          <div
            key={note.title}
            className={`flex aspect-square w-[72%] shrink-0 snap-center flex-col rounded-2xl p-5 shadow-xl shadow-black/30 sm:w-[62%] ${tilt[i % tilt.length]}`}
            style={i % 2 === 0 ? { background: highlight, color: shadow } : { background: shadow, color: "#fff", border: `1px solid ${highlight}40` }}
          >
            <span className="font-poster text-4xl leading-none opacity-40">{i + 1}</span>
            <p className="mt-3 font-display text-lg font-bold lowercase leading-tight">{note.title}</p>
            <p className="mt-2 line-clamp-5 text-sm leading-snug opacity-85">{note.body}</p>
          </div>
        ))}
        <div className="flex aspect-square w-[72%] shrink-0 snap-center flex-col justify-center gap-4 rounded-2xl border border-dashed border-white/20 p-5 sm:w-[62%]">
          <p className="font-accent text-2xl italic leading-tight text-white">{chapter.hook}</p>
          <CtaLink course={course} chapter={chapter} label="read the chapter" />
        </div>
      </div>
    </div>
  );
};

/** Compact editorial card: photo beside the headline, spoiler hidden until tapped */
const SplitMedia = ({ course, chapter, onTap }: { course: Course; chapter: CourseChapter; onTap: () => boolean }) => {
  const [revealed, setRevealed] = useState(false);
  const [shadow, highlight] = chapter.duo;
  return (
    <div
      onClick={() => !onTap() && setRevealed(true)}
      className="grid cursor-pointer grid-cols-[42%_minmax(0,1fr)]"
      style={{ background: shadow }}
    >
      <ChapterCover chapter={{ ...chapter, number: undefined }} wordClass="text-4xl" className="min-h-56 h-full w-full" />
      <div className="flex flex-col justify-between gap-4 p-5">
        <span className="font-jetbrains text-[10px] font-bold uppercase tracking-widest" style={{ color: highlight }}>
          ch {chapter.number} · {chapter.minutes} min
        </span>
        <p className="font-display text-xl font-bold lowercase leading-[1.1] tracking-[-0.03em] text-white">{chapter.hook}</p>
        <div>
          <p className={`font-accent text-lg italic leading-tight transition-[filter,opacity] duration-500 ${revealed ? "" : "select-none opacity-60 blur-sm"}`} style={{ color: highlight }}>
            {chapter.tease}
          </p>
          {revealed ? (
            <div className="mt-3">
              <CtaLink course={course} chapter={chapter} label="go deeper" />
            </div>
          ) : (
            <span className="mt-2 inline-block text-xs text-white/60">tap to reveal</span>
          )}
        </div>
      </div>
    </div>
  );
};

/** A scene from the course storyline, like a comic panel */
const StoryMedia = ({ course, chapter, onTap }: { course: Course; chapter: CourseChapter; onTap: () => boolean }) => {
  const scene = slideOf(chapter, "story")!;
  const [shadow, highlight] = chapter.duo;
  return (
    <div onClick={onTap} style={{ background: shadow }}>
      <div className="relative">
        <ChapterCover chapter={{ ...chapter, word: "", number: undefined }} className="aspect-[16/10] w-full" />
        <span className="absolute left-4 top-4 rounded-md px-2 py-1 font-poster text-lg uppercase leading-none" style={{ background: highlight, color: shadow }}>
          {scene.scene}
        </span>
      </div>
      <div className="p-5 sm:p-6">
        <p className="font-accent text-[1.6rem] italic leading-[1.15] text-white">{scene.body}</p>
        {scene.say && (
          <div className="mt-4 flex items-end gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-xs font-bold" style={{ background: highlight, color: shadow }}>
              R
            </span>
            <p className="rounded-2xl rounded-bl-md bg-white px-4 py-2 text-[15px] leading-snug text-black">{scene.say}</p>
          </div>
        )}
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-sm text-white/60">what happens next?</span>
          <CtaLink course={course} chapter={chapter} label="continue the story" />
        </div>
      </div>
    </div>
  );
};

export const ChapterPost = ({
  course,
  chapter,
  reason,
  seed,
  layout = "carousel",
}: {
  course: Course;
  chapter: CourseChapter;
  reason?: string;
  seed: number;
  layout?: ChapterLayout;
}) => {
  const { liked, toggle, bursts, onTap } = useLike();
  const media = {
    carousel: <Carousel course={course} chapter={chapter} onTap={onTap} />,
    poster: <PosterMedia course={course} chapter={chapter} onTap={onTap} />,
    quiz: <QuizMedia course={course} chapter={chapter} />,
    notes: <NotesMedia course={course} chapter={chapter} />,
    split: <SplitMedia course={course} chapter={chapter} onTap={onTap} />,
    story: <StoryMedia course={course} chapter={chapter} onTap={onTap} />,
  }[layout];
  return (
    <PostFrame
      id={`post-${chapter.id}`}
      avatar={<CourseAvatar course={course} />}
      accent={course.color}
      action={
        <a
          href={chapterHash(course, chapter)}
          className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold text-black transition-transform hover:scale-105"
          style={{ background: course.color }}
        >
          start
        </a>
      }
      name={course.handle}
      meta={`${course.title} · ch ${chapter.number} · ${chapter.minutes} min`}
      reason={reason}
      media={
        <>
          {media}
          <HeartBursts bursts={bursts} />
        </>
      }
      liked={liked}
      onToggleLike={toggle}
      likes={chapter.likes}
      caption={chapter.caption}
      tags={chapter.tags}
      comments={Math.round(chapter.likes / 27)}
      age={`${seed * 3 + 2}h ago`}
      seed={seed}
    />
  );
};

export const GamePost = ({ game, reason, seed }: { game: GameMeta; reason?: string; seed: number }) => {
  const { liked, toggle, bursts, onTap } = useLike();
  return (
    <PostFrame
      id={`post-${game.id}`}
      avatar={<GamepadIcon className="h-5 w-5" />}
      name="offtrck.games"
      meta={`mini game · ${game.how}`}
      reason={reason}
      media={
        <>
          <div onClick={onTap} className="group relative aspect-square">
            <ChapterCover chapter={game} wordClass="text-[clamp(4rem,19vw,6.5rem)]" className="h-full w-full" />
            <a
              href={gameHash(game.id)}
              onClick={event => event.stopPropagation()}
              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3"
            >
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white text-black shadow-2xl shadow-black/40 transition-transform group-hover:scale-110">
                <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
                <svg viewBox="0 0 24 24" className="relative ml-1 h-8 w-8" fill="currentColor" aria-hidden>
                  <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
                </svg>
              </span>
              <span className="rounded-full bg-black/60 px-4 py-1.5 text-sm font-bold text-white backdrop-blur">tap to play</span>
            </a>
          </div>
          <HeartBursts bursts={bursts} />
        </>
      }
      liked={liked}
      onToggleLike={toggle}
      likes={Math.round(game.plays / 4)}
      caption={game.caption}
      tags={game.tags}
      comments={Math.round(game.plays / 90)}
      age={`${seed * 2 + 1}h ago`}
      seed={seed}
    />
  );
};

export const PollPost = ({ poll, reason, seed }: { poll: Poll; reason?: string; seed: number }) => {
  const { liked, toggle } = useLike();
  const [picked, setPicked] = useState<number | null>(null);
  const course = findCourse(poll.courseId) ?? COURSES[0];
  const voted = picked !== null;

  return (
    <PostFrame
      id={`post-${poll.id}`}
      avatar={<CourseAvatar course={course} />}
      accent={course.color}
      name={course.handle}
      meta={`poll · ${voted ? "results are in" : "tap to vote"}`}
      reason={reason}
      media={
        <div className="flex flex-col p-5 sm:p-7" style={{ background: `${course.color}14` }}>
          <span className="w-fit rounded-full px-2.5 py-1 font-jetbrains text-[10px] font-bold uppercase tracking-widest text-black" style={{ background: course.color }}>
            poll
          </span>
          <p className="mt-4 font-display text-[clamp(1.4rem,6vw,1.9rem)] font-bold lowercase leading-[1.1] tracking-[-0.03em]">{poll.q}</p>
          <div className="mt-5 grid gap-2.5">
            {poll.options.map((option, i) => {
              const isAnswer = i === poll.answer;
              const share = poll.votes[i];
              return (
                <button
                  key={option}
                  type="button"
                  disabled={voted}
                  onClick={() => setPicked(i)}
                  className={`relative overflow-hidden rounded-2xl border px-4 py-3.5 text-left text-[15px] font-semibold transition ${
                    voted
                      ? isAnswer
                        ? "border-emerald-400/70"
                        : picked === i
                          ? "border-rose-400/70"
                          : "border-(--line)"
                      : "border-(--line) bg-white/[0.04] hover:border-white/30 active:scale-[0.98]"
                  }`}
                >
                  {voted && (
                    <span
                      className={`absolute inset-y-0 left-0 transition-[width] duration-700 ease-out ${isAnswer ? "bg-emerald-400/20" : "bg-white/[0.07]"}`}
                      style={{ width: `${share}%` }}
                    />
                  )}
                  <span className="relative flex items-center justify-between gap-3">
                    <span>
                      {voted && isAnswer && "✓ "}
                      {option}
                    </span>
                    {voted && <span className="font-jetbrains text-xs text-(--muted)">{share}%</span>}
                  </span>
                </button>
              );
            })}
          </div>
          {voted && (
            <p className="mt-4 animate-tile-in text-sm leading-snug">
              <b className={picked === poll.answer ? "text-emerald-300" : "text-rose-300"}>
                {picked === poll.answer ? "you're in the smart " + poll.votes[poll.answer] + "%. " : "plot twist. "}
              </b>
              <span className="text-(--muted)">{poll.why}</span>
            </p>
          )}
        </div>
      }
      liked={liked}
      onToggleLike={toggle}
      likes={900 + seed * 137}
      caption={POLL_CAPTIONS[seed % POLL_CAPTIONS.length]}
      tags={poll.tags}
      comments={40 + seed * 7}
      age={`${seed + 1}h ago`}
      seed={seed}
    />
  );
};

export const FactPost = ({ fact, reason, seed }: { fact: Fact; reason?: string; seed: number }) => {
  const { liked, toggle, bursts, onTap } = useLike();
  const course = findCourse(fact.courseId) ?? COURSES[0];
  const [shadow, highlight] = fact.duo;
  const flipped = seed % 2 === 1;

  return (
    <PostFrame
      id={`post-${fact.id}`}
      avatar={<CourseAvatar course={course} />}
      accent={course.color}
      name={course.handle}
      meta="did you know?"
      reason={reason}
      media={
        <>
          <div
            onClick={onTap}
            className="flex aspect-square flex-col justify-between p-6 sm:p-8"
            style={{ background: flipped ? highlight : shadow, color: flipped ? shadow : "#fff" }}
          >
            <span className="font-jetbrains text-[11px] font-bold uppercase tracking-widest opacity-70">did you know?</span>
            <div>
              <p
                className="break-words font-poster text-[clamp(5.5rem,30vw,10rem)] uppercase leading-[0.85]"
                style={{ color: flipped ? shadow : highlight }}
              >
                {fact.big}
              </p>
              <p className="mt-4 font-display text-[clamp(1.25rem,5.5vw,1.7rem)] font-bold lowercase leading-[1.1] tracking-[-0.03em]">
                {fact.line}
              </p>
            </div>
            <p className="font-vibe text-sm leading-snug opacity-80">{fact.sub}</p>
          </div>
          <HeartBursts bursts={bursts} />
        </>
      }
      liked={liked}
      onToggleLike={toggle}
      likes={2100 + seed * 211}
      caption={FACT_CAPTIONS[seed % FACT_CAPTIONS.length]}
      tags={fact.tags}
      comments={60 + seed * 9}
      age={`${seed + 2}h ago`}
      seed={seed}
    />
  );
};

export const CoursesPost = ({ base }: { base: string }) => (
  <article className="animate-tile-in border-b border-(--line) py-4 sm:rounded-[28px] sm:border sm:bg-(--panel) sm:p-5 sm:backdrop-blur-sm">
    <div className="flex items-center justify-between px-4 sm:px-0">
      <div className="flex items-center gap-2">
        <OfftrckMark className="h-5 w-5 text-(--gem)" />
        <p className="font-display text-sm font-bold lowercase">courses for you</p>
      </div>
      <a href={base} className="text-xs font-semibold text-(--gem) hover:underline">
        see all
      </a>
    </div>
    <div className="no-scrollbar mt-4 flex snap-x gap-3 overflow-x-auto px-4 sm:px-0">
      {COURSES.map(course => (
        <a key={course.id} href={`${base}/${course.id}`} className="group w-44 shrink-0 snap-start">
          <ChapterCover
            chapter={{ ...course.chapters[0], number: undefined }}
            wordClass="text-4xl"
            className="aspect-[4/5] rounded-2xl ring-1 ring-white/10 transition-transform group-hover:-translate-y-1"
          />
          <p className="mt-2.5 truncate text-sm font-bold">{course.title}</p>
          <p className="truncate text-xs text-(--muted)">
            {course.chapters.length} chapters · {course.tagline}
          </p>
        </a>
      ))}
    </div>
  </article>
);
