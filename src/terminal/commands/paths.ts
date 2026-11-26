import { SELF_RATINGS, isStepDone, levelFrom, nextCheckStage, pathStatus, readGuide, saveCheck, toggleStep, type Answer } from "../../courses/guide/guide-store";
import { PATHS, findPath, pathsFor, type LearningPath, type Step } from "../../courses/guide/paths";
import { readPrefs } from "../../courses/prefs";
import { readProgress } from "../../courses/progress";
import { QUIT_CHIP, bar, isQuit, letter, optionChips, pickIndex, printOptions, rule } from "../format";
import type { Command, Term } from "../term";

const KIND: Record<Step["kind"], string> = { chapter: "read", game: "play", academy: "lab", web: "free online", do: "try it" };

const time = (minutes: number) => (minutes < 60 ? `${minutes} min` : `${Math.round(minutes / 60)} h`);

const stepAction = (step: Step, done: boolean) => {
  switch (step.kind) {
    case "chapter":
      return done ? "" : `[[read →|learn ${step.course} ${step.chapter}]]`;
    case "game":
      return `[[play →|play ${step.game}]]`;
    case "academy":
      return "[[academy →|academy]]";
    case "web":
      return `<<${step.site} ↗|${step.href}>>`;
    case "do":
      return "";
  }
};

const printStep = (t: Term, path: LearningPath, step: Step, done: boolean) => {
  const tick = step.kind === "chapter" ? "" : `  [[${done ? "untick" : "✓ tick"}|path done ${step.id}]]`;
  t.print(`  ${done ? `{${path.color}:✓}` : "{dim:○}"} ${done ? `{dim:${step.label}}` : step.label}`, { indent: true });
  t.print(`    {dim:${KIND[step.kind]} · ${time(step.minutes)} · ${step.why}}  ${stepAction(step, done)}${tick}`, { indent: true });
};

const printNext = (t: Term, path: LearningPath) => {
  const status = pathStatus(path, readGuide());
  if (!status.next.length) return t.print(`{green:you finished the whole ${path.title} path. 🏆}`);
  t.print(`**your next steps** {dim:(${path.title}, stage ${status.stage + 1}: ${path.stages[status.stage].name})}`);
  status.next.forEach(step => printStep(t, path, step, false));
};

const list = (t: Term) => {
  const prefs = readPrefs();
  const mine = pathsFor(prefs?.interests ?? []);
  const guide = readGuide();
  t.print(rule("paths"));
  t.print("{dim:step-by-step roadmaps. a 1-minute check skips what you already know.}");
  const row = (path: LearningPath) => {
    const s = pathStatus(path, guide);
    t.print("");
    t.print(`[[{${path.color}:${path.glyph}} **${path.title}**|path ${path.id}]] {dim:· ${path.tagline}}`);
    t.print(
      s.checked
        ? `  {${path.color}:${bar(s.stepsDone, s.stepsTotal, 12)}} stage ${Math.min(s.stage + 1, path.stages.length)}/${path.stages.length}${s.next[0] ? ` {dim:· next: ${s.next[0].label}}` : " {green:done 🏆}"}`
        : `  {dim:not started.} [[take the 1-minute check →|path check ${path.id}]]`,
    );
  };
  mine.forEach(row);
  const others = PATHS.filter(p => !mine.includes(p));
  if (others.length) {
    t.print("");
    t.print("{dim:── more paths}");
    others.forEach(row);
  }
};

const show = (t: Term, path: LearningPath) => {
  const guide = readGuide();
  const finished = readProgress().done;
  const status = pathStatus(path, guide, finished);
  t.print(rule(path.title, path.color));
  t.print(`{dim:${path.tagline}}`);
  if (!status.checked) t.print(`{yellow:not sure where you are?} [[take the 1-minute check|path check ${path.id}]]`);
  t.print("");
  const lit = (text: string, on: boolean) => (on ? `{${path.color}:${text}}` : `{dim:${text}}`);
  t.block([
    path.stages.map((_, i) => lit(i < status.stage ? "●" : i === status.stage ? "◉" : "○", i <= status.stage) + (i < path.stages.length - 1 ? lit("────", i < status.stage) : "")).join(""),
    `{${path.color}:${"     ".repeat(Math.min(status.stage, path.stages.length - 1))}${status.stage < path.stages.length ? "you" : ""}}`,
  ]);
  path.stages.forEach((stage, i) => {
    t.print("");
    const mark = i < status.stage ? `{${path.color}:✓}` : i === status.stage ? `{${path.color}:▶}` : "{dim:○}";
    t.print(`${mark} **stage ${i + 1}: ${stage.name}**${i === status.stage ? ` {${path.color}:← you are here}` : ""}`);
    t.print(`  {dim:you'll be able to ${stage.can}.}`, { indent: true });
    if (i < status.known) return t.print("  {dim:you already know this (from your check).}", { indent: true });
    stage.steps.forEach(step => printStep(t, path, step, isStepDone(step, guide, finished)));
  });
  t.print("");
  t.print("**where this can take you**");
  path.careers.forEach(c => t.print(`  {${path.color}:${c.role}} {dim:· ${c.does}}`, { indent: true }));
  if (path.id === "money") t.print("{dim:this path teaches how money works. it isn't financial advice.}");
  t.print("");
  t.print(`[[retake the check|path check ${path.id}]]  [[all paths|path]]`);
};

