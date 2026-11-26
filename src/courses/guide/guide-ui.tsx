import { useState } from "react";
import { SELF_RATINGS, levelFrom, nextCheckStage, saveCheck, toggleStep, useGuide, type Answer, type PathStatus } from "./guide-store";
import { pathHash, stepHref, type LearningPath, type Step } from "./paths";

const KIND_LABEL: Record<Step["kind"], string> = { chapter: "read", game: "play", academy: "lab", web: "free online", do: "try it" };

const duration = (minutes: number) => (minutes < 60 ? `${minutes} min` : `${Math.round(minutes / 60)} h`);

/** Five stations on a line. Finished ones are filled, yours pulses. */
export const PathTrail = ({ path, status }: { path: LearningPath; status: PathStatus }) => {
  const last = path.stages.length - 1;
  const fill = Math.min(status.stage, last) / last;
  return (
    <ol className="relative flex justify-between pt-6" aria-label={`${path.title} roadmap`}>
      <span className="absolute inset-x-[14px] top-[38px] h-0.5 rounded-full bg-white/10" aria-hidden />
      <span
        className="absolute left-[14px] top-[38px] h-0.5 rounded-full transition-[width] duration-700"
        style={{ width: `calc((100% - 28px) * ${fill})`, background: path.color }}
        aria-hidden
      />
      {path.stages.map((stage, i) => {
        const done = i < status.stage;
        const here = i === status.stage;
        return (
          <li key={stage.name} className="relative flex w-7 flex-col items-center" aria-current={here ? "step" : undefined}>
            {here && (
              <span
                className="absolute -top-6 whitespace-nowrap rounded-full px-2 py-0.5 font-jetbrains text-[9px] font-bold uppercase tracking-wider text-black"
                style={{ background: path.color }}
              >
                you
              </span>
            )}
            <span
              className={`relative grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${done ? "text-black" : here ? "bg-[#07080c]" : "border-2 border-white/15 bg-[#07080c] text-(--muted)"}`}
              style={done ? { background: path.color } : here ? { boxShadow: `0 0 0 2px ${path.color}`, color: path.color } : undefined}
            >
              {here && <span className="absolute inset-0 animate-pulse-ring rounded-full" style={{ boxShadow: `0 0 0 2px ${path.color}` }} aria-hidden />}
              {done ? "✓" : i + 1}
            </span>
            <span className={`mt-1.5 whitespace-nowrap text-[10px] ${here ? "font-bold text-(--fg)" : "text-(--muted)"}`}>{stage.name}</span>
          </li>
        );
      })}
    </ol>
  );
};

