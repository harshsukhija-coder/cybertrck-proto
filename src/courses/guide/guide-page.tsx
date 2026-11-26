import { useState } from "react";
import type { InterestId } from "../prefs";
import { isStepDone, useGuide, type PathStatus } from "./guide-store";
import { PathSummary, PathTrail, SkillCheck, StepRow } from "./guide-ui";
import { PATHS, findPath, pathHash, pathsFor, type LearningPath } from "./paths";

const Glyph = ({ path, className = "h-11 w-11 text-lg" }: { path: LearningPath; className?: string }) => (
  <span className={`grid shrink-0 place-items-center rounded-2xl font-display font-bold text-black ${className}`} style={{ background: path.color }}>
    {path.glyph}
  </span>
);

const PathCard = ({ path, status }: { path: LearningPath; status: PathStatus }) => (
  <a href={pathHash(path.id, !status.checked)} className="group flex flex-col gap-3 rounded-3xl border border-(--line) bg-(--panel) p-5 transition hover:border-white/25">
    <div className="flex items-center gap-3">
      <Glyph path={path} />
      <span className="min-w-0 flex-1">
        <span className="block font-display font-bold lowercase">{path.title}</span>
        <span className="block truncate text-xs text-(--muted)">{path.tagline}</span>
      </span>
      <span className="shrink-0 text-sm font-semibold transition-transform group-hover:translate-x-0.5" style={{ color: path.color }}>
        {status.checked ? "open →" : "check →"}
      </span>
    </div>
    {status.checked ? (
      <>
        <PathTrail path={path} status={status} />
        <p className="text-xs text-(--muted)">
          {status.next[0] ? (
            <>
              next: <span className="text-(--fg)">{status.next[0].label}</span>
            </>
          ) : (
            "path complete 🏆"
          )}
        </p>
      </>
    ) : (
      <p className="rounded-2xl border border-dashed border-white/15 px-4 py-3 text-sm text-(--muted)">
        not started. take the 1-minute check and we'll show you where to begin.
      </p>
    )}
  </a>
);

const PathList = ({ interests }: { interests: InterestId[] }) => {
  const { statusOf } = useGuide();
  const mine = pathsFor(interests);
  const others = PATHS.filter(p => !mine.includes(p));
  return (
    <div className="flex flex-col gap-6 px-4 sm:px-0">
      <div>
        <h1 className="font-display text-2xl font-bold lowercase tracking-[-0.03em]">
          your <span className="font-accent text-[1.3em] font-normal italic tracking-normal text-(--gem)">paths</span>
        </h1>
        <p className="mt-1 text-sm text-(--muted)">step-by-step roadmaps for what you're into. a quick check skips what you already know.</p>
      </div>
      <div className="grid gap-3">
        {mine.map(path => (
          <PathCard key={path.id} path={path} status={statusOf(path)} />
        ))}
      </div>
      {others.length > 0 && (
        <>
          <h2 className="font-jetbrains text-[11px] font-bold uppercase tracking-wider text-(--muted)">more paths</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {others.map(path => (
              <PathCard key={path.id} path={path} status={statusOf(path)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

/** Every stage as a station on a vertical line, with its steps */
const FullMap = ({ path, status }: { path: LearningPath; status: PathStatus }) => {
  const { state, finished } = useGuide();
  return (
    <ol className="flex flex-col">
      {path.stages.map((stage, i) => {
        const known = i < status.known;
        const done = i < status.stage;
        const here = i === status.stage;
        const steps = (
          <ul className="mt-3 grid gap-2">
            {stage.steps.map(step => (
              <StepRow key={step.id} step={step} done={isStepDone(step, state, finished)} color={path.color} />
            ))}
          </ul>
        );
        return (
          <li key={stage.name} className="relative flex gap-4 pb-8 last:pb-0">
            {i < path.stages.length - 1 && (
              <span className="absolute bottom-0 left-[15px] top-9 w-0.5 rounded-full" style={{ background: done ? path.color : "rgba(255,255,255,0.1)" }} aria-hidden />
            )}
            <span
              className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${done ? "text-black" : here ? "" : "border-2 border-white/15 text-(--muted)"}`}
              style={done ? { background: path.color } : here ? { boxShadow: `0 0 0 2px ${path.color}`, color: path.color } : undefined}
            >
              {here && <span className="absolute inset-0 animate-pulse-ring rounded-full" style={{ boxShadow: `0 0 0 2px ${path.color}` }} aria-hidden />}
              {done ? "✓" : i + 1}
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-display font-bold lowercase">
                  stage {i + 1}: {stage.name}
                </span>
                {here && (
                  <span className="rounded-full px-2 py-0.5 font-jetbrains text-[9px] font-bold uppercase tracking-wider text-black" style={{ background: path.color }}>
                    you are here
                  </span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-(--muted)">you'll be able to {stage.can}.</p>
              {known ? (
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer text-(--muted) hover:text-(--fg)">you already know this (from your check). show steps</summary>
                  {steps}
                </details>
              ) : (
                steps
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

const PathDetail = ({ path, check }: { path: LearningPath; check: boolean }) => {
  const { statusOf } = useGuide();
  const status = statusOf(path);
  const [checking, setChecking] = useState(check || !status.checked);
  return (
    <div className="flex flex-col gap-6 px-4 sm:px-0">
      <a href={pathHash()} className="text-sm text-(--muted) hover:text-(--fg)">
        ← all paths
      </a>
      <div className="flex items-center gap-4">
        <Glyph path={path} className="h-14 w-14 text-2xl" />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold lowercase tracking-[-0.03em]">{path.title}</h1>
          <p className="text-sm text-(--muted)">{path.tagline}</p>
        </div>
      </div>

      <section className="rounded-3xl border border-(--line) p-5 sm:p-7" style={{ background: `${path.color}10` }}>
        {checking ? (
          <SkillCheck
            path={path}
            more={false}
            onFinish={() => {
              setChecking(false);
              if (check) window.location.hash = pathHash(path.id);
            }}
          />
        ) : (
          <>
            <PathSummary path={path} status={status} more={false} />
            <a href={pathHash(path.id, true)} className="mt-4 inline-block text-xs text-(--muted) hover:text-(--fg)">
              retake the skill check
            </a>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-jetbrains text-[11px] font-bold uppercase tracking-wider text-(--muted)">the full roadmap</h2>
        <FullMap path={path} status={status} />
      </section>

      <section>
        <h2 className="mb-3 font-jetbrains text-[11px] font-bold uppercase tracking-wider text-(--muted)">where this can take you</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {path.careers.map(c => (
            <div key={c.role} className="rounded-2xl border border-(--line) bg-(--panel) p-4">
              <p className="font-display text-sm font-bold lowercase">{c.role}</p>
              <p className="mt-1 text-xs leading-snug text-(--muted)">{c.does}</p>
            </div>
          ))}
        </div>
        {path.id === "money" && <p className="mt-3 text-xs text-(--muted)">this path teaches how money works. it isn't financial advice.</p>}
      </section>
    </div>
  );
};

export const PathsPage = ({ id, check = false, interests }: { id?: string; check?: boolean; interests: InterestId[] }) => {
  const path = id ? findPath(id) : undefined;
  return path ? <PathDetail key={`${path.id}-${check}`} path={path} check={check} /> : <PathList interests={interests} />;
};
