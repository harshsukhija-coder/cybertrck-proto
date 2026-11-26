import { markRead, readAcademy, saveExam, saveLab, saveQuiz, summarizeAcademy } from "../../courses/academy/academy-progress";
import { ACADEMY_TITLE, ALL_LESSONS, COUNTS, FINAL_EXAM, MODULES, lessonHash, lessonKey } from "../../courses/academy/content";
import { gradeLab } from "../../courses/academy/grade";
import { EXAM_PASS, LAB_PASS, QUIZ_PASS, type Article, type Block, type Lab, type Lesson, type Module, type QuizQuestion } from "../../courses/academy/types";
import { NEXT_CHIP, QUIT_CHIP, bar, isQuit, optionChips, pickIndex, printOptions, rule, table } from "../format";
import type { Command, Term } from "../term";

const academy = () => summarizeAcademy(readAcademy());

const findModule = (ref?: string) => MODULES.find(m => String(m.number) === ref || m.id === ref);

const MARK = { done: "{green:✓}", failed: "{red:↻}", todo: "{dim:○}" } as const;
const KIND = { article: "blog", quiz: "quiz", lab: "lab" } as const;

/** The command that opens a lesson */
const openCmd = (module: Module, lesson: Lesson) =>
  lesson.kind === "article" ? `read ${module.number}.${module.lessons.indexOf(lesson) + 1}` : `${lesson.kind} ${module.number}`;

const nextStep = (t: Term) => {
  const a = academy();
  if (a.next) t.print(`{dim:up next:} [[${a.next.lesson.title}|${openCmd(a.next.module, a.next.lesson)}]]`);
  else if (a.examUnlocked && !a.examPassed) t.print("{dim:up next:} [[the final challenge|final]]");
  else if (a.finished) t.print("{green:you finished the academy.} share your badge: [[share network-pro]]");
};

// ---------- overview ----------

const overview = (t: Term, args: string[]) => {
  const module = findModule(args[0]);
  const a = academy();
  if (module) {
    t.print(rule(`module ${module.number} · ${module.title}`, module.color));
    t.print(`{dim:${module.tagline}}`);
    t.print("");
    module.lessons.forEach((lesson, i) => {
      const status = a.statusOf(lessonKey(module, lesson), lesson.kind);
      const score = lesson.kind === "quiz" ? a.progress.quiz[lessonKey(module, lesson)] : lesson.kind === "lab" ? a.progress.labs[lessonKey(module, lesson)]?.score : undefined;
      t.print(`${MARK[status]} {dim:${i + 1}.} [[${lesson.title}|${openCmd(module, lesson)}]] {dim:· ${KIND[lesson.kind]}${score !== undefined ? ` · best ${score}%` : ""}}`);
    });
    return;
  }
  t.print(rule(`${ACADEMY_TITLE.toLowerCase()} · networking academy`));
  t.print(`{dim:${COUNTS.articles} blogs · ${COUNTS.quizzes} quizzes · ${COUNTS.labs} cisco packet tracer labs · ~${Math.round(COUNTS.minutes / 60)} hours}`);
  t.print(`{accent:${bar(a.done, a.total, 20)}} ${a.done}/${a.total} lessons · ${a.gradedPassed}/${a.gradedTotal} quizzes and labs passed`);
  t.print("");
  for (const m of MODULES) {
    const marks = m.lessons.map(l => MARK[a.statusOf(lessonKey(m, l), l.kind)]).join("");
    t.print(`${marks}  [[{${m.color}:${m.number}.} ${m.title}|academy ${m.number}]]`);
  }
  t.print("");
  t.print(`${a.examPassed ? "{green:✓}" : a.examUnlocked ? "{yellow:◆}" : "{dim:🔒}"} [[final challenge|final]] {dim:· ${FINAL_EXAM.length} questions · ${EXAM_PASS}% to pass${a.progress.exam !== undefined ? ` · best ${a.progress.exam}%` : ""}}`);
  t.print("");
  nextStep(t);
};

// ---------- blogs ----------

/** Same rule as the website: everything after the first blank line is output, "!" lines are comments */
const cliLines = (prompt: string | undefined, lines: string[]) =>
  lines.map((line, i) => {
    const muted = line === "" || lines.slice(0, i).includes("") || line.startsWith("!");
    if (muted) return `{dim:${line || " "}}`;
    return i === 0 && prompt ? `{green:${prompt}} ${line}` : line;
  });

