import { chapters } from "./story";

export type SavedPhase = "story" | "quiz" | "failed" | "passed";

export type Progress = {
  chapterIndex: number;
  nextScene: number;
  phase: SavedPhase;
  quizIndex: number;
  correctCount: number;
};

const storageKey = (username: string) => `offtrck:progress:${username}`;

const isValid = (progress: Progress) => {
  const chapter = chapters[progress.chapterIndex];
  if (!chapter) return false;
  if (progress.nextScene < 1 || progress.nextScene > chapter.scenes.length) return false;
  if (progress.phase === "quiz" || progress.phase === "failed") {
    const quizLength = chapter.quiz?.length ?? 0;
    return progress.quizIndex >= 0 && progress.quizIndex < quizLength && progress.correctCount <= progress.quizIndex + 1;
  }
  return true;
};

export const loadProgress = (username: string): Progress | null => {
  try {
    const raw = localStorage.getItem(storageKey(username));
    if (!raw) return null;
    const progress = JSON.parse(raw) as Progress;
    // A passed quiz resumes at the start of the next chapter
    if (progress.phase === "passed") {
      return chapters[progress.chapterIndex + 1]
        ? { chapterIndex: progress.chapterIndex + 1, nextScene: 1, phase: "story", quizIndex: 0, correctCount: 0 }
        : null;
    }
    return isValid(progress) ? progress : null;
  } catch {
    return null;
  }
};

export const saveProgress = (username: string, progress: Progress) => {
  try {
    localStorage.setItem(storageKey(username), JSON.stringify(progress));
  } catch {
    // Storage can be full or blocked (private mode); progress just won't persist
  }
};

export const clearProgress = (username: string) => {
  try {
    localStorage.removeItem(storageKey(username));
  } catch {
    // Same as above
  }
};
