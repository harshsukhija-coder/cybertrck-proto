import { useState } from "react";
import { KindIcon, Ring } from "./academy-ui";
import type { QuizQuestion } from "./types";

type Props = {
  title: string;
  kind: "quiz" | "exam";
  questions: QuizQuestion[];
  passMark: number;
  best?: number;
  onFinish: (score: number) => void;
};

export const QuizView = ({ title, kind, questions, passMark, best, onFinish }: Props) => {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const finished = answers.length === questions.length && index === questions.length;
  const correct = answers.filter((a, i) => a === questions[i].answer).length;
  const score = Math.round((correct / questions.length) * 100);
  const passed = score >= passMark;

  const restart = () => {
    setAnswers([]);
    setIndex(0);
    setStarted(true);
  };

  if (!started) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-10">
        <p className="flex items-center gap-2 font-jetbrains text-[11px] uppercase tracking-[0.18em] text-(--accent)">
          <KindIcon kind={kind === "exam" ? "exam" : "quiz"} className="h-4 w-4" /> {kind === "exam" ? "final exam" : "quiz"}
        </p>
        <h1 className="mt-4 font-display text-[clamp(1.75rem,5vw,2.75rem)] font-bold lowercase leading-[1.08] tracking-[-0.035em]">{title}</h1>
        <div className="mt-6 grid grid-cols-3 gap-2 sm:max-w-md">
          {[
            [String(questions.length), "questions"],
            [`${passMark}%`, "to pass"],
            [best !== undefined ? `${best}%` : "—", "your best"],
          ].map(([big, small]) => (
            <div key={small} className="rounded-2xl bg-white/5 px-3 py-3">
              <p className="font-poster text-3xl text-white">{big}</p>
              <p className="font-jetbrains text-[10px] uppercase tracking-wider text-white/45">{small}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-md text-white/60">
          One question at a time. You'll see the answer and why straight away. Retry as often as you like; only your best score counts.
        </p>
        <button type="button" onClick={restart} className="mt-8 rounded-full bg-(--accent) px-7 py-3 font-semibold text-black transition hover:-translate-y-0.5">
          {best !== undefined ? "try again →" : "start →"}
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="animate-pop">
        <div className={`rounded-3xl border p-6 text-center sm:p-10 ${passed ? "border-emerald-400/40 bg-emerald-400/[0.06]" : "border-rose-400/40 bg-rose-400/[0.06]"}`}>
          <div className="flex justify-center">
            <Ring value={score / 100} size={120} color={passed ? "#34d399" : "#fb7185"}>
              <span className="font-poster text-4xl">{score}%</span>
            </Ring>
          </div>
          <p className={`mt-5 font-poster text-5xl uppercase ${passed ? "text-emerald-300" : "text-rose-300"}`}>{passed ? "passed" : "not yet"}</p>
          <p className="mt-2 text-white/70">
            {correct} of {questions.length} correct · you need {passMark}%
          </p>
          <button type="button" onClick={restart} className="mt-6 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
            ↻ retake
          </button>
        </div>
        <h2 className="mt-10 font-display text-lg font-bold lowercase">review</h2>
        <ol className="mt-4 grid gap-3">
          {questions.map((q, i) => {
            const right = answers[i] === q.answer;
            return (
              <li key={q.q} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="flex gap-2 font-semibold text-white">
                  <span className={right ? "text-emerald-300" : "text-rose-300"}>{right ? "✓" : "✕"}</span>
                  {q.q}
                </p>
                {!right && <p className="mt-1.5 pl-5 text-sm text-rose-200/80">you said: {q.options[answers[i]]}</p>}
                <p className="mt-1.5 pl-5 text-sm text-white/60">
                  <b className="text-white/80">{q.options[q.answer]}</b>: {q.why}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  const q = questions[index];
  const picked = answers[index];
  const answered = picked !== undefined;

  const next = () => {
    const nextIndex = index + 1;
    setIndex(nextIndex);
    if (nextIndex === questions.length) {
      const finalCorrect = answers.filter((a, i) => a === questions[i].answer).length;
      onFinish(Math.round((finalCorrect / questions.length) * 100));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="font-jetbrains text-xs text-white/50">
          {index + 1}/{questions.length}
        </span>
        <div className="flex flex-1 gap-1">
          {questions.map((qq, i) => (
            <span
              key={qq.q}
              className={`h-1.5 flex-1 rounded-full transition ${i < answers.length ? (answers[i] === questions[i].answer ? "bg-emerald-400" : "bg-rose-400") : i === index ? "bg-white/60" : "bg-white/10"}`}
            />
          ))}
        </div>
      </div>
      <h2 key={index} className="mt-8 animate-pop font-display text-[clamp(1.35rem,4vw,1.9rem)] font-bold leading-tight">
        {q.q}
      </h2>
      <div className="mt-6 grid gap-2.5">
        {q.options.map((option, i) => {
          const tone = !answered
            ? "border-white/10 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.07]"
            : i === q.answer
              ? "border-emerald-400 bg-emerald-400/10"
              : i === picked
                ? "animate-shake border-rose-400 bg-rose-400/10"
                : "border-white/5 opacity-40";
          return (
            <button
              key={option}
              type="button"
              disabled={answered}
              onClick={() => setAnswers(a => [...a, i])}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-base text-white transition ${tone}`}
            >
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/20 font-jetbrains text-xs">
                {answered && i === q.answer ? "✓" : answered && i === picked ? "✕" : String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="mt-5 animate-pop rounded-2xl bg-white/[0.05] p-4">
          <p className={`font-semibold ${picked === q.answer ? "text-emerald-300" : "text-rose-300"}`}>{picked === q.answer ? "correct!" : "not quite"}</p>
          <p className="mt-1 text-white/75">{q.why}</p>
          <button type="button" onClick={next} className="mt-4 rounded-full bg-(--accent) px-6 py-2.5 text-sm font-semibold text-black transition hover:-translate-y-0.5">
            {index === questions.length - 1 ? "see my score" : "next question →"}
          </button>
        </div>
      )}
    </div>
  );
};