const CALLOUT = { tip: ["green", "TIP"], warn: ["yellow", "HEADS UP"], fact: ["blue", "FUN FACT"] } as const;

const showBlock = (t: Term, block: Block, module: Module, lesson: Lesson) => {
  switch (block.kind) {
    case "p":
      t.print("");
      t.print(block.text);
      break;
    case "h":
      t.print("");
      t.print(`{${module.color}:## ${block.text}}`);
      break;
    case "list":
      block.items.forEach((item, i) => t.print(`{dim:${block.ordered ? `${i + 1}.` : "•"}} ${item}`, { indent: true }));
      break;
    case "callout": {
      const [tone, label] = CALLOUT[block.tone];
      t.print("");
      t.print(`{${tone}:${label}}  ${block.text}`, { bar: tone });
      break;
    }
    case "cli":
      t.block(cliLines(block.prompt, block.lines));
      if (block.note) t.print(`{dim:${block.note}}`);
      break;
    case "table":
      t.block(table(block.head, block.rows));
      break;
    case "anim":
      t.print(`{purple:▶ animation:} ${block.caption}`);
      t.segs([{ text: "  watch it in the visual app ↗", href: lessonHash(module, lesson), tone: "dim" }]);
      break;
    case "check":
      t.print("");
      t.print("{accent:QUICK CHECK}");
      t.print(`**${block.q}**`);
      printOptions(t, block.options);
      break;
  }
};

const readArticle = (t: Term, module: Module, article: Article) => {
  const blocks = article.blocks;
  let i = 0;
  let check: Extract<Block, { kind: "check" }> | null = null;

  t.print("");
  t.print(rule(`module ${module.number} · blog`, module.color));
  t.print(`**${article.title}**`);
  t.print(`{dim:${article.minutes} min · ${article.summary}}`);

  /** Shows blocks up to the next heading or question, so it reads like pages */
  const page = () => {
    while (i < blocks.length) {
      const block = blocks[i++];
      showBlock(t, block, module, article);
      if (block.kind === "check") {
        check = block;
        return;
      }
      if (blocks[i]?.kind === "h") break;
    }
    if (i >= blocks.length) {
      markRead(lessonKey(module, article));
      t.print("");
      t.print("{green:**blog done ✓**}");
      nextStep(t);
      t.exit();
    }
  };

  t.start({
    name: "blog",
    prompt: () => (check ? "answer ›" : `blog ${Math.round((i / blocks.length) * 100)}% ↵ ›`),
    chips: () => (check ? [...optionChips(check.options.length), QUIT_CHIP] : [NEXT_CHIP, QUIT_CHIP]),
    input: line => {
      if (isQuit(line)) return t.exit();
      if (check) {
        const picked = pickIndex(line, check.options.length);
        if (picked === null) return t.print("{yellow:pick a letter.}");
        t.print(picked === check.answer ? "{green:correct ✓}" : `{red:not quite.} it's **${check.options[check.answer]}**.`);
        t.print(`{dim:${check.why}}`);
        check = null;
        return;
      }
      page();
    },
  });
  page();
};

const read = (t: Term, args: string[]) => {
  const [m, l] = (args[0] ?? "").split(".");
  const module = findModule(m);
  const lesson = module?.lessons[Number(l) - 1];
  if (!module || !lesson) {
    const next = academy().next;
    if (!args[0] && next?.lesson.kind === "article") return readArticle(t, next.module, next.lesson);
    return t.print("{red:which blog?} use module.lesson, like [[read 1.1]], or see [[academy]].");
  }
  if (lesson.kind !== "article") return void t.run(openCmd(module, lesson));
  readArticle(t, module, lesson);
};

// ---------- quizzes ----------