export const StepRow = ({ step, done, color, big = false }: { step: Step; done: boolean; color: string; big?: boolean }) => {
  const href = stepHref(step);
  const external = step.kind === "web";
  const manual = step.kind !== "chapter";
  return (
    <li className={`flex items-start gap-3 rounded-2xl border p-3 transition-colors ${big ? "border-white/15 bg-white/[0.05]" : "border-(--line) bg-white/[0.02]"} ${done ? "opacity-55" : ""}`}>
      <button
        type="button"
        disabled={!manual}
        onClick={() => toggleStep(step.id)}
        aria-label={manual ? (done ? `mark "${step.label}" as not done` : `mark "${step.label}" as done`) : done ? "finished" : "finishes when you complete the chapter"}
        title={manual ? "tick when you've done it" : "ticks itself when you finish the chapter"}
        className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold transition ${
          done ? "border-transparent text-black" : "border-white/20 text-transparent enabled:hover:border-white/50"
        }`}
        style={done ? { background: color } : undefined}
      >
        ✓
      </button>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-jetbrains text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
            {KIND_LABEL[step.kind]}
          </span>
          <span className="font-jetbrains text-[10px] text-(--muted)">
            {duration(step.minutes)}
            {step.kind === "web" ? ` · ${step.site}` : ""}
          </span>
        </span>
        <span className={`mt-0.5 block font-semibold leading-snug ${big ? "text-base" : "text-sm"} ${done ? "line-through" : ""}`}>{step.label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-(--muted)">{step.why}</span>
      </span>
      {href && !done && (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noreferrer" : undefined}
          className={`shrink-0 self-center rounded-full font-bold transition-transform active:scale-95 ${big ? "px-4 py-2 text-sm text-black" : "border border-white/15 px-3 py-1.5 text-xs hover:border-white/40"}`}
          style={big ? { background: color } : undefined}
        >
          {external ? "open ↗" : "go →"}
        </a>
      )}
    </li>
  );
};

export const NextSteps = ({ path, status }: { path: LearningPath; status: PathStatus }) => {
  if (!status.next.length)
    return <p className="rounded-2xl border border-(--line) p-4 text-sm">you finished the whole path. 🏆 look at the careers below, or start another path.</p>;
  return (
    <ul className="grid gap-2">
      {status.next.map((step, i) => (
        <StepRow key={step.id} step={step} done={false} color={path.color} big={i === 0} />
      ))}
    </ul>
  );
};

const stageTitle = (path: LearningPath, status: PathStatus) =>
  status.stage >= path.stages.length ? "path complete 🏆" : `stage ${status.stage + 1} of ${path.stages.length}: ${path.stages[status.stage].name}`;

/** Where you are, the trail and your next steps */
export const PathSummary = ({ path, status, more = true }: { path: LearningPath; status: PathStatus; more?: boolean }) => {
  const current = path.stages[status.stage];
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-display text-[clamp(1.3rem,5.5vw,1.7rem)] font-bold lowercase leading-[1.1] tracking-[-0.03em]">{stageTitle(path, status)}</p>
        {current && <p className="mt-1.5 text-sm text-(--muted)">after this stage you can {current.can}.</p>}
      </div>
      <PathTrail path={path} status={status} />
      <div>
        <p className="mb-2 font-jetbrains text-[10px] font-bold uppercase tracking-wider text-(--muted)">your next steps</p>
        <NextSteps path={path} status={status} />
      </div>
      {more && (
        <a href={pathHash(path.id)} className="self-start text-sm font-semibold hover:underline" style={{ color: path.color }}>
          see the full roadmap →
        </a>
      )}
    </div>
  );
};

type CheckProps = { path: LearningPath; onFinish?: () => void; more?: boolean };

/** "How much do you know?" then up to five questions that get harder or easier as you answer */
export const SkillCheck = ({ path, onFinish, more = true }: CheckProps) => {
  const [start, setStart] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const { statusOf } = useGuide();

  if (finished) {
    const level = levelFrom(answers);
    const status = statusOf(path);
    return (
      <div className="flex animate-tile-in flex-col gap-4">
        <div className="flex items-end gap-3">
          <p className="font-poster text-6xl leading-none" style={{ color: path.color }}>
            {level}/{path.stages.length}
          </p>
          <p className="pb-1 text-sm text-(--muted)">
            {level === 0
              ? "fresh start. that's the fun part."
              : level === path.stages.length
                ? "you already know all of it. respect."
                : `stages you already know. we'll skip ${level === 1 ? "it" : "them"}.`}
          </p>
        </div>
        <PathSummary path={path} status={status} more={more} />
        <button type="button" onClick={onFinish} className="self-start text-xs text-(--muted) hover:text-(--fg)">
          done
        </button>
      </div>
    );
  }

  if (start === null) {
    return (
      <div className="flex flex-col gap-4">
        <p className="font-display text-[clamp(1.3rem,5.5vw,1.7rem)] font-bold lowercase leading-[1.1] tracking-[-0.03em]">
          how much do you know about {path.title}?
        </p>
        <p className="-mt-2 text-sm text-(--muted)">pick one, then answer a few quick questions. we'll tell you exactly what to do next.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {SELF_RATINGS.map(r => (
            <button
              key={r.label}
              type="button"
              onClick={() => setStart(r.start)}
              className="rounded-2xl border border-(--line) bg-white/[0.04] px-4 py-3.5 text-left text-[15px] font-semibold transition hover:border-white/30 active:scale-[0.98]"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const stage = picked === null ? nextCheckStage(start, answers, path.stages.length) : answers[answers.length - 1].stage;
  if (stage === null) return null;
  const { check, name } = path.stages[stage];
  const last = answers[answers.length - 1];
  const upcoming = picked === null ? null : nextCheckStage(start, answers, path.stages.length);

  const answer = (i: number) => {
    setPicked(i);
    setAnswers(a => [...a, { stage, right: i === check.answer }]);
  };
  const next = () => {
    if (upcoming === null) {
      saveCheck(path.id, levelFrom(answers));
      setFinished(true);
    }
    setPicked(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 font-jetbrains text-[10px] font-bold uppercase tracking-wider">
        <span style={{ color: path.color }}>question {answers.length + (picked === null ? 1 : 0)}</span>
        <span className="text-(--muted)">· {name} level</span>
        <span className="ml-auto flex gap-1">
          {path.stages.map((_, i) => {
            const a = answers.find(x => x.stage === i);
            return <span key={i} className={`h-1.5 w-4 rounded-full ${a ? (a.right ? "bg-emerald-400" : "bg-rose-400") : i === stage ? "bg-white/50" : "bg-white/10"}`} />;
          })}
        </span>
      </div>
      <p className="font-display text-[clamp(1.2rem,5vw,1.55rem)] font-bold lowercase leading-[1.15] tracking-[-0.02em]">{check.q}</p>
      <div className="grid gap-2">
        {[...check.options, "no idea yet"].map((option, i) => {
          const isNoIdea = i === check.options.length;
          const state = picked === null ? "idle" : i === check.answer ? "right" : i === picked ? "wrong" : "idle";
          return (
            <button
              key={option}
              type="button"
              disabled={picked !== null}
              onClick={() => answer(i)}
              className={`rounded-2xl border px-4 py-3 text-left text-[15px] font-semibold transition ${
                state === "right"
                  ? "border-emerald-400/70 bg-emerald-400/10"
                  : state === "wrong"
                    ? "border-rose-400/70 bg-rose-400/10"
                    : isNoIdea
                      ? "border-dashed border-white/15 text-(--muted) enabled:hover:border-white/30"
                      : "border-(--line) bg-white/[0.04] enabled:hover:border-white/30 enabled:active:scale-[0.98]"
              } ${picked !== null && state === "idle" ? "opacity-45" : ""}`}
            >
              {state === "right" && "✓ "}
              {option}
            </button>
          );
        })}
      </div>
      {picked !== null && last && (
        <div className="flex animate-tile-in flex-col gap-3">
          <p className="text-sm leading-snug">
            <b className={last.right ? "text-emerald-300" : "text-rose-300"}>{last.right ? "correct. " : picked === check.options.length ? "no worries. " : "not quite. "}</b>
            <span className="text-(--muted)">{check.why}</span>
          </p>
          <button type="button" onClick={next} className="self-start rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform active:scale-95">
            {upcoming === null ? "show my roadmap →" : last.right ? "harder one →" : "easier one →"}
          </button>
        </div>
      )}
    </div>
  );
};

/** Side panel card: the single next thing to do on your top path */
export const NextStepCard = ({ paths }: { paths: LearningPath[] }) => {
  const { statusOf } = useGuide();
  const path = paths.find(p => statusOf(p).checked && statusOf(p).next.length) ?? paths[0];
  if (!path) return null;
  const status = statusOf(path);
  const step = status.next[0];
  const href = step && stepHref(step);
  return (
    <section className="rounded-3xl border border-(--line) bg-(--panel) p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-bold lowercase">your next step</h2>
        <a href={pathHash()} className="text-xs font-semibold text-(--gem) hover:underline">
          all paths
        </a>
      </div>
      {!status.checked ? (
        <>
          <p className="mt-2 text-sm text-(--muted)">not sure where to start with {path.title}? a 1-minute check tells you.</p>
          <a href={pathHash(path.id, true)} className="mt-3 inline-block rounded-full px-4 py-2 text-sm font-bold text-black" style={{ background: path.color }}>
            take the check →
          </a>
        </>
      ) : step ? (
        <>
          <p className="mt-2 font-jetbrains text-[10px] uppercase tracking-wider" style={{ color: path.color }}>
            {path.title} · stage {status.stage + 1}
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug">{step.label}</p>
          <p className="mt-0.5 text-xs text-(--muted)">{step.why}</p>
          <a
            href={href ?? pathHash(path.id)}
            target={step.kind === "web" ? "_blank" : undefined}
            rel={step.kind === "web" ? "noreferrer" : undefined}
            className="mt-3 inline-block rounded-full px-4 py-2 text-sm font-bold text-black"
            style={{ background: path.color }}
          >
            {href ? "start →" : "open roadmap →"}
          </a>
        </>
      ) : (
        <p className="mt-2 text-sm text-(--muted)">you finished {path.title}. 🏆 pick another path.</p>
      )}
    </section>
  );
};
