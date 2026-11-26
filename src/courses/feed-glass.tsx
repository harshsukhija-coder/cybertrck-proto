import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { COURSES, chapterHash, findCourse } from "./data";
import type { FeedItem } from "./feed-build";
import type { Fact, Poll } from "./feed-extras";
import { FEED_LAYOUTS, type FeedLayout } from "./feed-layout-store";
import { gameHash, type GameMeta } from "./games/games";
import { useQuickRound } from "./games/use-quick-round";
import { useGuide } from "./guide/guide-store";
import { pathHash, type LearningPath } from "./guide/paths";
import { markLiveSeen } from "./live/live-feed";
import type { LivePost } from "./live/live-sources";
import type { Course, CourseChapter } from "./types";

/** Frosted glass on the dark page */
const GLASS = "border border-white/10 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_50px_-20px_rgba(0,0,0,0.6)]";
/** Frosted glass sitting on top of a photo */
const FROST = "border border-white/20 bg-black/40 backdrop-blur-xl";

const short = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n));

const tint = (color: string): CSSProperties => ({ background: `color-mix(in srgb, ${color} 7%, rgba(255,255,255,0.025))` });

// ---------- shared pieces ----------

const Shell = ({ accent, compact, children, id }: { accent: string; compact: boolean; children: ReactNode; id?: string }) => (
  <article id={id} className={`animate-tile-in ${compact ? "rounded-[24px] p-1.5" : "rounded-[32px] p-2"} ${GLASS}`} style={tint(accent)}>
    {children}
  </article>
);

type PhotoProps = { src: string; focus?: string; exposure?: number; ratio: string; onError?: () => void; children?: ReactNode };

const Photo = ({ src, focus, exposure, ratio, onError, children }: PhotoProps) => (
  <div className={`relative overflow-hidden rounded-[22px] bg-white/5 ${ratio}`}>
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={onError}
      className="absolute inset-0 h-full w-full object-cover"
      style={{ objectPosition: focus, filter: exposure ? `brightness(${exposure})` : undefined }}
    />
    {children}
  </div>
);

const Avatar = ({ color, children }: { color: string; children: ReactNode }) => (
  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-[11px] font-bold text-black" style={{ background: color }}>
    {children}
  </span>
);

/** Account pill floating on a photo */
const Who = ({ avatar, name, meta }: { avatar: ReactNode; name: string; meta?: string }) => (
  <span className={`absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-full py-1 pl-1 pr-3.5 ${FROST}`}>
    {avatar}
    <span className="min-w-0 truncate text-xs">
      <b className="font-semibold">{name}</b>
      {meta && <span className="text-white/60"> · {meta}</span>}
    </span>
  </span>
);

/** Account row for posts without a photo */
const Header = ({ avatar, name, meta }: { avatar: ReactNode; name: string; meta?: string }) => (
  <div className="flex items-center gap-2 text-xs">
    {avatar}
    <b className="font-semibold">{name}</b>
    {meta && <span className="truncate text-(--muted)">· {meta}</span>}
  </div>
);

const Reason = ({ text }: { text?: string }) =>
  text ? <p className="font-jetbrains text-[10px] uppercase tracking-wider text-white/55">✦ {text.replace(/^because /, "")}</p> : null;