const runQuiz = (t: Term, opts: { title: string; questions: QuizQuestion[]; pass: number; best?: number; onDone: (score: number) => void }) => {
  let i = 0;
  let right = 0;
  let answered = false;
  t.print("");
  t.print(rule(opts.title));
  t.print(`{dim:${opts.questions.length} questions · ${opts.pass}% to pass${opts.best !== undefined ? ` · your best ${opts.best}%` : ""}}`);
  const show = () => {
    answered = false;
    t.print("");
    t.print(`{dim:${i + 1}/${opts.questions.length}} **${opts.questions[i].q}**`);
    printOptions(t, opts.questions[i].options);
  };
  t.start({
    name: "quiz",
    prompt: () => (answered ? "↵ next ›" : `quiz ${i + 1}/${opts.questions.length} ›`),
    chips: () => (answered ? [NEXT_CHIP, QUIT_CHIP] : [...optionChips(opts.questions[i].options.length), QUIT_CHIP]),
    input: line => {
      if (isQuit(line)) {
        t.print("{dim:quiz stopped. nothing was saved.}");
        return t.exit();
      }
      if (answered) {
        i++;
        if (i < opts.questions.length) return show();
        const score = Math.round((right / opts.questions.length) * 100);
        opts.onDone(score);
        const passed = score >= opts.pass;
        t.print("");
        t.block([`${passed ? "{green:PASS}" : "{red:FAIL}"}  ${score}%  {dim:(${right}/${opts.questions.length} right)}`]);
        t.print(passed ? (score === 100 ? "{yellow:perfect score! 🎯}" : "nice work.") : `you need ${opts.pass}%. read the blogs again, then retry.`);
        nextStep(t);
        return t.exit();
      }
      const q = opts.questions[i];
      const picked = pickIndex(line, q.options.length);
      if (picked === null) return t.print("{yellow:pick a letter.}");
      answered = true;
      if (picked === q.answer) right++;
      t.print(picked === q.answer ? "{green:✓ correct}" : `{red:✕} it's **${q.options[q.answer]}**`);
      t.print(`{dim:${q.why}}`);
    },
  });
  show();
};

const quiz = (t: Term, args: string[]) => {
  const module = findModule(args[0]) ?? (args[0] ? undefined : academy().next?.module);
  const lesson = module?.lessons.find(l => l.kind === "quiz");
  if (!module || !lesson || lesson.kind !== "quiz") return t.print("{red:which module?} e.g. [[quiz 1]]. see [[academy]].");
  const key = lessonKey(module, lesson);
  runQuiz(t, { title: `module ${module.number} quiz · ${module.title}`, questions: lesson.questions, pass: QUIZ_PASS, best: readAcademy().quiz[key], onDone: score => saveQuiz(key, score) });
};

const final = (t: Term) => {
  const a = academy();
  if (!a.examUnlocked) {
    t.print(`{dim:🔒 the final challenge unlocks once every quiz and lab is passed.} you're at ${a.gradedPassed}/${a.gradedTotal}.`);
    return nextStep(t);
  }
  runQuiz(t, { title: `${ACADEMY_TITLE.toLowerCase()}: final challenge`, questions: FINAL_EXAM, pass: EXAM_PASS, best: a.progress.exam, onDone: saveExam });
};

// ---------- labs ----------

const LEVEL = { easy: "{green:easy}", medium: "{yellow:medium}", hard: "{red:hard}" };

const showLab = (t: Term, module: Module, lab: Lab) => {
  const best = readAcademy().labs[lessonKey(module, lab)];
  t.print("");
  t.print(rule(`module ${module.number} · packet tracer lab`, module.color));
  t.print(`**${lab.title}**  ${LEVEL[lab.level]} {dim:· ~${lab.minutes} min}${best ? ` {dim:· your best ${best.score}%}` : ""}`);
  t.print(lab.story, { bar: module.color });
  t.print("");
  t.print(`{${module.color}:1. the goal}`);
  lab.goals.forEach(g => t.print(`{dim:◆} ${g}`, { indent: true }));
  t.print("");
  t.print(`{${module.color}:2. the network}`);
  const label = (id: string) => {
    const node = lab.topology.nodes.find(n => n.id === id);
    return node ? `${node.label}${node.sub ? ` {dim:${node.sub}}` : ""}` : id;
  };
  t.block(lab.topology.links.map(l => `${label(l.a)} ──${l.label ? ` {dim:${l.label}} ` : ""}── ${label(l.b)}`));
  t.block(table(lab.addressing.head, lab.addressing.rows));
  t.print("");
  t.print(`{${module.color}:3. build it, step by step}`);
  lab.steps.forEach((step, i) => {
    t.print(`{dim:${i + 1}.} **${step.title}** ${step.text.replace("drop the file into the box below", "type [[upload]] or drop the file on this window")}`, { indent: true });
    if (step.cli) t.block(cliLines(step.cli.prompt, step.cli.lines));
  });
  t.print("");
  t.print(`{${module.color}:4. upload and get graded}`);
  t.print(`save your work as a {code:.pkt} file, then type [[upload]] or drop the file on this window. it's checked right here in your browser. you need ${LAB_PASS}%.`);
};

