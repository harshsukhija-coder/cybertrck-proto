import { readBadges } from "../../courses/badges/use-badges";
import { ALL_CHAPTERS } from "../../courses/data";
import { GAMES } from "../../courses/games/games";
import { GEMS, pickGem } from "../../courses/gems";
import { THEMES, currentTheme, setTheme } from "../../courses/theme-store";
import { readProgress, summarizeProgress } from "../../courses/progress";
import { columns, narrow, padEnd, plural, rule } from "../format";
import { completePath, nodeAt, resolvePath } from "../fs";
import type { Command, Term } from "../term";

const pathComplete = (args: string[], t: Term) => completePath(t.cwd, args.at(-1) ?? "");

const GEM_KEY = "offtrck.courses.gem";

export const LOGO = ["┌─┐┌─┐┌─┐┌┬┐┬─┐┌─┐┬┌─", "│ │├┤ ├┤  │ ├┬┘│  ├┴┐", "└─┘└  └   ┴ ┴└─└─┘┴ ┴"];

export const gemColor = () => (GEMS.find(g => g.id === localStorage.getItem(GEM_KEY)) ?? GEMS[0]).color;

/** Opens a file from the pretend file system */
const openPath = (t: Term, target: string) => {
  const path = resolvePath(t.cwd, target);
  const node = nodeAt(path);
  if (!node) {
    t.print(`{red:no such file:} ${target}. try [[ls]].`);
    return;
  }
  if (node.children) {
    t.cwd = path;
    t.refresh();
    return;
  }
  if (node.open) void t.run(node.open);
};

const listDir = (t: Term, target?: string, long = false) => {
  const path = resolvePath(t.cwd, target ?? ".");
  const node = nodeAt(path);
  if (!node) return t.print(`{red:ls: no such folder:} ${target}`);
  if (!node.children) return t.print(node.name);
  const rel = (name: string) => (target ? `${target.replace(/\/$/, "")}/${name}` : name);
  if (long || narrow()) {
    const width = Math.min(30, Math.max(...node.children.map(c => columns(c.name) + (c.children ? 1 : 0))));
    for (const c of node.children) {
      const name = c.children ? `{blue:${c.name}/}` : c.name;
      t.print(`[[${name}|${c.children ? `cd ${rel(c.name)}` : `open ${rel(c.name)}`}]]${" ".repeat(Math.max(1, width - columns(c.name) - (c.children ? 1 : 0)) + 1)} {dim:${c.about ?? ""}}`);
    }
    return;
  }
  t.segs(
    node.children.flatMap(c => [
      { text: c.children ? `${c.name}/` : c.name, tone: c.children ? ("blue" as const) : undefined, cmd: c.children ? `cd ${rel(c.name)}` : `open ${rel(c.name)}` },
      { text: "   " },
    ]),
  );
};

const tree = (t: Term, args: string[]) => {
  const root = resolvePath(t.cwd, args[0] ?? t.cwd);
  if (!nodeAt(root)?.children) {
    t.print(`{red:tree:} ${args[0]} is not a folder. try [[tree]].`);
    return;
  }
  const lines: string[] = [];
  const walk = (path: string, prefix: string, depth: number) => {
    const node = nodeAt(path);
    const kids = node?.children ?? [];
    kids.forEach((c, i) => {
      const lastOne = i === kids.length - 1;
      lines.push(`{dim:${prefix}${lastOne ? "└── " : "├── "}}${c.children ? `{blue:${c.name}/}` : c.name}`);
      if (c.children && depth < 1) walk(`${path}/${c.name}`, `${prefix}${lastOne ? "    " : "│   "}`, depth + 1);
    });
  };
  walk(root, "", 0);
  t.block([`{blue:${root}}`, ...lines]);
};

