import { useEffect, useState } from "react";
import { COURSES } from "./data";
import type { Course } from "./types";

const STORAGE_KEY = "offtrck.courses.progress";
const CHANGE_EVENT = "offtrck-progress";

type Progress = {
  /** "course/chapter" keys */
  done: string[];
  /** minutes learned per day, keyed by yyyy-mm-dd */
  minutes: Record<string, number>;
};

const today = () => new Date().toISOString().slice(0, 10);

export const readProgress = (): Progress => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Progress;
  } catch {
    /* fall through to empty progress */
  }
  return { done: [], minutes: {} };
};

export const markDone = (courseId: string, chapterId: string, minutes: number) => {
  const progress = readProgress();
  const key = `${courseId}/${chapterId}`;
  if (progress.done.includes(key)) return;
  progress.done.push(key);
  progress.minutes[today()] = (progress.minutes[today()] ?? 0) + minutes;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const summarizeProgress = (progress: Progress) => {
  const isDone = (courseId: string, chapterId: string) => progress.done.includes(`${courseId}/${chapterId}`);
  const doneIn = (course: Course) => course.chapters.filter(ch => isDone(course.id, ch.id)).length;
  const nextIn = (course: Course) => course.chapters.find(ch => !isDone(course.id, ch.id)) ?? course.chapters[0];
  const totalDone = COURSES.reduce((sum, course) => sum + doneIn(course), 0);

  return {
    isDone,
    doneIn,
    nextIn,
    totalDone,
    minutesToday: progress.minutes[today()] ?? 0,
    daysLearned: Object.keys(progress.minutes).length,
    /** The chapter finished most recently, to suggest what to do next */
    lastDone: progress.done.at(-1),
  };
};

export const useProgress = () => {
  const [progress, setProgress] = useState(readProgress);

  useEffect(() => {
    const refresh = () => setProgress(readProgress());
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return summarizeProgress(progress);
};