const startLab = (t: Term, module: Module, lab: Lab) => {
  let busy = false;
  const grade = async (file: File) => {
    if (busy) return;
    if (!/\.(pkt|pka)$/i.test(file.name)) {
      t.print("{red:that's not a packet tracer file.} save your work as .pkt (file → save as) and upload that.");
      return;
    }
    busy = true;
    t.print(`{dim:checking ${file.name}… opening the file, reading every device and simulating pings}`);
    try {
      const result = await gradeLab(lab, new Uint8Array(await file.arrayBuffer()));
      saveLab(lessonKey(module, lab), { score: result.score, file: file.name, at: new Date().toISOString() });
      t.print("");
      t.block([`${result.passed ? "{green:PASS}" : "{red:FAIL}"}  ${result.score}%`, `{dim:${file.name} · packet tracer ${result.version.split(".").slice(0, 2).join(".") || "?"} · ${result.devices.length} devices · ${result.cables} cables}`]);
      for (const r of result.results) {
        t.print(`${r.ok ? "{green:✓}" : "{red:✕}"} ${r.label} {dim:${r.ok ? r.points : 0}/${r.points}}`);
        if (!r.ok) {
          if (r.reason) t.print(`{red:${r.reason}}`, { indent: true });
          t.print(`{dim:💡 ${r.hint}}`, { indent: true });
        }
      }
      t.print("");
      t.print(result.passed ? "{green:your network works. great job, engineer.}" : `you need ${LAB_PASS}%. fix the red items and [[upload]] again.`);
      if (result.passed) nextStep(t);
      t.afterInput(t);
    } catch (error) {
      t.print(`{red:couldn't read this file:} ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      busy = false;
      t.refresh();
    }
  };

  showLab(t, module, lab);
  t.start({
    name: "lab",
    prompt: () => (busy ? "grading… ›" : `lab ${module.number} · upload or q ›`),
    chips: () => [{ label: "📁 upload .pkt", send: "upload" }, { label: "steps", send: "steps" }, QUIT_CHIP],
    file: file => void grade(file),
    input: line => {
      if (isQuit(line)) return t.exit();
      if (/^(upload|u|choose)$/i.test(line)) return t.pickFile(".pkt,.pka");
      if (/^(steps|show|again)$/i.test(line)) return showLab(t, module, lab);
      t.print("type [[upload]] to choose your .pkt file, [[steps]] to see the lab again, or [[q]] to leave.");
    },
  });
};

const lab = (t: Term, args: string[]) => {
  const module = findModule(args[0]);
  const lesson = module?.lessons.find(l => l.kind === "lab");
  if (!module || !lesson || lesson.kind !== "lab") {
    t.print("{red:which lab?} pick a module:");
    MODULES.forEach(m => {
      const l = m.lessons.find(x => x.kind === "lab");
      if (l) t.print(`  [[lab ${m.number}]] {dim:· ${l.title}}`);
    });
    return;
  }
  startLab(t, module, lesson);
};

export const academyCommands: Command[] = [
  { name: "academy", usage: "academy [module]", about: "networking academy: modules and progress", group: "learn", run: overview, complete: () => MODULES.map(m => String(m.number)) },
  {
    name: "read",
    aliases: ["blog"],
    usage: "read <module.lesson>",
    about: "read an academy blog, e.g. read 1.2",
    group: "learn",
    run: read,
    complete: () => ALL_LESSONS.filter(x => x.lesson.kind === "article").map(x => `${x.module.number}.${x.module.lessons.indexOf(x.lesson) + 1}`),
  },
  { name: "quiz", usage: "quiz <module>", about: "take a module quiz", group: "learn", run: quiz, complete: () => MODULES.map(m => String(m.number)) },
  { name: "lab", usage: "lab <module>", about: "a cisco packet tracer lab, graded from your file", group: "learn", run: lab, complete: () => MODULES.map(m => String(m.number)) },
  { name: "final", aliases: ["challenge", "exam"], usage: "final", about: "the academy's final challenge", group: "learn", run: final },
];
