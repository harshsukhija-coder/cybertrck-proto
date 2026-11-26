import { MODULES } from "../courses/academy/content";
import { BADGES } from "../courses/badges/badges";
import { COURSES } from "../courses/data";
import { GAMES } from "../courses/games/games";
import { SECTORS } from "../courses/stories/sources";
import { MISSIONS } from "./missions-data";

/** A pretend file system, so learners can explore with ls / cd and open things */
export type FsNode = {
  name: string;
  children?: FsNode[];
  /** Command that runs when the file is opened */
  open?: string;
  about?: string;
};

const two = (n: number) => String(n).padStart(2, "0");

const build = (): FsNode => ({
  name: "~",
  children: [
    { name: "readme.txt", open: "help", about: "start here" },
    { name: "feed.sh", open: "feed", about: "your personal feed" },
    {
      name: "courses",
      about: "bite-sized courses",
      children: COURSES.map(course => ({
        name: course.id,
        about: course.title,
        children: course.chapters.map(ch => ({ name: `${two(ch.number)}-${ch.id}.lesson`, open: `learn ${course.id} ${ch.number}`, about: ch.title })),
      })),
    },
    {
      name: "academy",
      about: "networking academy: blogs, quizzes, labs",
      children: [
        ...MODULES.map(m => ({
          name: `${m.number}-${m.id}`,
          about: m.title,
          children: m.lessons.map((l, i) => ({
            name: `${i + 1}-${l.id}.${l.kind === "article" ? "md" : l.kind}`,
            open: l.kind === "article" ? `read ${m.number}.${i + 1}` : `${l.kind} ${m.number}`,
            about: l.title,
          })),
        })),
        { name: "final-challenge.quiz", open: "final", about: "the last step of the academy" },
      ],
    },
    { name: "games", about: "learning games", children: GAMES.map(g => ({ name: `${g.id}.game`, open: `play ${g.id}`, about: g.title })) },
    { name: "stories", about: "daily facts from free APIs", children: SECTORS.map(s => ({ name: `${s.id}.story`, open: `stories ${s.id}`, about: s.label })) },
    { name: "badges", about: "badges you can earn and share", children: BADGES.map(b => ({ name: `${b.id}.badge`, open: `badge ${b.id}`, about: b.name })) },
    {
      name: "missions",
      about: "story missions from the classic desktop",
      children: MISSIONS.map(m => ({
        name: m.id,
        about: m.title,
        children: m.chapters.map((ch, i) => ({ name: `${i + 1}-chapter.mission`, open: `mission ${m.id} ${i + 1}`, about: ch.title })),
      })),
    },
  ],
});

let root: FsNode | null = null;
export const fsRoot = () => (root ??= build());

/** Turns "../games" or "~/courses" into a clean absolute path like "~/games" */
export const resolvePath = (cwd: string, target = "~") => {
  const parts = target.startsWith("~") ? [] : cwd.split("/").slice(1);
  for (const p of target.replace(/^~\/?/, "").split("/")) {
    if (!p || p === ".") continue;
    if (p === "..") parts.pop();
    else parts.push(p);
  }
  return ["~", ...parts].join("/");
};

export const nodeAt = (path: string): FsNode | undefined => {
  let node: FsNode | undefined = fsRoot();
  for (const p of path.split("/").slice(1)) node = node?.children?.find(c => c.name === p);
  return node;
};

/** Every path below the cwd that starts with the typed text, for tab completion */
export const completePath = (cwd: string, typed: string) => {
  const slash = typed.lastIndexOf("/");
  const dirPart = slash >= 0 ? typed.slice(0, slash + 1) : "";
  const dir = nodeAt(resolvePath(cwd, dirPart || "."));
  return (dir?.children ?? []).map(c => `${dirPart}${c.name}${c.children ? "/" : ""}`);
};
