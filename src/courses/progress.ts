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

const load = (): Progress => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as Progress;
  } catch {
    /* fall through to empty progress */
  }
  return { done: [], minutes: {} };
};

export const markDone = (courseId: string, chapterId: string, minutes: number) => {
  const progress = load();
  const key = `${courseId}/${chapterId}`;
  if (progress.done.includes(key)) return;
  progress.done.push(key);
  progress.minutes[today()] = (progress.minutes[today()] ?? 0) + minutes;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const useProgress = () => {
  const [progress, setProgress] = useState(load);

  useEffect(() => {
    const refresh = () => setProgress(load());
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const isDone = (courseId: string, chapterId: string) => progress.done.includes(`${courseId}/${chapterId}`);
  const doneIn = (course: Course) => course.chapters.filter(ch => isDone(course.id, ch.id)).length;
  const nextIn = (course: Course) => course.chapters.find(ch => !isDone(course.id, ch.id)) ?? course.chapters[0];
  const totalDone = COURSES.reduce((sum, course) => sum + doneIn(course), 0);

  return { isDone, doneIn, nextIn, totalDone, minutesToday: progress.minutes[today()] ?? 0 };
};
