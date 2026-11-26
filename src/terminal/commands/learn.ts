import { readBadges } from "../../courses/badges/use-badges";
import { ALL_CHAPTERS, COURSES, findCourse } from "../../courses/data";
import { buildFeed, interestLabel, type FeedItem } from "../../courses/feed-build";
import { pathStatus, readGuide } from "../../courses/guide/guide-store";
import { getLivePosts, markLiveSeen } from "../../courses/live/live-feed";
import type { LivePost } from "../../courses/live/live-sources";
import { POLLS } from "../../courses/feed-extras";
import { INTERESTS, PACES, STYLES, readPrefs, savePrefs, type InterestId, type Prefs } from "../../courses/prefs";
import { markDone, readProgress, summarizeProgress } from "../../courses/progress";
import type { Story } from "../../courses/stories/sources";
import { getStories, markSeen, readSeen } from "../../courses/stories/use-stories";
import type { Course, CourseChapter, LessonSlide } from "../../courses/types";
import { NEXT_CHIP, QUIT_CHIP, bar, isQuit, optionChips, pickIndex, plural, printOptions, rule, table } from "../format";
import type { Command, Term } from "../term";

const learning = () => summarizeProgress(readProgress());

// ---------- courses and lessons ----------

const findChapter = (course: Course, ref?: string) => {
  if (!ref) return undefined;
  return /^\d+$/.test(ref) ? course.chapters.find(ch => ch.number === Number(ref)) : course.chapters.find(ch => ch.id === ref);
};

const nextAfter = (course: Course, chapter: CourseChapter) => {
  const i = course.chapters.indexOf(chapter);
  if (i < course.chapters.length - 1) return { course, chapter: course.chapters[i + 1] };
  const nextCourse = COURSES[(COURSES.indexOf(course) + 1) % COURSES.length];
  return { course: nextCourse, chapter: nextCourse.chapters[0] };
};

const listCourses = (t: Term) => {
  const p = learning();
  t.print(rule("courses"));
  for (const course of COURSES) {
    const done = p.doneIn(course);
    t.print("");
    t.print(`[[{${course.color}:●} **${course.title}**|learn ${course.id}]]`);
    t.print(`  {dim:${course.tagline}}`);
    t.print(`  {${course.color}:${bar(done, course.chapters.length, 12)}} ${done}/${course.chapters.length}  [[${done ? "continue" : "start"} →|learn ${course.id} ${p.nextIn(course).number}]]`);
  }
  t.print("");
  t.print("{dim:there's also the networking academy with real labs:} [[academy]]");
};

const listChapters = (t: Term, course: Course) => {
  const p = learning();
  t.print(rule(course.title, course.color));
  t.print(`{dim:${course.tagline}}`);
  t.print("");
  for (const ch of course.chapters) {
    const done = p.isDone(course.id, ch.id);
    t.print(`${done ? "{green:✓}" : "{dim:○}"} [[${String(ch.number).padStart(2)}. ${ch.title}|learn ${course.id} ${ch.number}]] {dim:· ${ch.minutes} min}`);
    t.print(`     {dim:${ch.hook}}`);
  }
};

const showSlide = (t: Term, slide: LessonSlide, hl: string) => {
  t.print("");
  switch (slide.kind) {
    case "text":
      t.print(`{${hl}:▍}**${slide.title}**`);
      t.print(slide.body);
      break;
    case "stat":
      t.print(`{dim:FUN FACT}`);
      t.block([`{${hl}:${slide.big}}`]);
      t.print(slide.body);
      break;
    case "story":
      t.print(`{${hl}:◆ the story · ${slide.scene}}`);
      t.print(slide.body, { bar: hl });
      if (slide.say) t.print(`{${hl}:riya ›} "${slide.say}"`);
      break;
    case "table": {
      t.print(`**${slide.title}**`);
      const rows = slide.rows.map(([a, b]) => [a, b]);
      if (slide.total) rows.push([`**${slide.total[0]}**`, `**${slide.total[1]}**`]);
      t.block(table(slide.head, rows));
      if (slide.note) t.print(`{dim:${slide.note}}`);
      break;
    }
    case "quiz":
      t.print(`{${hl}:QUICK CHECK}`);
      t.print(`**${slide.q}**`);
      printOptions(t, slide.options);
      break;
  }
};

