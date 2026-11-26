import { useRef, useState, type DragEvent } from "react";
import { saveLab, type LabResult } from "./academy-progress";
import { KindIcon, Rich, Ring } from "./academy-ui";
import { Cli } from "./article-view";
import { gradeLab, type Grade } from "./grade";
import { TopologyDiagram } from "./topology";
import { LAB_PASS, type Lab } from "./types";

const LEVEL = { easy: "🟢 easy", medium: "🟡 medium", hard: "🔴 hard" };

type Status = { state: "idle" } | { state: "reading"; file: string } | { state: "error"; file: string; message: string } | { state: "done"; file: string; grade: Grade };

const Section = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <section className="mt-12">
    <h2 className="flex items-center gap-3 font-display text-lg font-bold lowercase sm:text-xl">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 font-jetbrains text-xs text-(--accent)">{n}</span>
      {title}
    </h2>
    <div className="mt-5">{children}</div>
  </section>
);

const Steps = ({ lab }: { lab: Lab }) => {
  const [open, setOpen] = useState(0);
  return (
    <ol className="grid gap-2">
      {lab.steps.map((step, i) => {
        const isOpen = open === i;
        return (
          <li key={step.title} className={`overflow-hidden rounded-2xl border transition ${isOpen ? "border-white/15 bg-white/[0.04]" : "border-white/5"}`}>
            <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-jetbrains text-[11px] ${isOpen ? "bg-(--accent) text-black" : "bg-white/10 text-white/60"}`}>{i + 1}</span>
              <span className="font-semibold text-white">{step.title}</span>
              <span className={`ml-auto text-white/40 transition ${isOpen ? "rotate-180" : ""}`}>⌄</span>
            </button>
            {isOpen && (
              <div className="grid animate-pop gap-3 px-4 pb-4 pl-[3.25rem]">
                {step.text && (
                  <p className="text-[15px] leading-relaxed text-white/70">
                    <Rich text={step.text} />
                  </p>
                )}
                {step.cli && <Cli prompt={step.cli.prompt} lines={step.cli.lines} />}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
};

const Results = ({ grade, file, onRetry }: { grade: Grade; file: string; onRetry: () => void }) => (
  <div className="animate-pop">
    <div className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 ${grade.passed ? "border-emerald-400/40 bg-emerald-400/[0.06]" : "border-rose-400/40 bg-rose-400/[0.06]"}`}>
      <div className="flex items-center gap-4 sm:gap-6">
        <Ring value={grade.score / 100} size={92} color={grade.passed ? "#34d399" : "#fb7185"}>
          <span className="font-poster text-2xl sm:text-3xl">{grade.score}%</span>
        </Ring>
        <div className="min-w-0">
          <p className={`font-poster text-5xl uppercase leading-none sm:text-6xl ${grade.passed ? "text-emerald-300" : "text-rose-300"}`}>{grade.passed ? "pass" : "fail"}</p>
          <p className="mt-2 text-sm text-white/60">{grade.passed ? "your network works. great job, engineer." : `you need ${LAB_PASS}%. fix the red items below and upload again.`}</p>
        </div>
      </div>
      <p className="mt-5 truncate font-jetbrains text-[11px] text-white/45">
        {file} · Packet Tracer {grade.version.split(".").slice(0, 2).join(".") || "?"} · {grade.devices.length} devices · {grade.cables} cables
      </p>
    </div>

    <ul className="mt-4 grid gap-2">
      {grade.results.map(r => (
        <li key={r.label} className={`rounded-2xl border p-4 ${r.ok ? "border-white/5 bg-white/[0.02]" : "border-rose-400/25 bg-rose-400/[0.04]"}`}>
          <div className="flex items-start gap-3">
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${r.ok ? "bg-emerald-400 text-black" : "bg-rose-500 text-white"}`}>{r.ok ? "✓" : "✕"}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-white">{r.label}</span>
              {!r.ok && (
                <>
                  <span className="mt-1 block text-sm text-rose-200/90">{r.reason}</span>
                  <span className="mt-1.5 block text-sm text-white/55">💡 {r.hint}</span>
                </>
              )}
            </span>
            <span className={`shrink-0 font-jetbrains text-xs ${r.ok ? "text-emerald-300" : "text-white/35"}`}>
              {r.ok ? r.points : 0}/{r.points}
            </span>
          </div>
        </li>
      ))}
    </ul>
    <button type="button" onClick={onRetry} className="mt-5 w-full rounded-full border border-white/15 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
      ↻ upload another file
    </button>
  </div>
);

export const LabView = ({ lab, labKey, best }: { lab: Lab; labKey: string; best?: LabResult }) => {
  const [status, setStatus] = useState<Status>({ state: "idle" });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const grade = async (file: File) => {
    if (!/\.(pkt|pka)$/i.test(file.name)) {
      setStatus({ state: "error", file: file.name, message: "that's not a Packet Tracer file. Save your work as .pkt (File → Save As) and upload that." });
      return;
    }
    setStatus({ state: "reading", file: file.name });
    try {
      const [result] = await Promise.all([gradeLab(lab, new Uint8Array(await file.arrayBuffer())), new Promise(r => setTimeout(r, 900))]);
      setStatus({ state: "done", file: file.name, grade: result });
      saveLab(labKey, { score: result.score, file: file.name, at: new Date().toISOString() });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus({ state: "error", file: file.name, message: `couldn't read this file: ${message}` });
    }
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void grade(file);
  };

  return (
    <div>
      <p className="flex flex-wrap items-center gap-2 font-jetbrains text-[11px] uppercase tracking-[0.18em] text-(--accent)">
        <KindIcon kind="lab" className="h-4 w-4" /> packet tracer practical
        <span className="rounded-full bg-white/10 px-2 py-0.5 normal-case tracking-normal text-white/70">{LEVEL[lab.level]}</span>
        <span className="normal-case tracking-normal text-white/50">~{lab.minutes} min</span>
      </p>
      <h1 className="mt-4 font-display text-[clamp(1.75rem,5vw,2.75rem)] font-bold lowercase leading-[1.08] tracking-[-0.035em]">{lab.title}</h1>
      <p className="mt-4 font-accent text-xl italic leading-snug text-white/65 sm:text-2xl">{lab.story}</p>

      {best && (
        <p className={`mt-6 inline-flex rounded-full px-3 py-1.5 text-sm ${best.score >= LAB_PASS ? "bg-emerald-400/15 text-emerald-200" : "bg-white/5 text-white/60"}`}>
          your best: {best.score}% {best.score >= LAB_PASS ? "· passed ✓" : ""}
        </p>
      )}

      <Section n={1} title="the goal">
        <ul className="grid gap-2 sm:grid-cols-2">
          {lab.goals.map(g => (
            <li key={g} className="flex gap-2.5 rounded-xl bg-white/[0.04] px-3.5 py-2.5 text-[15px] text-white/80">
              <span className="text-(--accent)">◆</span>
              {g}
            </li>
          ))}
        </ul>
      </Section>

      <Section n={2} title="the network">
        <div className="keep-white rounded-2xl border border-white/10 bg-[#0c0f16] p-3 sm:p-5">
          <TopologyDiagram topology={lab.topology} />
        </div>
        <div className="no-scrollbar mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-max text-left font-jetbrains text-[12.5px]">
            <thead className="bg-white/[0.04] text-[10px] uppercase tracking-wider text-white/50">
              <tr>
                {lab.addressing.head.map(h => (
                  <th key={h} className="px-3.5 py-2.5 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lab.addressing.rows.map(row => (
                <tr key={row.join()} className="border-t border-white/5">
                  {row.map((cell, i) => (
                    <td key={i} className={`px-3.5 py-2.5 ${i === 0 ? "font-vibe font-semibold text-white" : "text-white/75"}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section n={3} title="build it, step by step">
        <Steps lab={lab} />
        <p className="mt-3 text-sm text-white/45">Stuck? Each step has the exact commands. Try it on your own first, though. That's where the learning happens.</p>
      </Section>

      <Section n={4} title="upload and get graded">
        {status.state === "done" ? (
          <Results grade={status.grade} file={status.file} onRetry={() => setStatus({ state: "idle" })} />
        ) : (
          <div
            onDragOver={e => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`relative rounded-3xl border-2 border-dashed p-8 text-center transition sm:p-12 ${dragging ? "border-(--accent) bg-(--accent)/10" : "border-white/15 bg-white/[0.02]"}`}
          >
            {status.state === "reading" ? (
              <div className="py-4">
                <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-(--accent)" />
                <p className="mt-4 font-semibold text-white">checking {status.file}…</p>
                <p className="mt-1 text-sm text-white/50">opening the file, reading every device and simulating pings</p>
              </div>
            ) : (
              <>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/5 text-2xl">📁</span>
                <p className="mt-4 font-display text-lg font-bold lowercase">drop your .pkt file here</p>
                <p className="mt-1 text-sm text-white/50">it's checked right here in your browser. Nothing is uploaded to a server.</p>
                <button type="button" onClick={() => inputRef.current?.click()} className="mt-6 rounded-full bg-(--accent) px-6 py-3 font-semibold text-black transition hover:-translate-y-0.5">
                  choose file
                </button>
                {status.state === "error" && <p className="mx-auto mt-5 max-w-md animate-shake rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">{status.message}</p>}
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".pkt,.pka"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) void grade(file);
              }}
            />
          </div>
        )}
        <p className="mt-3 text-xs text-white/40">
          Your file is graded on its settings and a simulated ping test. Works with Packet Tracer 5 to 9. You need {LAB_PASS}% to pass.
        </p>
      </Section>
    </div>
  );
};
