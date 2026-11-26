import { useEffect, useRef } from "react";
import { markRead, saveExam, saveQuiz, useAcademy } from "./academy-progress";
import { KindIcon, Ring, Shell, StatusMark } from "./academy-ui";
import { BadgeMedal } from "../badges/badge-medal";
import { badgeHash, findBadge } from "../badges/badges";
import { ArticleView } from "./article-view";
import { ACADEMY_TITLE, COUNTS, FINAL_EXAM, MODULES, findLesson, lessonHash, lessonKey, neighbours } from "./content";
import { LabView } from "./lab-view";
import { QuizView } from "./quiz-view";
import { EXAM_PASS, KIND_LABEL, QUIZ_PASS, type Lesson, type Module } from "./types";

const DEFAULT_ACCENT = "#4f8cff";
const PRO_BADGE = findBadge("network-pro")!;

const lessonMinutes = (lesson: Lesson) => (lesson.kind === "quiz" ? 5 : lesson.minutes);

// ---------- overview ----------

const HOW = [
  { icon: "📖", title: "read and play", text: "short blogs with animations you can poke at" },
  { icon: "✅", title: "prove it", text: `a quiz after every module (${QUIZ_PASS}% to pass)` },
  { icon: "🛠️", title: "build it for real", text: "solve a problem in Cisco Packet Tracer, upload the file, get graded" },
  { icon: "🛰️", title: "earn the badge", text: "pass the final challenge to unlock the network pro badge, then share it" },
];

