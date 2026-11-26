import { summarizeAcademy, readAcademy } from "../../courses/academy/academy-progress";
import { BADGES, type Badge } from "../../courses/badges/badges";
import { buildCaption, drawBadgeCard, formatDate, shareLinks } from "../../courses/badges/badge-share";
import { readBadges, saveUnlocked, type BadgeState } from "../../courses/badges/use-badges";
import { ALL_CHAPTERS, COURSES } from "../../courses/data";
import { readBest } from "../../courses/games/game-utils";
import { GAMES } from "../../courses/games/games";
import { PACES, readPrefs } from "../../courses/prefs";
import { readProgress, summarizeProgress } from "../../courses/progress";
import { bar, plural, rule } from "../format";
import type { Command, Term } from "../term";

const TIER = { bronze: "{orange:bronze}", silver: "{muted:silver}", gold: "{yellow:gold}" } as const;

const badgeLine = (b: BadgeState) => {
  const earned = Boolean(b.earnedAt);
  return `${earned ? b.badge.emoji : "{dim:🔒}"} [[${earned ? `{${b.badge.color}:**${b.badge.name}**}` : b.badge.name}|badge ${b.badge.id}]] {dim:${earned ? `· earned ${formatDate(b.earnedAt).toLowerCase()}` : `· ${b.value}/${b.goal}`}}`;
};

const listBadges = (t: Term) => {
  const list = readBadges();
  const earned = list.filter(b => b.earnedAt);
  t.print(rule(`badges · ${earned.length}/${list.length}`));
  t.print(`{accent:${bar(earned.length, list.length, 20)}}`);
  if (earned.length) {
    t.print("");
    t.print("{green:earned}");
    earned.forEach(b => t.print(badgeLine(b)));
  }
  const locked = list.filter(b => !b.earnedAt).sort((a, b) => b.value / b.goal - a.value / a.goal);
  if (locked.length) {
    t.print("");
    t.print("{dim:still to earn (closest first)}");
    locked.forEach(b => t.print(badgeLine(b)));
  }
  t.print("");
  t.print("{dim:tap a badge to see how to earn it, or to share it.}");
};

const goCommand = (badge: Badge) => {
  if (badge.go.startsWith("#/feed/games/")) return `play ${badge.go.split("/").pop()}`;
  if (badge.go.startsWith("#/feed/games")) return "games";
  if (badge.go.startsWith("#/feed/courses/")) return `learn ${badge.go.split("/").pop()}`;
  if (badge.go.startsWith("#/feed/courses")) return "courses";
  if (badge.go.startsWith("#/academy")) return "academy";
  return "stories";
};

const showBadge = (t: Term, args: string[]) => {
  const state = readBadges().find(b => b.badge.id === args[0]);
  if (!state) return listBadges(t);
  const { badge } = state;
  t.print("");
  t.block([`{${badge.color}:   ╭─────╮}`, `{${badge.color}:   │}  ${badge.emoji}  {${badge.color}:│}   **${badge.name}**`, `{${badge.color}:   ╰─────╯}   ${TIER[badge.tier]}`]);
  t.print(`{dim:how to earn:} ${badge.how}`);
  if (state.earnedAt) {
    t.print(`{green:✓ earned ${formatDate(state.earnedAt).toLowerCase()}}`);
    t.print(`[[share it →|share ${badge.id}]]`);
  } else {
    t.print(`{${badge.color}:${bar(state.value, state.goal)}} ${state.value}/${state.goal}`);
    t.print(`[[go earn it →|${goCommand(badge)}]]`);
  }
};

const share = async (t: Term, args: string[]) => {
  const state = readBadges().find(b => b.badge.id === args[0]);
  if (!state) {
    const earned = readBadges().filter(b => b.earnedAt);
    if (!earned.length) return t.print("{dim:you haven't earned a badge yet. finish a chapter to get your first one:} [[learn]]");
    t.print("which badge?");
    earned.forEach(b => t.print(`  [[${b.badge.emoji} ${b.badge.name}|share ${b.badge.id}]]`));
    return;
  }
  if (!state.earnedAt) return t.print(`{dim:🔒 ${state.badge.name} is still locked. ${state.badge.how}.}`);
  const caption = buildCaption(state.badge);
  if (args[1] === "image") {
    t.print("{dim:drawing your badge image…}");
    const blob = await drawBadgeCard(state.badge, t.username, state.earnedAt);
    const url = URL.createObjectURL(blob);
    t.image(url, `${state.badge.name} badge`);
    const a = document.createElement("a");
    a.href = url;
    a.download = `offtrck-${state.badge.id}.png`;
    a.click();
    return t.print(`{green:saved} offtrck-${state.badge.id}.png {dim:to your downloads. post it with the caption above.}`);
  }
  if (args[1] === "copy") {
    await navigator.clipboard.writeText(caption).catch(() => undefined);
    return t.print("{green:caption copied ✓} paste it anywhere.");
  }
  t.print(rule(`share · ${state.badge.name}`, state.badge.color));
  t.block(caption.split("\n").map(line => line.replace(/[{}[\]]/g, "")));
  t.print(`[[📋 copy caption|share ${state.badge.id} copy]]   [[🖼 download image|share ${state.badge.id} image]]`);
  t.segs(shareLinks(caption).flatMap(l => [{ text: `${l.label} ↗`, href: l.href }, { text: "   " }]));
  t.print("{dim:for instagram: download the image, copy the caption, then post both.}");
};