const startLesson = (t: Term, course: Course, chapter: CourseChapter) => {
  const hl = chapter.duo[1];
  const slides = chapter.lesson;
  let index = -1;
  let waitingForAnswer = false;

  t.print("");
  t.print(rule(`${course.title} · chapter ${chapter.number}`, course.color));
  t.print(`**${chapter.title}**`);
  t.print(`{${hl}:${chapter.hook}}`);
  t.print(`{dim:${chapter.minutes} min · ${slides.length} cards · press enter to go on, q to stop}`);

  const finish = () => {
    markDone(course.id, chapter.id, chapter.minutes);
    const next = nextAfter(course, chapter);
    t.print("");
    t.print(`{green:**done ✓**} +${chapter.minutes} min learned. you now know more about **${chapter.title}** than most people.`);
    t.print(`{dim:up next:} [[${next.chapter.title}|learn ${next.course.id} ${next.chapter.number}]] {dim:(${next.course.title})}`);
    t.exit();
  };

  const advance = () => {
    index++;
    if (index >= slides.length) return finish();
    const slide = slides[index];
    showSlide(t, slide, hl);
    waitingForAnswer = slide.kind === "quiz";
  };

  t.start({
    name: "lesson",
    prompt: () => `${course.label} [${Math.max(0, index + 1)}/${slides.length}] ${waitingForAnswer ? "answer" : "↵"} ›`,
    chips: () => (waitingForAnswer ? [...optionChips((slides[index] as { options: string[] }).options.length), QUIT_CHIP] : [NEXT_CHIP, QUIT_CHIP]),
    input: line => {
      if (isQuit(line)) {
        t.print("{dim:lesson paused. come back with} [[learn " + `${course.id} ${chapter.number}]]`);
        return t.exit();
      }
      if (!waitingForAnswer) return advance();
      const slide = slides[index];
      if (slide.kind !== "quiz") return;
      const picked = pickIndex(line, slide.options.length);
      if (picked === null) return t.print(`{yellow:type a letter from a to ${String.fromCharCode(96 + slide.options.length)}.}`);
      const right = picked === slide.answer;
      t.print(right ? "{green:nailed it 🎉}" : `{red:not quite.} the answer is **${String.fromCharCode(97 + slide.answer)}) ${slide.options[slide.answer]}**`);
      t.print(`{dim:${slide.why}}`);
      waitingForAnswer = false;
      t.print("{dim:press enter to go on}");
    },
  });
};

const learn = (t: Term, args: string[]) => {
  if (!args[0]) {
    const p = learning();
    const last = p.lastDone?.split("/")[0];
    const course = findCourse(last ?? "") ?? COURSES[0];
    t.print(`{dim:picking up where you left off in} **${course.title}**. see all with [[courses]].`);
    return startLesson(t, course, p.nextIn(course));
  }
  const course = findCourse(args[0]) ?? COURSES.find(c => c.label === args[0]);
  if (!course) {
    const hit = ALL_CHAPTERS.find(x => x.chapter.id === args[0]);
    if (hit) return startLesson(t, hit.course, hit.chapter);
    return t.print(`{red:no course called} ${args[0]}. see [[courses]].`);
  }
  if (!args[1]) return listChapters(t, course);
  const chapter = findChapter(course, args[1]);
  if (!chapter) return t.print(`{red:${course.title} has no chapter} ${args[1]}. see [[learn ${course.id}]].`);
  startLesson(t, course, chapter);
};

// ---------- feed ----------

const PAGE = 6;
let feedState: { key: string; page: number; live: LivePost[] | null } = { key: "", page: 0, live: null };

const nextBadge = () =>
  readBadges()
    .filter(b => !b.earnedAt)
    .sort((a, b) => b.value / b.goal - a.value / a.goal)[0];