export const banner = (t: Term) => {
  const learning = summarizeProgress(readProgress());
  const badges = readBadges();
  const played = GAMES.filter(g => localStorage.getItem(`offtrck.games.best.${g.id}`) !== null).length;
  const info = [
    `{accent:${t.username}}{dim:@}{accent:offtrck}`,
    "{dim:─────────────────}",
    `{accent:courses}  ${learning.totalDone}/${ALL_CHAPTERS.length} chapters`,
    `{accent:games}    ${played}/${GAMES.length} played`,
    `{accent:badges}   ${badges.filter(b => b.earnedAt).length}/${badges.length} earned`,
    `{accent:streak}   ${plural(learning.daysLearned, "day")} of learning`,
    `{accent:today}    ${learning.minutesToday} min`,
  ];
  if (narrow()) t.block([...LOGO.map(l => `{accent:${l}}`), "", ...info]);
  else t.block(info.map((line, i) => `${padEnd(LOGO[i] ? `{accent:${LOGO[i]}}` : "", 25)}${line}`));
};

const GROUPS = ["start here", "learn", "play", "you", "files", "terminal"];

const help = (t: Term, args: string[]) => {
  if (args[0]) {
    const c = t.find(args[0]);
    if (!c) return t.print(`{red:no manual entry for} ${args[0]}`);
    t.segs([{ text: c.usage, tone: "accent" }]);
    t.print(c.about);
    if (c.aliases?.length) t.print(`{dim:also works as: ${c.aliases.join(", ")}}`);
    return;
  }
  const list = [...new Set(t.commands.values())].filter(c => !c.hidden);
  const width = Math.max(...list.map(c => columns(c.usage)));
  for (const group of GROUPS) {
    const inGroup = list.filter(c => c.group === group);
    if (!inGroup.length) continue;
    t.print("");
    t.print(rule(group));
    for (const c of inGroup) {
      if (narrow()) {
        t.segs([{ text: c.usage, cmd: c.name }]);
        t.segs([{ text: `  ${c.about}`, tone: "dim" }]);
      } else t.segs([{ text: c.usage, cmd: c.name }, { text: " ".repeat(width - columns(c.usage) + 2) }, { text: c.about, tone: "dim" }]);
    }
  }
  t.print("");
  t.print("{dim:tip: tap any underlined word to run it. press tab to complete, ↑ ↓ for history, ctrl+c to stop.}");
};

const GUI_ROUTES: Record<string, string> = {
  feed: "#/feed",
  home: "#/feed",
  learn: "#/feed/courses",
  courses: "#/feed/courses",
  games: "#/feed/games",
  badges: "#/feed/badges",
  paths: "#/feed/paths",
  path: "#/feed/paths",
  academy: "#/academy",
  desktop: "#/",
};

