import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type DragEvent, type KeyboardEvent } from "react";
import { useIsMobile, useKeyboardInset } from "../core/use-media";
import { OfftrckMark } from "../icons/OfftrckMark";
import { academyCommands } from "./commands/academy";
import { announceBadges, badgeCommands } from "./commands/badges";
import { gameCommands } from "./commands/games";
import { learnCommands } from "./commands/learn";
import { pathCommands } from "./commands/paths";
import { missionCommands } from "./commands/missions";
import { LOGO, banner, gemColor, openFallback, shellCommands } from "./commands/shell";
import { Term, type Chip, type Entry, type Seg, type Tone } from "./term";

const TONE: Record<Tone, string> = {
  fg: "text-[#eceef1]",
  muted: "text-[#a6adb8]",
  dim: "text-[#7c8594]",
  accent: "text-(--acc)",
  green: "text-[#3ddc84]",
  red: "text-[#ff6b7a]",
  yellow: "text-[#ffd166]",
  blue: "text-[#7aa7ff]",
  cyan: "text-[#4cc9f0]",
  pink: "text-[#ff6fb0]",
  orange: "text-[#ff9a52]",
  purple: "text-[#b9a2ff]",
  code: "rounded bg-white/[0.07] px-1 text-[#8bd5ff]",
};

const TONE_COLOR: Partial<Record<Tone, string>> = {
  green: "#3ddc84",
  red: "#ff6b7a",
  yellow: "#ffd166",
  blue: "#7aa7ff",
  purple: "#b9a2ff",
  accent: "var(--acc)",
};

const SHELL_CHIPS: Chip[] = [
  ...["help", "feed", "learn", "path", "play", "stories", "academy", "badges", "stats", "ls", "clear"].map(c => ({ label: c, send: c })),
  { label: "modern ui ↗", send: "gui" },
];

const welcome = (t: Term) => {
  banner(t);
  t.print(`{dim:offtrck terminal · learn by typing · ${new Date().toDateString().toLowerCase()}}`);
  t.print("");
  t.print("everything from the app works here: courses, games, stories, badges, the academy and the missions.");
  t.print("type [[help]] or try [[feed]] [[learn]] [[games]] [[badges]]. {dim:tap any underlined word to run it.}");
  t.print("{dim:prefer buttons and pictures?} [[switch to the modern ui ↗|gui]] {dim:(or type} `ui`{dim:). you can always come back.}");
};

const createTerm = (username: string | null, onLogin: (name: string) => void, onLogout: () => void, pickFile: (accept: string) => void) => {
  const t = new Term(username ?? "guest");
  t.pickFile = pickFile;
  t.accent = gemColor();
  t.register([...shellCommands, ...learnCommands, ...pathCommands, ...gameCommands, ...academyCommands, ...badgeCommands, ...missionCommands]);
  t.fallback = openFallback;
  t.afterInput = announceBadges;
  t.logout = onLogout;

  if (username) {
    welcome(t);
    announceBadges(t);
    return t;
  }

  t.block(LOGO.map(l => `{accent:${l}}`));
  t.print("{dim:offtrck terminal · learn by typing}");
  t.print("");
  t.print("log in to start. new here? pick any username and it becomes your account.");
  let name = "";
  t.start({
    name: "login",
    prompt: () => (name ? "password:" : "offtrck login:"),
    masked: false,
    chips: () => [],
    input: line => {
      if (!name) {
        const clean = line.trim().replace(/\s+/g, "_").slice(0, 24);
        if (!clean) return t.print("{yellow:type a username.}");
        name = clean;
        t.program!.masked = true;
        t.refresh();
        return;
      }
      if (!line) return t.print("{yellow:type any password.}");
      t.print(`{green:welcome, ${name}.} starting your session…`);
      t.exit();
      onLogin(name);
    },
  });
  return t;
};

