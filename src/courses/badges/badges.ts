import { COURSES } from "../data";
import { GAMES } from "../games/games";

export type BadgeStats = {
  totalDone: number;
  daysLearned: number;
  /** Finished chapters per course id */
  doneByCourse: Record<string, number>;
  gamesPlayed: number;
  debitCreditBest: number;
  labsPassed: number;
  perfectQuiz: boolean;
  examPassed: boolean;
  storiesSeen: number;
};

export type Badge = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  tier: "bronze" | "silver" | "gold";
  /** How to earn it */
  how: string;
  /** First-person line for the share caption */
  brag: string;
  hashtag: string;
  /** Where to go to earn it */
  go: string;
  /** Current value and the goal, for the progress bar */
  progress: (s: BadgeStats) => [number, number];
};

const COURSE_BADGES: Record<string, { name: string; emoji: string }> = {
  networking: { name: "packet pusher", emoji: "📡" },
  accounting: { name: "balance boss", emoji: "⚖️" },
  databases: { name: "query whisperer", emoji: "🗄️" },
  money: { name: "money mover", emoji: "💸" },
  marketing: { name: "hook master", emoji: "🪝" },
};

export const BADGES: Badge[] = [
  {
    id: "first-step",
    name: "first step",
    emoji: "👣",
    color: "#ffd166",
    tier: "bronze",
    how: "finish your first chapter",
    brag: "i just finished my first chapter",
    hashtag: "learning",
    go: "#/feed/courses",
    progress: s => [s.totalDone, 1],
  },
  {
    id: "on-a-roll",
    name: "on a roll",
    emoji: "🔥",
    color: "#ff8a3d",
    tier: "silver",
    how: "learn something on 3 different days",
    brag: "i've been learning something new on 3 different days",
    hashtag: "consistency",
    go: "#/feed/courses",
    progress: s => [s.daysLearned, 3],
  },
  {
    id: "curious-mind",
    name: "curious mind",
    emoji: "🧭",
    color: "#b49bff",
    tier: "silver",
    how: "finish a chapter in 4 different courses",
    brag: "i've explored 4 different subjects, from networks to money",
    hashtag: "curiosity",
    go: "#/feed/courses",
    progress: s => [Object.values(s.doneByCourse).filter(n => n > 0).length, 4],
  },
  ...COURSES.map<Badge>(course => ({
    id: `course-${course.id}`,
    name: COURSE_BADGES[course.id]?.name ?? `${course.label} grad`,
    emoji: COURSE_BADGES[course.id]?.emoji ?? "🎒",
    color: course.color,
    tier: "gold",
    how: `finish every chapter of ${course.title}`,
    brag: `i finished the whole "${course.title}" course`,
    hashtag: course.label,
    go: `#/feed/courses/${course.id}`,
    progress: s => [s.doneByCourse[course.id] ?? 0, course.chapters.length],
  })),
  {
    id: "lab-rat",
    name: "lab rat",
    emoji: "🧪",
    color: "#5ff0b5",
    tier: "silver",
    how: "pass a cisco packet tracer lab in the networking academy",
    brag: "i built a real network in cisco packet tracer and it passed",
    hashtag: "networking",
    go: "#/academy",
    progress: s => [s.labsPassed, 1],
  },
  {
    id: "quiz-ace",
    name: "quiz ace",
    emoji: "🎯",
    color: "#ff5fa2",
    tier: "silver",
    how: "score 100% on any networking academy quiz",
    brag: "i scored 100% on a networking quiz",
    hashtag: "networking",
    go: "#/academy",
    progress: s => [s.perfectQuiz ? 1 : 0, 1],
  },
  {
    id: "network-pro",
    name: "network pro",
    emoji: "🛰️",
    color: "#4f8cff",
    tier: "gold",
    how: "pass every quiz and lab, then the networking academy final challenge",
    brag: "i passed the networking academy final challenge, labs and all",
    hashtag: "networking",
    go: "#/academy",
    progress: s => [s.examPassed ? 1 : 0, 1],
  },
  {
    id: "player-one",
    name: "player one",
    emoji: "🎮",
    color: "#4cc9f0",
    tier: "bronze",
    how: "play 3 different games",
    brag: "i've been learning by playing games",
    hashtag: "gamifiedlearning",
    go: "#/feed/games",
    progress: s => [s.gamesPlayed, 3],
  },
  {
    id: "arcade-legend",
    name: "arcade legend",
    emoji: "🕹️",
    color: "#c084fc",
    tier: "gold",
    how: `play all ${GAMES.length} games`,
    brag: `i played all ${GAMES.length} learning games`,
    hashtag: "gamifiedlearning",
    go: "#/feed/games",
    progress: s => [s.gamesPlayed, GAMES.length],
  },
  {
    id: "double-entry",
    name: "double entry",
    emoji: "📒",
    color: "#ffb547",
    tier: "silver",
    how: "score 8/10 or more in \"debit or credit?\"",
    brag: "i can tell a debit from a credit (8/10 or better!)",
    hashtag: "accounting",
    go: "#/feed/games/debit-or-credit",
    progress: s => [s.debitCreditBest, 8],
  },
  {
    id: "in-the-loop",
    name: "in the loop",
    emoji: "📰",
    color: "#38bdf8",
    tier: "bronze",
    how: "watch 25 story slides",
    brag: "i've been keeping up with the daily stories",
    hashtag: "dailylearning",
    go: "#/feed",
    progress: s => [s.storiesSeen, 25],
  },
];

export const findBadge = (id: string) => BADGES.find(b => b.id === id);

export const badgeHash = (id?: string) => (id ? `#/feed/badges/${id}` : "#/feed/badges");
