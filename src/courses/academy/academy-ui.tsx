import { Fragment, type CSSProperties, type ReactNode } from "react";
import { OfftrckMark } from "../../icons/OfftrckMark";

/** Renders **bold** and `code` inside plain strings */
export const Rich = ({ text }: { text: string }) => (
  <>
    {text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) return <b key={i} className="font-semibold text-white">{part.slice(2, -2)}</b>;
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="rounded-md bg-white/10 px-1.5 py-0.5 font-jetbrains text-[0.85em] text-(--accent)">
            {part.slice(1, -1)}
          </code>
        );
      }
      return <Fragment key={i}>{part}</Fragment>;
    })}
  </>
);

export const KindIcon = ({ kind, className = "" }: { kind: "article" | "quiz" | "lab" | "exam"; className?: string }) => {
  const paths = {
    article: "M5 4h10l4 4v12H5z M14 4v5h5 M8 13h8 M8 17h6",
    quiz: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14 M12 17.5v.01",
    lab: "M9 3h6 M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3 M7.5 15h9",
    exam: "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M8.5 14l-1.5 7 5-3 5 3-1.5-7",
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={paths[kind]} />
    </svg>
  );
};

export const StatusMark = ({ status }: { status: "done" | "failed" | "todo" }) =>
  status === "done" ? (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-(--accent) text-[11px] font-bold text-black">✓</span>
  ) : status === "failed" ? (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-rose-400/60 text-[11px] text-rose-300">↻</span>
  ) : (
    <span className="h-6 w-6 shrink-0 rounded-full border border-white/15" />
  );

export const Ring = ({ value, size = 56, color = "var(--accent)", children }: { value: number; size?: number; color?: string; children?: ReactNode }) => {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)} className="transition-[stroke-dashoffset] duration-700" />
      </svg>
      <span className="absolute">{children}</span>
    </span>
  );
};

export const Shell = ({ accent, crumb, children }: { accent: string; crumb?: ReactNode; children: ReactNode }) => (
  <div style={{ "--accent": accent } as CSSProperties} className="cv-root relative h-full overflow-y-auto overflow-x-hidden font-vibe">
    <div className="cv-grid pointer-events-none absolute inset-x-0 top-0 h-[700px]" aria-hidden />
    <header className="sticky top-0 z-30 border-b border-(--line) bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:px-6">
        <a href="#/academy" className="flex shrink-0 items-center gap-2 font-display text-sm font-bold tracking-tight">
          <OfftrckMark className="h-5 w-5 text-(--accent)" />
          <span className="max-sm:hidden">offtrck</span>
          <span className="font-normal text-(--muted)">academy</span>
        </a>
        {crumb && <span className="min-w-0 truncate border-l border-(--line) pl-3 text-sm text-(--muted)">{crumb}</span>}
        <a href="#/courses" className="ml-auto shrink-0 rounded-full border border-(--line) px-3 py-1.5 text-xs text-(--muted) transition hover:text-(--fg)">
          all courses
        </a>
      </div>
    </header>
    <div className="relative">{children}</div>
  </div>
);
