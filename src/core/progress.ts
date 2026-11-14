import type { Choices, Course } from "./story";

export type SavedPhase = "story" | "quiz" | "failed" | "passed";

export type Progress = {
  chapterIndex: number;
  nextScene: number;
  phase: SavedPhase;
  quizIndex: number;
  correctCount: number;
  // Answers to choice scenes, like which os the learner uses
  choices: Choices;
};

// nmap keeps the original key so existing saves still resume
const storageKey = (course: Course, username: string) =>
  course.id === "nmap" ? `offtrck:progress:${username}` : `offtrck:progress:${course.id}:${username}`;

const isValid = (course: Course, progress: Progress) => {
  const chapter = course.chapters[progress.chapterIndex];
  if (!chapter) return false;
  if (progress.nextScene < 1 || progress.nextScene > chapter.scenes.length) return false;
  if (progress.phase === "quiz" || progress.phase === "failed") {
    const quizLength = chapter.quiz?.length ?? 0;
    return progress.quizIndex >= 0 && progress.quizIndex < quizLength && progress.correctCount <= progress.quizIndex + 1;
  }
  return true;
};

export const loadProgress = (course: Course, username: string): Progress | null => {
  try {
    const raw = localStorage.getItem(storageKey(course, username));
    if (!raw) return null;
    const stored = JSON.parse(raw) as Progress;
    const progress = { ...stored, choices: stored.choices ?? {} };
    const { chapters } = course;
    // A passed quiz resumes at the start of the next chapter; the last chapter stays "passed" so its downloads remain
    if (progress.phase === "passed") {
      if (chapters[progress.chapterIndex + 1]) {
        return { chapterIndex: progress.chapterIndex + 1, nextScene: 1, phase: "story", quizIndex: 0, correctCount: 0, choices: progress.choices };
      }
      return chapters[progress.chapterIndex] ? { ...progress, nextScene: chapters[progress.chapterIndex].scenes.length } : null;
    }
    return isValid(course, progress) ? progress : null;
  } catch {
    return null;
  }
};

export const saveProgress = (course: Course, username: string, progress: Progress) => {
  try {
    localStorage.setItem(storageKey(course, username), JSON.stringify(progress));
  } catch {
    // Storage can be full or blocked (private mode); progress just won't persist
  }
};

export const clearProgress = (course: Course, username: string) => {
  try {
    localStorage.removeItem(storageKey(course, username));
  } catch {
    // Same as above
  }
};
