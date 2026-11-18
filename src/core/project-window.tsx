import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { downloadText } from "./downloads";
import { Highlighted } from "./message-block";
import { MobileBackHeader } from "./mobile-chrome";
import { cast, type CastWho } from "./project-faces";
import type { ComicStrip, LiveLine, LiveTerm, Project, ProjectPage } from "./project";

type ProjectWindowProps = {
  project: Project;
  minimized: boolean;
  mobile?: boolean;
  onMinimize: () => void;
  onClose: () => void;
};

const toneClass: Record<NonNullable<LiveLine["tone"]>, string> = {
  ok: "text-neon",
  warn: "text-amber",
  err: "text-danger",
  info: "text-cyan",
  dim: "text-slate-500",
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const Face = ({ who, size = "md" }: { who: CastWho; size?: "sm" | "md" | "lg" }) => {
  const person = cast[who];
  const dim = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  return (
    <img
      src={person.face}
      alt={person.label}
      className={`${dim} shrink-0 rounded-full border-2 object-cover`}
      style={{ borderColor: person.color }}
    />
  );
};

/** terminal: type command, then stream result lines one by one */
const LiveTerminal = ({ term, playKey }: { term: LiveTerm; playKey: string }) => {
  const [lineIdx, setLineIdx] = useState(0);
  const [typing, setTyping] = useState("");
  const [outLines, setOutLines] = useState(0);
  const [phase, setPhase] = useState<"idle" | "cmd" | "out" | "done">("idle");
  const who: CastWho = term.side === "bot" ? "bot" : term.side;
  const person = cast[who];

  useEffect(() => {
    setLineIdx(0);
    setTyping("");
    setOutLines(0);
    setPhase("idle");
    if (prefersReducedMotion() || term.lines.length === 0) {
      setLineIdx(term.lines.length);
      setPhase("done");
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const runLine = (index: number) => {
      if (cancelled) return;
      if (index >= term.lines.length) {
        setPhase("done");
        return;
      }
      const line = term.lines[index];
      setLineIdx(index);
      setOutLines(0);

      timer = setTimeout(() => {
        if (cancelled) return;

        const afterCmd = () => {
          if (cancelled) return;
          const chunks = line.output ? line.output.split("\n") : [];
          if (chunks.length === 0) {
            setLineIdx(index + 1);
            runLine(index + 1);
            return;
          }
          setPhase("out");
          let o = 0;
          const nextOut = () => {
            if (cancelled) return;
            o += 1;
            setOutLines(o);
            if (o >= chunks.length) {
              timer = setTimeout(() => {
                setLineIdx(index + 1);
                runLine(index + 1);
              }, 180);
            } else {
              timer = setTimeout(nextOut, 140);
            }
          };
          timer = setTimeout(nextOut, 100);
        };

        if (line.command != null) {
          setPhase("cmd");
          let i = 0;
          const full = line.command;
          const tick = () => {
            if (cancelled) return;
            i += 1;
            setTyping(full.slice(0, i));
            if (i < full.length) {
              timer = setTimeout(tick, 14 + Math.random() * 16);
            } else {
              timer = setTimeout(() => {
                setTyping("");
                afterCmd();
              }, 120);
            }
          };
          tick();
        } else {
          afterCmd();
        }
      }, line.pause ?? 220);
    };

    runLine(0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [playKey, term]);

  const committed = term.lines.slice(0, Math.min(lineIdx, term.lines.length));
  const current = term.lines[lineIdx];
  const currentOut = current?.output?.split("\n") ?? [];

  return (
    <div className="overflow-hidden rounded-xl border bg-[#050607]" style={{ borderColor: `${person.color}66` }}>
      <div className="flex items-center gap-2 border-b border-white/10 px-2.5 py-1.5" style={{ backgroundColor: person.bg }}>
        <Face who={who} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[10px] font-bold tracking-wide uppercase" style={{ color: person.color }}>
            {term.title}
          </p>
          <p className="font-mono text-[9px] text-slate-500">
            {phase === "cmd" ? "typing…" : phase === "out" ? "streaming output…" : phase === "done" ? "idle" : "ready"}
          </p>
        </div>
      </div>
      <pre className="max-h-48 overflow-y-auto px-2.5 py-2 font-mono text-[10.5px] leading-snug md:max-h-56 md:text-[11px]">
        {committed.map((line, i) => (
          <div key={`${playKey}-c-${i}`} className="mb-1.5">
            {line.command != null && (
              <p>
                <span style={{ color: person.color }}>{line.prompt ?? term.host}</span>{" "}
                <span className="font-semibold text-slate-50">
                  <Highlighted text={line.command} chip={false} />
                </span>
              </p>
            )}
            {line.output != null && line.output !== "" && (
              <p className={`whitespace-pre-wrap ${line.tone ? toneClass[line.tone] : "text-slate-400"}`}>
                <Highlighted text={line.output} chip={false} />
              </p>
            )}
          </div>
        ))}
        {phase === "cmd" && current?.command != null && (
          <p>
            <span style={{ color: person.color }}>{current.prompt ?? term.host}</span>{" "}
            <span className="font-semibold text-slate-50">{typing}</span>
            <span className="animate-blink ml-0.5 inline-block h-2.5 w-1 translate-y-px bg-neon align-middle" />
          </p>
        )}
        {phase === "out" && current && (
          <div className="mb-1">
            {current.command != null && (
              <p>
                <span style={{ color: person.color }}>{current.prompt ?? term.host}</span>{" "}
                <span className="font-semibold text-slate-50">
                  <Highlighted text={current.command} chip={false} />
                </span>
              </p>
            )}
            {currentOut.slice(0, outLines).map((row, i) => (
              <p key={`${playKey}-o-${i}`} className={`whitespace-pre-wrap ${current.tone ? toneClass[current.tone] : "text-slate-400"}`}>
                <Highlighted text={row} chip={false} />
              </p>
            ))}
          </div>
        )}
      </pre>
    </div>
  );
};

const Speech = ({ who, text }: { who: CastWho; text: string }) => {
  const person = cast[who];
  const right = who === "attacker" || who === "bot";
  return (
    <div className={`flex items-end gap-2.5 ${right ? "flex-row-reverse" : ""}`}>
      <Face who={who} />
      <div
        className="min-w-0 max-w-[88%] rounded-2xl border px-3.5 py-2.5"
        style={{ borderColor: `${person.color}77`, backgroundColor: person.bg }}
      >
        <p className="mb-0.5 font-mono text-[9px] font-bold tracking-[0.16em] uppercase" style={{ color: person.color }}>
          {person.label}
        </p>
        <p className="text-[13px] leading-snug text-slate-100">
          <Highlighted text={text} />
        </p>
      </div>
    </div>
  );
};

const NarratorBox = ({ text }: { text: string }) => (
  <div className="flex gap-2.5 rounded-xl border border-[#ffd23f]/40 bg-[#1c1810] px-3 py-2.5">
    <Face who="narrator" />
    <div className="min-w-0 flex-1">
      <p className="mb-0.5 font-mono text-[9px] tracking-[0.16em] text-[#ffd23f] uppercase">narrator</p>
      <p className="text-[13px] leading-snug text-[#ffe9a8]">
        <Highlighted text={text} />
      </p>
    </div>
  </div>
);

const Decode = ({ text }: { text: string }) => (
  <div className="flex gap-2.5 rounded-xl border border-cyan/35 bg-[#0a1214] px-3 py-2.5">
    <Face who="narrator" size="sm" />
    <div className="min-w-0 flex-1">
      <p className="mb-0.5 font-mono text-[9px] tracking-[0.14em] text-cyan uppercase">explained</p>
      <p className="text-[12.5px] leading-snug text-slate-100">
        <Highlighted text={text} />
      </p>
    </div>
  </div>
);

const packetMeaning: Record<string, { title: string; meaning: string; color: string }> = {
  knock: { title: "SYN (knock)", meaning: "asks: is anyone listening on this port?", color: "#ff8a3d" },
  answer: { title: "SYN-ACK (answer)", meaning: "replies: yes, I’m listening — scanners mark this open", color: "#3ddc84" },
  roast: { title: "data (“try harder”)", meaning: "extra TCP payload with the text try harder", color: "#ff4fd8" },
  block: { title: "DROP (block)", meaning: "firewall throws the packet away — no reply at all", color: "#c4545e" },
  data: { title: "ACK / data", meaning: "normal follow-up traffic after a handshake", color: "#6fa8b8" },
};

/** clear numbered steps — no flying chips */
const WireLane = ({
  from,
  to,
  packets,
  note,
}: {
  from: "target" | "attacker" | "bot";
  to: "target" | "attacker" | "bot";
  packets: { label: string; kind?: "knock" | "answer" | "roast" | "block" | "data" }[];
  note?: string;
}) => {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    if (prefersReducedMotion()) {
      setShown(packets.length);
      return;
    }
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setShown(i);
      if (i < packets.length) timer = setTimeout(tick, 700);
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [packets]);

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Face who={from} size="sm" />
          <span className="font-mono text-[10px] font-bold uppercase" style={{ color: cast[from].color }}>
            {cast[from].label}
          </span>
        </div>
        <span className="font-mono text-[9px] tracking-wide text-slate-500 uppercase">step by step</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] font-bold uppercase" style={{ color: cast[to].color }}>
            {cast[to].label}
          </span>
          <Face who={to} size="sm" />
        </div>
      </div>

      <ol className="space-y-1.5">
        {packets.map((packet, i) => {
          const kind = packet.kind ?? "data";
          const meta = packetMeaning[kind] ?? packetMeaning.data;
          const visible = i < shown;
          const reverse = kind === "answer" || kind === "roast";
          return (
            <li
              key={`${packet.label}-${i}`}
              className={`rounded-lg border px-2.5 py-2 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-25"}`}
              style={{ borderColor: `${meta.color}55`, backgroundColor: `${meta.color}12` }}
            >
              <div className="flex items-start gap-2">
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full font-mono text-[10px] font-bold text-black"
                  style={{ backgroundColor: meta.color }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[11px] font-bold" style={{ color: meta.color }}>
                    {packet.label}
                    <span className="ml-1.5 font-normal text-slate-500">· {meta.title}</span>
                  </p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-slate-300">
                    {reverse ? (
                      <>
                        <span style={{ color: cast[to].color }}>{cast[to].label}</span>
                        {" → "}
                        <span style={{ color: cast[from].color }}>{cast[from].label}</span>
                      </>
                    ) : (
                      <>
                        <span style={{ color: cast[from].color }}>{cast[from].label}</span>
                        {" → "}
                        <span style={{ color: cast[to].color }}>{cast[to].label}</span>
                      </>
                    )}
                    {" · "}
                    {meta.meaning}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {note && (
        <p className="mt-2 border-t border-white/10 pt-2 text-[12px] leading-snug text-slate-300">
          <Highlighted text={note} />
        </p>
      )}
    </div>
  );
};

const Strip = ({ strip, playKey }: { strip: ComicStrip; playKey: string }) => {
  if (strip.type === "narrator") return <NarratorBox text={strip.text} />;
  if (strip.type === "bubble") return <Speech who={strip.who} text={strip.text} />;
  if (strip.type === "decode") return <Decode text={strip.text} />;

  if (strip.type === "tool") {
    const person = cast[strip.who];
    return (
      <div className="flex gap-2.5 rounded-xl border px-3 py-2.5" style={{ borderColor: `${person.color}55`, backgroundColor: person.bg }}>
        <Face who={strip.who} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <p className="font-mono text-[9px] tracking-wide uppercase" style={{ color: person.color }}>
              tool
            </p>
            <span className="rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-100" style={{ borderColor: `${person.color}77` }}>
              {strip.name}
            </span>
          </div>
          <p className="mb-1 text-[12.5px] leading-snug text-slate-100">
            <span className="font-semibold text-slate-300">does · </span>
            <Highlighted text={strip.does} />
          </p>
          <p className="text-[12.5px] leading-snug text-slate-300">
            <span className="font-semibold text-slate-200">why · </span>
            <Highlighted text={strip.why} />
          </p>
        </div>
      </div>
    );
  }

  if (strip.type === "run") {
    return (
      <div className="space-y-2">
        {strip.setup && (
          <p className="text-[12.5px] leading-snug text-slate-300">
            <Highlighted text={strip.setup} />
          </p>
        )}
        <LiveTerminal term={strip.term} playKey={`${playKey}-run`} />
        {strip.decode && <Decode text={strip.decode} />}
      </div>
    );
  }

  if (strip.type === "wire") {
    return <WireLane from={strip.from} to={strip.to} packets={strip.packets} note={strip.note} />;
  }

  if (strip.type === "duel") {
    return (
      <div className="space-y-2">
        {strip.setup && (
          <p className="text-[12.5px] leading-snug text-slate-300">
            <Highlighted text={strip.setup} />
          </p>
        )}
        <div className="grid gap-2 md:grid-cols-2">
          <LiveTerminal term={strip.target} playKey={`${playKey}-t`} />
          <LiveTerminal term={strip.attacker} playKey={`${playKey}-a`} />
        </div>
        {strip.wire && <WireLane from={strip.wire.from} to={strip.wire.to} packets={strip.wire.packets} />}
        {strip.decode && <Decode text={strip.decode} />}
        {strip.twist && (
          <p className="rounded-xl border border-amber/40 bg-amber/10 px-3 py-2 text-[12.5px] text-amber">
            <Highlighted text={strip.twist} />
          </p>
        )}
      </div>
    );
  }

  if (strip.type === "meme") return null;

  if (strip.type === "boom") {
    return (
      <div className="rounded-xl border border-danger/45 bg-danger/10 px-3 py-2.5">
        <p className="mb-1 font-mono text-[10px] font-bold tracking-wide text-danger uppercase">{strip.title}</p>
        <p className="text-[12.5px] leading-snug text-[#ffb4bc]">
          <Highlighted text={strip.text} />
        </p>
      </div>
    );
  }

  if (strip.type === "fix") {
    return (
      <div className="rounded-xl border border-neon/40 bg-neon/10 px-3 py-2.5">
        <p className="mb-1 font-mono text-[10px] font-bold tracking-wide text-neon uppercase">{strip.title}</p>
        <p className="text-[12.5px] leading-snug text-slate-100">
          <Highlighted text={strip.text} />
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="font-mono text-[10px] tracking-wide text-[#a78bfa] uppercase">{strip.title}</p>
      <pre className="max-h-56 overflow-y-auto rounded-xl border border-[#a78bfa]/35 bg-black/70 p-2.5 font-mono text-[10.5px] leading-snug text-slate-300">
        {strip.code}
      </pre>
      <Decode text={strip.decode} />
    </div>
  );
};

const PageShell = ({ act, title, children }: { act: string; title: string; children: React.ReactNode }) => (
  <div className="mx-auto flex h-full w-full max-w-xl flex-col gap-2">
    <header className="shrink-0 border-b border-neon/15 pb-2">
      <p className="font-mono text-[9px] tracking-[0.18em] text-neon/55 uppercase">{act}</p>
      <h3 className="mt-0.5 text-[15px] font-bold leading-snug text-neon md:text-base">{title}</h3>
    </header>
    <main className="thin-scrollbar min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5">{children}</main>
  </div>
);

const PageBody = ({
  page,
  pageIndex,
  quizChoice,
  onPick,
}: {
  page: ProjectPage;
  pageIndex: number;
  quizChoice: number | null;
  onPick: (i: number) => void;
}) => {
  const playKey = `${pageIndex}`;

  if (page.kind === "cover") {
    return (
      <div className="relative flex h-full flex-col items-center justify-center gap-3 overflow-hidden text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,93,115,0.14),transparent_55%)]" />
        <div className="relative flex items-center gap-2">
          <Face who="target" size="sm" />
          <Face who="attacker" size="sm" />
          <Face who="bot" size="sm" />
          <Face who="narrator" size="sm" />
        </div>
        <p className="relative font-mono text-[10px] tracking-[0.18em] text-danger/80 uppercase">{page.kicker}</p>
        <h2 className="relative text-2xl font-black tracking-tight text-neon md:text-3xl">{page.title}</h2>
        <p className="relative max-w-md text-[13.5px] leading-snug text-slate-200">
          <Highlighted text={page.tagline} />
        </p>
        <p className="relative font-mono text-[11px] text-neon/45">
          press <span className="text-neon">enter</span> to start
        </p>
      </div>
    );
  }

  if (page.kind === "comic") {
    return (
      <PageShell act={page.act} title={page.headline}>
        {page.strips.map((strip, i) => (
          <div key={`${playKey}-${i}`}>
            <Strip strip={strip} playKey={`${playKey}-${i}`} />
          </div>
        ))}
      </PageShell>
    );
  }

  if (page.kind === "choice") {
    const locked = quizChoice !== null;
    return (
      <PageShell act={page.act} title={page.prompt}>
        <div className="grid gap-1.5">
          {page.options.map((option, i) => {
            const picked = quizChoice === i;
            const correct = i === page.answer;
            const show = locked && (picked || correct);
            return (
              <button
                key={option}
                type="button"
                disabled={locked}
                onClick={e => {
                  e.stopPropagation();
                  onPick(i);
                }}
                className={`rounded-xl border px-3 py-2 text-left text-[12.5px] transition ${
                  show && correct
                    ? "border-neon/60 bg-neon/15 text-neon"
                    : show && picked
                      ? "border-danger/50 bg-danger/15 text-[#ff8a9a]"
                      : "border-neon/25 bg-black/40 text-slate-100 hover:border-neon/45 hover:bg-neon/10"
                }`}
              >
                <span className="mr-1.5 font-mono text-neon/55">{i + 1})</span>
                {option}
              </button>
            );
          })}
        </div>
        {locked && (
          <div className="mt-2 space-y-2">
            {quizChoice !== page.answer && (
              <p className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-[12px] text-[#ffb4bc]">
                <Highlighted text={page.roastWrong} />
              </p>
            )}
            <Decode text={page.explain} />
            {page.twist && (
              <p className="rounded-xl border border-amber/40 bg-amber/10 px-3 py-2 text-[12px] text-amber">
                <Highlighted text={page.twist} />
              </p>
            )}
          </div>
        )}
      </PageShell>
    );
  }

  return (
    <PageShell act="one-stop" title={page.title}>
      <p className="text-[13px] leading-snug text-slate-200">
        <Highlighted text={page.outro} />
      </p>
      <ul className="space-y-1.5">
        {page.bullets.map(b => (
          <li key={b} className="rounded-xl border border-neon/20 bg-neon/[0.05] px-3 py-1.5 text-[12.5px] text-slate-100">
            <Highlighted text={b} />
          </li>
        ))}
      </ul>
      <div className="rounded-xl border border-dashed border-neon/45 bg-neon/[0.05] p-3">
        <p className="mb-1 font-mono text-[10px] tracking-wide text-neon uppercase">download loot</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-neon/50 bg-neon/15 px-3 py-1.5 text-[11px] font-semibold text-neon"
            onClick={e => {
              e.stopPropagation();
              downloadText(page.commandsFile);
            }}
          >
            ↓ commands .md
          </button>
          <button
            type="button"
            className="rounded-lg border border-amber/50 bg-amber/15 px-3 py-1.5 text-[11px] font-semibold text-amber"
            onClick={e => {
              e.stopPropagation();
              downloadText({ ...page.scriptFile, mime: "text/x-python;charset=utf-8" });
            }}
          >
            ↓ firewall_try_harder.py
          </button>
        </div>
      </div>
    </PageShell>
  );
};

const ProjectWindow = ({ project, minimized, mobile = false, onMinimize, onClose }: ProjectWindowProps) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const pages = project.pages;
  const page = pages[index];
  const last = index >= pages.length - 1;
  const quizLocked = page.kind === "choice" && quizChoice === null;

  const go = (next: number) => {
    if (next < 0 || next >= pages.length) return;
    setDir(next > index ? "fwd" : "back");
    setIndex(next);
    setQuizChoice(null);
    requestAnimationFrame(() => focusRef.current?.focus());
  };

  const advance = () => {
    if (quizLocked) return;
    if (last) {
      onClose();
      return;
    }
    go(index + 1);
  };

  useEffect(() => {
    focusRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (minimized) return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowRight") {
        event.preventDefault();
        advance();
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "Backspace") {
        event.preventDefault();
        if (index > 0) go(index - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const handleWindowButton = (action: () => void) => (event: React.MouseEvent) => {
    event.stopPropagation();
    action();
  };

  const chapterLabel =
    page.kind === "cover" ? "start" : page.kind === "loot" ? "one-stop" : page.kind === "choice" ? page.act : page.act;

  const shell = (
    <div
      className={`pointer-events-auto ${
        mobile
          ? `animate-screen-push flex h-full w-full flex-col overflow-hidden bg-panel ${minimized ? "hidden" : ""}`
          : `w-[min(48rem,94vw)] ${minimized ? "hidden" : ""}`
      }`}
      ref={windowRef}
    >
      <div
        className={
          mobile
            ? "relative flex h-full flex-col overflow-hidden bg-panel"
            : "relative animate-window-open flex h-[min(82vh,46rem)] flex-col overflow-hidden rounded-lg border border-neon/20 bg-panel"
        }
        ref={focusRef}
        tabIndex={0}
      >
        {mobile ? (
          <MobileBackHeader title={project.title} icon={<project.Icon className="h-3.5 w-3.5 text-neon" />} onBack={onClose} />
        ) : (
          <div className="window-handle flex h-9 shrink-0 cursor-grab items-center justify-between gap-2 border-b border-neon/15 bg-neon/[0.04] px-3 text-xs active:cursor-grabbing">
            <div className="flex min-w-0 items-center gap-2">
              <project.Icon className="h-3.5 w-3.5 shrink-0 text-neon" />
              <span className="truncate font-semibold text-neon">{project.title}</span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button className="window-button grid h-6 w-6 place-items-center rounded text-neon/50 hover:bg-neon/10" onClick={handleWindowButton(onMinimize)} aria-label="minimize">
                —
              </button>
              <button className="window-button grid h-6 w-6 place-items-center rounded text-neon/50 hover:bg-danger hover:text-white" onClick={handleWindowButton(onClose)} aria-label="close">
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-neon/10 px-3 py-1.5">
          <p className="truncate font-mono text-[11px] text-neon/70">
            <span className="text-neon">{index + 1}</span>
            <span className="text-neon/30">/{pages.length}</span>
            <span className="ml-2 text-slate-500">{chapterLabel}</span>
          </p>
          <div className="flex items-center -space-x-1.5">
            <Face who="target" size="sm" />
            <Face who="attacker" size="sm" />
            <Face who="bot" size="sm" />
            <Face who="narrator" size="sm" />
          </div>
        </div>

        <div
          className="min-h-0 flex-1 cursor-pointer overflow-hidden px-3 py-3 md:px-4"
          onClick={() => {
            if (!quizLocked) advance();
          }}
        >
          <div key={index} className={`h-full ${dir === "fwd" ? "animate-page-in" : "animate-page-in-back"}`}>
            <PageBody page={page} pageIndex={index} quizChoice={quizChoice} onPick={setQuizChoice} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-neon/15 px-3 py-2">
          <button
            type="button"
            disabled={index === 0}
            onClick={e => {
              e.stopPropagation();
              go(index - 1);
            }}
            className="min-h-9 rounded-lg border border-neon/15 px-3 font-mono text-[12px] text-neon/70 disabled:opacity-25"
          >
            ←
          </button>
          <p className="min-w-0 flex-1 truncate text-center font-mono text-[11px] text-neon/40">
            {quizLocked ? "tap an answer" : "enter / tap · next page"}
          </p>
          <button
            type="button"
            disabled={quizLocked}
            onClick={e => {
              e.stopPropagation();
              advance();
            }}
            className="min-h-9 rounded-lg border border-neon/50 bg-neon/20 px-4 font-mono text-[12px] font-semibold text-neon disabled:opacity-35"
          >
            {last ? "done ✓" : "next →"}
          </button>
        </div>
      </div>
    </div>
  );

  if (mobile) return shell;

  return (
    <Draggable nodeRef={windowRef} handle=".window-handle" cancel=".window-button,button,a">
      {shell}
    </Draggable>
  );
};

export default ProjectWindow;
