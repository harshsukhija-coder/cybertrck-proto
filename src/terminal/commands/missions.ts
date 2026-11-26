import { loadProgress, saveProgress, type Progress } from "../../core/progress";
import { PASS_SCORE, isChoiceScene, speakers, type Choices, type Course, type StoryMessage, type TerminalBlock } from "../../core/story";
import { NEXT_CHIP, QUIT_CHIP, bar, isQuit, optionChips, pickIndex, printOptions, rule } from "../format";
import { MISSIONS, findMission } from "../missions-data";
import { parse, type Command, type Term } from "../term";

const termBlock = (t: Term, block: TerminalBlock, who = "kim") => {
  if (block.title) t.print(`{dim:${block.title}}`);
  t.block([`{green:${block.prompt ?? `${who}@kali:~$`}} ${block.command}`, ...(block.output?.split("\n") ?? [])]);
};

const CALLOUT = { tip: "green", warning: "yellow", danger: "red" } as const;

const showMessage = (t: Term, m: StoryMessage) => {
  const who = speakers[m.from];
  if (m.text) {
    if (m.from === "system") {
      const text = m.text.replace(/^\[profile\]\s*/, "{purple:profile ›} ");
      t.segs([{ text: "› ", tone: "dim" }, ...parse(text).map(s => (s.tone || s.color ? s : { ...s, tone: "dim" as const }))]);
    }
    else t.print(`{${who.color}:**${who.name}**} ${m.text}`);
  }
  if (m.image) t.image(m.image, m.caption ?? "", m.caption);
  if (m.terminal) termBlock(t, m.terminal, m.from === "you" ? "you" : "kim");
  if (m.dual?.kim) termBlock(t, m.dual.kim);
  if (m.dual?.sally) {
    const s = m.dual.sally;
    const detail = s.email ? `email from ${s.email.from}: "${s.email.subject}"` : s.browser ? `browser at ${s.browser.url}` : (s.note ?? s.title ?? s.mode);
    t.print(`{blue:sally's screen ›} ${detail}`);
  }
  if (m.visual) t.print(`{purple:📊 diagram:} ${m.visual.replace(/-/g, " ")} {dim:(see it drawn in the classic desktop)}`);
  if (m.callout) {
    const tone = CALLOUT[m.callout.tone];
    t.print(`{${tone}:**${m.callout.title}**}`, { bar: tone });
    t.print(m.callout.text, { bar: tone });
  }
};

const missionProgress = (course: Course, username: string) => {
  const p = loadProgress(course, username);
  const passedAll = p?.phase === "passed" && p.chapterIndex === course.chapters.length - 1;
  const done = p ? (passedAll ? course.chapters.length : p.chapterIndex) : 0;
  return { p, done };
};

const listMissions = (t: Term) => {
  t.print(rule("missions"));
  t.print("{dim:story-driven hacking lessons from the classic desktop. chat with friday, ramesh and kim, then pass the quiz.}");
  t.print("");
  for (const m of MISSIONS) {
    const { done } = missionProgress(m, t.username);
    t.print(`[[**${m.title}**|mission ${m.id}]] {dim:· ${m.badge}}`);
    t.print(`  {green:${bar(done, m.chapters.length, 10)}} ${done}/${m.chapters.length} chapters`);
  }
};