const showItem = (t: Term, item: FeedItem) => {
  t.print("");
  const reason = "reason" in item && item.reason ? `  {dim:· ${item.reason}}` : "";
  switch (item.kind) {
    case "chapter": {
      const { course, chapter } = item;
      t.print(`{${course.color}:@${course.handle}}${reason}`);
      t.print(`**${chapter.title}**  {dim:♥ ${chapter.likes.toLocaleString("en-US")}}`);
      t.print(chapter.caption);
      t.print(`[[▶ read it (${chapter.minutes} min)|learn ${course.id} ${chapter.number}]]`);
      break;
    }
    case "game":
      t.print(`{cyan:🎮 game}${reason}`);
      t.print(`**${item.game.title}**  {dim:${item.game.plays.toLocaleString("en-US")} plays}`);
      t.print(item.game.caption);
      t.print(`[[▶ play|play ${item.game.id}]]`);
      break;
    case "poll":
      t.print(`{pink:📊 poll}${reason}`);
      t.print(`**${item.poll.q}**`);
      item.poll.options.forEach((o, i) => t.print(`  [[${String.fromCharCode(97 + i)}|vote ${item.poll.id} ${i + 1}]]  ${o}`));
      break;
    case "fact":
      t.print(`{orange:💡 did you know}${reason}`);
      t.block([`{${item.fact.duo[1]}:${item.fact.big}}`]);
      t.print(`**${item.fact.line}**`);
      t.print(`{dim:${item.fact.sub}}`);
      break;
    case "live": {
      // Text from the web goes in as plain segments so stray brackets or asterisks can't break the markup
      const p = item.post;
      t.segs([
        { text: `● ${p.source}`, color: p.color },
        { text: ` · live${p.author ? ` · by ${p.author}` : ""}${item.reason ? ` · ${item.reason}` : ""}`, tone: "dim" },
      ]);
      t.segs([{ text: p.kicker, tone: "dim" }]);
      t.segs([{ text: p.title, bold: true, tone: "fg" }]);
      if (p.stat) t.segs([{ text: p.stat.value, color: p.color }, { text: ` ${p.stat.label}`, tone: "dim" }]);
      if (p.image) t.image(p.image, p.title);
      if (p.body) t.segs([{ text: p.body }]);
      t.segs([{ text: `↗ ${p.linkLabel}`, href: p.link }]);
      markLiveSeen(p.id);
      break;
    }
    case "guide": {
      const { path } = item;
      const s = pathStatus(path, readGuide());
      t.print(`{${path.color}:🧭 your roadmap · ${path.title}}${reason}`);
      if (!s.checked) {
        t.print(`**how much do you know about ${path.title}?** answer a few quick questions and get your next steps.`);
        t.print(`[[▶ take the 1-minute check|path check ${path.id}]]`);
      } else if (!s.next.length) {
        t.print(`{green:path complete 🏆} [[see it|path ${path.id}]]`);
      } else {
        t.print(`stage ${s.stage + 1}/${path.stages.length}: **${path.stages[s.stage].name}**  {${path.color}:${bar(s.stepsDone, s.stepsTotal, 10)}} {dim:${s.stepsDone}/${s.stepsTotal} steps}`);
        t.print(`{dim:next:} ${s.next[0].label}`);
        t.print(`[[▶ my next steps|path next]]  [[full roadmap|path ${path.id}]]`);
      }
      break;
    }
    case "courses":
      t.print(`{accent:📚 ${COURSES.length} courses, ${ALL_CHAPTERS.length} chapters.} pick one: [[courses]]`);
      break;
    case "academy":
      t.print("{blue:🎓 networking academy:} blogs, quizzes and real cisco packet tracer labs. [[academy]]");
      break;
    case "badge": {
      const b = nextBadge();
      if (b) t.print(`{yellow:🏅 next badge:} ${b.badge.emoji} **${b.badge.name}**. ${b.badge.how}. ${b.value}/${b.goal} [[badges]]`);
      break;
    }
  }
};

const feed = async (t: Term, args: string[]) => {
  const prefs = readPrefs();
  if (!prefs) {
    t.print("{yellow:first, tell me what you're into.} it takes 20 seconds.");
    return startVibe(t, () => void feed(t, args));
  }
  const filter = (INTERESTS.find(i => i.id === args.find(a => a !== "more" && a !== "refresh"))?.id ?? null) as InterestId | null;
  const key = `${filter}`;
  const refresh = args.includes("refresh");
  if (args.includes("more") && feedState.key === key && !refresh) feedState.page++;
  else feedState = { key, page: 0, live: feedState.key === key && !refresh ? feedState.live : null };
  if (!feedState.live) {
    t.print("{dim:fetching live posts for your interests…}");
    feedState.live = await getLivePosts(filter ? [filter] : prefs.interests, refresh);
  }
  const items = buildFeed(prefs, filter, feedState.live);
  const page = items.slice(feedState.page * PAGE, (feedState.page + 1) * PAGE);
  if (!feedState.page) {
    const hour = new Date().getHours();
    t.print(`${hour < 12 ? "good morning" : hour < 18 ? "good afternoon" : "good evening"}, {accent:${t.username}}. here's your feed${filter ? ` for **${interestLabel(filter)}**` : ""}.`);
    t.print(`{dim:filter:} ${prefs.interests.map(i => `[[${i}|feed ${i}]]`).join(" ")} [[all|feed]]`);
  }
  if (!page.length) {
    t.print("{dim:you've reached the end. that's everything for now.} [[feed]]");
    return;
  }
  page.forEach(item => showItem(t, item));
  t.print("");
  t.print(`{dim:${Math.min(items.length, (feedState.page + 1) * PAGE)}/${items.length}} [[more ↓|feed ${filter ? `${filter} ` : ""}more]]  [[↻ refresh|feed ${filter ? `${filter} ` : ""}refresh]]  [[stories]]`);
};

