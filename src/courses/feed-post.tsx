import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import { OfftrckMark } from "../icons/OfftrckMark";
import { ChapterCover } from "./chapter-cover";
import { BookmarkIcon, ChevronIcon, CommentIcon, DotsIcon, GamepadIcon, HeartIcon, ShareIcon, VerifiedIcon } from "./feed-icons";
import { gameHash, type GameMeta } from "./games/games";
import type { CourseChapter } from "./networking";

const DOUBLE_TAP_MS = 300;
const LIKERS = ["packet_pal", "dns.diva", "ping_prince", "router.rat", "lagless.lena", "subnet.sam"];

const chapterHash = (chapter: CourseChapter) => `#/courses/networking/${chapter.id}`;

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

const SpoilerSlide = ({ chapter, revealed }: { chapter: CourseChapter; revealed: boolean }) => {
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
          href={chapterHash(chapter)}
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

const Carousel = ({ chapter, onTap }: { chapter: CourseChapter; onTap: () => boolean }) => {
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
          <SpoilerSlide chapter={chapter} revealed={revealed} />
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
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--gem) text-black ring-2 ring-(--gem)/30 ring-offset-2 ring-offset-[#07080c]">
          {props.avatar}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="flex items-center gap-1 text-[15px] font-bold">
            {props.name}
            <VerifiedIcon className="h-4 w-4 text-(--gem)" />
          </p>
          <p className="truncate text-xs text-(--muted)">{props.meta}</p>
        </div>
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

export const ChapterPost = ({ chapter, reason, seed }: { chapter: CourseChapter; reason?: string; seed: number }) => {
  const { liked, toggle, bursts, onTap } = useLike();
  return (
    <PostFrame
      id={`post-${chapter.id}`}
      avatar={<OfftrckMark className="h-5 w-5" />}
      name="offtrck"
      meta={`chapter ${String(chapter.number).padStart(2, "0")} · ${chapter.title} · ${chapter.minutes} min`}
      reason={reason}
      media={
        <>
          <Carousel chapter={chapter} onTap={onTap} />
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