const LikePill = ({ base }: { base: number }) => {
  const [liked, setLiked] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setLiked(l => !l)}
      aria-pressed={liked}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${liked ? "border-rose-400/50 bg-rose-500/15 text-rose-200" : "border-white/10 bg-white/[0.06] hover:bg-white/10"}`}
    >
      <span key={String(liked)} className={liked ? "animate-like-pop" : ""}>
        {liked ? "♥" : "♡"}
      </span>
      {short(base + (liked ? 1 : 0))}
    </button>
  );
};

const Go = ({ href, color, children, external }: { href: string; color: string; children: ReactNode; external?: boolean }) => (
  <a
    href={href}
    target={external ? "_blank" : undefined}
    rel={external ? "noreferrer" : undefined}
    className="ml-auto shrink-0 rounded-full px-4 py-1.5 text-xs font-bold text-black transition-transform hover:scale-105"
    style={{ background: color }}
  >
    {children}
  </a>
);

const Actions = ({ children }: { children: ReactNode }) => <div className="flex items-center gap-2 px-2 pb-1.5 pt-3">{children}</div>;

const Choice = ({ label, state, onClick, fill }: { label: string; state: "idle" | "right" | "wrong" | "dim"; onClick: () => void; fill?: number }) => (
  <button
    type="button"
    disabled={state !== "idle"}
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition active:scale-[0.98] ${
      state === "right"
        ? "border-emerald-400/70 bg-emerald-400/10"
        : state === "wrong"
          ? "animate-shake border-rose-400/70 bg-rose-400/10"
          : state === "dim"
            ? "border-white/10 opacity-50"
            : "border-white/10 bg-white/[0.05] hover:border-white/30 hover:bg-white/[0.08]"
    }`}
  >
    {fill !== undefined && <span className="absolute inset-y-0 left-0 bg-white/[0.07] transition-[width] duration-700" style={{ width: `${fill}%` }} />}
    <span className="relative flex justify-between gap-2">
      <span>{label}</span>
      {fill !== undefined && <span className="font-jetbrains text-xs text-white/60">{fill}%</span>}
    </span>
  </button>
);

// ---------- one card per kind ----------