const vote = (t: Term, args: string[]) => {
  const poll = POLLS.find(p => p.id === args[0]);
  if (!poll) return t.print("{red:which poll?} you'll find them in your [[feed]].");
  const picked = pickIndex(args[1] ?? "", poll.options.length);
  if (picked === null) return t.print(`{red:pick an option from 1 to ${poll.options.length}.}`);
  t.print(`**${poll.q}**`);
  poll.options.forEach((o, i) => {
    const mark = i === poll.answer ? "{green:✓}" : i === picked ? "{red:✕}" : " ";
    t.print(`${mark} {${i === poll.answer ? "green" : "dim"}:${bar(poll.votes[i], 100, 10)}} ${String(poll.votes[i]).padStart(2)}%  ${o}`);
  });
  t.print(picked === poll.answer ? "{green:you got it.}" : "{yellow:most people miss this one too.}");
  t.print(`{dim:${poll.why}}`);
};

// ---------- stories ----------

const unseenIn = (story: Story, seen: Set<string>) => story.slides.filter(s => !seen.has(s.id)).length;

const playStory = (t: Term, stories: Story[], startAt: number) => {
  let si = startAt;
  const seen = new Set(readSeen());
  let slide = stories[si].slides.findIndex(s => !seen.has(s.id));
  if (slide < 0) slide = 0;
  let trivia: { options: string[]; answer: number } | undefined;

  const show = () => {
    const story = stories[si];
    const s = story.slides[slide];
    if (slide === 0 || slide === story.slides.findIndex(x => !seen.has(x.id))) {
      t.print("");
      t.print(rule(`${story.label} · ${story.slides.length} slides`, story.color));
    }
    t.print("");
    t.segs([{ text: s.kicker.toUpperCase(), color: story.color }]);
    t.segs([{ text: s.title, bold: true, tone: "fg" }]);
    if (s.image) t.image(s.image.src, s.title, s.image.credit);
    if (s.stat) t.segs([{ text: `${s.stat.value} `, color: story.color, bold: true }, { text: s.stat.label, tone: "muted" }]);
    if (s.body) t.segs([{ text: s.body }]);
    if (s.list) t.block(table(undefined, s.list.map(row => [row.label.replace(/[[\]{}]/g, ""), row.value.replace(/[[\]{}]/g, "")])));
    trivia = s.trivia;
    if (s.trivia) printOptions(t, s.trivia.options);
    t.segs([{ text: `source: ${s.source}  `, tone: "dim" }, ...(s.link ? [{ text: s.link.label, href: s.link.href }] : [])]);
    markSeen(s.id);
    seen.add(s.id);
  };

  const advance = () => {
    slide++;
    if (slide >= stories[si].slides.length) {
      si++;
      slide = 0;
      if (si >= stories.length) {
        t.print("");
        t.print("{green:you're all caught up.} new facts land every day. 👀");
        return t.exit();
      }
    }
    show();
  };

  t.start({
    name: "stories",
    prompt: () => (trivia ? `${stories[si].label} · answer ›` : `${stories[si].label} [${slide + 1}/${stories[si].slides.length}] ↵ ›`),
    chips: () => (trivia ? [...optionChips(trivia.options.length), QUIT_CHIP] : [NEXT_CHIP, { label: "skip story", send: "s" }, QUIT_CHIP]),
    input: line => {
      if (isQuit(line)) return t.exit();
      if (trivia) {
        const picked = pickIndex(line, trivia.options.length);
        if (picked === null) return t.print("{yellow:pick a letter, or press enter to skip.}");
        t.print(picked === trivia.answer ? "{green:correct! 🎉}" : `{red:nope.} it was **${trivia.options[trivia.answer]}**`);
        trivia = undefined;
        return;
      }
      if (line.toLowerCase() === "s") slide = stories[si].slides.length;
      advance();
    },
  });
  show();
};

