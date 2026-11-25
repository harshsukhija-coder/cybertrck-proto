import { useEffect, useRef, useState } from "react";
import { markRead } from "./academy-progress";
import { KindIcon, Rich } from "./academy-ui";
import { Animation } from "./animations";
import type { Article, Block } from "./types";

const CALLOUT = {
  tip: { icon: "💡", label: "tip", className: "border-(--accent)/40 bg-(--accent)/8" },
  warn: { icon: "⚠️", label: "watch out", className: "border-amber-400/40 bg-amber-400/8" },
  fact: { icon: "🤓", label: "fun fact", className: "border-white/15 bg-white/[0.04]" },
};

const InlineCheck = ({ block }: { block: Extract<Block, { kind: "check" }> }) => {
  const [picked, setPicked] = useState<number>();
  const answered = picked !== undefined;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <p className="font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em] text-(--accent)">quick check</p>
      <p className="mt-2 font-display text-base font-semibold leading-snug text-white">{block.q}</p>
      <div className="mt-3 grid gap-2">
        {block.options.map((o, i) => {
          const tone = !answered
            ? "border-white/10 hover:border-white/30 hover:bg-white/5"
            : i === block.answer
              ? "border-emerald-400 bg-emerald-400/10"
              : i === picked
                ? "animate-shake border-rose-400 bg-rose-400/10"
                : "border-white/5 opacity-40";
          return (
            <button key={o} type="button" disabled={answered} onClick={() => setPicked(i)} className={`rounded-xl border px-3.5 py-2.5 text-left text-[15px] text-white transition ${tone}`}>
              {o}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className="mt-3 animate-pop text-[15px] text-white/80">
          <b className={picked === block.answer ? "text-emerald-300" : "text-rose-300"}>{picked === block.answer ? "correct! " : "not quite. "}</b>
          {block.why}
        </p>
      )}
    </div>
  );
};

/** The prompt shows on the first line; everything after a blank line is device output; "!" lines are comments */
export const Cli = ({ prompt, lines }: { prompt?: string; lines: string[] }) => (
  <pre className="no-scrollbar overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-4 font-jetbrains text-[13px] leading-relaxed">
    {lines.map((line, i) => {
      const isOutput = line === "" || lines.slice(0, i).includes("");
      const isComment = line.startsWith("!");
      return (
        <div key={i} className={isOutput || isComment ? "text-white/45" : "text-white"}>
          {!isOutput && !isComment && prompt && <span className="select-none text-(--accent)">{i === 0 ? `${prompt} ` : ""}</span>}
          {line || " "}
        </div>
      );
    })}
  </pre>
);

const BlockView = ({ block }: { block: Block }) => {
  switch (block.kind) {
    case "p":
      return (
        <p className="text-[17px] leading-[1.75] text-white/75">
          <Rich text={block.text} />
        </p>
      );
    case "h":
      return <h2 className="pt-4 font-display text-xl font-bold lowercase tracking-[-0.02em] text-white sm:text-2xl">{block.text}</h2>;
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag className="grid gap-2.5">
          {block.items.map((item, i) => (
            <li key={item} className="flex gap-3 text-[17px] leading-relaxed text-white/75">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/[0.06] font-jetbrains text-[11px] text-(--accent)">{block.ordered ? i + 1 : "•"}</span>
              <span>
                <Rich text={item} />
              </span>
            </li>
          ))}
        </Tag>
      );
    }
    case "callout": {
      const c = CALLOUT[block.tone];
      return (
        <div className={`rounded-2xl border p-4 ${c.className}`}>
          <p className="font-jetbrains text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">
            {c.icon} {c.label}
          </p>
          <p className="mt-1.5 text-[16px] leading-relaxed text-white/85">
            <Rich text={block.text} />
          </p>
        </div>
      );
    }
    case "cli":
      return (
        <figure>
          <Cli prompt={block.prompt} lines={block.lines} />
          {block.note && <figcaption className="mt-2 px-1 text-sm text-white/50">↳ {block.note}</figcaption>}
        </figure>
      );
    case "table":
      return (
        <div className="no-scrollbar overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-max text-left text-[14px]">
            <thead className="bg-white/[0.04] font-jetbrains text-[10px] uppercase tracking-wider text-white/50">
              <tr>
                {block.head.map(h => (
                  <th key={h} className="px-3.5 py-2.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map(row => (
                <tr key={row.join()} className="border-t border-white/5">
                  {row.map((cell, i) => (
                    <td key={i} className={`px-3.5 py-2.5 ${i === 0 ? "font-medium text-white" : "text-white/70"}`}>
                      <Rich text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "anim":
      return (
        <figure>
          <Animation id={block.id} />
          <figcaption className="mt-2 px-1 text-sm text-white/50">↳ {block.caption}</figcaption>
        </figure>
      );
    case "check":
      return <InlineCheck block={block} />;
  }
};

export const ArticleView = ({ article, readKey, read }: { article: Article; readKey: string; read: boolean }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = endRef.current;
    if (!el || read) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && markRead(readKey));
    io.observe(el);
    return () => io.disconnect();
  }, [readKey, read]);

  return (
    <article>
      <p className="flex items-center gap-2 font-jetbrains text-[11px] uppercase tracking-[0.18em] text-(--accent)">
        <KindIcon kind="article" className="h-4 w-4" /> blog · {article.minutes} min read
        {read && <span className="rounded-full bg-(--accent)/15 px-2 py-0.5 normal-case tracking-normal">✓ read</span>}
      </p>
      <h1 className="mt-4 font-display text-[clamp(1.75rem,5vw,2.75rem)] font-bold lowercase leading-[1.08] tracking-[-0.035em]">{article.title}</h1>
      <p className="mt-4 font-accent text-xl italic leading-snug text-white/60 sm:text-2xl">{article.summary}</p>
      <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-6">
        {article.blocks.map((block, i) => (
          <BlockView key={i} block={block} />
        ))}
      </div>
      <div ref={endRef} />
    </article>
  );
};