const check = (t: Term, path: LearningPath) => {
  let start: number | null = null;
  const answers: Answer[] = [];
  let stage: number | null = null;

  const ask = () => {
    stage = nextCheckStage(start!, answers, path.stages.length);
    if (stage === null) return finish();
    const q = path.stages[stage].check;
    t.print("");
    t.print(`{${path.color}:question ${answers.length + 1} · ${path.stages[stage].name} level}`);
    t.print(`**${q.q}**`);
    printOptions(t, [...q.options, "{dim:no idea yet}"]);
  };

  const finish = () => {
    const level = levelFrom(answers);
    saveCheck(path.id, level);
    t.print("");
    t.print(rule("your result", path.color));
    t.print(`you already know {${path.color}:**${level}/${path.stages.length}**} stages.${level ? " we'll skip those." : " fresh start. that's the fun part."}`);
    t.print("");
    printNext(t, path);
    t.print("");
    t.print(`[[see the full roadmap|path ${path.id}]]`);
    t.exit();
  };

  t.print(rule(`skill check · ${path.title}`, path.color));
  t.print(`**how much do you know about ${path.title}?**`);
  printOptions(
    t,
    SELF_RATINGS.map(r => r.label),
  );

  t.start({
    name: "check",
    prompt: () => (start === null ? "how much ›" : "answer ›"),
    chips: () => [...optionChips(start === null ? SELF_RATINGS.length : path.stages[stage ?? 0].check.options.length + 1), QUIT_CHIP],
    input: line => {
      if (isQuit(line)) {
        t.print(`{dim:check stopped. come back with} [[path check ${path.id}]]`);
        return t.exit();
      }
      if (start === null) {
        const picked = pickIndex(line, SELF_RATINGS.length);
        if (picked === null) return t.print(`{yellow:type a letter from a to ${letter(SELF_RATINGS.length - 1)}.}`);
        start = SELF_RATINGS[picked].start;
        return ask();
      }
      const q = path.stages[stage!].check;
      const picked = pickIndex(line, q.options.length + 1);
      if (picked === null) return t.print(`{yellow:type a letter from a to ${letter(q.options.length)}.}`);
      const right = picked === q.answer;
      answers.push({ stage: stage!, right });
      t.print(
        right
          ? "{green:correct.}"
          : `${picked === q.options.length ? "{yellow:no worries.}" : "{red:not quite.}"} it's **${letter(q.answer)}) ${q.options[q.answer]}**`,
      );
      t.print(`{dim:${q.why}}`);
      ask();
    },
  });
};

const path = (t: Term, args: string[]) => {
  const [first, second] = args;
  if (!first) return list(t);
  if (first === "next") {
    const mine = pathsFor(readPrefs()?.interests ?? []);
    const guide = readGuide();
    const checked = mine.filter(p => guide.checks[p.id]);
    if (!checked.length) return t.print(`{dim:you haven't taken a check yet.} ${mine[0] ? `[[start with ${mine[0].title}|path check ${mine[0].id}]]` : "[[see all paths|path]]"}`);
    checked.forEach((p, i) => {
      if (i) t.print("");
      printNext(t, p);
    });
    return;
  }
  if (first === "done") {
    const step = PATHS.flatMap(p => p.stages.flatMap(s => s.steps.map(st => ({ p, st })))).find(x => x.st.id === second);
    if (!step) return t.print("{red:which step?} open a roadmap with [[path]] and tap tick.");
    if (step.st.kind === "chapter") return t.print(`{dim:chapters tick themselves when you finish them.} [[read it|learn ${step.st.course} ${step.st.chapter}]]`);
    toggleStep(step.st.id);
    const nowDone = readGuide().done.includes(step.st.id);
    t.print(nowDone ? `{green:✓ ticked:} ${step.st.label}` : `{dim:unticked:} ${step.st.label}`);
    if (nowDone) printNext(t, step.p);
    return;
  }
  if (first === "check") {
    const target = findPath(second ?? "") ?? pathsFor(readPrefs()?.interests ?? [])[0];
    if (!target) return t.print("{red:which path?} see [[path]].");
    return check(t, target);
  }
  const target = findPath(first) ?? PATHS.find(p => p.label === first);
  if (!target) return t.print(`{red:no path called} ${first}. see [[path]].`);
  show(t, target);
};

export const pathCommands: Command[] = [
  {
    name: "path",
    aliases: ["paths", "roadmap", "guide"],
    usage: "path [name|check <name>|next]",
    about: "roadmaps for your interests, a skill check and your next steps",
    group: "learn",
    run: path,
    complete: args => (args.length <= 1 ? [...PATHS.map(p => p.id), "check", "next"] : args[0] === "check" ? PATHS.map(p => p.id) : []),
  },
];
