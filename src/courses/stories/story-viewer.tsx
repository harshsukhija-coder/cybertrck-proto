import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { Slide, Story } from "./sources";
import { markSeen } from "./use-stories";

const SLIDE_MS = 7000;
const LONG_SLIDE_MS = 10000;
const TRIVIA_MS = 15000;
/** Don't hold a slide forever if its photo is slow */
const IMAGE_WAIT_MS = 4000;

const durationOf = (slide: Slide) => (slide.trivia ? TRIVIA_MS : slide.list || slide.title.length > 120 ? LONG_SLIDE_MS : SLIDE_MS);

const firstUnseen = (story: Story, seen: Set<string>) => Math.max(0, story.slides.findIndex(slide => !seen.has(slide.id)));

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const when = (at: number) => {
  const diff = at - Date.now();
  const abs = Math.abs(diff);
  if (abs < 3_600_000) return relative.format(Math.round(diff / 60_000), "minute");
  if (abs < 86_400_000) return relative.format(Math.round(diff / 3_600_000), "hour");
  if (abs < 60 * 86_400_000) return relative.format(Math.round(diff / 86_400_000), "day");
  return relative.format(Math.round(diff / (30 * 86_400_000)), "month");
};

export const StoryAvatar = ({ story, className = "" }: { story: Story; className?: string }) => {
  const [broken, setBroken] = useState(false);
  const photo = story.slides.find(slide => slide.image)?.image?.src;
  const icon = story.slides.find(slide => slide.icon)?.icon;

  if (photo && !broken) return <img src={photo} alt="" draggable={false} onError={() => setBroken(true)} className={`object-cover ${className}`} />;
  if (icon && !broken)
    return (
      <span className={`grid place-items-center bg-white ${className}`}>
        <img src={icon} alt="" draggable={false} onError={() => setBroken(true)} className="h-3/5 w-3/5 object-contain" />
      </span>
    );
  return (
    <span className={`grid place-items-center font-poster ${className}`} style={{ background: `${story.color}26`, color: story.color }}>
      {story.glyph}
    </span>
  );
};