const SegView = ({ seg, onTap }: { seg: Seg; onTap: (cmd: string) => void }) => {
  const className = `${seg.tone ? TONE[seg.tone] : ""} ${seg.bold ? "font-bold" : ""}`;
  const style = seg.color ? { color: seg.color } : undefined;
  if (seg.cmd) {
    return (
      <button
        type="button"
        onClick={event => {
          event.stopPropagation();
          onTap(seg.cmd!);
        }}
        className={`cursor-pointer whitespace-pre-wrap text-left underline decoration-current/35 decoration-dotted underline-offset-4 hover:decoration-solid hover:bg-white/[0.06] ${seg.tone || seg.color ? className : `${className} text-[#eceef1]`}`}
        style={style}
      >
        {seg.text}
      </button>
    );
  }
  if (seg.href) {
    const external = /^https?:/.test(seg.href);
    return (
      <a href={seg.href} target={external ? "_blank" : undefined} rel="noreferrer" onClick={e => e.stopPropagation()} className={`underline decoration-dotted underline-offset-4 hover:decoration-solid ${className || TONE.blue}`} style={style}>
        {seg.text}
      </a>
    );
  }
  return (
    <span className={className} style={style}>
      {seg.text}
    </span>
  );
};

const Segs = ({ segs, onTap }: { segs: Seg[]; onTap: (cmd: string) => void }) => (
  <>
    {segs.length ? segs.map((seg, i) => <SegView key={i} seg={seg} onTap={onTap} />) : " "}
  </>
);

/** "riya@offtrck:~/games$" with the usual shell colours */
const PromptView = ({ prompt }: { prompt: string }) => {
  const m = prompt.match(/^([^@]+)@([^:]+):(.*)\$$/);
  if (!m) return <span className="text-(--acc)">{prompt}</span>;
  return (
    <span>
      <span className="text-[#3ddc84]">
        {m[1]}@{m[2]}
      </span>
      <span className="text-[#7c8594]">:</span>
      <span className="text-[#7aa7ff]">{m[3]}</span>
      <span className="text-[#7c8594]">$</span>
    </span>
  );
};

const EntryView = ({ entry, onTap }: { entry: Entry; onTap: (cmd: string, owner: number) => void }) => {
  const tap = (cmd: string) => onTap(cmd, entry.owner);
  switch (entry.kind) {
    case "echo":
      return (
        <div className="mt-1 whitespace-pre-wrap break-words">
          <PromptView prompt={entry.prompt} /> <span className="text-[#eceef1]">{entry.text}</span>
        </div>
      );
    case "line":
      return (
        <div
          className={`whitespace-pre-wrap break-words ${entry.bar ? "border-l-2 pl-3" : ""} ${entry.indent ? "pl-3 -indent-3 sm:pl-4 sm:-indent-4" : ""}`}
          style={entry.bar ? { borderColor: TONE_COLOR[entry.bar as Tone] ?? entry.bar } : undefined}
        >
          <Segs segs={entry.segs} onTap={tap} />
        </div>
      );
    case "block":
      return (
        <pre className="no-scrollbar my-1 overflow-x-auto whitespace-pre font-jetbrains leading-[1.25]">
          {entry.lines.map((line, i) => (
            <div key={i}>
              <Segs segs={line} onTap={tap} />
            </div>
          ))}
        </pre>
      );
    case "image":
      return (
        <figure className="my-2">
          <img src={entry.src} alt={entry.alt} loading="lazy" className="max-h-60 w-auto max-w-[min(100%,340px)] rounded-md border border-white/10 object-cover" />
          {entry.caption && <figcaption className="mt-1 text-[#7c8594]">{entry.caption}</figcaption>}
        </figure>
      );
  }
};

const FILE_INPUT = "offtrck-term-file";

const pickFile = (accept: string) => {
  const input = document.getElementById(FILE_INPUT) as HTMLInputElement | null;
  if (!input) return;
  input.accept = accept;
  input.click();
};

/** Set when the terminal lives in a desktop window instead of filling the page */
export type Frame = { onMinimize: () => void; onClose: () => void };

type Props = { username: string | null; onLogin: (name: string) => void; onLogout: () => void; frame?: Frame };

/** Desktop windows unmount when minimised, so their sessions are kept here */
const windowSessions = new Map<string, Term>();

const windowSession = (username: string, onLogin: (name: string) => void, onLogout: () => void) => {
  const existing = windowSessions.get(username);
  if (existing) return existing;
  const t = createTerm(username, onLogin, () => {
    windowSessions.delete(username);
    onLogout();
  }, pickFile);
  windowSessions.set(username, t);
  return t;
};

const TerminalSession = ({ username, onLogin, onLogout, frame }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [term] = useState(() => (frame && username ? windowSession(username, onLogin, onLogout) : createTerm(username, onLogin, onLogout, pickFile)));
  useSyncExternalStore(term.subscribe, term.getVersion);
  const [value, setValue] = useState("");
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const keyboardInset = useKeyboardInset();

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  useEffect(() => {
    if (!frame) document.title = "terminal · offtrck";
  }, [frame]);

  useEffect(() => {
    if (!isMobile) inputRef.current?.focus();
    if (frame) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target === inputRef.current || target.isContentEditable || /INPUT|TEXTAREA/.test(target.tagName)) return;
      if (event.metaKey || event.altKey) return;
      if (event.ctrlKey && event.key.toLowerCase() === "c" && !window.getSelection()?.toString()) {
        event.preventDefault();
        term.interrupt();
        return;
      }
      if (event.key.length === 1 && !event.ctrlKey) inputRef.current?.focus();
      const mapped = term.program?.keys?.[event.key];
      if (mapped) {
        event.preventDefault();
        term.submit(mapped);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [term, isMobile, frame]);

  const send = (text: string) => {
    term.submit(text);
    setValue("");
    setHistoryIndex(null);
  };

  const complete = () => {
    const { line, options } = term.complete(value);
    if (options.length > 1 && line === value) {
      term.print(options.map(o => `[[${o}|${(value.split(/\s+/).slice(0, -1).concat(o).join(" ")).trim()}]]`).join("   "));
    }
    setValue(line);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;
    if (key === "Enter") {
      event.preventDefault();
      send(value);
      return;
    }
    if (key === "Tab") {
      event.preventDefault();
      complete();
      return;
    }
    if (event.ctrlKey && key.toLowerCase() === "c") {
      event.preventDefault();
      term.interrupt(value);
      setValue("");
      return;
    }
    if (event.ctrlKey && key.toLowerCase() === "l") {
      event.preventDefault();
      term.clear();
      return;
    }
    if (!value && term.program?.keys?.[key]) {
      event.preventDefault();
      send(term.program.keys[key]);
      return;
    }
    if (term.program) return;
    if (key === "ArrowUp" || key === "ArrowDown") {
      event.preventDefault();
      const h = term.history;
      if (!h.length) return;
      const next = key === "ArrowUp" ? (historyIndex === null ? h.length - 1 : Math.max(0, historyIndex - 1)) : historyIndex === null ? null : historyIndex + 1 >= h.length ? null : historyIndex + 1;
      setHistoryIndex(next);
      setValue(next === null ? "" : h[next]);
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) term.dropFile(file);
  };

  const chips: Chip[] = term.program ? (term.program.chips?.() ?? []) : SHELL_CHIPS;
  const masked = term.program?.masked;

  return (
    <div
      style={{ "--acc": term.accent, height: frame ? "100%" : keyboardInset ? `calc(100dvh - ${keyboardInset}px)` : "100dvh" } as CSSProperties}
      className="relative flex flex-col overflow-hidden bg-[#07080a] font-jetbrains text-[13px] leading-[1.6] text-[#c9ced6] selection:bg-(--acc)/30 md:text-[14px]"
      onDragOver={event => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <header
        className={`flex h-10 shrink-0 items-center gap-2.5 border-b border-white/[0.07] px-3 text-[12px] text-[#7c8594] md:px-5 ${
          frame ? "window-handle cursor-grab active:cursor-grabbing" : "pt-[env(safe-area-inset-top)]"
        }`}
      >
        <OfftrckMark className="h-4 w-4 shrink-0 text-(--acc)" />
        <span className="min-w-0 truncate">
          <span className="text-[#c9ced6]">{term.username}</span>@offtrck: {term.cwd}
          {term.program ? <span className="text-(--acc)"> · {term.program.name}</span> : null}
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => send("help")} className="window-button rounded px-2 py-1 hover:bg-white/5 hover:text-[#eceef1]">
            help
          </button>
          <a
            href="#/feed"
            title="switch to the modern ui (or type: ui)"
            className="window-button rounded-md border border-(--acc)/40 px-2.5 py-1 text-(--acc) transition-colors hover:bg-(--acc) hover:text-black"
          >
            ⇄ modern ui
          </a>
          {frame && (
            <>
              <button type="button" onClick={frame.onMinimize} aria-label="minimize" className="window-button grid h-6 w-6 place-items-center rounded hover:bg-white/5 hover:text-[#eceef1]">
                —
              </button>
              <button type="button" onClick={frame.onClose} aria-label="close" className="window-button grid h-6 w-6 place-items-center rounded hover:bg-[#ff6b7a] hover:text-white">
                ✕
              </button>
            </>
          )}
        </span>
      </header>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 pt-3 md:px-6"
        onClick={() => {
          if (!window.getSelection()?.toString() && !isMobile) inputRef.current?.focus();
        }}
      >
        <div className="mx-auto max-w-4xl">
          {term.entries.map(entry => (
            <EntryView key={entry.id} entry={entry} onTap={(cmd, owner) => term.tap(cmd, owner)} />
          ))}
          <label className="mt-1 flex items-baseline gap-2">
            <span className="shrink-0 whitespace-nowrap">
              <PromptView prompt={term.prompt()} />
            </span>
            <input
              ref={inputRef}
              value={value}
              onChange={event => setValue(event.target.value)}
              onKeyDown={onKeyDown}
              type={masked ? "password" : "text"}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="send"
              aria-label="terminal input"
              className="min-w-0 flex-1 bg-transparent text-[16px] text-[#eceef1] caret-(--acc) outline-none md:text-[14px]"
            />
          </label>
        </div>
      </div>

      {(chips.length > 0 || isMobile) && (
        <nav className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto border-t border-white/[0.07] bg-[#0b0d10] px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:px-6">
          {!term.program && isMobile && (
            <button type="button" onClick={complete} className="shrink-0 rounded-md border border-white/10 px-3 py-1.5 text-[12px] text-[#a6adb8] active:bg-white/10">
              tab ⇥
            </button>
          )}
          {chips.map(chip => (
            <button
              key={`${chip.label}-${chip.send}`}
              type="button"
              onClick={() => send(chip.send)}
              className="shrink-0 rounded-md border border-white/10 px-3 py-1.5 text-[12px] text-[#c9ced6] transition-colors hover:border-(--acc)/50 hover:text-(--acc) active:bg-white/10"
            >
              {chip.label}
            </button>
          ))}
          {isMobile && (
            <button type="button" onClick={() => inputRef.current?.focus()} className="ml-auto shrink-0 rounded-md border border-(--acc)/40 px-3 py-1.5 text-[12px] text-(--acc)">
              ⌨ type
            </button>
          )}
        </nav>
      )}

      {dragging && (
        <div className="pointer-events-none absolute inset-3 grid place-items-center rounded-xl border-2 border-dashed border-(--acc)/60 bg-black/70 text-(--acc)">
          drop your .pkt file to grade it
        </div>
      )}

      <input
        id={FILE_INPUT}
        type="file"
        className="hidden"
        onChange={event => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) term.dropFile(file);
        }}
      />
    </div>
  );
};

/** The whole app as a terminal: same courses, games, badges and progress */
const TerminalPage = (props: Props) => <TerminalSession key={props.username ?? "guest"} {...props} />;

export default TerminalPage;