const stats = (t: Term) => {
  const p = summarizeProgress(readProgress());
  const a = summarizeAcademy(readAcademy());
  const prefs = readPrefs();
  const goal = PACES.find(x => x.id === prefs?.pace)?.minutes ?? 15;
  const badges = readBadges();
  const played = GAMES.filter(g => readBest(g.id) !== null);
  t.print(rule(`${t.username}'s stats`));
  t.print(`{accent:today}     ${bar(p.minutesToday, goal, 16)} ${p.minutesToday}/${goal} min`);
  t.print(`{accent:streak}    ${plural(p.daysLearned, "day")} of learning`);
  t.print(`{accent:chapters}  ${bar(p.totalDone, ALL_CHAPTERS.length, 16)} ${p.totalDone}/${ALL_CHAPTERS.length}`);
  for (const c of COURSES) t.print(`  {${c.color}:●} ${c.title} {dim:${p.doneIn(c)}/${c.chapters.length}}`, { indent: true });
  t.print(`{accent:academy}   ${bar(a.done, a.total, 16)} ${a.done}/${a.total}${a.examPassed ? " {green:· passed ✓}" : ""}`);
  t.print(`{accent:games}     ${bar(played.length, GAMES.length, 16)} ${played.length}/${GAMES.length} played`);
  t.print(`{accent:badges}    ${bar(badges.filter(b => b.earnedAt).length, BADGES.length, 16)} ${badges.filter(b => b.earnedAt).length}/${BADGES.length}`);
};

/** Shown after commands: celebrates badges unlocked since the last check */
export const announceBadges = (t: Term) => {
  for (const badge of saveUnlocked()) {
    t.print("");
    t.print(`{yellow:🏅 badge unlocked:} ${badge.emoji} {${badge.color}:**${badge.name}**}  {dim:${badge.how}}`, { bar: badge.color });
    t.print(`[[share it|share ${badge.id}]]  [[see all|badges]]`, { bar: badge.color });
  }
};

export const badgeCommands: Command[] = [
  { name: "badges", usage: "badges", about: "badges you earned and how to get the rest", group: "you", run: listBadges },
  { name: "badge", usage: "badge <name>", about: "one badge in detail", group: "you", hidden: true, run: showBadge, complete: () => BADGES.map(b => b.id) },
  { name: "share", usage: "share <badge>", about: "share a badge: caption, image and links", group: "you", run: share, complete: () => BADGES.map(b => b.id) },
  { name: "stats", aliases: ["me", "profile", "progress"], usage: "stats", about: "minutes, streak and progress everywhere", group: "you", run: stats },
  { name: "find", aliases: ["search", "grep"], usage: "find <word>", about: "search every chapter, game and badge", group: "files", run: (t, args) => search(t, args.join(" ")) },
];

const search = (t: Term, query: string) => {
  const q = query.toLowerCase().trim();
  if (!q) return t.print("{red:find what?} e.g. [[find dns]]");
  const hits: string[] = [];
  for (const { course, chapter } of ALL_CHAPTERS) {
    if (`${chapter.title} ${chapter.hook} ${chapter.caption}`.toLowerCase().includes(q)) hits.push(`📖 [[${chapter.title}|learn ${course.id} ${chapter.number}]] {dim:· ${course.title}}`);
  }
  for (const g of GAMES) if (`${g.title} ${g.tagline}`.toLowerCase().includes(q)) hits.push(`🎮 [[${g.title}|play ${g.id}]]`);
  for (const b of BADGES) if (`${b.name} ${b.how}`.toLowerCase().includes(q)) hits.push(`🏅 [[${b.name}|badge ${b.id}]]`);
  if (!hits.length) return t.print(`{dim:nothing matches "${query}".}`);
  t.print(`{dim:${plural(hits.length, "result")} for "${query}"}`);
  hits.slice(0, 20).forEach(h => t.print(h));
};
