import { useEffect, useState } from "react";
import { ALL_LESSONS, lessonKey } from "./content";
import { EXAM_PASS, LAB_PASS, QUIZ_PASS } from "./types";

const STORAGE_KEY = "offtrck.academy";
const CHANGE_EVENT = "offtrck-academy";

export type LabResult = { score: number; file: string; at: string };

export type AcademyProgress = {
  read: string[];
  /** best quiz score in %, keyed by "module/lesson" */
  quiz: Record<string, number>;
  /** best lab result, keyed by "module/lesson" */
  labs: Record<string, LabResult>;
  exam?: number;
  certificate?: { name: string; id: string; date: string };
};

const empty = (): AcademyProgress => ({ read: [], quiz: {}, labs: {} });

const load = (): AcademyProgress => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...empty(), ...(JSON.parse(saved) as AcademyProgress) };
  } catch {
    /* fall through to empty progress */
  }
  return empty();
};

const save = (update: (p: AcademyProgress) => void) => {
  const progress = load();
  update(progress);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const markRead = (key: string) =>
  save(p => {
    if (!p.read.includes(key)) p.read.push(key);
  });

export const saveQuiz = (key: string, score: number) =>
  save(p => {
    p.quiz[key] = Math.max(p.quiz[key] ?? 0, score);
  });

export const saveLab = (key: string, result: LabResult) =>
  save(p => {
    if ((p.labs[key]?.score ?? -1) <= result.score) p.labs[key] = result;
  });

export const saveExam = (score: number) =>
  save(p => {
    p.exam = Math.max(p.exam ?? 0, score);
  });

export const saveCertificate = (certificate: AcademyProgress["certificate"]) =>
  save(p => {
    p.certificate = certificate;
  });

export const useAcademy = () => {
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

  const statusOf = (key: string, kind: "article" | "quiz" | "lab") => {
    if (kind === "article") return progress.read.includes(key) ? "done" : "todo";
    const score = kind === "quiz" ? progress.quiz[key] : progress.labs[key]?.score;
    if (score === undefined) return "todo";
    return score >= (kind === "quiz" ? QUIZ_PASS : LAB_PASS) ? "done" : "failed";
  };

  const graded = ALL_LESSONS.filter(x => x.lesson.kind !== "article");
  const gradedPassed = graded.filter(x => statusOf(lessonKey(x.module, x.lesson), x.lesson.kind) === "done").length;
  const done = ALL_LESSONS.filter(x => statusOf(lessonKey(x.module, x.lesson), x.lesson.kind) === "done").length;
  const examPassed = (progress.exam ?? 0) >= EXAM_PASS;
  const examUnlocked = gradedPassed === graded.length;

  return {
    progress,
    statusOf,
    done,
    total: ALL_LESSONS.length,
    gradedPassed,
    gradedTotal: graded.length,
    examUnlocked,
    examPassed,
    certified: examUnlocked && examPassed,
    next: ALL_LESSONS.find(x => statusOf(lessonKey(x.module, x.lesson), x.lesson.kind) !== "done"),
  };
};