const Trivia = ({ trivia, color }: { trivia: NonNullable<Slide["trivia"]>; color: string }) => {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="mt-5 grid gap-2">
      {trivia.options.map((option, i) => {
        const state = picked === null ? "idle" : i === trivia.answer ? "right" : i === picked ? "wrong" : "idle";
        return (
          <button
            key={option}
            type="button"
            disabled={picked !== null}
            onClick={() => setPicked(i)}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-[15px] font-semibold transition-colors ${
              state === "right"
                ? "border-[#2ee6a6] bg-[#2ee6a6]/15"
                : state === "wrong"
                  ? "border-[#ff4d6d] bg-[#ff4d6d]/15"
                  : "border-white/15 bg-white/[0.04] enabled:hover:border-white/40"
            } ${picked !== null && state === "idle" ? "opacity-50" : ""}`}
          >
            {option}
            {state === "right" && <span className="text-[#2ee6a6]">✓</span>}
            {state === "wrong" && <span className="text-[#ff4d6d]">✕</span>}
          </button>
        );
      })}
      {picked !== null && (
        <p className="mt-1 text-sm font-semibold" style={{ color }}>
          {picked === trivia.answer ? "nailed it. 🎉" : "not quite. now you know!"}
        </p>
      )}
    </div>
  );
};

const SlideView = ({ slide, color, onReady, onClose }: { slide: Slide; color: string; onReady: () => void; onClose: () => void }) => {
  const [imageOk, setImageOk] = useState(true);
  const photo = slide.image && imageOk ? slide.image : null;
  const length = slide.title.length;
  const titleSize = photo ? (length > 110 ? "text-lg" : "text-[22px]") : length > 140 ? "text-xl" : length > 80 ? "text-2xl" : "text-[28px] sm:text-[32px]";

  return (
    <div className="flex h-full flex-col px-5 pb-6 pt-[72px]">
      {photo && (
        <figure className="relative min-h-[36%] flex-1 overflow-hidden rounded-2xl bg-white/5">
          <img
            src={photo.src}
            alt=""
            draggable={false}
            onLoad={onReady}
            onError={() => {
              setImageOk(false);
              onReady();
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {photo.credit && (
            <figcaption className="absolute bottom-2 left-2 max-w-[90%] truncate rounded-full bg-black/65 px-2.5 py-1 text-[10px] text-white/80">{photo.credit}</figcaption>
          )}
        </figure>
      )}

      <div className={`flex flex-col ${photo ? "mt-5 shrink-0" : "flex-1 justify-center"}`}>
        {slide.icon && <img src={slide.icon} alt="" draggable={false} className="mb-4 h-14 w-14 rounded-2xl bg-white object-contain p-1.5" />}
        <p className="font-jetbrains text-[11px] uppercase tracking-[0.14em]" style={{ color }}>
          {slide.kicker}
        </p>
        {slide.stat && (
          <div className="mt-3">
            <p className={`font-poster leading-none ${photo ? "text-5xl" : "text-6xl sm:text-7xl"}`}>{slide.stat.value}</p>
            <p className="mt-1.5 text-sm text-(--muted)">{slide.stat.label}</p>
          </div>
        )}
        <h2 className={`mt-3 font-display font-bold leading-[1.18] tracking-[-0.02em] ${titleSize} ${photo ? "line-clamp-4" : ""}`}>{slide.title}</h2>
        {slide.body && <p className={`mt-3 text-[15px] leading-relaxed text-(--muted) ${photo ? "line-clamp-3" : ""}`}>{slide.body}</p>}
        {slide.list && (
          <ul className="mt-5 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03]">
            {slide.list.map(row => (
              <li key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                <span className="truncate">{row.label}</span>
                <span className="shrink-0 font-jetbrains" style={{ color }}>
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
        )}
        {slide.trivia && <Trivia trivia={slide.trivia} color={color} />}
        {slide.link && (
          <a
            href={slide.link.href}
            {...(slide.link.href.startsWith("#") ? { onClick: onClose } : { target: "_blank", rel: "noreferrer" })}
            className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-white px-4 py-2.5 text-sm font-bold text-black transition-transform active:scale-95"
          >
            {slide.link.label} <span aria-hidden>{slide.link.href.startsWith("#") ? "→" : "↗"}</span>
          </a>
        )}
      </div>
    </div>
  );
};

type Props = { stories: Story[]; start: number; seen: Set<string>; onClose: () => void };

export const StoryViewer = ({ stories, start, seen, onClose }: Props) => {
  const [pos, setPos] = useState(() => ({ s: start, i: firstUnseen(stories[start], seen), round: 0 }));
  const [held, setHeld] = useState(false);
  const [hidden, setHidden] = useState(document.hidden);
  const [ready, setReady] = useState<string | null>(null);
  const press = useRef<{ x: number; y: number; t: number } | null>(null);

  const story = stories[pos.s];
  const slide = story.slides[pos.i];
  const waiting = !!slide.image && ready !== slide.id;
  const paused = held || hidden || waiting;

  const next = () => {
    if (pos.i < story.slides.length - 1) return setPos({ ...pos, i: pos.i + 1 });
    if (pos.s < stories.length - 1) return setPos({ s: pos.s + 1, i: firstUnseen(stories[pos.s + 1], seen), round: pos.round });
    onClose();
  };
  const prev = () => {
    if (pos.i > 0) return setPos({ ...pos, i: pos.i - 1 });
    if (pos.s > 0) return setPos({ s: pos.s - 1, i: 0, round: pos.round });
    setPos({ ...pos, round: pos.round + 1 });
  };

  useEffect(() => markSeen(slide.id), [slide.id]);

  useEffect(() => {
    if (!slide.image) return;
    const timer = window.setTimeout(() => setReady(slide.id), IMAGE_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [slide]);

  useEffect(() => {
    const upcoming = story.slides[pos.i + 1] ?? stories[pos.s + 1]?.slides[0];
    if (upcoming?.image) new Image().src = upcoming.image.src;
  }, [story, stories, pos.s, pos.i]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    const root = document.querySelector<HTMLElement>(".cv-root");
    const overflow = root?.style.overflowY;
    if (root) root.style.overflowY = "hidden";
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (root) root.style.overflowY = overflow ?? "";
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowRight") next();
      else if (event.key === "ArrowLeft") prev();
      else if (event.key === " ") {
        event.preventDefault();
        setHeld(h => !h);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("a, button")) return;
    press.current = { x: event.clientX, y: event.clientY, t: Date.now() };
    setHeld(true);
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = press.current;
    press.current = null;
    setHeld(false);
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (dy > 90 && Math.abs(dy) > Math.abs(dx)) return onClose();
    if (Date.now() - start.t > 300 || Math.abs(dx) > 30) return;
    const box = event.currentTarget.getBoundingClientRect();
    if (event.clientX - box.left < box.width * 0.3) prev();
    else next();
  };
  const onPointerCancel = () => {
    press.current = null;
    setHeld(false);
  };

  const sideButton = "hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20 disabled:opacity-0 sm:grid";

  return (
    <div role="dialog" aria-modal aria-label={`${story.label} story`} className="fixed inset-0 z-50 flex items-center justify-center gap-5 bg-black/90 backdrop-blur-md animate-pop">
      <button type="button" aria-label="Previous" onClick={prev} disabled={pos.s === 0 && pos.i === 0} className={sideButton}>
        ‹
      </button>

      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onPointerLeave={onPointerCancel}
        onContextMenu={event => event.preventDefault()}
        className="relative h-[100dvh] w-full touch-none select-none overflow-hidden sm:aspect-[9/16] sm:h-[min(860px,92dvh)] sm:w-auto sm:rounded-3xl sm:border sm:border-white/10"
        style={{ background: `color-mix(in srgb, ${story.color} 9%, #0a0b10)` }}
      >
        <div className="absolute inset-x-0 top-0 z-10 px-3 pt-3">
          <div className="flex gap-1">
            {story.slides.map((s, idx) => (
              <span key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
                {idx < pos.i && <span className="block h-full w-full bg-white" />}
                {idx === pos.i && (
                  <span
                    key={`${pos.s}-${pos.i}-${pos.round}`}
                    onAnimationEnd={next}
                    className="block h-full w-full origin-left animate-story-fill bg-white"
                    style={{ animationDuration: `${durationOf(slide)}ms`, animationPlayState: paused ? "paused" : "running" }}
                  />
                )}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <span className="shrink-0 rounded-full p-[1.5px]" style={{ boxShadow: `0 0 0 1.5px ${story.color}` }}>
              <StoryAvatar story={story} className="h-8 w-8 rounded-full text-[11px]" />
            </span>
            <p className="min-w-0 flex-1 truncate text-[13px]">
              <span className="font-bold">{story.label}</span>
              <span className="text-(--muted)">
                {" "}
                · via {slide.source}
                {slide.at ? ` · ${when(slide.at)}` : ""}
              </span>
            </p>
            {held && <span className="font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">paused</span>}
            <button type="button" aria-label="Close" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xl text-white/80 hover:bg-white/10">
              ✕
            </button>
          </div>
        </div>

        <SlideView key={slide.id} slide={slide} color={story.color} onReady={() => setReady(slide.id)} onClose={onClose} />
      </div>

      <button type="button" aria-label="Next" onClick={next} className={sideButton}>
        ›
      </button>
    </div>
  );
};