const playChapter = (t: Term, course: Course, chapterIndex: number, fromScene: number, choices: Choices) => {
  const chapter = course.chapters[chapterIndex];
  const queue: StoryMessage[] = [];
  let scene = fromScene;
  let pendingChoice: ReturnType<typeof choiceAt> = null;
  let quizIndex = -1;
  let correct = 0;
  let answered = false;

  const save = (patch: Partial<Progress>) =>
    saveProgress(course, t.username, { chapterIndex, nextScene: Math.max(1, Math.min(scene, chapter.scenes.length)), phase: "story", quizIndex: 0, correctCount: 0, choices, ...patch });

  function choiceAt(i: number) {
    const s = chapter.scenes[i];
    return s && isChoiceScene(s) ? s : null;
  }

  /** Puts the next scene's messages in the queue */
  const loadScene = () => {
    const s = chapter.scenes[scene];
    if (!s) return false;
    if (isChoiceScene(s)) {
      queue.push(...s.prompt);
      const saved = choices[s.key];
      if (saved !== undefined && s.options[saved]) queue.push({ from: "system", text: `showing: ${s.options[saved].label}` }, ...s.options[saved].messages);
      else pendingChoice = s;
    } else queue.push(...s);
    scene++;
    save({});
    return true;
  };

  const startQuiz = () => {
    const quiz = chapter.quiz ?? [];
    if (!quiz.length) return finish(true);
    quizIndex = 0;
    t.print("");
    t.print(rule(`chapter ${chapterIndex + 1} quiz · ${Math.ceil(PASS_SCORE * quiz.length)}/${quiz.length} to pass`));
    showQuestion();
  };

  const showQuestion = () => {
    const q = chapter.quiz![quizIndex];
    answered = false;
    t.print("");
    t.print(`{dim:${quizIndex + 1}/${chapter.quiz!.length}} **${q.question}**`);
    printOptions(t, q.options);
  };

  const finish = (passed: boolean) => {
    if (passed) {
      saveProgress(course, t.username, { chapterIndex, nextScene: chapter.scenes.length, phase: "passed", quizIndex: 0, correctCount: correct, choices });
      t.print("");
      t.print(`{green:**chapter ${chapterIndex + 1} passed ✓**} ${chapter.title}`);
      if (course.chapters[chapterIndex + 1]) t.print(`{dim:next:} [[chapter ${chapterIndex + 2} · ${course.chapters[chapterIndex + 1].title}|mission ${course.id} ${chapterIndex + 2}]]`);
      else t.print(`{yellow:🎉 you finished the ${course.title} mission!} [[missions]]`);
    } else {
      save({ nextScene: chapter.scenes.length });
      t.print(`{red:not quite.} you need ${Math.round(PASS_SCORE * 100)}%. [[try the quiz again|mission ${course.id} ${chapterIndex + 1} quiz]]`);
    }
    t.exit();
  };

  const step = () => {
    while (!queue.length) {
      if (pendingChoice) return;
      if (!loadScene()) return startQuiz();
    }
    showMessage(t, queue.shift()!);
    if (!queue.length && pendingChoice) {
      t.print("");
      printOptions(t, pendingChoice.options.map(o => o.label), true);
    }
  };

  t.print("");
  t.print(rule(`${course.title} · chapter ${chapterIndex + 1}`));
  t.print(`**${chapter.title}**  {dim:${chapter.subtitle}}`);
  t.print(fromScene ? `{dim:resuming at scene ${fromScene + 1}/${chapter.scenes.length}.}` : "{dim:press enter to read the next message. type} **skip** {dim:to show a whole scene,} **q** {dim:to pause.}");

  t.start({
    name: course.moduleName,
    prompt: () => {
      if (quizIndex >= 0) return answered ? "↵ next ›" : `quiz ${quizIndex + 1}/${chapter.quiz!.length} ›`;
      if (pendingChoice && !queue.length) return "choose ›";
      return `~/${course.moduleName} [${Math.min(scene, chapter.scenes.length)}/${chapter.scenes.length}] ↵ ›`;
    },
    chips: () => {
      if (quizIndex >= 0) return answered ? [NEXT_CHIP, QUIT_CHIP] : [...optionChips(chapter.quiz![quizIndex].options.length), QUIT_CHIP];
      if (pendingChoice && !queue.length) return [...optionChips(pendingChoice.options.length, true), QUIT_CHIP];
      return [NEXT_CHIP, { label: "skip scene", send: "skip" }, QUIT_CHIP];
    },
    input: line => {
      if (isQuit(line)) {
        t.print(`{dim:paused. continue any time with} [[mission ${course.id}]]`);
        return t.exit();
      }
      if (quizIndex >= 0) {
        const quiz = chapter.quiz!;
        if (answered) {
          quizIndex++;
          if (quizIndex < quiz.length) return showQuestion();
          return finish(correct / quiz.length >= PASS_SCORE);
        }
        const picked = pickIndex(line, quiz[quizIndex].options.length);
        if (picked === null) return t.print("{yellow:pick a letter.}");
        answered = true;
        if (picked === quiz[quizIndex].answer) correct++;
        t.print(picked === quiz[quizIndex].answer ? "{green:✓ correct}" : `{red:✕} it's **${quiz[quizIndex].options[quiz[quizIndex].answer]}**`);
        t.print(`{dim:${quiz[quizIndex].explanation}}`);
        return;
      }
      if (pendingChoice && !queue.length) {
        const picked = pickIndex(line, pendingChoice.options.length);
        if (picked === null) return t.print("{yellow:type the number of your choice.}");
        choices[pendingChoice.key] = picked;
        queue.push({ from: "system", text: `showing: ${pendingChoice.options[picked].label}` }, ...pendingChoice.options[picked].messages);
        pendingChoice = null;
        save({});
        return step();
      }
      if (line.toLowerCase() === "skip") {
        if (!queue.length && !pendingChoice && !loadScene()) return startQuiz();
        while (queue.length) showMessage(t, queue.shift()!);
        if (pendingChoice) printOptions(t, pendingChoice.options.map(o => o.label), true);
        return;
      }
      step();
    },
  });
  if (fromScene >= chapter.scenes.length) startQuiz();
  else step();
};

const mission = (t: Term, args: string[]) => {
  const course = findMission(args[0] ?? "");
  if (!course) return listMissions(t);
  const { p, done } = missionProgress(course, t.username);
  const choices = { ...(p?.choices ?? {}) };
  if (args[1]) {
    const n = Number(args[1]) - 1;
    if (!course.chapters[n]) return t.print(`{red:${course.title} has ${course.chapters.length} chapters.}`);
    if (n > done) return t.print(`{dim:🔒 finish chapter ${done + 1} first:} [[mission ${course.id} ${done + 1}]]`);
    return playChapter(t, course, n, args[2] === "quiz" ? course.chapters[n].scenes.length : 0, choices);
  }
  if (done >= course.chapters.length) {
    t.print(`{green:you finished ${course.title}.} replay a chapter:`);
    course.chapters.forEach((ch, i) => t.print(`  [[${i + 1}. ${ch.title}|mission ${course.id} ${i + 1}]]`));
    return;
  }
  playChapter(t, course, p?.chapterIndex ?? 0, p && p.phase === "story" ? Math.max(0, p.nextScene - 1) : p ? course.chapters[p.chapterIndex].scenes.length : 0, choices);
};

export const missionCommands: Command[] = [
  { name: "missions", usage: "missions", about: "hacking story missions (nmap, wifi, vpn…)", group: "learn", run: listMissions },
  { name: "mission", usage: "mission <name> [chapter]", about: "play a mission as a chat", group: "learn", hidden: true, run: mission, complete: () => MISSIONS.map(m => m.id) },
];