export const shellCommands: Command[] = [
  { name: "help", aliases: ["man", "?"], usage: "help [command]", about: "list every command, or explain one", group: "start here", run: help, complete: () => [] },
  {
    name: "welcome",
    aliases: ["neofetch"],
    usage: "welcome",
    about: "your learning summary",
    group: "start here",
    run: t => banner(t),
  },
  { name: "ls", aliases: ["dir", "ll"], usage: "ls [folder]", about: "see what's in a folder", group: "files", run: (t, args, raw) => listDir(t, args.find(a => !a.startsWith("-")), raw.includes("-l")), complete: pathComplete },
  {
    name: "cd",
    usage: "cd <folder>",
    about: "go into a folder (cd .. goes back)",
    group: "files",
    run: (t, args) => {
      const path = resolvePath(t.cwd, args[0] ?? "~");
      const node = nodeAt(path);
      if (!node) return t.print(`{red:cd: no such folder:} ${args[0]}`);
      if (!node.children) return t.print(`{red:cd: not a folder:} ${args[0]}. open it with [[open ${args[0]}]]`);
      t.cwd = path;
      t.refresh();
    },
    complete: pathComplete,
  },
  { name: "pwd", usage: "pwd", about: "where am i?", group: "files", run: t => t.print(t.cwd.replace("~", `/home/${t.username}`)) },
  { name: "tree", usage: "tree [folder]", about: "see the folder map", group: "files", run: tree, complete: pathComplete },
  {
    name: "open",
    aliases: ["cat", "run", "start", "less"],
    usage: "open <file>",
    about: "open a lesson, game, badge… from a folder",
    group: "files",
    run: (t, args) => (args[0] ? openPath(t, args.join(" ")) : t.print("{red:open what?} e.g. [[open readme.txt]]")),
    complete: pathComplete,
  },
  { name: "clear", aliases: ["cls"], usage: "clear", about: "clean the screen (or ctrl+l)", group: "terminal", run: t => t.clear() },
  {
    name: "history",
    usage: "history",
    about: "commands you ran before",
    group: "terminal",
    run: t => t.history.slice(-20).forEach((h, i, all) => t.print(`{dim:${String(t.history.length - all.length + i + 1).padStart(4)}}  [[${h}]]`)),
  },
  { name: "whoami", usage: "whoami", about: "your username", group: "terminal", run: t => t.print(t.username) },
  { name: "date", usage: "date", about: "today's date and time", group: "terminal", run: t => t.print(new Date().toString().slice(0, 24)) },
  { name: "echo", usage: "echo <text>", about: "print some text", group: "terminal", hidden: true, run: (t, _a, raw) => t.segs([{ text: raw }]) },
  {
    name: "theme",
    usage: "theme [look or colour]",
    about: "change the app's look (dark, light…) and highlight colour",
    group: "terminal",
    run: (t, args) => {
      const want = args[0]?.toLowerCase();
      const look = THEMES.find(x => x.id === want || (want === "light" && x.id === "paper") || (want === "dark" && x.id === "midnight"));
      if (look) {
        setTheme(look.id);
        return t.print(`app look set to {accent:${look.label}} (${look.about}). the terminal stays terminal-dark.`);
      }
      const gem = GEMS.find(g => g.id === want || g.name.toLowerCase() === want);
      if (!gem) {
        const now = currentTheme();
        t.print(`look {dim:(now ${now})}:`);
        t.print(`  ${THEMES.map(x => `[[${x.label}|theme ${x.id}]]`).join("  ")}`);
        t.print("highlight colour:");
        t.print(`  ${GEMS.map(g => `[[{${g.color}:●} ${g.name.toLowerCase()}|theme ${g.id}]]`).join("  ")}`);
        return;
      }
      pickGem(gem.id);
      t.accent = gem.color;
      t.print(`colour set to {accent:${gem.name.toLowerCase()}}. it's used in the app too.`);
    },
    complete: () => [...THEMES.map(x => x.id), ...GEMS.map(g => g.id)],
  },
  {
    name: "gui",
    aliases: ["ui", "modern", "app", "switch"],
    usage: "gui [page]",
    about: "switch to the modern ui (feed, learn, paths, games, badges, academy, desktop)",
    group: "start here",
    run: (t, args) => {
      const route = GUI_ROUTES[args[0] ?? "feed"];
      if (!route) return t.print(`{red:no page called} ${args[0]}. try ${Object.keys(GUI_ROUTES).map(k => `[[${k}|gui ${k}]]`).join(" ")}`);
      t.print("{dim:switching to the modern ui… come back any time from the menu (terminal mode).}");
      window.location.hash = route;
    },
    complete: () => Object.keys(GUI_ROUTES),
  },
  { name: "logout", aliases: ["exit"], usage: "logout", about: "sign out", group: "terminal", run: t => t.logout() },
  // a few jokes for the curious
  { name: "sudo", usage: "sudo", about: "", group: "terminal", hidden: true, run: t => t.print(`${t.username} is not in the sudoers file. this incident will be reported to friday. 🕵️`) },
  { name: "rm", usage: "rm", about: "", group: "terminal", hidden: true, run: t => t.print("{yellow:nice try.} your progress is safe. nothing was deleted. 😌") },
  { name: "chai", aliases: ["coffee", "tea"], usage: "chai", about: "", group: "terminal", hidden: true, run: t => t.block(["   ( (", "    ) )", "  ........", "  |      |]", "  \\      /", "   `----'", "", "{orange:☕ break time. riya's stall is open.}"]) },
  { name: "hack", usage: "hack", about: "", group: "terminal", hidden: true, run: t => t.print("{green:access granted.} just kidding. real hackers start with [[mission nmap]]. 😉") },
];

/** Lets people type a file name, or ./file, instead of `open file` */
export const openFallback = (t: Term, line: string) => {
  const target = line.replace(/^\.\//, "");
  const node = nodeAt(resolvePath(t.cwd, target));
  if (!node) return false;
  openPath(t, target);
  return true;
};