const stories = async (t: Term, args: string[]) => {
  t.print("{dim:fetching today's stories…}");
  const all = await getStories();
  if (!all.length) return t.print("{red:couldn't reach the story APIs.} check your internet and try again.");
  const seen = new Set(readSeen());
  const prefs = readPrefs();
  const ordered = [...all].sort(
    (a, b) =>
      Number(!unseenIn(a, seen)) - Number(!unseenIn(b, seen)) ||
      b.interests.filter(i => prefs?.interests.includes(i)).length - a.interests.filter(i => prefs?.interests.includes(i)).length,
  );
  const wanted = args[0];
  if (wanted && wanted !== "all") {
    const i = ordered.findIndex(s => s.id === wanted);
    if (i < 0) return t.print(`{red:no story called} ${wanted}.`);
    return playStory(t, ordered, i);
  }
  if (wanted === "all") return playStory(t, ordered, 0);
  t.print(rule("stories"));
  for (const s of ordered) {
    const fresh = unseenIn(s, seen);
    t.print(`${fresh ? `{${s.color}:●}` : "{dim:○}"} [[${s.label}|stories ${s.id}]] {dim:· ${fresh ? `${fresh} new` : "all seen"} · ${plural(s.slides.length, "slide")}}`);
  }
  t.print("");
  t.print("[[▶ watch everything new|stories all]]");
};

// ---------- preferences ----------

const startVibe = (t: Term, then?: () => void) => {
  const current = readPrefs();
  let step = 0;
  const draft: Prefs = { interests: [], styles: [], pace: "daily" };

  const ask = () => {
    t.print("");
    if (step === 0) {
      t.print("**1/3 what are you into?** {dim:type numbers, like} `1 3 5`");
      INTERESTS.forEach((i, n) => t.print(`  {dim:${String(n + 1).padStart(2)}} {${i.color}:${i.label}} {dim:· ${i.hint}}`));
    } else if (step === 1) {
      t.print("**2/3 how do you like to learn?** {dim:pick one or more}");
      STYLES.forEach((s, n) => t.print(`  {dim:${n + 1}} ${s.label}`));
    } else {
      t.print("**3/3 how much time a day?**");
      PACES.forEach((p, n) => t.print(`  {dim:${n + 1}} ${p.label}`));
    }
  };

  const numbers = (line: string, max: number) => [...new Set(line.split(/[\s,]+/).map(Number).filter(n => n >= 1 && n <= max))];

  t.print(current ? `{dim:right now you're into:} ${current.interests.map(interestLabel).join(", ")}` : "{accent:let's set up your feed.}");
  t.start({
    name: "vibe",
    prompt: () => `vibe ${step + 1}/3 ›`,
    chips: () => (step === 0 ? INTERESTS : step === 1 ? STYLES : PACES).map((_, n) => ({ label: String(n + 1), send: String(n + 1) })).concat(QUIT_CHIP),
    input: line => {
      if (isQuit(line)) return t.exit();
      if (step === 0) {
        const picked = numbers(line, INTERESTS.length);
        if (!picked.length) return t.print("{yellow:pick at least one number.}");
        draft.interests = picked.map(n => INTERESTS[n - 1].id);
      } else if (step === 1) {
        const picked = numbers(line, STYLES.length);
        if (!picked.length) return t.print("{yellow:pick at least one number.}");
        draft.styles = picked.map(n => STYLES[n - 1].id);
      } else {
        const [n] = numbers(line, PACES.length);
        if (!n) return t.print("{yellow:pick 1, 2 or 3.}");
        draft.pace = PACES[n - 1].id;
        savePrefs(draft);
        t.print(`{green:saved.} your feed now leans towards ${draft.interests.map(interestLabel).join(", ")}.`);
        t.exit();
        if (then) then();
        else t.print("see it with [[feed]].");
        return;
      }
      step++;
      ask();
    },
  });
  ask();
};

export const learnCommands: Command[] = [
  { name: "feed", aliases: ["home"], usage: "feed [topic] [more|refresh]", about: "your feed: our lessons, games and polls mixed with live posts from the web", group: "start here", run: feed, complete: () => [...INTERESTS.map(i => i.id), "more", "refresh"] },
  { name: "stories", aliases: ["story"], usage: "stories [topic|all]", about: "today's fun facts from free APIs", group: "start here", run: stories, complete: () => ["all", "today", "tech", "money", "marketing", "data", "security", "space", "fun"] },
  { name: "courses", usage: "courses", about: "every course and your progress", group: "learn", run: listCourses },
  {
    name: "learn",
    aliases: ["lesson"],
    usage: "learn [course] [chapter]",
    about: "read a chapter, card by card",
    group: "learn",
    run: learn,
    complete: args => (args.length <= 1 ? COURSES.map(c => c.id) : (findCourse(args[0])?.chapters.map(c => String(c.number)) ?? [])),
  },
  { name: "vote", usage: "vote <poll> <option>", about: "answer a poll from the feed", group: "learn", hidden: true, run: vote },
  { name: "vibe", aliases: ["prefs", "setup"], usage: "vibe", about: "change what your feed shows", group: "you", run: t => startVibe(t) },
];