const ChapterCard = ({ course, chapter, reason, compact, seed }: { course: Course; chapter: CourseChapter; reason?: string; compact: boolean; seed: number }) => {
  const [peek, setPeek] = useState(false);
  const ratio = compact ? (seed % 3 === 0 ? "aspect-[3/4]" : "aspect-square") : "aspect-[4/5]";
  return (
    <Shell accent={course.color} compact={compact} id={`glass-${chapter.id}`}>
      <a href={chapterHash(course, chapter)} className="block">
        <Photo src={chapter.photo} focus={chapter.focus} exposure={chapter.exposure} ratio={ratio}>
          {!compact && <Who avatar={<Avatar color={course.color}>{course.title[0].toUpperCase()}</Avatar>} name={course.handle} meta={`ch ${chapter.number}`} />}
          <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 font-jetbrains text-[10px] font-bold ${FROST}`}>{chapter.minutes} min</span>
          <div className={`absolute inset-x-2 bottom-2 rounded-[18px] ${compact ? "p-3" : "p-4"} ${FROST}`}>
            {!compact && <Reason text={reason} />}
            <h3 className={`font-display font-bold lowercase leading-tight tracking-[-0.02em] ${compact ? "text-sm" : "mt-1 text-2xl"}`}>{chapter.title}</h3>
            {!compact && <p className="mt-1.5 text-sm leading-snug text-white/75">{peek ? chapter.tease : chapter.hook}</p>}
          </div>
        </Photo>
      </a>
      {!compact && (
        <Actions>
          <LikePill base={chapter.likes} />
          <button
            type="button"
            onClick={() => setPeek(p => !p)}
            className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold transition hover:bg-white/10"
          >
            {peek ? "↺ the question" : "👀 peek"}
          </button>
          <Go href={chapterHash(course, chapter)} color={course.color}>
            start →
          </Go>
        </Actions>
      )}
    </Shell>
  );
};

const GameCard = ({ game, reason, compact }: { game: GameMeta; reason?: string; compact: boolean }) => (
  <Shell accent={game.duo[1]} compact={compact} id={`glass-game-${game.id}`}>
    <a href={gameHash(game.id)} className="group block">
      <Photo src={game.photo} focus={game.focus} exposure={game.exposure} ratio={compact ? "aspect-[4/5]" : "aspect-[4/3]"}>
        {!compact && <Who avatar={<Avatar color={game.duo[1]}>▶</Avatar>} name="offtrck.games" meta={game.how} />}
        <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-white/15 text-2xl backdrop-blur-xl transition-transform group-hover:scale-110">
          ▶
        </span>
        <div className={`absolute inset-x-2 bottom-2 rounded-[18px] ${compact ? "p-3" : "p-4"} ${FROST}`}>
          {!compact && <Reason text={reason} />}
          <h3 className={`font-display font-bold lowercase tracking-[-0.02em] ${compact ? "text-sm" : "mt-1 text-2xl"}`}>{game.title}</h3>
          {!compact && <p className="mt-1 text-sm text-white/75">{game.tagline}</p>}
        </div>
      </Photo>
    </a>
    {!compact && (
      <Actions>
        <LikePill base={Math.round(game.plays / 4)} />
        <span className="text-xs text-(--muted)">{short(game.plays)} plays</span>
        <Go href={gameHash(game.id)} color={game.duo[1]}>
          play →
        </Go>
      </Actions>
    )}
  </Shell>
);

const QuickCard = ({ game, round, reason, compact }: { game: GameMeta; round: number; reason?: string; compact: boolean }) => {
  const { r, picked, correct, streak, pick, another } = useQuickRound(game, round);
  if (!r) return null;
  const color = game.duo[1];
  return (
    <Shell accent={color} compact={compact} id={`glass-quick-${game.id}-${round}`}>
      <Photo src={game.photo} focus={game.focus} exposure={game.exposure} ratio={compact ? "aspect-[2/1]" : "aspect-[5/2]"}>
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 font-jetbrains text-[10px] font-bold uppercase tracking-widest ${FROST}`}>
          ⚡ quick play{streak > 1 ? ` · ${streak}🔥` : ""}
        </span>
      </Photo>
      <div className={compact ? "p-2.5" : "p-4"}>
        {!compact && <Reason text={reason} />}
        <p className="mt-1 font-jetbrains text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
          {r.kicker}
        </p>
        <p className={r.big ? "mt-2 text-center text-5xl" : `mt-1 font-display font-bold leading-snug [overflow-wrap:anywhere] ${compact ? "text-base" : "text-xl"}`}>{r.prompt}</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {r.options.map(option => (
            <Choice
              key={option}
              label={option}
              onClick={() => pick(option)}
              state={picked === null ? "idle" : option === r.answer ? "right" : option === picked ? "wrong" : "dim"}
            />
          ))}
        </div>
        {picked !== null && (
          <div className="mt-3 animate-tile-in text-xs">
            <p>
              <b className={correct ? "text-emerald-300" : "text-rose-300"}>{correct ? "you got it! " : `it's ${r.answer}. `}</b>
              <span className="text-(--muted)">{r.why}</span>
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <button type="button" onClick={another} className="rounded-full border border-white/15 px-3 py-1.5 font-semibold hover:bg-white/10">
                another ↻
              </button>
              <Go href={gameHash(game.id)} color={color}>
                full game →
              </Go>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
};

const PollCard = ({ poll, reason, compact }: { poll: Poll; reason?: string; compact: boolean }) => {
  const [picked, setPicked] = useState<number | null>(null);
  const course = findCourse(poll.courseId) ?? COURSES[0];
  return (
    <Shell accent={course.color} compact={compact} id={`glass-${poll.id}`}>
      <div className={compact ? "p-2.5" : "p-4"}>
        <Header avatar={<Avatar color={course.color}>?</Avatar>} name={compact ? "poll" : course.handle} meta={compact ? undefined : "poll"} />
        {!compact && <div className="mt-3"><Reason text={reason} /></div>}
        <p className={`mt-2 font-display font-bold lowercase leading-tight tracking-[-0.02em] ${compact ? "text-base" : "text-2xl"}`}>{poll.q}</p>
        <div className="mt-3 grid gap-2">
          {poll.options.map((option, i) => (
            <Choice
              key={option}
              label={option}
              onClick={() => setPicked(i)}
              fill={picked === null ? undefined : poll.votes[i]}
              state={picked === null ? "idle" : i === poll.answer ? "right" : i === picked ? "wrong" : "dim"}
            />
          ))}
        </div>
        {picked !== null && <p className="mt-3 animate-tile-in text-xs text-(--muted)">{poll.why}</p>}
      </div>
    </Shell>
  );
};

const FactCard = ({ fact, compact }: { fact: Fact; compact: boolean }) => {
  const course = findCourse(fact.courseId) ?? COURSES[0];
  return (
    <Shell accent={fact.duo[1]} compact={compact} id={`glass-${fact.id}`}>
      <div className={compact ? "p-3" : "p-5"}>
        <Header avatar={<Avatar color={course.color}>!</Avatar>} name="did you know" />
        <p className={`mt-4 font-poster uppercase leading-[0.85] ${compact ? "text-5xl" : "text-8xl"}`} style={{ color: fact.duo[1] }}>
          {fact.big}
        </p>
        <p className={`mt-3 font-display font-bold lowercase leading-snug ${compact ? "text-sm" : "text-xl"}`}>{fact.line}</p>
        {!compact && <p className="mt-1.5 text-sm text-(--muted)">{fact.sub}</p>}
      </div>
      {!compact && (
        <Actions>
          <LikePill base={2400} />
          <span className="text-xs text-(--muted)">from {course.title}</span>
        </Actions>
      )}
    </Shell>
  );
};

const LiveCard = ({ post, reason, compact }: { post: LivePost; reason?: string; compact: boolean }) => {
  const [imageOk, setImageOk] = useState(true);
  const watched = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = watched.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      markLiveSeen(post.id);
      observer.disconnect();
    }, { threshold: 0.6 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [post.id]);
  const avatar = <Avatar color={post.color}>{post.source[0].toUpperCase()}</Avatar>;
  const hasImage = !!post.image && imageOk;

  return (
    <div ref={watched}>
      <Shell accent={post.color} compact={compact} id={`glass-live-${post.id}`}>
        {hasImage && (
          <Photo src={post.image!} ratio={compact ? "aspect-[4/3]" : "aspect-video"} onError={() => setImageOk(false)}>
            {!compact && <Who avatar={avatar} name={post.source} meta="live" />}
          </Photo>
        )}
        <div className={compact ? "p-2.5" : "p-4"}>
          {(!hasImage || compact) && <Header avatar={avatar} name={post.source} meta="● live" />}
          {!compact && <div className={hasImage ? "" : "mt-3"}><Reason text={reason} /></div>}
          <p className="mt-2 font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">{post.kicker}</p>
          <h3 className={`mt-1 font-display font-bold leading-snug tracking-[-0.01em] ${compact ? "line-clamp-3 text-sm" : "text-xl"}`}>{post.title}</h3>
          {post.stat && (
            <p className="mt-2 font-poster text-2xl" style={{ color: post.color }}>
              {post.stat.value} <span className="font-jetbrains text-[11px] text-(--muted)">{post.stat.label}</span>
            </p>
          )}
          {!compact && post.body && <p className="mt-2 line-clamp-3 text-sm text-(--muted)">{post.body}</p>}
        </div>
        <Actions>
          {!compact && <LikePill base={post.likes ?? 120} />}
          <Go href={post.link} color={post.color} external>
            ↗ {compact ? "open" : post.linkLabel}
          </Go>
        </Actions>
      </Shell>
    </div>
  );
};

const GuideCard = ({ path, reason, compact }: { path: LearningPath; reason?: string; compact: boolean }) => {
  const { statusOf } = useGuide();
  const s = statusOf(path);
  return (
    <Shell accent={path.color} compact={compact} id={`glass-guide-${path.id}`}>
      <div className={compact ? "p-3" : "p-5"}>
        <Header avatar={<Avatar color={path.color}>{path.glyph}</Avatar>} name={`${path.title} path`} meta={compact ? undefined : "your roadmap"} />
        {!compact && <div className="mt-3"><Reason text={reason} /></div>}
        {!s.checked ? (
          <>
            <p className={`mt-3 font-display font-bold lowercase leading-tight ${compact ? "text-base" : "text-2xl"}`}>how much do you know about {path.title}?</p>
            {!compact && <p className="mt-1.5 text-sm text-(--muted)">a 1-minute check. we skip what you know and show your next steps.</p>}
            <Actions>
              <Go href={pathHash(path.id, true)} color={path.color}>
                take the check →
              </Go>
            </Actions>
          </>
        ) : (
          <>
            <div className="mt-4 flex gap-1.5">
              {path.stages.map((stage, i) => (
                <span key={stage.name} className="h-1.5 flex-1 rounded-full" style={{ background: i < s.stage ? path.color : i === s.stage ? `${path.color}88` : "rgba(255,255,255,0.12)" }} />
              ))}
            </div>
            <p className="mt-3 font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">
              stage {s.stage + 1}/{path.stages.length} · {s.stepsDone}/{s.stepsTotal} steps
            </p>
            <p className={`mt-1 font-display font-bold lowercase ${compact ? "text-base" : "text-2xl"}`}>{path.stages[s.stage]?.name ?? "path complete 🏆"}</p>
            {s.next[0] && <p className="mt-1.5 text-sm text-(--muted)">next: {s.next[0].label}</p>}
            <Actions>
              <Go href={pathHash(path.id)} color={path.color}>
                my next steps →
              </Go>
            </Actions>
          </>
        )}
      </div>
    </Shell>
  );
};

const CoursesCard = ({ compact }: { compact: boolean }) => (
  <Shell accent="#ffffff" compact={compact}>
    <div className={compact ? "p-3" : "p-5"}>
      <Header avatar={<Avatar color="var(--gem)">✦</Avatar>} name="all courses" />
      <div className="mt-3 flex flex-wrap gap-2">
        {COURSES.map(course => (
          <a
            key={course.id}
            href={`#/feed/courses/${course.id}`}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold transition hover:bg-white/10"
          >
            <span className="h-2 w-2 rounded-full" style={{ background: course.color }} />
            {course.title}
          </a>
        ))}
      </div>
    </div>
  </Shell>
);

const AcademyCard = ({ compact }: { compact: boolean }) => (
  <Shell accent="#ff4d6d" compact={compact}>
    <a href="#/academy" className={`block ${compact ? "p-3" : "p-5"}`}>
      <Header avatar={<Avatar color="#ff4d6d">⇄</Avatar>} name="offtrck academy" meta={compact ? undefined : "new"} />
      <p className={`mt-3 font-display font-bold lowercase leading-tight ${compact ? "text-base" : "text-2xl"}`}>blogs, quizzes and real packet tracer labs.</p>
      <p className="mt-3 text-xs font-bold text-[#ff4d6d]">open the academy →</p>
    </a>
  </Shell>
);

/** One feed item as a glass card. `compact` is the small bento tile version. */
export const GlassItem = ({ item, seed, compact = false }: { item: FeedItem; seed: number; compact?: boolean }) => {
  switch (item.kind) {
    case "chapter":
      return <ChapterCard course={item.course} chapter={item.chapter} reason={item.reason} compact={compact} seed={seed} />;
    case "game":
      return <GameCard game={item.game} reason={item.reason} compact={compact} />;
    case "quick":
      return <QuickCard game={item.game} round={item.round} reason={item.reason} compact={compact} />;
    case "poll":
      return <PollCard poll={item.poll} reason={item.reason} compact={compact} />;
    case "fact":
      return <FactCard fact={item.fact} compact={compact} />;
    case "live":
      return <LiveCard post={item.post} reason={item.reason} compact={compact} />;
    case "guide":
      return <GuideCard path={item.path} reason={item.reason} compact={compact} />;
    case "courses":
      return <CoursesCard compact={compact} />;
    case "academy":
      return <AcademyCard compact={compact} />;
    case "badge":
      return null;
  }
};

const LayoutIcon = ({ id }: { id: FeedLayout }) => (
  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
    {id === "stream" && <rect x="3" y="1.5" width="10" height="13" rx="2" />}
    {id === "glass" && (
      <>
        <rect x="2" y="1.5" width="12" height="13" rx="3" opacity=".35" />
        <rect x="3.5" y="9" width="9" height="4" rx="1.5" />
      </>
    )}
    {id === "bento" && (
      <>
        <rect x="1.5" y="1.5" width="6" height="8" rx="1.5" />
        <rect x="8.5" y="1.5" width="6" height="5" rx="1.5" />
        <rect x="1.5" y="10.5" width="6" height="4" rx="1.5" />
        <rect x="8.5" y="7.5" width="6" height="7" rx="1.5" />
      </>
    )}
  </svg>
);

export const LayoutSwitch = ({ layout, onChange }: { layout: FeedLayout; onChange: (layout: FeedLayout) => void }) => (
  <div role="radiogroup" aria-label="Feed layout" className={`flex shrink-0 gap-0.5 rounded-full bg-white/[0.04] p-1 ${GLASS}`}>
    {FEED_LAYOUTS.map(l => (
      <button
        key={l.id}
        type="button"
        role="radio"
        aria-checked={layout === l.id}
        title={l.about}
        onClick={() => onChange(l.id)}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${layout === l.id ? "bg-white text-black" : "text-(--muted) hover:text-(--fg)"}`}
      >
        <LayoutIcon id={l.id} />
        <span className="hidden sm:inline">{l.label}</span>
      </button>
    ))}
  </div>
);