const ModuleCard = ({ module }: { module: Module }) => {
  const { statusOf } = useAcademy();
  const done = module.lessons.filter(l => statusOf(lessonKey(module, l), l.kind) === "done").length;
  return (
    <li className="relative" style={{ "--accent": module.color } as React.CSSProperties}>
      <div className="overflow-hidden rounded-3xl border border-(--line) bg-white/[0.02]">
        <div className="flex items-center gap-4 p-5 sm:p-6">
          <span className="font-poster text-6xl leading-none text-(--accent) sm:text-7xl">{String(module.number).padStart(2, "0")}</span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-bold lowercase leading-tight tracking-[-0.02em] sm:text-xl">{module.title}</h3>
            <p className="mt-1 text-sm text-(--muted)">{module.tagline}</p>
          </div>
          <Ring value={done / module.lessons.length} size={48}>
            <span className="font-jetbrains text-[10px] text-white/70">
              {done}/{module.lessons.length}
            </span>
          </Ring>
        </div>
        <ol className="border-t border-(--line)">
          {module.lessons.map(lesson => {
            const status = statusOf(lessonKey(module, lesson), lesson.kind);
            return (
              <li key={lesson.id} className="border-b border-(--line) last:border-0">
                <a href={lessonHash(module, lesson)} className="group flex items-center gap-3 px-5 py-3.5 transition hover:bg-white/[0.04] sm:px-6">
                  <StatusMark status={status} />
                  <KindIcon kind={lesson.kind} className={`h-4 w-4 shrink-0 ${lesson.kind === "lab" ? "text-(--accent)" : "text-white/40"}`} />
                  <span className="min-w-0 flex-1 truncate text-[15px] text-white/85 group-hover:text-white">{lesson.title}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 font-jetbrains text-[10px] uppercase tracking-wider ${lesson.kind === "lab" ? "bg-(--accent)/15 text-(--accent)" : "text-white/35"}`}>
                    {KIND_LABEL[lesson.kind]}
                  </span>
                  <span className="hidden w-12 shrink-0 text-right font-jetbrains text-[11px] text-white/35 sm:block">{lessonMinutes(lesson)}m</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </li>
  );
};

const Overview = () => {
  const { done, total, next, examUnlocked, examPassed, finished, gradedPassed, gradedTotal, progress } = useAcademy();
  const hours = Math.round(COUNTS.minutes / 60);

  return (
    <>
      <section className="mx-auto max-w-5xl px-5 pb-10 pt-12 sm:px-6 sm:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-(--line) bg-(--panel) px-3.5 py-1.5 font-jetbrains text-[11px] uppercase tracking-wider text-(--muted)">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-(--accent)" />
          free course · real hands-on labs
        </span>
        <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.3rem,6.5vw,4.6rem)] font-bold lowercase leading-[1] tracking-[-0.045em]">
          networking, from zero to <span className="font-accent text-[1.15em] font-normal italic tracking-normal text-(--accent)">pro.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-(--muted)">
          Learn how the internet really works, then prove it by building real networks in Cisco Packet Tracer. Every practical is graded the moment you upload it.
        </p>

        <dl className="mt-8 grid grid-cols-4 gap-2 sm:max-w-xl">
          {[
            [MODULES.length, "modules"],
            [COUNTS.articles, "blogs"],
            [COUNTS.labs, "labs"],
            [`~${hours}h`, "total"],
          ].map(([big, small]) => (
            <div key={small} className="rounded-2xl border border-(--line) bg-(--panel) px-3 py-3">
              <dt className="sr-only">{small}</dt>
              <dd className="font-poster text-3xl leading-none sm:text-4xl">{big}</dd>
              <p className="mt-1 font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">{small}</p>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap items-center gap-4 rounded-3xl border border-(--line) bg-white/[0.03] p-5 sm:flex-nowrap sm:p-6">
          <Ring value={done / total} size={64}>
            <span className="font-jetbrains text-xs">{Math.round((done / total) * 100)}%</span>
          </Ring>
          <div className="min-w-0 flex-1">
            <p className="font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">{done === 0 ? "start here" : finished ? "all done" : "up next"}</p>
            <p className="mt-1 truncate font-display text-lg font-bold lowercase">
              {finished ? "you're a network pro 🛰️" : next ? next.lesson.title : examUnlocked ? "the final challenge" : ""}
            </p>
            <p className="text-sm text-(--muted)">
              {gradedPassed}/{gradedTotal} quizzes and labs passed
            </p>
          </div>
          <a
            href={finished ? badgeHash("network-pro") : next ? lessonHash(next.module, next.lesson) : "#/academy/challenge"}
            className="w-full shrink-0 rounded-full bg-(--accent) px-6 py-3 text-center font-semibold text-black transition hover:-translate-y-0.5 sm:w-auto"
          >
            {done === 0 ? "start the course →" : finished ? "share your badge →" : "continue →"}
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 sm:px-6">
        <h2 className="font-display text-2xl font-bold lowercase tracking-[-0.03em]">how it works</h2>
        <ol className="no-scrollbar -mx-5 mt-5 flex snap-x gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0">
          {HOW.map((h, i) => (
            <li key={h.title} className="w-56 shrink-0 snap-start rounded-2xl border border-(--line) bg-(--panel) p-4 sm:w-auto">
              <p className="flex items-center justify-between">
                <span className="text-2xl">{h.icon}</span>
                <span className="font-jetbrains text-[10px] text-white/30">0{i + 1}</span>
              </p>
              <p className="mt-3 font-semibold">{h.title}</p>
              <p className="mt-1 text-sm text-(--muted)">{h.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-24 pt-14 sm:px-6">
        <h2 className="font-display text-2xl font-bold lowercase tracking-[-0.03em]">the course</h2>
        <ol className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-4">
          {MODULES.map(m => (
            <ModuleCard key={m.id} module={m} />
          ))}
          <li className="grid gap-4 sm:grid-cols-2">
            <a
              href={examUnlocked ? "#/academy/challenge" : undefined}
              className={`flex items-center gap-4 rounded-3xl border p-5 sm:p-6 ${examUnlocked ? "border-(--accent)/40 bg-(--accent)/[0.06] transition hover:bg-(--accent)/10" : "border-(--line) bg-white/[0.02] opacity-60"}`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/5 text-(--accent)">
                <KindIcon kind="exam" className="h-6 w-6" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-lg font-bold lowercase">final challenge</span>
                <span className="block text-sm text-(--muted)">
                  {examPassed ? `passed · ${progress.exam}%` : examUnlocked ? `${FINAL_EXAM.length} questions · ${EXAM_PASS}% to pass` : "🔒 pass every quiz and lab first"}
                </span>
              </span>
            </a>
            <a href={badgeHash("network-pro")} className={`flex items-center gap-4 rounded-3xl border p-5 sm:p-6 transition hover:bg-white/[0.04] ${finished ? "border-(--accent)/40 bg-(--accent)/[0.06]" : "border-(--line) bg-white/[0.02]"}`}>
              <BadgeMedal badge={PRO_BADGE} earned={finished} className="w-12" />
              <span className="min-w-0">
                <span className="block font-display text-lg font-bold lowercase">network pro badge</span>
                <span className="block text-sm text-(--muted)">{finished ? "unlocked: share it with your friends" : "pass the final challenge to unlock it"}</span>
              </span>
            </a>
          </li>
        </ol>
      </section>
    </>
  );
};

// ---------- a single lesson ----------

const LessonPage = ({ module, lesson }: { module: Module; lesson: Lesson }) => {
  const { statusOf, progress } = useAcademy();
  const key = lessonKey(module, lesson);
  const { prev, next } = neighbours(module, lesson);
  const index = module.lessons.indexOf(lesson);

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-8 sm:px-6 sm:pt-12">
      <div className="mb-8 flex items-center gap-1.5">
        {module.lessons.map((l, i) => (
          <a
            key={l.id}
            href={lessonHash(module, l)}
            aria-label={l.title}
            className={`h-1.5 flex-1 rounded-full transition ${i === index ? "bg-(--accent)" : statusOf(lessonKey(module, l), l.kind) === "done" ? "bg-(--accent)/40" : "bg-white/10 hover:bg-white/20"}`}
          />
        ))}
      </div>

      {lesson.kind === "article" && <ArticleView article={lesson} readKey={key} read={statusOf(key, "article") === "done"} />}
      {lesson.kind === "quiz" && (
        <QuizView
          key={key}
          kind="quiz"
          title={`${lesson.title}: ${module.title}`}
          questions={lesson.questions}
          passMark={QUIZ_PASS}
          best={progress.quiz[key]}
          onFinish={score => saveQuiz(key, score)}
        />
      )}
      {lesson.kind === "lab" && <LabView key={key} lab={lesson} labKey={key} best={progress.labs[key]} />}

      <nav className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-3 border-t border-(--line) pt-8 sm:grid-cols-2">
        {prev ? (
          <a href={lessonHash(prev.module, prev.lesson)} className="rounded-2xl border border-(--line) p-4 transition hover:bg-white/[0.04] max-sm:order-last">
            <span className="font-jetbrains text-[10px] uppercase tracking-wider text-(--muted)">← previous</span>
            <span className="mt-1 block truncate font-semibold">{prev.lesson.title}</span>
          </a>
        ) : (
          <span className="max-sm:hidden" />
        )}
        {next ? (
          <a
            href={lessonHash(next.module, next.lesson)}
            onClick={() => lesson.kind === "article" && markRead(key)}
            className="rounded-2xl bg-(--accent) p-4 text-black transition hover:-translate-y-0.5 sm:text-right"
          >
            <span className="font-jetbrains text-[10px] uppercase tracking-wider opacity-70">next {KIND_LABEL[next.lesson.kind]} →</span>
            <span className="mt-1 block truncate font-semibold">{next.lesson.title}</span>
          </a>
        ) : (
          <a href="#/academy/challenge" className="rounded-2xl bg-(--accent) p-4 text-black transition hover:-translate-y-0.5 sm:text-right">
            <span className="font-jetbrains text-[10px] uppercase tracking-wider opacity-70">last step →</span>
            <span className="mt-1 block font-semibold">the final challenge</span>
          </a>
        )}
      </nav>
    </div>
  );
};

const Exam = () => {
  const { examUnlocked, progress, gradedPassed, gradedTotal } = useAcademy();
  if (!examUnlocked) {
    return (
      <div className="mx-auto max-w-xl px-5 py-20 text-center">
        <span className="text-5xl">🔒</span>
        <h1 className="mt-5 font-display text-3xl font-bold lowercase">not yet!</h1>
        <p className="mt-3 text-white/60">
          The final challenge unlocks once every quiz and practical is passed. You're at {gradedPassed}/{gradedTotal}.
        </p>
        <a href="#/academy" className="mt-8 inline-block rounded-full bg-(--accent) px-6 py-3 font-semibold text-black">
          back to the course
        </a>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <QuizView kind="exam" title={`${ACADEMY_TITLE}: final challenge`} questions={FINAL_EXAM} passMark={EXAM_PASS} best={progress.exam} onFinish={saveExam} />
      {(progress.exam ?? 0) >= EXAM_PASS && (
        <a href={badgeHash("network-pro")} className="mt-8 flex animate-pop items-center justify-center gap-2 rounded-full bg-emerald-400 py-4 font-semibold text-black transition hover:-translate-y-0.5">
          🛰️ you unlocked the network pro badge. share it →
        </a>
      )}
    </div>
  );
};

// ---------- router ----------

/** Inside the signed-in app the academy keeps the app's menu, with a breadcrumb instead of its own header */
const EmbeddedFrame = ({ accent, crumb, children }: { accent: string; crumb?: React.ReactNode; children: React.ReactNode }) => (
  <div style={{ "--accent": accent } as React.CSSProperties}>
    <nav className="mx-auto flex max-w-5xl items-center gap-2 px-5 pt-5 font-jetbrains text-xs uppercase tracking-wider text-(--muted) sm:px-6 sm:pt-8">
      <a href="#/feed/courses" className="hover:text-(--fg)">
        learn
      </a>
      <span>/</span>
      <a href="#/academy" className={crumb ? "hover:text-(--fg)" : "text-(--fg)"}>
        networking academy
      </a>
      {crumb && (
        <>
          <span>/</span>
          <span className="min-w-0 truncate text-(--fg)">{crumb}</span>
        </>
      )}
    </nav>
    {children}
  </div>
);

const AcademyPage = ({ route, embedded = false }: { route: string; embedded?: boolean }) => {
  const [first = "", second = ""] = route.replace(/^#\/academy\/?/, "").split("/");
  const scroller = useRef<HTMLDivElement>(null);
  const found = findLesson(first, second);

  useEffect(() => {
    scroller.current?.closest(".cv-root")?.scrollTo({ top: 0 });
  }, [route]);

  let body = <Overview />;
  let accent = DEFAULT_ACCENT;
  let crumb: React.ReactNode;

  if (first === "challenge" || first === "exam") {
    body = <Exam />;
    crumb = "final challenge";
  } else if (found) {
    accent = found.module.color;
    crumb = (
      <>
        <span className="max-sm:hidden">module {found.module.number} · </span>
        {found.module.title}
      </>
    );
    body = <LessonPage key={route} module={found.module} lesson={found.lesson} />;
  } else if (first) {
    body = (
      <div className="px-5 py-24 text-center">
        <p className="font-poster text-6xl uppercase">lost?</p>
        <p className="mt-2 text-white/60">that page doesn't exist.</p>
        <a href="#/academy" className="mt-6 inline-block rounded-full bg-white px-5 py-2.5 font-semibold text-black">
          back to the academy
        </a>
      </div>
    );
  }

  if (embedded) {
    return (
      <EmbeddedFrame accent={accent} crumb={crumb}>
        <div ref={scroller}>{body}</div>
      </EmbeddedFrame>
    );
  }

  return (
    <Shell accent={accent} crumb={crumb}>
      <div ref={scroller}>{body}</div>
    </Shell>
  );
};

export default AcademyPage;
